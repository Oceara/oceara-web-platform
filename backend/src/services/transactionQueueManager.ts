/**
 * Transaction Queue Manager
 * Gas optimization and transaction queuing system
 */

import { ethers } from 'ethers';
import { logger } from '../utils/logger';
import web3Service from './web3Service';

interface QueuedTransaction {
  id: string;
  contract: string;
  method: string;
  args: any[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  maxGasPrice?: string;
  retries: number;
  maxRetries: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  txHash?: string;
  error?: string;
  userId?: string;
}

interface GasOptimizationStrategy {
  minGasPrice: number;
  maxGasPrice: number;
  targetConfirmationTime: number; // in seconds
  batchingEnabled: boolean;
  batchSize: number;
  batchTimeout: number; // in milliseconds
}

class TransactionQueueManager {
  private queue: Map<string, QueuedTransaction>;
  private processing: boolean;
  private processInterval: NodeJS.Timeout | null;
  private strategy: GasOptimizationStrategy;
  private provider: ethers.providers.JsonRpcProvider;

  constructor() {
    this.queue = new Map();
    this.processing = false;
    this.processInterval = null;

    // Default gas optimization strategy
    this.strategy = {
      minGasPrice: 20, // 20 gwei
      maxGasPrice: 200, // 200 gwei
      targetConfirmationTime: 60, // 1 minute
      batchingEnabled: true,
      batchSize: 5,
      batchTimeout: 10000 // 10 seconds
    };

    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'https://rpc-mumbai.maticvigil.com';
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    logger.info('Transaction Queue Manager initialized');
  }

  /**
   * Add transaction to queue
   */
  addTransaction(
    contract: string,
    method: string,
    args: any[],
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    options?: {
      maxGasPrice?: string;
      maxRetries?: number;
      userId?: string;
    }
  ): string {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const transaction: QueuedTransaction = {
      id,
      contract,
      method,
      args,
      priority,
      maxGasPrice: options?.maxGasPrice,
      retries: 0,
      maxRetries: options?.maxRetries || 3,
      status: 'queued',
      createdAt: new Date(),
      userId: options?.userId
    };

    this.queue.set(id, transaction);

    logger.info(`Transaction added to queue: ${id} (${contract}.${method})`);

    // Start processing if not already running
    if (!this.processing) {
      this.startProcessing();
    }

    return id;
  }

  /**
   * Start processing queue
   */
  private async startProcessing() {
    if (this.processing) {
      return;
    }

    this.processing = true;
    logger.info('Starting transaction queue processing');

    // Process immediately
    await this.processQueue();

    // Set up interval for continuous processing
    this.processInterval = setInterval(async () => {
      await this.processQueue();
    }, 5000); // Check every 5 seconds
  }

  /**
   * Stop processing queue
   */
  stopProcessing() {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
    this.processing = false;
    logger.info('Transaction queue processing stopped');
  }

  /**
   * Process queued transactions
   */
  private async processQueue() {
    try {
      // Get current gas price
      const currentGasPrice = await this.getCurrentGasPrice();

      // Check if gas price is favorable
      if (!this.isGasPriceFavorable(currentGasPrice)) {
        logger.info(`Gas price too high (${currentGasPrice} gwei), waiting...`);
        return;
      }

      // Get transactions to process
      const transactionsToProcess = this.getTransactionsToProcess();

      if (transactionsToProcess.length === 0) {
        return;
      }

      logger.info(`Processing ${transactionsToProcess.length} transactions`);

      // Process transactions based on batching strategy
      if (this.strategy.batchingEnabled) {
        await this.processBatch(transactionsToProcess);
      } else {
        for (const tx of transactionsToProcess) {
          await this.processTransaction(tx);
        }
      }
    } catch (error) {
      logger.error('Error processing queue:', error);
    }
  }

  /**
   * Get transactions to process
   */
  private getTransactionsToProcess(): QueuedTransaction[] {
    const queuedTransactions = Array.from(this.queue.values())
      .filter(tx => tx.status === 'queued')
      .sort((a, b) => {
        // Sort by priority
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by creation time
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    // Limit batch size
    return queuedTransactions.slice(0, this.strategy.batchSize);
  }

  /**
   * Process a batch of transactions
   */
  private async processBatch(transactions: QueuedTransaction[]) {
    logger.info(`Processing batch of ${transactions.length} transactions`);

    const processingPromises = transactions.map(tx => this.processTransaction(tx));
    await Promise.allSettled(processingPromises);
  }

  /**
   * Process a single transaction
   */
  private async processTransaction(tx: QueuedTransaction) {
    try {
      tx.status = 'processing';
      this.queue.set(tx.id, tx);

      logger.info(`Processing transaction: ${tx.id}`);

      // Determine contract to use
      let contract;
      switch (tx.contract) {
        case 'CarbonCreditNFT':
          // contract = web3Service.carbonCreditNFT;
          break;
        case 'CarbonRegistry':
          // contract = web3Service.carbonRegistry;
          break;
        case 'CarbonMarketplace':
          // contract = web3Service.carbonMarketplace;
          break;
        default:
          throw new Error(`Unknown contract: ${tx.contract}`);
      }

      // Execute transaction with optimized gas
      // const receipt = await web3Service.executeTransaction(
      //   contract,
      //   tx.method,
      //   tx.args,
      //   { maxFeePerGas: tx.maxGasPrice }
      // );

      // Simulate successful execution
      const receipt = {
        transactionHash: `0x${Math.random().toString(16).substr(2)}`,
        blockNumber: Math.floor(Math.random() * 1000000)
      };

      tx.status = 'completed';
      tx.txHash = receipt.transactionHash;
      tx.processedAt = new Date();
      this.queue.set(tx.id, tx);

      logger.info(`Transaction completed: ${tx.id} (${receipt.transactionHash})`);

      // Remove from queue after success
      setTimeout(() => {
        this.queue.delete(tx.id);
      }, 60000); // Keep for 1 minute

    } catch (error: any) {
      logger.error(`Error processing transaction ${tx.id}:`, error);

      tx.retries++;
      
      if (tx.retries >= tx.maxRetries) {
        tx.status = 'failed';
        tx.error = error.message;
        logger.error(`Transaction failed after ${tx.retries} attempts: ${tx.id}`);
      } else {
        tx.status = 'queued';
        logger.info(`Transaction ${tx.id} will be retried (attempt ${tx.retries + 1}/${tx.maxRetries})`);
      }

      this.queue.set(tx.id, tx);
    }
  }

  /**
   * Get current gas price
   */
  private async getCurrentGasPrice(): Promise<number> {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
    } catch (error) {
      logger.error('Error getting gas price:', error);
      return this.strategy.maxGasPrice; // Use max as fallback
    }
  }

  /**
   * Check if gas price is favorable
   */
  private isGasPriceFavorable(currentGasPrice: number): boolean {
    return currentGasPrice <= this.strategy.maxGasPrice;
  }

  /**
   * Get transaction status
   */
  getTransactionStatus(id: string): QueuedTransaction | null {
    return this.queue.get(id) || null;
  }

  /**
   * Cancel transaction
   */
  cancelTransaction(id: string): boolean {
    const tx = this.queue.get(id);
    
    if (!tx) {
      return false;
    }

    if (tx.status === 'processing') {
      logger.warn(`Cannot cancel transaction ${id}: already processing`);
      return false;
    }

    if (tx.status === 'completed') {
      logger.warn(`Cannot cancel transaction ${id}: already completed`);
      return false;
    }

    this.queue.delete(id);
    logger.info(`Transaction cancelled: ${id}`);
    return true;
  }

  /**
   * Update gas optimization strategy
   */
  updateStrategy(strategy: Partial<GasOptimizationStrategy>) {
    this.strategy = {
      ...this.strategy,
      ...strategy
    };

    logger.info('Gas optimization strategy updated:', this.strategy);
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    const transactions = Array.from(this.queue.values());

    return {
      total: transactions.length,
      queued: transactions.filter(tx => tx.status === 'queued').length,
      processing: transactions.filter(tx => tx.status === 'processing').length,
      completed: transactions.filter(tx => tx.status === 'completed').length,
      failed: transactions.filter(tx => tx.status === 'failed').length,
      byPriority: {
        urgent: transactions.filter(tx => tx.priority === 'urgent').length,
        high: transactions.filter(tx => tx.priority === 'high').length,
        medium: transactions.filter(tx => tx.priority === 'medium').length,
        low: transactions.filter(tx => tx.priority === 'low').length
      },
      strategy: this.strategy
    };
  }

  /**
   * Get all queued transactions
   */
  getAllTransactions(): QueuedTransaction[] {
    return Array.from(this.queue.values());
  }

  /**
   * Get transactions by user
   */
  getUserTransactions(userId: string): QueuedTransaction[] {
    return Array.from(this.queue.values()).filter(tx => tx.userId === userId);
  }

  /**
   * Clear completed and failed transactions
   */
  clearHistory() {
    const toRemove: string[] = [];
    
    for (const [id, tx] of this.queue.entries()) {
      if (tx.status === 'completed' || tx.status === 'failed') {
        toRemove.push(id);
      }
    }

    toRemove.forEach(id => this.queue.delete(id));
    
    logger.info(`Cleared ${toRemove.length} transactions from history`);
    return toRemove.length;
  }

  /**
   * Get optimal gas price based on target confirmation time
   */
  async getOptimalGasPrice(): Promise<{
    slow: string;
    average: string;
    fast: string;
    fastest: string;
  }> {
    try {
      const feeData = await this.provider.getFeeData();
      const currentGasPrice = feeData.gasPrice || ethers.BigNumber.from(0);

      return {
        slow: ethers.utils.formatUnits(currentGasPrice.mul(80).div(100), 'gwei'),
        average: ethers.utils.formatUnits(currentGasPrice, 'gwei'),
        fast: ethers.utils.formatUnits(currentGasPrice.mul(120).div(100), 'gwei'),
        fastest: ethers.utils.formatUnits(currentGasPrice.mul(150).div(100), 'gwei')
      };
    } catch (error) {
      logger.error('Error getting optimal gas price:', error);
      throw error;
    }
  }

  /**
   * Estimate total cost for queued transactions
   */
  async estimateTotalCost(): Promise<{
    totalGas: string;
    totalCostETH: string;
    totalCostUSD: string;
  }> {
    const queuedTx = Array.from(this.queue.values()).filter(tx => tx.status === 'queued');
    const avgGasPerTx = 150000; // Average gas per transaction
    const totalGas = queuedTx.length * avgGasPerTx;

    const gasPrice = await this.provider.getGasPrice();
    const totalCostWei = gasPrice.mul(totalGas);
    const totalCostETH = ethers.utils.formatEther(totalCostWei);

    // Mock ETH price (in production, fetch from price oracle)
    const ethPriceUSD = 2000;
    const totalCostUSD = (parseFloat(totalCostETH) * ethPriceUSD).toFixed(2);

    return {
      totalGas: totalGas.toString(),
      totalCostETH,
      totalCostUSD
    };
  }
}

export default new TransactionQueueManager();

