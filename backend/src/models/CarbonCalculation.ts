/**
 * Carbon Calculation Model
 * Stores carbon calculation results with full audit trail
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ICarbonCalculation extends Document {
  ecosystemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  calculationType: 'single' | 'forest' | 'ai_assisted' | 'manual_override';
  
  // Input data
  inputData: {
    treeCount: number;
    areaHectares: number;
    species: string;
    measurements?: Array<{
      speciesType: string;
      dbh: number;
      height: number;
      crownRadius?: number;
      age?: number;
      healthScore?: number;
    }>;
  };

  // AI/ML results (if applicable)
  aiResults?: {
    crownDetection?: {
      crownsDetected: number;
      confidence: number;
    };
    speciesClassification?: {
      species: string;
      confidence: number;
    };
    healthAssessment?: {
      healthScore: number;
      confidence: number;
    };
  };

  // Calculation results
  results: {
    totalAGB: number;
    totalBGB: number;
    totalBiomass: number;
    carbonStock: number;
    co2Sequestration: number;
    annualSequestration: number;
    crownArea: number;
    basalArea: number;
    confidence: number;
    methodology: string;
    calculations: {
      perTree: {
        avgAGB: number;
        avgBGB: number;
        avgCarbonStock: number;
        avgCO2: number;
      };
      perHectare: {
        biomass: number;
        carbonStock: number;
        co2Sequestration: number;
      };
    };
    speciesBreakdown: Array<{
      species: string;
      count: number;
      totalAGB: number;
      carbonStock: number;
      co2Sequestration: number;
    }>;
  };

  // Manual overrides (admin)
  manualOverrides?: {
    appliedBy: mongoose.Types.ObjectId;
    appliedAt: Date;
    reason: string;
    overrides: {
      crownCount?: number;
      species?: string;
      healthScore?: number;
      confidence?: number;
    };
    previousResults: any;
  };

  // Verification status
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'requires_review';
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  verificationNotes?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'submitted' | 'approved' | 'archived';
}

const CarbonCalculationSchema: Schema = new Schema(
  {
    ecosystemId: {
      type: Schema.Types.ObjectId,
      ref: 'Ecosystem',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    calculationType: {
      type: String,
      enum: ['single', 'forest', 'ai_assisted', 'manual_override'],
      required: true
    },
    
    inputData: {
      treeCount: { type: Number, required: true },
      areaHectares: { type: Number, required: true },
      species: { type: String, required: true },
      measurements: [{
        speciesType: String,
        dbh: Number,
        height: Number,
        crownRadius: Number,
        age: Number,
        healthScore: Number
      }]
    },

    aiResults: {
      crownDetection: {
        crownsDetected: Number,
        confidence: Number
      },
      speciesClassification: {
        species: String,
        confidence: Number
      },
      healthAssessment: {
        healthScore: Number,
        confidence: Number
      }
    },

    results: {
      totalAGB: { type: Number, required: true },
      totalBGB: { type: Number, required: true },
      totalBiomass: { type: Number, required: true },
      carbonStock: { type: Number, required: true },
      co2Sequestration: { type: Number, required: true },
      annualSequestration: { type: Number, required: true },
      crownArea: Number,
      basalArea: Number,
      confidence: { type: Number, required: true },
      methodology: { type: String, required: true },
      calculations: {
        perTree: {
          avgAGB: Number,
          avgBGB: Number,
          avgCarbonStock: Number,
          avgCO2: Number
        },
        perHectare: {
          biomass: Number,
          carbonStock: Number,
          co2Sequestration: Number
        }
      },
      speciesBreakdown: [{
        species: String,
        count: Number,
        totalAGB: Number,
        carbonStock: Number,
        co2Sequestration: Number
      }]
    },

    manualOverrides: {
      appliedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      appliedAt: Date,
      reason: String,
      overrides: {
        crownCount: Number,
        species: String,
        healthScore: Number,
        confidence: Number
      },
      previousResults: Schema.Types.Mixed
    },

    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'requires_review'],
      default: 'pending',
      index: true
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationNotes: String,

    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'archived'],
      default: 'draft',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
CarbonCalculationSchema.index({ ecosystemId: 1, createdAt: -1 });
CarbonCalculationSchema.index({ userId: 1, verificationStatus: 1 });
CarbonCalculationSchema.index({ 'results.co2Sequestration': -1 });

// Virtual for total carbon credits potential
CarbonCalculationSchema.virtual('carbonCreditsPotential').get(function() {
  return this.results.co2Sequestration;
});

export default mongoose.model<ICarbonCalculation>('CarbonCalculation', CarbonCalculationSchema);
