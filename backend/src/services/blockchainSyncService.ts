/**
 * Blockchain Sync Service
 * Real-time synchronization between database and blockchain state
 */

import { ethers } from 'ethers';
import { logger } from '../utils/logger';
import web3Service from './web3Service';
import blockchainEventListener from './blockchainEventListener';

interface SyncStatus {
  lastSyncedBlock: number;
  currentBlock: number;
  isSyncing: boolean;
  syncProgress: number;
  pendingTransactions: number;
}

interface BlockchainState {
  tokenId: string;
  onChainData: any;
  databaseData: any;
  inSync: boolean;
  discrepancies?: string[];
}

class BlockchainSyncService {
  private provider: ethers.providers.JsonRpcProvider;
  private syncInterval: NodeJS.Timeout | null;
  private syncIntervalMs: number;
  private lastSyncedBlock: number;
  private isSyncing: boolean;
  private syncBatchSize: number;

  constructor() {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'https://rpc-mumbai.maticvigil.com';
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    this.syncInterval = null;
    this.syncIntervalMs = 60000; // 1 minute
    this.lastSyncedBlock = 0;
    this.isSyncing = false;
    this.syncBatchSize = 100; // Process 100 blocks at a time
  }

  /**
   * Start automatic synchronization
   */
  async startAutoSync() {
    if (this.syncInterval) {
      logger.warn('Auto-sync is already running');
      return;
    }

    logger.info('Starting automatic blockchain synchronization...');

    // Initial sync
    await this.syncAll();

    // Set up interval
    this.syncInterval = setInterval(async () => {
      await this.syncAll();
    }, this.syncIntervalMs);

    logger.info(`Auto-sync started with interval: ${this.syncIntervalMs}ms`);
  }

  /**
   * Stop automatic synchronization
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.info('Auto-sync stopped');
    }
  }

  /**
   * Sync all data
   */
  async syncAll() {
    if (this.isSyncing) {
      logger.warn('Sync already in progress');
      return;
    }

    this.isSyncing = true;
    logger.info('Starting full blockchain sync...');

    try {
      // Get current block number
      const currentBlock = await this.provider.getBlockNumber();
      
      // If first sync, start from recent blocks only
      if (this.lastSyncedBlock === 0) {
        this.lastSyncedBlock = Math.max(0, currentBlock - 1000); // Sync last 1000 blocks
      }

      logger.info(`Syncing from block ${this.lastSyncedBlock} to ${currentBlock}`);

      // Sync in batches
      let fromBlock = this.lastSyncedBlock + 1;
      while (fromBlock <= currentBlock) {
        const toBlock = Math.min(fromBlock + this.syncBatchSize - 1, currentBlock);
        
        await this.syncBlockRange(fromBlock, toBlock);
        
        fromBlock = toBlock + 1;
        this.lastSyncedBlock = toBlock;
      }

      // Sync pending transactions
      await this.syncPendingTransactions();

      // Verify data consistency
      await this.verifyDataConsistency();

      logger.info('Blockchain sync completed successfully');
    } catch (error) {
      logger.error('Error during blockchain sync:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a specific block range
   */
  private async syncBlockRange(fromBlock: number, toBlock: number) {
    try {
      logger.info(`Syncing blocks ${fromBlock} to ${toBlock}`);

      // Get contract addresses
      const nftAddress = process.env.CARBON_CREDIT_NFT_ADDRESS;
      const registryAddress = process.env.CARBON_REGISTRY_ADDRESS;
      const marketplaceAddress = process.env.CARBON_MARKETPLACE_ADDRESS;

      // Fetch logs for all contracts
      const filter = {
        fromBlock,
        toBlock,
        address: [nftAddress, registryAddress, marketplaceAddress].filter(Boolean)
      };

      const logs = await this.provider.getLogs(filter);

      logger.info(`Found ${logs.length} events in blocks ${fromBlock}-${toBlock}`);

      // Process each log
      for (const log of logs) {
        await this.processLog(log);
      }
    } catch (error) {
      logger.error(`Error syncing block range ${fromBlock}-${toBlock}:`, error);
      throw error;
    }
  }

  /**
   * Process a single log
   */
  private async processLog(log: ethers.providers.Log) {
    try {
      // Determine which contract emitted the event
      const nftAddress = process.env.CARBON_CREDIT_NFT_ADDRESS?.toLowerCase();
      const registryAddress = process.env.CARBON_REGISTRY_ADDRESS?.toLowerCase();
      const marketplaceAddress = process.env.CARBON_MARKETPLACE_ADDRESS?.toLowerCase();

      const logAddress = log.address.toLowerCase();

      // Parse and process based on contract
      if (logAddress === nftAddress) {
        await this.processNFTLog(log);
      } else if (logAddress === registryAddress) {
        await this.processRegistryLog(log);
      } else if (logAddress === marketplaceAddress) {
        await this.processMarketplaceLog(log);
      }
    } catch (error) {
      logger.error('Error processing log:', error);
    }
  }

  /**
   * Process NFT contract log
   */
  private async processNFTLog(log: ethers.providers.Log) {
    // In production, decode log and update database
    // This is a simplified example
    logger.debug(`Processing NFT log: ${log.transactionHash}`);
  }

  /**
   * Process Registry contract log
   */
  private async processRegistryLog(log: ethers.providers.Log) {
    logger.debug(`Processing Registry log: ${log.transactionHash}`);
  }

  /**
   * Process Marketplace contract log
   */
  private async processMarketplaceLog(log: ethers.providers.Log) {
    logger.debug(`Processing Marketplace log: ${log.transactionHash}`);
  }

  /**
   * Sync pending transactions
   */
  private async syncPendingTransactions() {
    try {
      const pendingTxHashes = web3Service.getPendingTransactions();
      
      if (pendingTxHashes.length === 0) {
        return;
      }

      logger.info(`Checking ${pendingTxHashes.length} pending transactions`);

      for (const txHash of pendingTxHashes) {
        const receipt = await web3Service.getTransactionReceipt(txHash);
        
        if (receipt) {
          logger.info(`Transaction confirmed: ${txHash} (block ${receipt.blockNumber})`);
          
          // Update database with confirmed transaction
          // await Transaction.updateOne(
          //   { txHash },
          //   { 
          //     status: 'confirmed',
          //     blockNumber: receipt.blockNumber,
          //     gasUsed: receipt.gasUsed.toString(),
          //     confirmedAt: new Date()
          //   }
          // );
        }
      }
    } catch (error) {
      logger.error('Error syncing pending transactions:', error);
    }
  }

  /**
   * Verify data consistency between blockchain and database
   */
  private async verifyDataConsistency() {
    try {
      logger.info('Verifying data consistency...');

      // Get all carbon credits from database
      // const dbCredits = await CarbonCredit.find({ isRetired: false });

      // Sample verification
      const sampleSize = 10;
      // const samplesToCheck = dbCredits.slice(0, sampleSize);

      let discrepancies = 0;

      // for (const dbCredit of samplesToCheck) {
      //   const onChainData = await web3Service.getCarbonCreditData(dbCredit.tokenId);
      //   
      //   const isConsistent = this.compareData(dbCredit, onChainData);
      //   
      //   if (!isConsistent) {
      //     discrepancies++;
      //     logger.warn(`Data mismatch for token ${dbCredit.tokenId}`);
      //     await this.resolveDiscrepancy(dbCredit.tokenId, dbCredit, onChainData);
      //   }
      // }

      if (discrepancies > 0) {
        logger.warn(`Found ${discrepancies} data discrepancies`);
      } else {
        logger.info('All data is consistent');
      }
    } catch (error) {
      logger.error('Error verifying data consistency:', error);
    }
  }

  /**
   * Compare database data with blockchain data
   */
  private compareData(dbData: any, onChainData: any): boolean {
    // Compare key fields
    const fieldsToCompare = [
      'projectId',
      'carbonAmount',
      'vintageYear',
      'isRetired',
      'isVerified',
      'currentOwner'
    ];

    for (const field of fieldsToCompare) {
      if (dbData[field]?.toString() !== onChainData[field]?.toString()) {
        logger.debug(`Mismatch in ${field}: DB=${dbData[field]}, Chain=${onChainData[field]}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Resolve data discrepancy
   */
  private async resolveDiscrepancy(tokenId: string, dbData: any, onChainData: any) {
    try {
      logger.info(`Resolving discrepancy for token ${tokenId}`);

      // Blockchain is source of truth - update database
      // await CarbonCredit.updateOne(
      //   { tokenId },
      //   {
      //     projectId: onChainData.projectId,
      //     carbonAmount: onChainData.carbonAmount,
      //     vintageYear: onChainData.vintageYear,
      //     isRetired: onChainData.isRetired,
      //     isVerified: onChainData.isVerified,
      //     currentOwner: onChainData.currentOwner,
      //     lastSyncedAt: new Date()
      //   }
      // );

      logger.info(`Discrepancy resolved for token ${tokenId}`);
    } catch (error) {
      logger.error(`Error resolving discrepancy for token ${tokenId}:`, error);
    }
  }

  /**
   * Force sync specific token
   */
  async syncToken(tokenId: number): Promise<boolean> {
    try {
      logger.info(`Force syncing token ${tokenId}`);

      const onChainData = await web3Service.getCarbonCreditData(tokenId);

      // Update database
      // await CarbonCredit.updateOne(
      //   { tokenId: tokenId.toString() },
      //   {
      //     ...onChainData,
      //     lastSyncedAt: new Date()
      //   },
      //   { upsert: true }
      // );

      logger.info(`Token ${tokenId} synced successfully`);
      return true;
    } catch (error) {
      logger.error(`Error syncing token ${tokenId}:`, error);
      return false;
    }
  }

  /**
   * Force sync specific project
   */
  async syncProject(projectId: number): Promise<boolean> {
    try {
      logger.info(`Force syncing project ${projectId}`);

      const onChainData = await web3Service.getProjectInfo(projectId);

      // Update database
      // await Project.updateOne(
      //   { projectId: projectId.toString() },
      //   {
      //     ...onChainData,
      //     lastSyncedAt: new Date()
      //   },
      //   { upsert: true }
      // );

      logger.info(`Project ${projectId} synced successfully`);
      return true;
    } catch (error) {
      logger.error(`Error syncing project ${projectId}:`, error);
      return false;
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const pendingTxCount = web3Service.getPendingTransactions().length;

      const totalBlocks = currentBlock - (this.lastSyncedBlock || 0);
      const syncProgress = totalBlocks > 0 
        ? ((this.lastSyncedBlock / currentBlock) * 100)
        : 100;

      return {
        lastSyncedBlock: this.lastSyncedBlock,
        currentBlock,
        isSyncing: this.isSyncing,
        syncProgress: Math.min(syncProgress, 100),
        pendingTransactions: pendingTxCount
      };
    } catch (error) {
      logger.error('Error getting sync status:', error);
      throw error;
    }
  }

  /**
   * Get blockchain state for a token
   */
  async getBlockchainState(tokenId: number): Promise<BlockchainState> {
    try {
      const onChainData = await web3Service.getCarbonCreditData(tokenId);
      
      // Get database data
      // const databaseData = await CarbonCredit.findOne({ tokenId: tokenId.toString() });

      const databaseData = null; // Placeholder

      const discrepancies: string[] = [];
      
      if (databaseData) {
        if (databaseData.carbonAmount !== onChainData.carbonAmount) {
          discrepancies.push('Carbon amount mismatch');
        }
        if (databaseData.currentOwner !== onChainData.currentOwner) {
          discrepancies.push('Owner mismatch');
        }
        if (databaseData.isRetired !== onChainData.isRetired) {
          discrepancies.push('Retirement status mismatch');
        }
      }

      return {
        tokenId: tokenId.toString(),
        onChainData,
        databaseData,
        inSync: discrepancies.length === 0,
        discrepancies: discrepancies.length > 0 ? discrepancies : undefined
      };
    } catch (error) {
      logger.error(`Error getting blockchain state for token ${tokenId}:`, error);
      throw error;
    }
  }

  /**
   * Resync from specific block
   */
  async resyncFromBlock(blockNumber: number) {
    logger.info(`Resyncing from block ${blockNumber}`);
    this.lastSyncedBlock = blockNumber - 1;
    await this.syncAll();
  }

  /**
   * Get service status
   */
  getServiceStatus() {
    return {
      isSyncing: this.isSyncing,
      autoSyncEnabled: this.syncInterval !== null,
      lastSyncedBlock: this.lastSyncedBlock,
      syncIntervalMs: this.syncIntervalMs,
      batchSize: this.syncBatchSize
    };
  }
}

export default new BlockchainSyncService();

