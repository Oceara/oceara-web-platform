/**
 * Project Model
 * Represents a mangrove/wetland restoration or conservation project
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  // Basic Information
  projectId: string;
  name: string;
  description: string;
  projectType: 'restoration' | 'conservation' | 'afforestation' | 'protection';
  
  // Owner Information
  ownerId: mongoose.Types.ObjectId;
  ownerName: string;
  ownerContact: {
    email: string;
    phone?: string;
    address?: string;
  };

  // Location Data
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  area: {
    total: number; // in hectares
    restored?: number;
    conserved?: number;
  };
  country: string;
  region: string;
  gpsCoordinates?: {
    corners: Array<[number, number]>;
    boundary?: any; // GeoJSON
  };

  // Ecosystem Data
  ecosystemType: 'mangrove' | 'wetland' | 'seagrass' | 'salt_marsh' | 'mixed';
  species: Array<{
    scientificName: string;
    commonName: string;
    count: number;
    percentage: number;
  }>;
  biodiversity?: {
    fauna: string[];
    flora: string[];
    endangeredSpecies?: string[];
  };

  // Timeline
  startDate: Date;
  restorationDate?: Date;
  completionDate?: Date;
  projectDuration: number; // in months
  milestones?: Array<{
    name: string;
    description: string;
    targetDate: Date;
    completedDate?: Date;
    status: 'pending' | 'in_progress' | 'completed';
  }>;

  // Carbon Data
  carbonData: {
    estimatedSequestration: number; // tons CO2e
    calculatedSequestration?: number; // tons CO2e (from calculations)
    annualSequestration?: number; // tons CO2e/year
    totalBiomass?: number; // tons
    carbonStock?: number; // tons C
    confidence?: number; // 0-1
    lastCalculated?: Date;
    methodology?: string;
  };

  // Tree/Vegetation Data
  vegetationData: {
    totalTrees: number;
    averageDBH?: number; // cm
    averageHeight?: number; // meters
    averageAge?: number; // years
    density?: number; // trees per hectare
    survivalRate?: number; // percentage
    healthScore?: number; // 0-100
  };

  // Environmental Conditions
  environmentalData?: {
    soilType?: string;
    salinity?: number; // ppt
    tidalRange?: number; // meters
    precipitation?: number; // mm/year
    temperature?: number; // °C
    waterQuality?: string;
    threats?: string[];
  };

  // Verification & Status
  verificationStatus: 'draft' | 'submitted' | 'under_review' | 'verified' | 'rejected' | 'requires_revision';
  verificationHistory: Array<{
    status: string;
    verifiedBy?: mongoose.Types.ObjectId;
    verificationDate: Date;
    notes?: string;
    aiConfidence?: number;
    manualOverride?: boolean;
  }>;
  
  // Credits
  creditsIssued: number;
  creditsAvailable: number;
  creditsRetired: number;
  creditsMinted: boolean;
  blockchainTokenId?: string;
  blockchainTxHash?: string;

  // Uploads & Documentation
  uploads: {
    droneImages: Array<{
      fileId: mongoose.Types.ObjectId;
      uploadDate: Date;
      fileType: string;
      fileSize: number;
      s3Key: string;
      s3Url: string;
      processed: boolean;
      aiResults?: any;
    }>;
    fieldData: Array<{
      fileId: mongoose.Types.ObjectId;
      uploadDate: Date;
      fileType: string;
      fileSize: number;
      s3Key: string;
      s3Url: string;
      parsed: boolean;
      data?: any;
    }>;
    gpsData: Array<{
      fileId: mongoose.Types.ObjectId;
      uploadDate: Date;
      fileType: string;
      fileSize: number;
      s3Key: string;
      s3Url: string;
      parsed: boolean;
      coordinates?: any;
    }>;
    beforeAfterPhotos: Array<{
      type: 'before' | 'after';
      fileId: mongoose.Types.ObjectId;
      uploadDate: Date;
      captureDate?: Date;
      s3Key: string;
      s3Url: string;
      description?: string;
    }>;
    documents: Array<{
      name: string;
      type: string;
      fileId: mongoose.Types.ObjectId;
      uploadDate: Date;
      s3Key: string;
      s3Url: string;
    }>;
  };

  // Community & Social Impact
  communityImpact?: {
    beneficiaries: number;
    employmentGenerated?: number;
    localParticipation?: number;
    educationPrograms?: string[];
    socialBenefits?: string[];
  };

  // Financial
  budget?: {
    total: number;
    spent: number;
    currency: string;
    fundingSources?: string[];
  };
  earnings: {
    totalEarnings: number;
    pendingPayments: number;
    currency: string;
    transactions: Array<mongoose.Types.ObjectId>;
  };

  // Monitoring & Reporting
  monitoring: {
    lastVisit?: Date;
    nextVisit?: Date;
    frequency: string; // 'monthly', 'quarterly', 'annually'
    reports: Array<{
      reportId: mongoose.Types.ObjectId;
      reportDate: Date;
      reportType: string;
      s3Key: string;
    }>;
  };

  // Metadata
  tags: string[];
  visibility: 'public' | 'private' | 'restricted';
  featured: boolean;
  status: 'active' | 'completed' | 'suspended' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: mongoose.Types.ObjectId;
}

const ProjectSchema: Schema = new Schema(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    projectType: {
      type: String,
      enum: ['restoration', 'conservation', 'afforestation', 'protection'],
      required: true,
      index: true
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    ownerName: {
      type: String,
      required: true
    },
    ownerContact: {
      email: { type: String, required: true },
      phone: String,
      address: String
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere'
      }
    },
    area: {
      total: { type: Number, required: true },
      restored: Number,
      conserved: Number
    },
    country: {
      type: String,
      required: true,
      index: true
    },
    region: {
      type: String,
      required: true
    },
    gpsCoordinates: {
      corners: [[Number]],
      boundary: Schema.Types.Mixed
    },

    ecosystemType: {
      type: String,
      enum: ['mangrove', 'wetland', 'seagrass', 'salt_marsh', 'mixed'],
      required: true,
      index: true
    },
    species: [{
      scientificName: String,
      commonName: String,
      count: Number,
      percentage: Number
    }],
    biodiversity: {
      fauna: [String],
      flora: [String],
      endangeredSpecies: [String]
    },

    startDate: {
      type: Date,
      required: true
    },
    restorationDate: Date,
    completionDate: Date,
    projectDuration: Number,
    milestones: [{
      name: String,
      description: String,
      targetDate: Date,
      completedDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
      }
    }],

    carbonData: {
      estimatedSequestration: { type: Number, required: true },
      calculatedSequestration: Number,
      annualSequestration: Number,
      totalBiomass: Number,
      carbonStock: Number,
      confidence: Number,
      lastCalculated: Date,
      methodology: String
    },

    vegetationData: {
      totalTrees: { type: Number, required: true },
      averageDBH: Number,
      averageHeight: Number,
      averageAge: Number,
      density: Number,
      survivalRate: Number,
      healthScore: Number
    },

    environmentalData: {
      soilType: String,
      salinity: Number,
      tidalRange: Number,
      precipitation: Number,
      temperature: Number,
      waterQuality: String,
      threats: [String]
    },

    verificationStatus: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'verified', 'rejected', 'requires_revision'],
      default: 'draft',
      index: true
    },
    verificationHistory: [{
      status: String,
      verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      verificationDate: { type: Date, default: Date.now },
      notes: String,
      aiConfidence: Number,
      manualOverride: Boolean
    }],

    creditsIssued: {
      type: Number,
      default: 0
    },
    creditsAvailable: {
      type: Number,
      default: 0
    },
    creditsRetired: {
      type: Number,
      default: 0
    },
    creditsMinted: {
      type: Boolean,
      default: false
    },
    blockchainTokenId: String,
    blockchainTxHash: String,

    uploads: {
      droneImages: [{
        fileId: Schema.Types.ObjectId,
        uploadDate: { type: Date, default: Date.now },
        fileType: String,
        fileSize: Number,
        s3Key: String,
        s3Url: String,
        processed: { type: Boolean, default: false },
        aiResults: Schema.Types.Mixed
      }],
      fieldData: [{
        fileId: Schema.Types.ObjectId,
        uploadDate: { type: Date, default: Date.now },
        fileType: String,
        fileSize: Number,
        s3Key: String,
        s3Url: String,
        parsed: { type: Boolean, default: false },
        data: Schema.Types.Mixed
      }],
      gpsData: [{
        fileId: Schema.Types.ObjectId,
        uploadDate: { type: Date, default: Date.now },
        fileType: String,
        fileSize: Number,
        s3Key: String,
        s3Url: String,
        parsed: { type: Boolean, default: false },
        coordinates: Schema.Types.Mixed
      }],
      beforeAfterPhotos: [{
        type: {
          type: String,
          enum: ['before', 'after']
        },
        fileId: Schema.Types.ObjectId,
        uploadDate: { type: Date, default: Date.now },
        captureDate: Date,
        s3Key: String,
        s3Url: String,
        description: String
      }],
      documents: [{
        name: String,
        type: String,
        fileId: Schema.Types.ObjectId,
        uploadDate: { type: Date, default: Date.now },
        s3Key: String,
        s3Url: String
      }]
    },

    communityImpact: {
      beneficiaries: Number,
      employmentGenerated: Number,
      localParticipation: Number,
      educationPrograms: [String],
      socialBenefits: [String]
    },

    budget: {
      total: Number,
      spent: Number,
      currency: { type: String, default: 'USD' },
      fundingSources: [String]
    },
    earnings: {
      totalEarnings: { type: Number, default: 0 },
      pendingPayments: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      transactions: [{
        type: Schema.Types.ObjectId,
        ref: 'Transaction'
      }]
    },

    monitoring: {
      lastVisit: Date,
      nextVisit: Date,
      frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'annually'],
        default: 'monthly'
      },
      reports: [{
        reportId: Schema.Types.ObjectId,
        reportDate: Date,
        reportType: String,
        s3Key: String
      }]
    },

    tags: [String],
    visibility: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'public'
    },
    featured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'suspended', 'archived'],
      default: 'active',
      index: true
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
ProjectSchema.index({ ownerId: 1, verificationStatus: 1 });
ProjectSchema.index({ country: 1, ecosystemType: 1 });
ProjectSchema.index({ verificationStatus: 1, createdAt: -1 });
ProjectSchema.index({ 'carbonData.calculatedSequestration': -1 });
ProjectSchema.index({ featured: 1, status: 1 });

// Virtual for total credits
ProjectSchema.virtual('totalCredits').get(function() {
  return this.creditsIssued + this.creditsAvailable;
});

// Method to update verification status
ProjectSchema.methods.updateVerificationStatus = function(
  status: string,
  verifiedBy: mongoose.Types.ObjectId,
  notes?: string,
  aiConfidence?: number,
  manualOverride?: boolean
) {
  this.verificationStatus = status;
  this.verificationHistory.push({
    status,
    verifiedBy,
    verificationDate: new Date(),
    notes,
    aiConfidence,
    manualOverride
  });
  return this.save();
};

// Method to add upload
ProjectSchema.methods.addUpload = function(
  uploadType: 'droneImages' | 'fieldData' | 'gpsData' | 'beforeAfterPhotos' | 'documents',
  uploadData: any
) {
  this.uploads[uploadType].push(uploadData);
  return this.save();
};

// Method to update carbon data
ProjectSchema.methods.updateCarbonData = function(carbonData: any) {
  this.carbonData = {
    ...this.carbonData,
    ...carbonData,
    lastCalculated: new Date()
  };
  return this.save();
};

export default mongoose.model<IProject>('Project', ProjectSchema);
