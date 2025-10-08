/**
 * Blockchain Service for Carbon Credit Smart Contracts
 * Integration with Web3.js/Ethers.js for contract interactions
 */

import { ethers } from 'ethers';
import { logger } from '../utils/logger';

// Contract ABIs (simplified - in production, these would be imported from compiled contracts)
const CARBON_CREDIT_NFT_ABI = [
  "function mintCredit(address to, uint256 projectId, uint256 carbonAmount, uint256 vintageYear, string memory methodology, string memory location, string memory species, string memory tokenURI) external returns (uint256)",
  "function transferCredit(uint256 tokenId, address to) external",
  "function retireCredit(uint256 tokenId, string memory retirementReason) external",
  "function verifyCredit(uint256 tokenId, bool verified, string memory verificationNotes) external",
  "function getCarbonCreditData(uint256 tokenId) external view returns (tuple(uint256 projectId, uint256 carbonAmount, uint256 vintageYear, uint256 issuanceDate, uint256 retirementDate, string methodology, string location, string species, bool isRetired, bool isVerified, address issuer, address currentOwner))",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function isCreditRetired(uint256 tokenId) external view returns (bool)",
  "function getCreditsByOwner(address owner) external view returns (uint256[])",
  "function getTotalCarbonByOwner(address owner) external view returns (uint256)",
  "function getTotalRetiredCarbon() external view returns (uint256)",
  "event CreditIssued(uint256 indexed tokenId, uint256 indexed projectId, address indexed issuer, uint256 carbonAmount, uint256 vintageYear, string methodology)",
  "event CreditTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 carbonAmount)",
  "event CreditRetired(uint256 indexed tokenId, address indexed retirer, uint256 carbonAmount, uint256 retirementDate, string retirementReason)",
  "event CreditVerified(uint256 indexed tokenId, address indexed verifier, bool verified, string verificationNotes)",
  "event ProjectVerified(uint256 indexed projectId, address indexed verifier, bool verified, string verificationNotes)"
];

const CARBON_REGISTRY_ABI = [
  "function createProject(string memory name, string memory description, string memory location, string memory methodology, uint256 totalArea, uint256 estimatedCarbon, uint256 vintageYear) external returns (uint256)",
  "function submitVerificationReport(uint256 projectId, uint256 carbonAmount, string memory reportHash, string memory notes, uint256 expiryDate) external returns (uint256)",
  "function reviewVerificationReport(uint256 verificationId, bool approved, string memory adminNotes) external",
  "function issueCredits(uint256 projectId, address recipient, uint256 carbonAmount, string memory tokenURI) external returns (uint256[])",
  "function verifyProject(uint256 projectId, bool verified, string memory verificationNotes) external",
  "function updateProjectStatus(uint256 projectId, uint8 newStatus) external",
  "function suspendProject(uint256 projectId, string memory reason) external",
  "function getProjectInfo(uint256 projectId) external view returns (string memory name, string memory description, string memory location, string memory methodology, address projectOwner, uint256 totalArea, uint256 estimatedCarbon, uint256 issuedCarbon, uint256 vintageYear, uint8 status, uint256 creationDate, uint256 lastUpdateDate)",
  "function getVerificationReport(uint256 verificationId) external view returns (uint256 projectId, address verifier, uint8 status, uint256 carbonAmount, string memory reportHash, string memory notes, uint256 verificationDate, uint256 expiryDate)",
  "function getProjectsByOwner(address owner) external view returns (uint256[])",
  "function getVerificationReportsByVerifier(address verifier) external view returns (uint256[])",
  "function getTotalProjects() external view returns (uint256)",
  "function getTotalVerificationReports() external view returns (uint256)",
  "function hasVerifierVerifiedProject(uint256 projectId, address verifier) external view returns (bool)",
  "event ProjectCreated(uint256 indexed projectId, address indexed owner, string name, string location, uint256 totalArea, uint256 estimatedCarbon)",
  "event ProjectVerified(uint256 indexed projectId, address indexed verifier, bool verified, uint256 carbonAmount, string reportHash)",
  "event ProjectStatusUpdated(uint256 indexed projectId, uint8 oldStatus, uint8 newStatus, address indexed updater)",
  "event VerificationReportSubmitted(uint256 indexed verificationId, uint256 indexed projectId, address indexed verifier, uint256 carbonAmount, string reportHash)",
  "event VerificationStatusUpdated(uint256 indexed verificationId, uint8 oldStatus, uint8 newStatus, address indexed updater)",
  "event CreditsIssued(uint256 indexed projectId, address indexed recipient, uint256 amount, uint256[] tokenIds)",
  "event ProjectSuspended(uint256 indexed projectId, address indexed admin, string reason)"
];

const CARBON_MARKETPLACE_ABI = [
  "function createFixedPriceListing(uint256 tokenId, uint256 price, uint256 duration) external returns (uint256)",
  "function createAuctionListing(uint256 tokenId, uint256 startingPrice, uint256 duration) external returns (uint256)",
  "function buyCredit(uint256 listingId) external",
  "function placeBid(uint256 listingId, uint256 bidAmount) external",
  "function endAuction(uint256 listingId) external",
  "function cancelListing(uint256 listingId) external",
  "function updateListingPrice(uint256 listingId, uint256 newPrice) external",
  "function getListingInfo(uint256 listingId) external view returns (uint256 tokenId, address seller, uint256 price, uint256 totalPrice, uint256 carbonAmount, uint8 listingType, uint8 status, uint256 startTime, uint256 endTime, address highestBidder, uint256 highestBid)",
  "function getBidAmount(uint256 listingId, address bidder) external view returns (uint256)",
  "function getBidders(uint256 listingId) external view returns (address[])",
  "function getListingsBySeller(address seller) external view returns (uint256[])",
  "function getListingsByBuyer(address buyer) external view returns (uint256[])",
  "function platformFeeBps() external view returns (uint256)",
  "function feeRecipient() external view returns (address)",
  "event ListingCreated(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 price, uint256 carbonAmount, uint8 listingType, uint256 endTime)",
  "event ListingUpdated(uint256 indexed listingId, uint256 newPrice, uint256 newEndTime)",
  "event ListingCancelled(uint256 indexed listingId, address indexed seller)",
  "event CreditSold(uint256 indexed listingId, uint256 indexed tokenId, address indexed buyer, address seller, uint256 price, uint256 carbonAmount, uint256 platformFee)",
  "event BidPlaced(uint256 indexed listingId, address indexed bidder, uint256 bidAmount, uint256 previousBid)",
  "event BidWithdrawn(uint256 indexed listingId, address indexed bidder, uint256 bidAmount)",
  "event AuctionEnded(uint256 indexed listingId, address indexed winner, uint256 winningBid)",
  "event PlatformFeeUpdated(uint256 oldFee, uint256 newFee, address indexed admin)",
  "event FeeRecipientUpdated(address oldRecipient, address newRecipient, address indexed admin)"
];

export interface CarbonCreditData {
  projectId: string;
  carbonAmount: string;
  vintageYear: string;
  issuanceDate: string;
  retirementDate: string;
  methodology: string;
  location: string;
  species: string;
  isRetired: boolean;
  isVerified: boolean;
  issuer: string;
  currentOwner: string;
}

export interface ProjectData {
  name: string;
  description: string;
  location: string;
  methodology: string;
  projectOwner: string;
  totalArea: string;
  estimatedCarbon: string;
  issuedCarbon: string;
  vintageYear: string;
  status: number;
  creationDate: string;
  lastUpdateDate: string;
}

export interface ListingData {
  tokenId: string;
  seller: string;
  price: string;
  totalPrice: string;
  carbonAmount: string;
  listingType: number;
  status: number;
  startTime: string;
  endTime: string;
  highestBidder: string;
  highestBid: string;
}

class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private carbonCreditNFT: ethers.Contract;
  private carbonRegistry: ethers.Contract;
  private carbonMarketplace: ethers.Contract;
  private adminWallet: ethers.Wallet;

  constructor() {
    // Initialize provider (Polygon Mumbai testnet)
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.BLOCKCHAIN_RPC_URL || 'https://rpc-mumbai.maticvigil.com'
    );

    // Initialize admin wallet
    this.adminWallet = new ethers.Wallet(
      process.env.ADMIN_PRIVATE_KEY || '',
      this.provider
    );

    // Initialize contracts
    this.carbonCreditNFT = new ethers.Contract(
      process.env.CARBON_CREDIT_NFT_ADDRESS || '',
      CARBON_CREDIT_NFT_ABI,
      this.adminWallet
    );

    this.carbonRegistry = new ethers.Contract(
      process.env.CARBON_REGISTRY_ADDRESS || '',
      CARBON_REGISTRY_ABI,
      this.adminWallet
    );

    this.carbonMarketplace = new ethers.Contract(
      process.env.CARBON_MARKETPLACE_ADDRESS || '',
      CARBON_MARKETPLACE_ABI,
      this.adminWallet
    );

    logger.info('Blockchain service initialized');
  }

  /**
   * Mint a new carbon credit NFT
   */
  async mintCredit(
    to: string,
    projectId: string,
    carbonAmount: string,
    vintageYear: string,
    methodology: string,
    location: string,
    species: string,
    tokenURI: string
  ): Promise<{ success: boolean; tokenId?: string; txHash?: string; error?: string }> {
    try {
      logger.info(`Minting carbon credit for project ${projectId}`);

      const tx = await this.carbonCreditNFT.mintCredit(
        to,
        projectId,
        ethers.utils.parseEther(carbonAmount), // Convert to wei
        vintageYear,
        methodology,
        location,
        species,
        tokenURI
      );

      const receipt = await tx.wait();
      const tokenId = receipt.events?.find(e => e.event === 'CreditIssued')?.args?.tokenId?.toString();

      logger.info(`Carbon credit minted successfully: ${tokenId}`);

      return {
        success: true,
        tokenId,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Error minting carbon credit:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Transfer a carbon credit
   */
  async transferCredit(
    tokenId: string,
    from: string,
    to: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      logger.info(`Transferring carbon credit ${tokenId} from ${from} to ${to}`);

      // Create a wallet for the sender
      const senderWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY || '', this.provider);
      const contractWithSender = this.carbonCreditNFT.connect(senderWallet);

      const tx = await contractWithSender.transferFrom(from, to, tokenId);
      const receipt = await tx.wait();

      logger.info(`Carbon credit transferred successfully`);

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Error transferring carbon credit:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Retire a carbon credit
   */
  async retireCredit(
    tokenId: string,
    retirementReason: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      logger.info(`Retiring carbon credit ${tokenId}`);

      const tx = await this.carbonCreditNFT.retireCredit(tokenId, retirementReason);
      const receipt = await tx.wait();

      logger.info(`Carbon credit retired successfully`);

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Error retiring carbon credit:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify a carbon credit
   */
  async verifyCredit(
    tokenId: string,
    verified: boolean,
    verificationNotes: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      logger.info(`Verifying carbon credit ${tokenId}: ${verified}`);

      const tx = await this.carbonCreditNFT.verifyCredit(tokenId, verified, verificationNotes);
      const receipt = await tx.wait();

      logger.info(`Carbon credit verification completed`);

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Error verifying carbon credit:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a new carbon project
   */
  async createProject(
    name: string,
    description: string,
    location: string,
    methodology: string,
    totalArea: string,
    estimatedCarbon: string,
    vintageYear: string
  ): Promise<{ success: boolean; projectId?: string; txHash?: string; error?: string }> {
    try {
      logger.info(`Creating carbon project: ${name}`);

      const tx = await this.carbonRegistry.createProject(
        name,
        description,
        location,
        methodology,
        ethers.utils.parseEther(totalArea), // Convert to wei
        ethers.utils.parseEther(estimatedCarbon), // Convert to wei
        vintageYear
      );

      const receipt = await tx.wait();
      const projectId = receipt.events?.find(e => e.event === 'ProjectCreated')?.args?.projectId?.toString();

      logger.info(`Carbon project created successfully: ${projectId}`);

      return {
        success: true,
        projectId,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Error creating carbon project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Submit a verification report
   */
  async submitVerificationReport(
    projectId: string,
    carbonAmount: string,
    reportHash: string,
    notes: string,
    expiryDate: string
  ): Promise<{ success: boolean; verificationId?: string; txHash?: string; error?: string }> {
    try {
      logger.info(`Submitting verification report for project ${projectId}`);

      const tx = await this.carbonRegistry.submitVerificationReport(
        projectId,
        ethers.utils.parseEther(carbonAmount), // Convert to wei
        reportHash,
        notes,
        expiryDate
      );

      const receipt = await tx.wait();
      const verificationId = receipt.events?.find(e => e.event === 'VerificationReportSubmitted')?.args?.verificationId?.toString();

      logger.info(`Verification report submitted successfully: ${verificationId}`);

      return {
        success: true,
        verificationId,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Error submitting verification report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Issue credits for a verified project
   */
  async issueCredits(
    projectId: string,
    recipient: string,
    carbonAmount: string,
    tokenURI: string
  ): Promise<{ success: boolean; tokenIds?: string[]; txHash?: string; error?: string }> {
    try {
      logger.info(`Issuing credits for project ${projectId}`);

      const tx = await this.carbonRegistry.issueCredits(
        projectId,
        recipient,
        ethers.utils.parseEther(carbonAmount), // Convert to wei
        tokenURI
      );

      const receipt = await tx.wait();
      const tokenIds = receipt.events?.find(e => e.event === 'CreditsIssued')?.args?.tokenIds?.map((id: any) => id.toString());

      logger.info(`Credits issued successfully: ${tokenIds?.length} tokens`);

      return {
        success: true,
        tokenIds,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Error issuing credits:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a fixed price listing
   */
  async createFixedPriceListing(
    tokenId: string,
    price: string,
    duration: string
  ): Promise<{ success: boolean; listingId?: string; txHash?: string; error?: string }> {
    try {
      logger.info(`Creating fixed price listing for token ${tokenId}`);

      const tx = await this.carbonMarketplace.createFixedPriceListing(
        tokenId,
        ethers.utils.parseEther(price), // Convert to wei
        duration
      );

      const receipt = await tx.wait();
      const listingId = receipt.events?.find(e => e.event === 'ListingCreated')?.args?.listingId?.toString();

      logger.info(`Fixed price listing created successfully: ${listingId}`);

      return {
        success: true,
        listingId,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Error creating fixed price listing:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create an auction listing
   */
  async createAuctionListing(
    tokenId: string,
    startingPrice: string,
    duration: string
  ): Promise<{ success: boolean; listingId?: string; txHash?: string; error?: string }> {
    try {
      logger.info(`Creating auction listing for token ${tokenId}`);

      const tx = await this.carbonMarketplace.createAuctionListing(
        tokenId,
        ethers.utils.parseEther(startingPrice), // Convert to wei
        duration
      );

      const receipt = await tx.wait();
      const listingId = receipt.events?.find(e => e.event === 'ListingCreated')?.args?.listingId?.toString();

      logger.info(`Auction listing created successfully: ${listingId}`);

      return {
        success: true,
        listingId,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Error creating auction listing:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Buy a carbon credit
   */
  async buyCredit(
    listingId: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      logger.info(`Buying carbon credit from listing ${listingId}`);

      const tx = await this.carbonMarketplace.buyCredit(listingId);
      const receipt = await tx.wait();

      logger.info(`Carbon credit purchased successfully`);

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Error buying carbon credit:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get carbon credit data
   */
  async getCarbonCreditData(tokenId: string): Promise<{ success: boolean; data?: CarbonCreditData; error?: string }> {
    try {
      const data = await this.carbonCreditNFT.getCarbonCreditData(tokenId);
      
      return {
        success: true,
        data: {
          projectId: data.projectId.toString(),
          carbonAmount: ethers.utils.formatEther(data.carbonAmount),
          vintageYear: data.vintageYear.toString(),
          issuanceDate: data.issuanceDate.toString(),
          retirementDate: data.retirementDate.toString(),
          methodology: data.methodology,
          location: data.location,
          species: data.species,
          isRetired: data.isRetired,
          isVerified: data.isVerified,
          issuer: data.issuer,
          currentOwner: data.currentOwner
        }
      };
    } catch (error) {
      logger.error('Error getting carbon credit data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get project information
   */
  async getProjectInfo(projectId: string): Promise<{ success: boolean; data?: ProjectData; error?: string }> {
    try {
      const data = await this.carbonRegistry.getProjectInfo(projectId);
      
      return {
        success: true,
        data: {
          name: data.name,
          description: data.description,
          location: data.location,
          methodology: data.methodology,
          projectOwner: data.projectOwner,
          totalArea: ethers.utils.formatEther(data.totalArea),
          estimatedCarbon: ethers.utils.formatEther(data.estimatedCarbon),
          issuedCarbon: ethers.utils.formatEther(data.issuedCarbon),
          vintageYear: data.vintageYear.toString(),
          status: data.status,
          creationDate: data.creationDate.toString(),
          lastUpdateDate: data.lastUpdateDate.toString()
        }
      };
    } catch (error) {
      logger.error('Error getting project info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get listing information
   */
  async getListingInfo(listingId: string): Promise<{ success: boolean; data?: ListingData; error?: string }> {
    try {
      const data = await this.carbonMarketplace.getListingInfo(listingId);
      
      return {
        success: true,
        data: {
          tokenId: data.tokenId.toString(),
          seller: data.seller,
          price: ethers.utils.formatEther(data.price),
          totalPrice: ethers.utils.formatEther(data.totalPrice),
          carbonAmount: ethers.utils.formatEther(data.carbonAmount),
          listingType: data.listingType,
          status: data.status,
          startTime: data.startTime.toString(),
          endTime: data.endTime.toString(),
          highestBidder: data.highestBidder,
          highestBid: ethers.utils.formatEther(data.highestBid)
        }
      };
    } catch (error) {
      logger.error('Error getting listing info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get credits owned by an address
   */
  async getCreditsByOwner(owner: string): Promise<{ success: boolean; tokenIds?: string[]; error?: string }> {
    try {
      const tokenIds = await this.carbonCreditNFT.getCreditsByOwner(owner);
      
      return {
        success: true,
        tokenIds: tokenIds.map(id => id.toString())
      };
    } catch (error) {
      logger.error('Error getting credits by owner:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get total carbon amount owned by an address
   */
  async getTotalCarbonByOwner(owner: string): Promise<{ success: boolean; totalCarbon?: string; error?: string }> {
    try {
      const totalCarbon = await this.carbonCreditNFT.getTotalCarbonByOwner(owner);
      
      return {
        success: true,
        totalCarbon: ethers.utils.formatEther(totalCarbon)
      };
    } catch (error) {
      logger.error('Error getting total carbon by owner:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<{ success: boolean; network?: any; error?: string }> {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getGasPrice();
      
      return {
        success: true,
        network: {
          name: network.name,
          chainId: network.chainId,
          blockNumber,
          gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei')
        }
      };
    } catch (error) {
      logger.error('Error getting network info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default new BlockchainService();