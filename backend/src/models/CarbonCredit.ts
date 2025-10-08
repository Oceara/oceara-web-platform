import mongoose, { Document, Schema } from 'mongoose';

export interface ICarbonCredit extends Document {
  _id: string;
  tokenId: string;
  ownerId: string;
  ecosystemId: string;
  carbonAmount: number; // in tons of CO2
  price: number; // in wei (ETH)
  ecosystemType: 'mangrove' | 'wetland' | 'seagrass' | 'saltmarsh' | 'kelp';
  location: {
    coordinates: {
      lat: number;
      lon: number;
    };
    country: string;
    region: string;
  };
  verification: {
    verifierId: string;
    verificationHash: string;
    verificationDate: Date;
    documents: string[]; // IPFS hashes
    methodology: string;
    confidence: 'low' | 'medium' | 'high';
  };
  status: 'minted' | 'listed' | 'sold' | 'retired' | 'cancelled';
  transactionHistory: {
    action: 'mint' | 'list' | 'buy' | 'retire' | 'transfer';
    from: string;
    to: string;
    price?: number;
    transactionHash: string;
    timestamp: Date;
  }[];
  metadata: {
    tokenURI: string;
    imageURI: string;
    description: string;
    attributes: {
      trait_type: string;
      value: string | number;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const CarbonCreditSchema: Schema = new Schema({
  tokenId: {
    type: String,
    required: [true, 'Token ID is required'],
    unique: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required'],
  },
  ecosystemId: {
    type: Schema.Types.ObjectId,
    ref: 'Ecosystem',
    required: [true, 'Ecosystem ID is required'],
  },
  carbonAmount: {
    type: Number,
    required: [true, 'Carbon amount is required'],
    min: [0, 'Carbon amount must be positive'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive'],
  },
  ecosystemType: {
    type: String,
    required: [true, 'Ecosystem type is required'],
    enum: ['mangrove', 'wetland', 'seagrass', 'saltmarsh', 'kelp'],
  },
  location: {
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      lon: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
    },
  },
  verification: {
    verifierId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Verifier ID is required'],
    },
    verificationHash: {
      type: String,
      required: [true, 'Verification hash is required'],
    },
    verificationDate: {
      type: Date,
      required: [true, 'Verification date is required'],
    },
    documents: [String],
    methodology: {
      type: String,
      required: [true, 'Verification methodology is required'],
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  status: {
    type: String,
    enum: ['minted', 'listed', 'sold', 'retired', 'cancelled'],
    default: 'minted',
  },
  transactionHistory: [{
    action: {
      type: String,
      enum: ['mint', 'list', 'buy', 'retire', 'transfer'],
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    price: Number,
    transactionHash: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  metadata: {
    tokenURI: {
      type: String,
      required: [true, 'Token URI is required'],
    },
    imageURI: String,
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    attributes: [{
      trait_type: {
        type: String,
        required: true,
      },
      value: Schema.Types.Mixed,
    }],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
CarbonCreditSchema.index({ tokenId: 1 });
CarbonCreditSchema.index({ ownerId: 1 });
CarbonCreditSchema.index({ ecosystemId: 1 });
CarbonCreditSchema.index({ ecosystemType: 1 });
CarbonCreditSchema.index({ status: 1 });
CarbonCreditSchema.index({ 'location.coordinates': '2dsphere' });
CarbonCreditSchema.index({ createdAt: -1 });

// Virtual for price in ETH
CarbonCreditSchema.virtual('priceInETH').get(function() {
  return this.price / Math.pow(10, 18); // Convert wei to ETH
});

// Virtual for carbon density
CarbonCreditSchema.virtual('carbonDensity').get(function() {
  // This would need ecosystem area data
  return this.carbonAmount; // Simplified
});

// Pre-save middleware
CarbonCreditSchema.pre('save', function(next) {
  // Add transaction to history if status changed
  if (this.isModified('status') && !this.isNew) {
    const lastTransaction = this.transactionHistory[this.transactionHistory.length - 1];
    if (!lastTransaction || lastTransaction.action !== this.status) {
      this.transactionHistory.push({
        action: this.status as any,
        from: this.ownerId.toString(),
        to: this.ownerId.toString(),
        transactionHash: `internal_${Date.now()}`,
        timestamp: new Date(),
      });
    }
  }
  next();
});

export default mongoose.model<ICarbonCredit>('CarbonCredit', CarbonCreditSchema);
