// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title CarbonCredit
 * @dev ERC721 NFT representing carbon credits from blue carbon ecosystems
 * @author Oceara Team
 */
contract CarbonCredit is ERC721, ERC721URIStorage, Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    Counters.Counter private _tokenIdCounter;

    // Struct to store carbon credit data
    struct CarbonCreditData {
        uint256 carbonAmount;        // Amount of CO2 sequestered (in tons)
        uint256 price;              // Price per ton in wei
        string ecosystemType;       // mangrove, wetland, seagrass, etc.
        string location;            // Geographic location
        uint256 timestamp;          // When the credit was created
        bool isRetired;             // Whether the credit has been retired
        address verifier;           // Address of the verifier
        string verificationHash;    // IPFS hash of verification documents
    }

    // Mapping from token ID to carbon credit data
    mapping(uint256 => CarbonCreditData) public carbonCredits;

    // Mapping from ecosystem type to total credits
    mapping(string => uint256) public ecosystemTotals;

    // Mapping from verifier address to verification status
    mapping(address => bool) public authorizedVerifiers;

    // Events
    event CarbonCreditMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 carbonAmount,
        string ecosystemType,
        string location
    );

    event CarbonCreditRetired(
        uint256 indexed tokenId,
        address indexed retirer,
        uint256 carbonAmount
    );

    event VerifierAuthorized(address indexed verifier);
    event VerifierRevoked(address indexed verifier);

    event EcosystemUpdated(
        string indexed ecosystemType,
        uint256 newTotal
    );

    // Modifiers
    modifier onlyAuthorizedVerifier() {
        require(authorizedVerifiers[msg.sender], "Not an authorized verifier");
        _;
    }

    modifier validEcosystemType(string memory _ecosystemType) {
        require(
            keccak256(bytes(_ecosystemType)) == keccak256(bytes("mangrove")) ||
            keccak256(bytes(_ecosystemType)) == keccak256(bytes("wetland")) ||
            keccak256(bytes(_ecosystemType)) == keccak256(bytes("seagrass")) ||
            keccak256(bytes(_ecosystemType)) == keccak256(bytes("saltmarsh")) ||
            keccak256(bytes(_ecosystemType)) == keccak256(bytes("kelp")),
            "Invalid ecosystem type"
        );
        _;
    }

    constructor() ERC721("Oceara Carbon Credit", "OCC") {
        // Authorize the contract owner as the first verifier
        authorizedVerifiers[msg.sender] = true;
        emit VerifierAuthorized(msg.sender);
    }

    /**
     * @dev Mint a new carbon credit NFT
     * @param to Address to mint the NFT to
     * @param carbonAmount Amount of CO2 sequestered (in tons)
     * @param price Price per ton in wei
     * @param ecosystemType Type of ecosystem (mangrove, wetland, etc.)
     * @param location Geographic location
     * @param tokenURI URI containing metadata
     * @param verificationHash IPFS hash of verification documents
     */
    function mintCarbonCredit(
        address to,
        uint256 carbonAmount,
        uint256 price,
        string memory ecosystemType,
        string memory location,
        string memory tokenURI,
        string memory verificationHash
    ) 
        external 
        onlyAuthorizedVerifier 
        whenNotPaused 
        nonReentrant
        validEcosystemType(ecosystemType)
        returns (uint256)
    {
        require(to != address(0), "Cannot mint to zero address");
        require(carbonAmount > 0, "Carbon amount must be greater than 0");
        require(price > 0, "Price must be greater than 0");
        require(bytes(location).length > 0, "Location cannot be empty");
        require(bytes(verificationHash).length > 0, "Verification hash cannot be empty");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Create carbon credit data
        carbonCredits[tokenId] = CarbonCreditData({
            carbonAmount: carbonAmount,
            price: price,
            ecosystemType: ecosystemType,
            location: location,
            timestamp: block.timestamp,
            isRetired: false,
            verifier: msg.sender,
            verificationHash: verificationHash
        });

        // Update ecosystem totals
        ecosystemTotals[ecosystemType] = ecosystemTotals[ecosystemType].add(carbonAmount);

        // Mint the NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit CarbonCreditMinted(tokenId, to, carbonAmount, ecosystemType, location);
        emit EcosystemUpdated(ecosystemType, ecosystemTotals[ecosystemType]);

        return tokenId;
    }

    /**
     * @dev Retire a carbon credit (permanently remove it from circulation)
     * @param tokenId ID of the token to retire
     */
    function retireCarbonCredit(uint256 tokenId) 
        external 
        whenNotPaused 
        nonReentrant
    {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this token");
        require(!carbonCredits[tokenId].isRetired, "Credit already retired");

        // Mark as retired
        carbonCredits[tokenId].isRetired = true;

        // Burn the NFT
        _burn(tokenId);

        emit CarbonCreditRetired(tokenId, msg.sender, carbonCredits[tokenId].carbonAmount);
    }

    /**
     * @dev Get carbon credit data for a specific token
     * @param tokenId ID of the token
     * @return CarbonCreditData struct containing all credit information
     */
    function getCarbonCreditData(uint256 tokenId) 
        external 
        view 
        returns (CarbonCreditData memory) 
    {
        require(_exists(tokenId), "Token does not exist");
        return carbonCredits[tokenId];
    }

    /**
     * @dev Get total carbon credits by ecosystem type
     * @param ecosystemType Type of ecosystem
     * @return Total amount of carbon credits for this ecosystem type
     */
    function getEcosystemTotal(string memory ecosystemType) 
        external 
        view 
        returns (uint256) 
    {
        return ecosystemTotals[ecosystemType];
    }

    /**
     * @dev Authorize a new verifier
     * @param verifier Address of the verifier to authorize
     */
    function authorizeVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Cannot authorize zero address");
        require(!authorizedVerifiers[verifier], "Verifier already authorized");
        
        authorizedVerifiers[verifier] = true;
        emit VerifierAuthorized(verifier);
    }

    /**
     * @dev Revoke verifier authorization
     * @param verifier Address of the verifier to revoke
     */
    function revokeVerifier(address verifier) external onlyOwner {
        require(authorizedVerifiers[verifier], "Verifier not authorized");
        
        authorizedVerifiers[verifier] = false;
        emit VerifierRevoked(verifier);
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override required by Solidity
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev Override required by Solidity
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override required by Solidity
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
