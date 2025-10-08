/**
 * Upload Model
 * Tracks all file uploads with S3/Cloud Storage integration
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IUpload extends Document {
  // File Identification
  uploadId: string;
  originalFilename: string;
  filename: string; // Sanitized/generated filename
  fileType: string; // MIME type
  fileExtension: string;
  fileSize: number; // bytes
  
  // Upload Classification
  uploadType: 'drone_image' | 'field_data' | 'gps_data' | 'before_after_photo' | 'document' | 'report' | 'other';
  category?: string; // Additional categorization
  
  // Owner & Project
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  userRole: 'landowner' | 'admin' | 'buyer' | 'verifier';
  
  // Storage Information
  storage: {
    provider: 'aws_s3' | 'google_cloud' | 'azure_blob' | 'local';
    bucket: string;
    key: string; // S3 key / Cloud path
    region?: string;
    url: string; // Public/signed URL
    cdnUrl?: string;
  };
  
  // Processing Status
  processingStatus: {
    uploaded: boolean;
    validated: boolean;
    scanned: boolean; // Virus/malware scan
    processed: boolean; // AI/ML processing
    indexed: boolean; // Search indexing
  };
  
  // AI/ML Processing (for images)
  aiProcessing?: {
    processed: boolean;
    processingDate?: Date;
    jobId?: string;
    results?: {
      crownDetection?: {
        crownsDetected: number;
        confidence: number;
        boundingBoxes?: any[];
      };
      speciesClassification?: {
        species: string;
        confidence: number;
        predictions?: any[];
      };
      healthAssessment?: {
        healthScore: number;
        confidence: number;
        issues?: string[];
      };
      imageQuality?: {
        resolution: { width: number; height: number };
        clarity: number;
        lighting: string;
        suitable: boolean;
      };
    };
    error?: string;
  };
  
  // Data Parsing (for CSV, Excel, KML, etc.)
  dataParsing?: {
    parsed: boolean;
    parsingDate?: Date;
    rowCount?: number;
    columnCount?: number;
    schema?: any;
    data?: any;
    validation?: {
      valid: boolean;
      errors?: string[];
      warnings?: string[];
    };
    error?: string;
  };
  
  // Metadata
  metadata: {
    description?: string;
    tags?: string[];
    captureDate?: Date;
    location?: {
      type: string;
      coordinates: [number, number];
    };
    camera?: string;
    resolution?: {
      width: number;
      height: number;
    };
    custom?: any;
  };
  
  // Security & Compliance
  security: {
    virusScanStatus: 'pending' | 'clean' | 'infected' | 'error';
    virusScanDate?: Date;
    encrypted: boolean;
    encryptionKey?: string;
    accessLevel: 'public' | 'private' | 'restricted';
  };
  
  // Access Control
  permissions: {
    public: boolean;
    sharedWith?: Array<{
      userId: mongoose.Types.ObjectId;
      permission: 'view' | 'edit' | 'download';
      sharedDate: Date;
    }>;
  };
  
  // Usage Tracking
  usage: {
    downloads: number;
    views: number;
    lastAccessed?: Date;
    accessLog?: Array<{
      userId: mongoose.Types.ObjectId;
      action: 'view' | 'download' | 'edit';
      timestamp: Date;
      ipAddress?: string;
    }>;
  };
  
  // Versioning
  version: number;
  parentUploadId?: mongoose.Types.ObjectId; // For file versions
  isLatestVersion: boolean;
  
  // Status & Lifecycle
  status: 'uploading' | 'uploaded' | 'processing' | 'processed' | 'failed' | 'archived' | 'deleted';
  archivedAt?: Date;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  
  // Timestamps
  uploadStarted: Date;
  uploadCompleted?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UploadSchema: Schema = new Schema(
  {
    uploadId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    originalFilename: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileExtension: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },

    uploadType: {
      type: String,
      enum: ['drone_image', 'field_data', 'gps_data', 'before_after_photo', 'document', 'report', 'other'],
      required: true,
      index: true
    },
    category: String,

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true
    },
    userRole: {
      type: String,
      enum: ['landowner', 'admin', 'buyer', 'verifier'],
      required: true
    },

    storage: {
      provider: {
        type: String,
        enum: ['aws_s3', 'google_cloud', 'azure_blob', 'local'],
        required: true
      },
      bucket: {
        type: String,
        required: true
      },
      key: {
        type: String,
        required: true,
        unique: true
      },
      region: String,
      url: {
        type: String,
        required: true
      },
      cdnUrl: String
    },

    processingStatus: {
      uploaded: { type: Boolean, default: false },
      validated: { type: Boolean, default: false },
      scanned: { type: Boolean, default: false },
      processed: { type: Boolean, default: false },
      indexed: { type: Boolean, default: false }
    },

    aiProcessing: {
      processed: { type: Boolean, default: false },
      processingDate: Date,
      jobId: String,
      results: {
        crownDetection: {
          crownsDetected: Number,
          confidence: Number,
          boundingBoxes: [Schema.Types.Mixed]
        },
        speciesClassification: {
          species: String,
          confidence: Number,
          predictions: [Schema.Types.Mixed]
        },
        healthAssessment: {
          healthScore: Number,
          confidence: Number,
          issues: [String]
        },
        imageQuality: {
          resolution: {
            width: Number,
            height: Number
          },
          clarity: Number,
          lighting: String,
          suitable: Boolean
        }
      },
      error: String
    },

    dataParsing: {
      parsed: { type: Boolean, default: false },
      parsingDate: Date,
      rowCount: Number,
      columnCount: Number,
      schema: Schema.Types.Mixed,
      data: Schema.Types.Mixed,
      validation: {
        valid: Boolean,
        errors: [String],
        warnings: [String]
      },
      error: String
    },

    metadata: {
      description: String,
      tags: [String],
      captureDate: Date,
      location: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: [Number]
      },
      camera: String,
      resolution: {
        width: Number,
        height: Number
      },
      custom: Schema.Types.Mixed
    },

    security: {
      virusScanStatus: {
        type: String,
        enum: ['pending', 'clean', 'infected', 'error'],
        default: 'pending'
      },
      virusScanDate: Date,
      encrypted: {
        type: Boolean,
        default: false
      },
      encryptionKey: String,
      accessLevel: {
        type: String,
        enum: ['public', 'private', 'restricted'],
        default: 'private'
      }
    },

    permissions: {
      public: {
        type: Boolean,
        default: false
      },
      sharedWith: [{
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        permission: {
          type: String,
          enum: ['view', 'edit', 'download']
        },
        sharedDate: {
          type: Date,
          default: Date.now
        }
      }]
    },

    usage: {
      downloads: {
        type: Number,
        default: 0
      },
      views: {
        type: Number,
        default: 0
      },
      lastAccessed: Date,
      accessLog: [{
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        action: {
          type: String,
          enum: ['view', 'download', 'edit']
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        ipAddress: String
      }]
    },

    version: {
      type: Number,
      default: 1
    },
    parentUploadId: {
      type: Schema.Types.ObjectId,
      ref: 'Upload'
    },
    isLatestVersion: {
      type: Boolean,
      default: true
    },

    status: {
      type: String,
      enum: ['uploading', 'uploaded', 'processing', 'processed', 'failed', 'archived', 'deleted'],
      default: 'uploading',
      index: true
    },
    archivedAt: Date,
    deletedAt: Date,
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },

    uploadStarted: {
      type: Date,
      default: Date.now
    },
    uploadCompleted: Date
  },
  {
    timestamps: true
  }
);

// Indexes
UploadSchema.index({ userId: 1, projectId: 1 });
UploadSchema.index({ uploadType: 1, status: 1 });
UploadSchema.index({ 'storage.key': 1 });
UploadSchema.index({ createdAt: -1 });
UploadSchema.index({ 'processingStatus.processed': 1 });

// Method to mark as processed
UploadSchema.methods.markAsProcessed = function(results: any) {
  this.processingStatus.processed = true;
  this.aiProcessing = {
    processed: true,
    processingDate: new Date(),
    results
  };
  this.status = 'processed';
  return this.save();
};

// Method to record access
UploadSchema.methods.recordAccess = function(
  userId: mongoose.Types.ObjectId,
  action: 'view' | 'download' | 'edit',
  ipAddress?: string
) {
  this.usage.lastAccessed = new Date();
  
  if (action === 'view') {
    this.usage.views += 1;
  } else if (action === 'download') {
    this.usage.downloads += 1;
  }
  
  this.usage.accessLog.push({
    userId,
    action,
    timestamp: new Date(),
    ipAddress
  });
  
  // Keep only last 100 access logs
  if (this.usage.accessLog.length > 100) {
    this.usage.accessLog = this.usage.accessLog.slice(-100);
  }
  
  return this.save();
};

// Method to soft delete
UploadSchema.methods.softDelete = function(deletedBy: mongoose.Types.ObjectId) {
  this.status = 'deleted';
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

export default mongoose.model<IUpload>('Upload', UploadSchema);
