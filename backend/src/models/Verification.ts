import mongoose, { Document, Schema } from 'mongoose';

export interface IVerification extends Document {
  _id: string;
  verifierId: string;
  ecosystemId: string;
  carbonCreditId?: string;
  verificationType: 'initial' | 'periodic' | 'retirement' | 'dispute';
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  methodology: {
    name: string;
    version: string;
    description: string;
    standards: string[]; // e.g., ['VCS', 'Gold Standard', 'CDM']
  };
  measurements: {
    carbonStored: number; // in tons CO2
    sequestrationRate: number; // tons CO2 per year
    measurementDate: Date;
    measurementMethod: 'satellite' | 'field' | 'model' | 'hybrid';
    confidence: 'low' | 'medium' | 'high';
    uncertainty: number; // percentage
  };
  documents: {
    title: string;
    type: 'report' | 'certificate' | 'study' | 'image' | 'data';
    url: string;
    hash: string;
    size: number;
    uploadedAt: Date;
  }[];
  fieldData: {
    plotId: string;
    coordinates: {
      lat: number;
      lon: number;
    };
    measurements: {
      biomass: number;
      soilCarbon: number;
      vegetationHeight: number;
      canopyCover: number;
      speciesCount: number;
    };
    collectedAt: Date;
    collectedBy: string;
  }[];
  satelliteData: {
    source: 'Landsat' | 'Sentinel' | 'MODIS' | 'Planet' | 'other';
    imageDate: Date;
    resolution: number;
    bands: string[];
    indices: {
      ndvi: number;
      ndwi: number;
      evi: number;
      lai: number;
    };
    cloudCover: number;
  }[];
  qualityAssurance: {
    peerReviewed: boolean;
    thirdPartyAudit: boolean;
    auditorId?: string;
    auditDate?: Date;
    auditReport?: string;
    complianceScore: number; // 0-100
  };
  review: {
    reviewerId?: string;
    reviewDate?: Date;
    comments: string[];
    recommendations: string[];
    approvalDate?: Date;
  };
  metadata: {
    version: string;
    previousVerificationId?: string;
    nextVerificationDue?: Date;
    tags: string[];
    notes: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema: Schema = new Schema({
  verifierId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Verifier ID is required'],
  },
  ecosystemId: {
    type: Schema.Types.ObjectId,
    ref: 'Ecosystem',
    required: [true, 'Ecosystem ID is required'],
  },
  carbonCreditId: {
    type: Schema.Types.ObjectId,
    ref: 'CarbonCredit',
  },
  verificationType: {
    type: String,
    required: [true, 'Verification type is required'],
    enum: ['initial', 'periodic', 'retirement', 'dispute'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending',
  },
  methodology: {
    name: {
      type: String,
      required: [true, 'Methodology name is required'],
    },
    version: {
      type: String,
      required: [true, 'Methodology version is required'],
    },
    description: {
      type: String,
      required: [true, 'Methodology description is required'],
    },
    standards: [{
      type: String,
      enum: ['VCS', 'Gold Standard', 'CDM', 'CAR', 'ACR', 'VCS+', 'Other'],
    }],
  },
  measurements: {
    carbonStored: {
      type: Number,
      required: [true, 'Carbon stored measurement is required'],
      min: [0, 'Carbon stored must be non-negative'],
    },
    sequestrationRate: {
      type: Number,
      required: [true, 'Sequestration rate is required'],
      min: [0, 'Sequestration rate must be non-negative'],
    },
    measurementDate: {
      type: Date,
      required: [true, 'Measurement date is required'],
    },
    measurementMethod: {
      type: String,
      enum: ['satellite', 'field', 'model', 'hybrid'],
      required: [true, 'Measurement method is required'],
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: [true, 'Confidence level is required'],
    },
    uncertainty: {
      type: Number,
      min: [0, 'Uncertainty must be non-negative'],
      max: [100, 'Uncertainty cannot exceed 100%'],
    },
  },
  documents: [{
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['report', 'certificate', 'study', 'image', 'data'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      min: [0, 'File size must be non-negative'],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  fieldData: [{
    plotId: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      lon: {
        type: Number,
        required: true,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
    measurements: {
      biomass: {
        type: Number,
        min: [0, 'Biomass must be non-negative'],
      },
      soilCarbon: {
        type: Number,
        min: [0, 'Soil carbon must be non-negative'],
      },
      vegetationHeight: {
        type: Number,
        min: [0, 'Vegetation height must be non-negative'],
      },
      canopyCover: {
        type: Number,
        min: [0, 'Canopy cover must be between 0 and 1'],
        max: [1, 'Canopy cover must be between 0 and 1'],
      },
      speciesCount: {
        type: Number,
        min: [0, 'Species count must be non-negative'],
      },
    },
    collectedAt: {
      type: Date,
      required: true,
    },
    collectedBy: {
      type: String,
      required: true,
    },
  }],
  satelliteData: [{
    source: {
      type: String,
      enum: ['Landsat', 'Sentinel', 'MODIS', 'Planet', 'other'],
      required: true,
    },
    imageDate: {
      type: Date,
      required: true,
    },
    resolution: {
      type: Number,
      min: [0, 'Resolution must be positive'],
    },
    bands: [String],
    indices: {
      ndvi: {
        type: Number,
        min: [-1, 'NDVI must be between -1 and 1'],
        max: [1, 'NDVI must be between -1 and 1'],
      },
      ndwi: {
        type: Number,
        min: [-1, 'NDWI must be between -1 and 1'],
        max: [1, 'NDWI must be between -1 and 1'],
      },
      evi: {
        type: Number,
        min: [-1, 'EVI must be between -1 and 1'],
        max: [1, 'EVI must be between -1 and 1'],
      },
      lai: {
        type: Number,
        min: [0, 'LAI must be non-negative'],
      },
    },
    cloudCover: {
      type: Number,
      min: [0, 'Cloud cover must be between 0 and 100'],
      max: [100, 'Cloud cover must be between 0 and 100'],
    },
  }],
  qualityAssurance: {
    peerReviewed: {
      type: Boolean,
      default: false,
    },
    thirdPartyAudit: {
      type: Boolean,
      default: false,
    },
    auditorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    auditDate: Date,
    auditReport: String,
    complianceScore: {
      type: Number,
      min: [0, 'Compliance score must be between 0 and 100'],
      max: [100, 'Compliance score must be between 0 and 100'],
    },
  },
  review: {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewDate: Date,
    comments: [String],
    recommendations: [String],
    approvalDate: Date,
  },
  metadata: {
    version: {
      type: String,
      default: '1.0',
    },
    previousVerificationId: {
      type: Schema.Types.ObjectId,
      ref: 'Verification',
    },
    nextVerificationDue: Date,
    tags: [String],
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
VerificationSchema.index({ verifierId: 1 });
VerificationSchema.index({ ecosystemId: 1 });
VerificationSchema.index({ carbonCreditId: 1 });
VerificationSchema.index({ verificationType: 1 });
VerificationSchema.index({ status: 1 });
VerificationSchema.index({ 'measurements.measurementDate': -1 });
VerificationSchema.index({ createdAt: -1 });

// Virtual for verification score
VerificationSchema.virtual('verificationScore').get(function() {
  let score = 0;
  
  // Base score from confidence
  const confidenceScores = { low: 30, medium: 60, high: 90 };
  score += confidenceScores[this.measurements.confidence] || 0;
  
  // Bonus for peer review
  if (this.qualityAssurance.peerReviewed) score += 5;
  
  // Bonus for third party audit
  if (this.qualityAssurance.thirdPartyAudit) score += 5;
  
  return Math.min(100, score);
});

// Pre-save middleware
VerificationSchema.pre('save', function(next) {
  // Set next verification due date for periodic verifications
  if (this.verificationType === 'periodic' && !this.metadata.nextVerificationDue) {
    const nextDue = new Date(this.measurements.measurementDate);
    nextDue.setFullYear(nextDue.getFullYear() + 1); // Annual verification
    this.metadata.nextVerificationDue = nextDue;
  }
  
  next();
});

// Static methods
VerificationSchema.statics.findByEcosystem = function(ecosystemId: string) {
  return this.find({ ecosystemId }).sort({ createdAt: -1 });
};

VerificationSchema.statics.findByVerifier = function(verifierId: string) {
  return this.find({ verifierId }).sort({ createdAt: -1 });
};

VerificationSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: 1 });
};

VerificationSchema.statics.findOverdue = function() {
  return this.find({
    'metadata.nextVerificationDue': { $lt: new Date() },
    status: { $ne: 'rejected' }
  }).sort({ 'metadata.nextVerificationDue': 1 });
};

export default mongoose.model<IVerification>('Verification', VerificationSchema);
