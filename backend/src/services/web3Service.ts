/**
 * Web3 Service Layer
 * Comprehensive service for smart contract interactions
 */

import { ethers } from 'ethers';
import { logger } from '../utils/logger';
import { createAuditLog } from './auditLogger';

// Contract ABIs
import CarbonCreditNFTABI from '../../../contracts/abis/CarbonCreditNFT.json';
import CarbonRegistryABI from '../../../contracts/abis/CarbonRegistry.json';
import CarbonMarketplaceABI from '../../../contracts/abis/CarbonMarketplace.json';

export interface TransactionOptions {
  gasLimit?: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
}

export interface ContractCallOptions extends TransactionOptions {
  value?: string;
}

class Web3Service {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private carbonCreditNFT: ethers.Contract;
  private carbonRegistry: ethers.Contract;
  private carbonMarketplace: ethers.Contract;
  private transactionQueue: Map<string, any>;
  private pendingTransactions: Set<string>;

  constructor() {
    // Initialize provider
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'https://rpc-mumbai.maticvigil.com';
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // Initialize wallet
    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('ADMIN_PRIVATE_KEY not set in environment variables');
    }
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    // Initialize contracts
    this.carbonCreditNFT = new ethers.Contract(
      process.env.CARBON_CREDIT_NFT_ADDRESS || '',
      CarbonCreditNFTABI,
      this.wallet
    );

    this.carbonRegistry = new ethers.Contract(
      process.env.CARBON_REGISTRY_ADDRESS || '',
      CarbonRegistryABI,
      this.wallet
    );

    this.carbonMarketplace = new ethers.Contract(
      process.env.CARBON_MARKETPLACE_ADDRESS || '',
      CarbonMarketplaceABI,
      this.wallet
    );

    this.transactionQueue = new Map();
    this.pendingTransactions = new Set();

    logger.info('Web3 Service initialized successfully');
  }

  /**
   * Get current network information
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getGasPrice();
      const balance = await this.wallet.getBalance();

      return {
        network: network.name,
        chainId: network.chainId,
        blockNumber,
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
        walletAddress: this.wallet.address,
        balance: ethers.utils.formatEther(balance)
      };
    } catch (error) {
      logger.error('Error getting network info:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(
    contract: ethers.Contract,
    method: string,
    args: any[],
    options: ContractCallOptions = {}
  ): Promise<ethers.BigNumber> {
    try {
      const gasEstimate = await contract.estimateGas[method](...args, options);
      // Add 20% buffer for safety
      return gasEstimate.mul(120).div(100);
    } catch (error) {
      logger.error(`Error estimating gas for ${method}:`, error);
      throw error;
    }
  }

  /**
   * Get optimized gas price
   */
  async getOptimizedGasPrice(): Promise<{
    maxFeePerGas: ethers.BigNumber;
    maxPriorityFeePerGas: ethers.BigNumber;
  }> {
    try {
      const feeData = await this.provider.getFeeData();
      
      // Use EIP-1559 if available
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        return {
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        };
      }

      // Fallback to legacy gas price
      const gasPrice = feeData.gasPrice || await this.provider.getGasPrice();
      return {
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: ethers.BigNumber.from(0)
      };
    } catch (error) {
      logger.error('Error getting gas price:', error);
      throw error;
    }
  }

  /**
   * Execute a contract transaction with retry logic
   */
  async executeTransaction(
    contract: ethers.Contract,
    method: string,
    args: any[],
    options: ContractCallOptions = {},
    maxRetries: number = 3
  ): Promise<ethers.providers.TransactionReceipt> {
    let attempt = 0;
    let lastError: any;

    while (attempt < maxRetries) {
      try {
        // Get optimized gas parameters
        const gasParams = await this.getOptimizedGasPrice();
        const gasLimit = await this.estimateGas(contract, method, args, options);

        const txOptions = {
          ...options,
          gasLimit,
          maxFeePerGas: options.maxFeePerGas || gasParams.maxFeePerGas,
          maxPriorityFeePerGas: options.maxPriorityFeePerGas || gasParams.maxPriorityFeePerGas
        };

        logger.info(`Executing ${method} (attempt ${attempt + 1}/${maxRetries})`);

        // Execute transaction
        const tx = await contract[method](...args, txOptions);
        this.pendingTransactions.add(tx.hash);

        logger.info(`Transaction submitted: ${tx.hash}`);

        // Wait for confirmation
        const receipt = await tx.wait();
        this.pendingTransactions.delete(tx.hash);

        logger.info(`Transaction confirmed: ${tx.hash} (block ${receipt.blockNumber})`);

        return receipt;
      } catch (error: any) {
        lastError = error;
        attempt++;

        logger.error(`Transaction attempt ${attempt} failed:`, error);

        // Don't retry if it's a revert or user error
        if (
          error.code === 'CALL_EXCEPTION' ||
          error.message.includes('revert') ||
          error.message.includes('insufficient funds')
        ) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          logger.info(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Transaction failed after ${maxRetries} attempts: ${lastError.message}`);
  }

  /**
   * Call a read-only contract method
   */
  async callContract(
    contract: ethers.Contract,
    method: string,
    args: any[] = []
  ): Promise<any> {
    try {
      const result = await contract[method](...args);
      return result;
    } catch (error) {
      logger.error(`Error calling ${method}:`, error);
      throw error;
    }
  }

  /**
   * Mint a carbon credit NFT
   */
  async mintCarbonCredit(
    to: string,
    projectId: number,
    carbonAmount: string,
    vintageYear: number,
    methodology: string,
    location: string,
    species: string,
    tokenURI: string
  ): Promise<{
    success: boolean;
    tokenId?: string;
    txHash?: string;
    blockNumber?: number;
    error?: string;
  }> {
    try {
      logger.info(`Minting carbon credit for project ${projectId}`);

      const carbonAmountWei = ethers.utils.parseEther(carbonAmount);

      const receipt = await this.executeTransaction(
        this.carbonCreditNFT,
        'mintCredit',
        [to, projectId, carbonAmountWei, vintageYear, methodology, location, species, tokenURI]
      );

      // Extract tokenId from events
      const event = receipt.events?.find(e => e.event === 'CreditIssued');
      const tokenId = event?.args?.tokenId?.toString();

      logger.info(`Carbon credit minted successfully: Token ID ${tokenId}`);

      return {
        success: true,
        tokenId,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    } catch (error: any) {
      logger.error('Error minting carbon credit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Transfer a carbon credit
   */
  async transferCarbonCredit(
    from: string,
    to: string,
    tokenId: number
  ): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      logger.info(`Transferring token ${tokenId} from ${from} to ${to}`);

      const receipt = await this.executeTransaction(
        this.carbonCreditNFT,
        'transferFrom',
        [from, to, tokenId]
      );

      logger.info(`Token transferred successfully: ${receipt.transactionHash}`);

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error: any) {
      logger.error('Error transferring carbon credit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Retire a carbon credit
   */
  async retireCarbonCredit(
    tokenId: number,
    retirementReason: string
  ): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      logger.info(`Retiring token ${tokenId}`);

      const receipt = await this.executeTransaction(
        this.carbonCreditNFT,
        'retireCredit',
        [tokenId, retirementReason]
      );

      logger.info(`Token retired successfully: ${receipt.transactionHash}`);

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error: any) {
      logger.error('Error retiring carbon credit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify a carbon credit
   */
  async verifyCarbonCredit(
    tokenId: number,
    verified: boolean,
    verificationNotes: string
  ): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      logger.info(`Verifying token ${tokenId}: ${verified}`);

      const receipt = await this.executeTransaction(
        this.carbonCreditNFT,
        'verifyCredit',
        [tokenId, verified, verificationNotes]
      );

      logger.info(`Token verification updated: ${receipt.transactionHash}`);

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error: any) {
      logger.error('Error verifying carbon credit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a carbon project
   */
  async createProject(
    name: string,
    description: string,
    location: string,
    methodology: string,
    totalArea: string,
    estimatedCarbon: string,
    vintageYear: number
  ): Promise<{
    success: boolean;
    projectId?: string;
    txHash?: string;
    error?: string;
  }> {
    try {
      logger.info(`Creating project: ${name}`);

      const totalAreaWei = ethers.utils.parseEther(totalArea);
      const estimatedCarbonWei = ethers.utils.parseEther(estimatedCarbon);

      const receipt = await this.executeTransaction(
        this.carbonRegistry,
        'createProject',
        [name, description, location, methodology, totalAreaWei, estimatedCarbonWei, vintageYear]
      );

      // Extract projectId from events
      const event = receipt.events?.find(e => e.event === 'ProjectCreated');
      const projectId = event?.args?.projectId?.toString();

      logger.info(`Project created successfully: ID ${projectId}`);

      return {
        success: true,
        projectId,
        txHash: receipt.transactionHash
      };
    } catch (error: any) {
      logger.error('Error creating project:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a marketplace listing
   */
  async createListing(
    tokenId: number,
    price: string,
    duration: number,
    listingType: 'fixed' | 'auction'
  ): Promise<{
    success: boolean;
    listingId?: string;
    txHash?: string;
    error?: string;
  }> {
    try {
      logger.info(`Creating ${listingType} listing for token ${tokenId}`);

      const priceWei = ethers.utils.parseEther(price);
      const method = listingType === 'fixed' ? 'createFixedPriceListing' : 'createAuctionListing';

      const receipt = await this.executeTransaction(
        this.carbonMarketplace,
        method,
        [tokenId, priceWei, duration]
      );

      // Extract listingId from events
      const event = receipt.events?.find(e => e.event === 'ListingCreated');
      const listingId = event?.args?.listingId?.toString();

      logger.info(`Listing created successfully: ID ${listingId}`);

      return {
        success: true,
        listingId,
        txHash: receipt.transactionHash
      };
    } catch (error: any) {
      logger.error('Error creating listing:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Buy a carbon credit from marketplace
   */
  async buyCarbonCredit(
    listingId: number
  ): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      logger.info(`Buying from listing ${listingId}`);

      const receipt = await this.executeTransaction(
        this.carbonMarketplace,
        'buyCredit',
        [listingId]
      );

      logger.info(`Purchase successful: ${receipt.transactionHash}`);

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error: any) {
      logger.error('Error buying carbon credit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get carbon credit data
   */
  async getCarbonCreditData(tokenId: number) {
    try {
      const data = await this.callContract(this.carbonCreditNFT, 'getCarbonCreditData', [tokenId]);
      
      return {
        projectId: data.projectId.toString(),
        carbonAmount: ethers.utils.formatEther(data.carbonAmount),
        vintageYear: data.vintageYear.toString(),
        issuanceDate: new Date(data.issuanceDate.toNumber() * 1000).toISOString(),
        retirementDate: data.retirementDate.toNumber() > 0 
          ? new Date(data.retirementDate.toNumber() * 1000).toISOString() 
          : null,
        methodology: data.methodology,
        location: data.location,
        species: data.species,
        isRetired: data.isRetired,
        isVerified: data.isVerified,
        issuer: data.issuer,
        currentOwner: data.currentOwner
      };
    } catch (error) {
      logger.error('Error getting carbon credit data:', error);
      throw error;
    }
  }

  /**
   * Get project information
   */
  async getProjectInfo(projectId: number) {
    try {
      const data = await this.callContract(this.carbonRegistry, 'getProjectInfo', [projectId]);
      
      return {
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
        creationDate: new Date(data.creationDate.toNumber() * 1000).toISOString(),
        lastUpdateDate: new Date(data.lastUpdateDate.toNumber() * 1000).toISOString()
      };
    } catch (error) {
      logger.error('Error getting project info:', error);
      throw error;
    }
  }

  /**
   * Get listing information
   */
  async getListingInfo(listingId: number) {
    try {
      const data = await this.callContract(this.carbonMarketplace, 'getListingInfo', [listingId]);
      
      return {
        tokenId: data.tokenId.toString(),
        seller: data.seller,
        price: ethers.utils.formatEther(data.price),
        totalPrice: ethers.utils.formatEther(data.totalPrice),
        carbonAmount: ethers.utils.formatEther(data.carbonAmount),
        listingType: data.listingType === 0 ? 'fixed' : 'auction',
        status: ['active', 'sold', 'cancelled', 'ended'][data.status],
        startTime: new Date(data.startTime.toNumber() * 1000).toISOString(),
        endTime: new Date(data.endTime.toNumber() * 1000).toISOString(),
        highestBidder: data.highestBidder,
        highestBid: ethers.utils.formatEther(data.highestBid)
      };
    } catch (error) {
      logger.error('Error getting listing info:', error);
      throw error;
    }
  }

  /**
   * Get credits owned by an address
   */
  async getCreditsByOwner(owner: string): Promise<string[]> {
    try {
      const tokenIds = await this.callContract(this.carbonCreditNFT, 'getCreditsByOwner', [owner]);
      return tokenIds.map((id: ethers.BigNumber) => id.toString());
    } catch (error) {
      logger.error('Error getting credits by owner:', error);
      throw error;
    }
  }

  /**
   * Get total carbon by owner
   */
  async getTotalCarbonByOwner(owner: string): Promise<string> {
    try {
      const totalCarbon = await this.callContract(this.carbonCreditNFT, 'getTotalCarbonByOwner', [owner]);
      return ethers.utils.formatEther(totalCarbon);
    } catch (error) {
      logger.error('Error getting total carbon by owner:', error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string): Promise<ethers.providers.TransactionReceipt | null> {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      logger.error('Error getting transaction receipt:', error);
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    txHash: string,
    confirmations: number = 1,
    timeout: number = 120000
  ): Promise<ethers.providers.TransactionReceipt> {
    try {
      return await this.provider.waitForTransaction(txHash, confirmations, timeout);
    } catch (error) {
      logger.error('Error waiting for transaction:', error);
      throw error;
    }
  }

  /**
   * Get pending transactions
   */
  getPendingTransactions(): string[] {
    return Array.from(this.pendingTransactions);
  }

  /**
   * Check if transaction is pending
   */
  isTransactionPending(txHash: string): boolean {
    return this.pendingTransactions.has(txHash);
  }

  /**
   * Get current gas price in Gwei
   */
  async getCurrentGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return ethers.utils.formatUnits(gasPrice, 'gwei');
    } catch (error) {
      logger.error('Error getting current gas price:', error);
      throw error;
    }
  }

  /**
   * Parse transaction error
   */
  parseTransactionError(error: any): string {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return 'Insufficient funds for transaction';
    }
    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      return 'Transaction would fail - contract revert or invalid state';
    }
    if (error.code === 'NONCE_EXPIRED') {
      return 'Transaction nonce already used';
    }
    if (error.message.includes('revert')) {
      const match = error.message.match(/revert (.+)/);
      return match ? `Contract reverted: ${match[1]}` : 'Transaction reverted';
    }
    return error.message || 'Unknown transaction error';
  }
}

export default new Web3Service();

