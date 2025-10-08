// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./CarbonCreditNFT.sol";

/**
 * @title CarbonMarketplace
 * @dev Marketplace contract for trading carbon credits
 * @notice Enables buying, selling, and auctioning of carbon credits
 */
contract CarbonMarketplace is AccessControl, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MARKETPLACE_ROLE = keccak256("MARKETPLACE_ROLE");

    // State variables
    Counters.Counter private _listingIdCounter;
    
    // Reference to the CarbonCreditNFT contract
    CarbonCreditNFT public carbonCreditNFT;
    
    // Payment token (USDC, USDT, etc.)
    IERC20 public paymentToken;
    
    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeeBps = 250;
    
    // Fee recipient
    address public feeRecipient;

    // Listing types
    enum ListingType {
        FixedPrice,
        Auction
    }

    // Listing status
    enum ListingStatus {
        Active,
        Sold,
        Cancelled,
        Ended
    }

    // Carbon credit listing structure
    struct CarbonListing {
        uint256 listingId;
        uint256 tokenId;
        address seller;
        uint256 price;              // Price per ton of carbon
        uint256 totalPrice;         // Total price for the entire credit
        uint256 carbonAmount;       // Amount of carbon in tons
        ListingType listingType;
        ListingStatus status;
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        mapping(address => uint256) bids;
        address[] bidders;
    }

    // Mappings
    mapping(uint256 => CarbonListing) public listings;
    mapping(uint256 => uint256) public tokenToListing;
    mapping(address => uint256[]) public sellerListings;
    mapping(address => uint256[]) public buyerListings;

    // Events
    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 carbonAmount,
        ListingType listingType,
        uint256 endTime
    );

    event ListingUpdated(
        uint256 indexed listingId,
        uint256 newPrice,
        uint256 newEndTime
    );

    event ListingCancelled(
        uint256 indexed listingId,
        address indexed seller
    );

    event CreditSold(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed buyer,
        address seller,
        uint256 price,
        uint256 carbonAmount,
        uint256 platformFee
    );

    event BidPlaced(
        uint256 indexed listingId,
        address indexed bidder,
        uint256 bidAmount,
        uint256 previousBid
    );

    event BidWithdrawn(
        uint256 indexed listingId,
        address indexed bidder,
        uint256 bidAmount
    );

    event AuctionEnded(
        uint256 indexed listingId,
        address indexed winner,
        uint256 winningBid
    );

    event PlatformFeeUpdated(
        uint256 oldFee,
        uint256 newFee,
        address indexed admin
    );

    event FeeRecipientUpdated(
        address oldRecipient,
        address newRecipient,
        address indexed admin
    );

    // Modifiers
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "CarbonMarketplace: must have admin role");
        _;
    }

    modifier onlyMarketplace() {
        require(hasRole(MARKETPLACE_ROLE, msg.sender), "CarbonMarketplace: must have marketplace role");
        _;
    }

    modifier validListingId(uint256 listingId) {
        require(listingId < _listingIdCounter.current(), "CarbonMarketplace: invalid listing ID");
        _;
    }

    modifier listingActive(uint256 listingId) {
        require(listings[listingId].status == ListingStatus.Active, "CarbonMarketplace: listing not active");
        _;
    }

    modifier notExpired(uint256 listingId) {
        require(block.timestamp <= listings[listingId].endTime, "CarbonMarketplace: listing expired");
        _;
    }

    modifier onlySeller(uint256 listingId) {
        require(listings[listingId].seller == msg.sender, "CarbonMarketplace: not the seller");
        _;
    }

    /**
     * @dev Constructor
     * @param _carbonCreditNFT Address of the CarbonCreditNFT contract
     * @param _paymentToken Address of the payment token (USDC, USDT, etc.)
     * @param _feeRecipient Address to receive platform fees
     */
    constructor(
        address _carbonCreditNFT,
        address _paymentToken,
        address _feeRecipient
    ) {
        require(_carbonCreditNFT != address(0), "CarbonMarketplace: invalid NFT contract address");
        require(_paymentToken != address(0), "CarbonMarketplace: invalid payment token address");
        require(_feeRecipient != address(0), "CarbonMarketplace: invalid fee recipient address");
        
        carbonCreditNFT = CarbonCreditNFT(_carbonCreditNFT);
        paymentToken = IERC20(_paymentToken);
        feeRecipient = _feeRecipient;
        
        // Set up roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MARKETPLACE_ROLE, msg.sender);
    }

    /**
     * @dev Create a fixed price listing
     * @param tokenId Token ID to list
     * @param price Price per ton of carbon
     * @param duration Duration of the listing in seconds
     * @return listingId The ID of the created listing
     */
    function createFixedPriceListing(
        uint256 tokenId,
        uint256 price,
        uint256 duration
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(carbonCreditNFT.ownerOf(tokenId) == msg.sender, "CarbonMarketplace: not the owner");
        require(price > 0, "CarbonMarketplace: price must be positive");
        require(duration > 0, "CarbonMarketplace: duration must be positive");
        require(!carbonCreditNFT.isCreditRetired(tokenId), "CarbonMarketplace: credit is retired");

        // Check if token is already listed
        require(tokenToListing[tokenId] == 0 || listings[tokenToListing[tokenId]].status != ListingStatus.Active, 
                "CarbonMarketplace: token already listed");

        uint256 listingId = _listingIdCounter.current();
        _listingIdCounter.increment();

        CarbonCreditNFT.CarbonCreditData memory creditData = carbonCreditNFT.getCarbonCreditData(tokenId);
        uint256 totalPrice = (price * creditData.carbonAmount) / 1e18;

        CarbonListing storage listing = listings[listingId];
        listing.listingId = listingId;
        listing.tokenId = tokenId;
        listing.seller = msg.sender;
        listing.price = price;
        listing.totalPrice = totalPrice;
        listing.carbonAmount = creditData.carbonAmount;
        listing.listingType = ListingType.FixedPrice;
        listing.status = ListingStatus.Active;
        listing.startTime = block.timestamp;
        listing.endTime = block.timestamp + duration;

        tokenToListing[tokenId] = listingId;
        sellerListings[msg.sender].push(listingId);

        emit ListingCreated(listingId, tokenId, msg.sender, price, creditData.carbonAmount, ListingType.FixedPrice, listing.endTime);

        return listingId;
    }

    /**
     * @dev Create an auction listing
     * @param tokenId Token ID to list
     * @param startingPrice Starting price per ton of carbon
     * @param duration Duration of the auction in seconds
     * @return listingId The ID of the created listing
     */
    function createAuctionListing(
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(carbonCreditNFT.ownerOf(tokenId) == msg.sender, "CarbonMarketplace: not the owner");
        require(startingPrice > 0, "CarbonMarketplace: starting price must be positive");
        require(duration > 0, "CarbonMarketplace: duration must be positive");
        require(!carbonCreditNFT.isCreditRetired(tokenId), "CarbonMarketplace: credit is retired");

        // Check if token is already listed
        require(tokenToListing[tokenId] == 0 || listings[tokenToListing[tokenId]].status != ListingStatus.Active, 
                "CarbonMarketplace: token already listed");

        uint256 listingId = _listingIdCounter.current();
        _listingIdCounter.increment();

        CarbonCreditNFT.CarbonCreditData memory creditData = carbonCreditNFT.getCarbonCreditData(tokenId);
        uint256 totalStartingPrice = (startingPrice * creditData.carbonAmount) / 1e18;

        CarbonListing storage listing = listings[listingId];
        listing.listingId = listingId;
        listing.tokenId = tokenId;
        listing.seller = msg.sender;
        listing.price = startingPrice;
        listing.totalPrice = totalStartingPrice;
        listing.carbonAmount = creditData.carbonAmount;
        listing.listingType = ListingType.Auction;
        listing.status = ListingStatus.Active;
        listing.startTime = block.timestamp;
        listing.endTime = block.timestamp + duration;

        tokenToListing[tokenId] = listingId;
        sellerListings[msg.sender].push(listingId);

        emit ListingCreated(listingId, tokenId, msg.sender, startingPrice, creditData.carbonAmount, ListingType.Auction, listing.endTime);

        return listingId;
    }

    /**
     * @dev Buy a carbon credit from a fixed price listing
     * @param listingId Listing ID to buy from
     */
    function buyCredit(uint256 listingId) 
        external 
        validListingId(listingId) 
        listingActive(listingId) 
        notExpired(listingId) 
        whenNotPaused 
        nonReentrant 
    {
        CarbonListing storage listing = listings[listingId];
        require(listing.listingType == ListingType.FixedPrice, "CarbonMarketplace: not a fixed price listing");
        require(listing.seller != msg.sender, "CarbonMarketplace: cannot buy your own listing");

        // Calculate platform fee
        uint256 platformFee = (listing.totalPrice * platformFeeBps) / 10000;
        uint256 sellerAmount = listing.totalPrice - platformFee;

        // Transfer payment token
        require(paymentToken.transferFrom(msg.sender, address(this), listing.totalPrice), 
                "CarbonMarketplace: payment transfer failed");
        
        // Transfer fee to fee recipient
        require(paymentToken.transfer(feeRecipient, platformFee), 
                "CarbonMarketplace: fee transfer failed");
        
        // Transfer payment to seller
        require(paymentToken.transfer(listing.seller, sellerAmount), 
                "CarbonMarketplace: seller payment failed");

        // Transfer NFT to buyer
        carbonCreditNFT.transferFrom(listing.seller, msg.sender, listing.tokenId);

        // Update listing status
        listing.status = ListingStatus.Sold;
        buyerListings[msg.sender].push(listingId);

        emit CreditSold(listingId, listing.tokenId, msg.sender, listing.seller, listing.totalPrice, listing.carbonAmount, platformFee);
    }

    /**
     * @dev Place a bid on an auction listing
     * @param listingId Listing ID to bid on
     * @param bidAmount Bid amount
     */
    function placeBid(uint256 listingId, uint256 bidAmount) 
        external 
        validListingId(listingId) 
        listingActive(listingId) 
        notExpired(listingId) 
        whenNotPaused 
        nonReentrant 
    {
        CarbonListing storage listing = listings[listingId];
        require(listing.listingType == ListingType.Auction, "CarbonMarketplace: not an auction listing");
        require(listing.seller != msg.sender, "CarbonMarketplace: cannot bid on your own listing");
        require(bidAmount > listing.highestBid, "CarbonMarketplace: bid too low");
        require(bidAmount >= listing.totalPrice, "CarbonMarketplace: bid below starting price");

        // Transfer bid amount
        require(paymentToken.transferFrom(msg.sender, address(this), bidAmount), 
                "CarbonMarketplace: bid transfer failed");

        // Return previous bid if any
        if (listing.highestBidder != address(0)) {
            require(paymentToken.transfer(listing.highestBidder, listing.highestBid), 
                    "CarbonMarketplace: previous bid return failed");
        }

        // Update bid
        listing.bids[msg.sender] = bidAmount;
        if (listing.bids[msg.sender] == 0) {
            listing.bidders.push(msg.sender);
        }

        uint256 previousBid = listing.highestBid;
        listing.highestBid = bidAmount;
        listing.highestBidder = msg.sender;

        emit BidPlaced(listingId, msg.sender, bidAmount, previousBid);
    }

    /**
     * @dev End an auction and transfer the NFT to the winner
     * @param listingId Listing ID to end
     */
    function endAuction(uint256 listingId) 
        external 
        validListingId(listingId) 
        listingActive(listingId) 
        whenNotPaused 
        nonReentrant 
    {
        CarbonListing storage listing = listings[listingId];
        require(listing.listingType == ListingType.Auction, "CarbonMarketplace: not an auction listing");
        require(block.timestamp > listing.endTime, "CarbonMarketplace: auction not ended");
        require(listing.highestBidder != address(0), "CarbonMarketplace: no bids placed");

        // Calculate platform fee
        uint256 platformFee = (listing.highestBid * platformFeeBps) / 10000;
        uint256 sellerAmount = listing.highestBid - platformFee;

        // Transfer fee to fee recipient
        require(paymentToken.transfer(feeRecipient, platformFee), 
                "CarbonMarketplace: fee transfer failed");
        
        // Transfer payment to seller
        require(paymentToken.transfer(listing.seller, sellerAmount), 
                "CarbonMarketplace: seller payment failed");

        // Transfer NFT to winner
        carbonCreditNFT.transferFrom(listing.seller, listing.highestBidder, listing.tokenId);

        // Update listing status
        listing.status = ListingStatus.Sold;
        buyerListings[listing.highestBidder].push(listingId);

        emit AuctionEnded(listingId, listing.highestBidder, listing.highestBid);
        emit CreditSold(listingId, listing.tokenId, listing.highestBidder, listing.seller, listing.highestBid, listing.carbonAmount, platformFee);
    }

    /**
     * @dev Cancel a listing
     * @param listingId Listing ID to cancel
     */
    function cancelListing(uint256 listingId) 
        external 
        validListingId(listingId) 
        onlySeller(listingId) 
        whenNotPaused 
        nonReentrant 
    {
        CarbonListing storage listing = listings[listingId];
        require(listing.status == ListingStatus.Active, "CarbonMarketplace: listing not active");

        // Return bids if auction
        if (listing.listingType == ListingType.Auction) {
            for (uint256 i = 0; i < listing.bidders.length; i++) {
                address bidder = listing.bidders[i];
                uint256 bidAmount = listing.bids[bidder];
                if (bidAmount > 0) {
                    require(paymentToken.transfer(bidder, bidAmount), 
                            "CarbonMarketplace: bid return failed");
                    emit BidWithdrawn(listingId, bidder, bidAmount);
                }
            }
        }

        listing.status = ListingStatus.Cancelled;

        emit ListingCancelled(listingId, msg.sender);
    }

    /**
     * @dev Update listing price (only for fixed price listings)
     * @param listingId Listing ID to update
     * @param newPrice New price per ton of carbon
     */
    function updateListingPrice(uint256 listingId, uint256 newPrice) 
        external 
        validListingId(listingId) 
        onlySeller(listingId) 
        listingActive(listingId) 
        whenNotPaused 
    {
        CarbonListing storage listing = listings[listingId];
        require(listing.listingType == ListingType.FixedPrice, "CarbonMarketplace: not a fixed price listing");
        require(newPrice > 0, "CarbonMarketplace: price must be positive");

        uint256 oldPrice = listing.price;
        listing.price = newPrice;
        listing.totalPrice = (newPrice * listing.carbonAmount) / 1e18;

        emit ListingUpdated(listingId, newPrice, listing.endTime);
    }

    /**
     * @dev Get listing information
     * @param listingId Listing ID
     * @return tokenId Token ID
     * @return seller Seller address
     * @return price Price per ton
     * @return totalPrice Total price
     * @return carbonAmount Carbon amount
     * @return listingType Listing type
     * @return status Listing status
     * @return startTime Start time
     * @return endTime End time
     * @return highestBidder Highest bidder (for auctions)
     * @return highestBid Highest bid (for auctions)
     */
    function getListingInfo(uint256 listingId) 
        external 
        view 
        validListingId(listingId) 
        returns (
            uint256 tokenId,
            address seller,
            uint256 price,
            uint256 totalPrice,
            uint256 carbonAmount,
            ListingType listingType,
            ListingStatus status,
            uint256 startTime,
            uint256 endTime,
            address highestBidder,
            uint256 highestBid
        ) 
    {
        CarbonListing storage listing = listings[listingId];
        return (
            listing.tokenId,
            listing.seller,
            listing.price,
            listing.totalPrice,
            listing.carbonAmount,
            listing.listingType,
            listing.status,
            listing.startTime,
            listing.endTime,
            listing.highestBidder,
            listing.highestBid
        );
    }

    /**
     * @dev Get bid amount for a specific bidder
     * @param listingId Listing ID
     * @param bidder Bidder address
     * @return Bid amount
     */
    function getBidAmount(uint256 listingId, address bidder) 
        external 
        view 
        validListingId(listingId) 
        returns (uint256) 
    {
        return listings[listingId].bids[bidder];
    }

    /**
     * @dev Get all bidders for an auction
     * @param listingId Listing ID
     * @return Array of bidder addresses
     */
    function getBidders(uint256 listingId) 
        external 
        view 
        validListingId(listingId) 
        returns (address[] memory) 
    {
        return listings[listingId].bidders;
    }

    /**
     * @dev Get listings by seller
     * @param seller Seller address
     * @return Array of listing IDs
     */
    function getListingsBySeller(address seller) external view returns (uint256[] memory) {
        return sellerListings[seller];
    }

    /**
     * @dev Get listings by buyer
     * @param buyer Buyer address
     * @return Array of listing IDs
     */
    function getListingsByBuyer(address buyer) external view returns (uint256[] memory) {
        return buyerListings[buyer];
    }

    /**
     * @dev Update platform fee
     * @param newFeeBps New fee in basis points
     */
    function updatePlatformFee(uint256 newFeeBps) external onlyAdmin {
        require(newFeeBps <= 1000, "CarbonMarketplace: fee too high"); // Max 10%
        
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        
        emit PlatformFeeUpdated(oldFee, newFeeBps, msg.sender);
    }

    /**
     * @dev Update fee recipient
     * @param newFeeRecipient New fee recipient address
     */
    function updateFeeRecipient(address newFeeRecipient) external onlyAdmin {
        require(newFeeRecipient != address(0), "CarbonMarketplace: invalid address");
        
        address oldRecipient = feeRecipient;
        feeRecipient = newFeeRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, newFeeRecipient, msg.sender);
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
     * @dev Emergency withdraw function (admin only)
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyAdmin {
        IERC20(token).transfer(msg.sender, amount);
    }
}