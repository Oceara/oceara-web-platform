import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  _id: string;
  transactionHash: string;
  type: 'mint' | 'list' | 'buy' | 'retire' | 'transfer' | 'refund';
  carbonCreditId: string;
  fromUserId?: string;
  toUserId?: string;
  fromAddress?: string;
  toAddress?: string;
  amount: number; // in wei for ETH transactions
  price?: number; // price per unit
  quantity?: number; // number of carbon credits
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  gasUsed?: number;
  gasPrice?: number;
  blockNumber?: number;
  blockHash?: string;
  confirmationCount: number;
  network: 'ethereum' | 'polygon' | 'bsc' | 'arbitrum';
  metadata: {
    ecosystemType?: string;
    carbonAmount?: number;
    verificationHash?: string;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema({
  transactionHash: {
    type: String,
    required: [true, 'Transaction hash is required'],
    unique: true,
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: ['mint', 'list', 'buy', 'retire', 'transfer', 'refund'],
  },
  carbonCreditId: {
    type: Schema.Types.ObjectId,
    ref: 'CarbonCredit',
    required: [true, 'Carbon credit ID is required'],
  },
  fromUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  toUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  fromAddress: {
    type: String,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'],
  },
  toAddress: {
    type: String,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be non-negative'],
  },
  price: {
    type: Number,
    min: [0, 'Price must be non-negative'],
  },
  quantity: {
    type: Number,
    min: [0, 'Quantity must be non-negative'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'cancelled'],
    default: 'pending',
  },
  gasUsed: {
    type: Number,
    min: [0, 'Gas used must be non-negative'],
  },
  gasPrice: {
    type: Number,
    min: [0, 'Gas price must be non-negative'],
  },
  blockNumber: {
    type: Number,
    min: [0, 'Block number must be non-negative'],
  },
  blockHash: String,
  confirmationCount: {
    type: Number,
    default: 0,
    min: [0, 'Confirmation count must be non-negative'],
  },
  network: {
    type: String,
    enum: ['ethereum', 'polygon', 'bsc', 'arbitrum'],
    default: 'ethereum',
  },
  metadata: {
    ecosystemType: {
      type: String,
      enum: ['mangrove', 'wetland', 'seagrass', 'saltmarsh', 'kelp'],
    },
    carbonAmount: {
      type: Number,
      min: [0, 'Carbon amount must be non-negative'],
    },
    verificationHash: String,
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
TransactionSchema.index({ transactionHash: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ carbonCreditId: 1 });
TransactionSchema.index({ fromUserId: 1 });
TransactionSchema.index({ toUserId: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ network: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ blockNumber: 1 });

// Virtual for amount in ETH
TransactionSchema.virtual('amountInETH').get(function() {
  return this.amount / Math.pow(10, 18); // Convert wei to ETH
});

// Virtual for gas cost in ETH
TransactionSchema.virtual('gasCostInETH').get(function() {
  if (this.gasUsed && this.gasPrice) {
    return (this.gasUsed * this.gasPrice) / Math.pow(10, 18);
  }
  return 0;
});

// Virtual for total value
TransactionSchema.virtual('totalValue').get(function() {
  if (this.price && this.quantity) {
    return this.price * this.quantity;
  }
  return this.amount;
});

// Pre-save middleware
TransactionSchema.pre('save', function(next) {
  // Ensure at least one of fromUserId or fromAddress is provided
  if (!this.fromUserId && !this.fromAddress) {
    return next(new Error('Either fromUserId or fromAddress must be provided'));
  }
  
  // Ensure at least one of toUserId or toAddress is provided
  if (!this.toUserId && !this.toAddress) {
    return next(new Error('Either toUserId or toAddress must be provided'));
  }
  
  next();
});

// Static methods
TransactionSchema.statics.findByUser = function(userId: string) {
  return this.find({
    $or: [
      { fromUserId: userId },
      { toUserId: userId }
    ]
  }).sort({ createdAt: -1 });
};

TransactionSchema.statics.findByCarbonCredit = function(carbonCreditId: string) {
  return this.find({ carbonCreditId }).sort({ createdAt: -1 });
};

TransactionSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

TransactionSchema.statics.getTransactionStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
};

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
