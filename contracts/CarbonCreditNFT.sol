// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CarbonCreditNFT
 * @dev ERC-721 NFT contract for unique carbon credits
 * @notice Each NFT represents a unique carbon credit with metadata
 */
contract CarbonCreditNFT is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Enumerable, 
    AccessControl, 
    Pausable, 
    ReentrancyGuard 
{
    using Counters for Counters.Counter;
    using Strings for uint256;

    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // State variables
    Counters.Counter private _tokenIdCounter;
    string private _baseTokenURI;
    
    // Carbon credit metadata structure
    struct CarbonCreditData {
        uint256 projectId;           // Reference to the carbon project
        uint256 carbonAmount;        // Amount of carbon in tons
        uint256 vintageYear;         // Year the carbon was sequestered
        uint256 issuanceDate;        // When the credit was issued
        uint256 retirementDate;      // When the credit was retired (0 if active)
        string methodology;          // Methodology used for verification
        string location;             // Geographic location
        string species;              // Tree species involved
        bool isRetired;              // Whether the credit has been retired
        bool isVerified;             // Whether the credit has been verified
        address issuer;              // Address that issued the credit
        address currentOwner;        // Current owner of the credit
    }

    // Mappings
    mapping(uint256 => CarbonCreditData) public carbonCredits;
    mapping(uint256 => bool) public retiredCredits;
    mapping(address => uint256[]) public ownerCredits;
    mapping(uint256 => string) public creditMetadata;

    // Events
    event CreditIssued(
        uint256 indexed tokenId,
        uint256 indexed projectId,
        address indexed issuer,
        uint256 carbonAmount,
        uint256 vintageYear,
        string methodology
    );

    event CreditTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 carbonAmount
    );

    event CreditRetired(
        uint256 indexed tokenId,
        address indexed retirer,
        uint256 carbonAmount,
        uint256 retirementDate,
        string retirementReason
    );

    event CreditVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        bool verified,
        string verificationNotes
    );

    event ProjectVerified(
        uint256 indexed projectId,
        address indexed verifier,
        bool verified,
        string verificationNotes
    );

    // Modifiers
    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, msg.sender), "CarbonCreditNFT: must have minter role");
        _;
    }

    modifier onlyVerifier() {
        require(hasRole(VERIFIER_ROLE, msg.sender), "CarbonCreditNFT: must have verifier role");
        _;
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "CarbonCreditNFT: must have admin role");
        _;
    }

    modifier validTokenId(uint256 tokenId) {
        require(_exists(tokenId), "CarbonCreditNFT: token does not exist");
        _;
    }

    modifier notRetired(uint256 tokenId) {
        require(!carbonCredits[tokenId].isRetired, "CarbonCreditNFT: credit is already retired");
        _;
    }

    /**
     * @dev Constructor
     * @param name Token name
     * @param symbol Token symbol
     * @param baseTokenURI Base URI for token metadata
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;
        
        // Set up roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Mint a new carbon credit NFT
     * @param to Address to mint the NFT to
     * @param projectId ID of the carbon project
     * @param carbonAmount Amount of carbon in tons (scaled by 1e18)
     * @param vintageYear Year the carbon was sequestered
     * @param methodology Methodology used for verification
     * @param location Geographic location
     * @param species Tree species involved
     * @param tokenURI URI for token metadata
     * @return tokenId The ID of the minted token
     */
    function mintCredit(
        address to,
        uint256 projectId,
        uint256 carbonAmount,
        uint256 vintageYear,
        string memory methodology,
        string memory location,
        string memory species,
        string memory tokenURI
    ) external onlyMinter whenNotPaused nonReentrant returns (uint256) {
        require(to != address(0), "CarbonCreditNFT: mint to zero address");
        require(carbonAmount > 0, "CarbonCreditNFT: carbon amount must be positive");
        require(vintageYear > 0 && vintageYear <= block.timestamp, "CarbonCreditNFT: invalid vintage year");
        require(bytes(methodology).length > 0, "CarbonCreditNFT: methodology required");
        require(bytes(location).length > 0, "CarbonCreditNFT: location required");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Create carbon credit data
        CarbonCreditData memory creditData = CarbonCreditData({
            projectId: projectId,
            carbonAmount: carbonAmount,
            vintageYear: vintageYear,
            issuanceDate: block.timestamp,
            retirementDate: 0,
            methodology: methodology,
            location: location,
            species: species,
            isRetired: false,
            isVerified: false,
            issuer: msg.sender,
            currentOwner: to
        });

        carbonCredits[tokenId] = creditData;
        ownerCredits[to].push(tokenId);

        // Mint the NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit CreditIssued(tokenId, projectId, msg.sender, carbonAmount, vintageYear, methodology);

        return tokenId;
    }

    /**
     * @dev Transfer a carbon credit (override to track ownership)
     * @param from Address to transfer from
     * @param to Address to transfer to
     * @param tokenId Token ID to transfer
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        // Update ownership tracking
        if (from != address(0) && to != address(0)) {
            carbonCredits[tokenId].currentOwner = to;
            
            // Remove from old owner's list
            uint256[] storage fromCredits = ownerCredits[from];
            for (uint256 i = 0; i < fromCredits.length; i++) {
                if (fromCredits[i] == tokenId) {
                    fromCredits[i] = fromCredits[fromCredits.length - 1];
                    fromCredits.pop();
                    break;
                }
            }
            
            // Add to new owner's list
            ownerCredits[to].push(tokenId);

            emit CreditTransferred(tokenId, from, to, carbonCredits[tokenId].carbonAmount);
        }
    }

    /**
     * @dev Retire a carbon credit (burn the NFT)
     * @param tokenId Token ID to retire
     * @param retirementReason Reason for retirement
     */
    function retireCredit(
        uint256 tokenId,
        string memory retirementReason
    ) external validTokenId(tokenId) notRetired(tokenId) whenNotPaused nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "CarbonCreditNFT: not the owner");
        require(bytes(retirementReason).length > 0, "CarbonCreditNFT: retirement reason required");

        CarbonCreditData storage credit = carbonCredits[tokenId];
        credit.isRetired = true;
        credit.retirementDate = block.timestamp;
        retiredCredits[tokenId] = true;

        uint256 carbonAmount = credit.carbonAmount;

        // Remove from owner's list
        uint256[] storage ownerCreditsList = ownerCredits[msg.sender];
        for (uint256 i = 0; i < ownerCreditsList.length; i++) {
            if (ownerCreditsList[i] == tokenId) {
                ownerCreditsList[i] = ownerCreditsList[ownerCreditsList.length - 1];
                ownerCreditsList.pop();
                break;
            }
        }

        // Burn the NFT
        _burn(tokenId);

        emit CreditRetired(tokenId, msg.sender, carbonAmount, block.timestamp, retirementReason);
    }

    /**
     * @dev Verify a carbon credit
     * @param tokenId Token ID to verify
     * @param verified Whether the credit is verified
     * @param verificationNotes Notes about the verification
     */
    function verifyCredit(
        uint256 tokenId,
        bool verified,
        string memory verificationNotes
    ) external onlyVerifier validTokenId(tokenId) whenNotPaused {
        carbonCredits[tokenId].isVerified = verified;

        emit CreditVerified(tokenId, msg.sender, verified, verificationNotes);
    }

    /**
     * @dev Verify a carbon project
     * @param projectId Project ID to verify
     * @param verified Whether the project is verified
     * @param verificationNotes Notes about the verification
     */
    function verifyProject(
        uint256 projectId,
        bool verified,
        string memory verificationNotes
    ) external onlyVerifier whenNotPaused {
        emit ProjectVerified(projectId, msg.sender, verified, verificationNotes);
    }

    /**
     * @dev Get carbon credit data
     * @param tokenId Token ID
     * @return CarbonCreditData struct
     */
    function getCarbonCreditData(uint256 tokenId) 
        external 
        view 
        validTokenId(tokenId) 
        returns (CarbonCreditData memory) 
    {
        return carbonCredits[tokenId];
    }

    /**
     * @dev Get credits owned by an address
     * @param owner Address to query
     * @return Array of token IDs
     */
    function getCreditsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerCredits[owner];
    }

    /**
     * @dev Get total carbon amount owned by an address
     * @param owner Address to query
     * @return Total carbon amount in tons
     */
    function getTotalCarbonByOwner(address owner) external view returns (uint256) {
        uint256[] memory credits = ownerCredits[owner];
        uint256 total = 0;
        
        for (uint256 i = 0; i < credits.length; i++) {
            if (!retiredCredits[credits[i]]) {
                total += carbonCredits[credits[i]].carbonAmount;
            }
        }
        
        return total;
    }

    /**
     * @dev Get total retired carbon amount
     * @return Total retired carbon amount in tons
     */
    function getTotalRetiredCarbon() external view returns (uint256) {
        uint256 total = 0;
        uint256 totalTokens = _tokenIdCounter.current();
        
        for (uint256 i = 0; i < totalTokens; i++) {
            if (retiredCredits[i]) {
                total += carbonCredits[i].carbonAmount;
            }
        }
        
        return total;
    }

    /**
     * @dev Check if a credit is retired
     * @param tokenId Token ID to check
     * @return Whether the credit is retired
     */
    function isCreditRetired(uint256 tokenId) external view returns (bool) {
        return retiredCredits[tokenId];
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyAdmin {
        _unpause();
    }

    /**
     * @dev Set base token URI
     * @param baseTokenURI New base URI
     */
    function setBaseTokenURI(string memory baseTokenURI) external onlyAdmin {
        _baseTokenURI = baseTokenURI;
    }

    /**
     * @dev Get base token URI
     * @return Base token URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Override tokenURI to include base URI
     * @param tokenId Token ID
     * @return Complete token URI
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
     * @dev Override supportsInterface
     * @param interfaceId Interface ID to check
     * @return Whether the interface is supported
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override _burn
     * @param tokenId Token ID to burn
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
