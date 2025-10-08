import mongoose, { Document, Schema } from 'mongoose';

export interface ICoordinates {
  lat: number;
  lon: number;
}

export interface IGeoJSON {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IEcosystem extends Document {
  _id: string;
  name: string;
  description: string;
  type: 'mangrove' | 'wetland' | 'seagrass' | 'saltmarsh' | 'kelp';
  location: {
    coordinates: ICoordinates;
    geoJSON: IGeoJSON;
    country: string;
    region: string;
    address?: string;
  };
  size: {
    area: number; // in square kilometers
    perimeter?: number;
  };
  carbonData: {
    totalStored: number; // in tons of CO2
    sequestrationRate: number; // tons CO2 per year
    lastMeasurement: Date;
    measurementMethod: 'satellite' | 'field' | 'model' | 'hybrid';
    confidence: 'low' | 'medium' | 'high';
  };
  biodiversity: {
    speciesCount: number;
    endangeredSpecies: string[];
    keySpecies: string[];
  };
  threats: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    mitigationMeasures: string[];
  };
  ownership: {
    type: 'public' | 'private' | 'community' | 'protected';
    ownerId?: string;
    ownerName?: string;
    managementAuthority?: string;
  };
  protection: {
    status: 'unprotected' | 'protected' | 'restricted' | 'conservation';
    designation?: string;
    protectionLevel: number; // 1-10 scale
  };
  monitoring: {
    lastSurvey: Date;
    nextSurvey: Date;
    surveyFrequency: 'monthly' | 'quarterly' | 'annually' | 'biannually';
    dataQuality: 'poor' | 'fair' | 'good' | 'excellent';
  };
  images: {
    satellite: string[];
    aerial: string[];
    ground: string[];
  };
  documents: {
    title: string;
    url: string;
    type: 'report' | 'certificate' | 'study' | 'other';
    date: Date;
  }[];
  status: 'active' | 'inactive' | 'under_review' | 'archived';
  isVerified: boolean;
  verificationDate?: Date;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EcosystemSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Ecosystem name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  type: {
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
    geoJSON: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function(coords: number[]) {
            return coords.length === 2 && 
                   coords[0] >= -180 && coords[0] <= 180 && 
                   coords[1] >= -90 && coords[1] <= 90;
          },
          message: 'Invalid coordinates',
        },
      },
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
    },
    address: String,
  },
  size: {
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [0, 'Area must be positive'],
    },
    perimeter: {
      type: Number,
      min: [0, 'Perimeter must be positive'],
    },
  },
  carbonData: {
    totalStored: {
      type: Number,
      required: [true, 'Total carbon stored is required'],
      min: [0, 'Carbon stored must be positive'],
    },
    sequestrationRate: {
      type: Number,
      required: [true, 'Sequestration rate is required'],
      min: [0, 'Sequestration rate must be positive'],
    },
    lastMeasurement: {
      type: Date,
      required: [true, 'Last measurement date is required'],
    },
    measurementMethod: {
      type: String,
      enum: ['satellite', 'field', 'model', 'hybrid'],
      default: 'satellite',
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  biodiversity: {
    speciesCount: {
      type: Number,
      default: 0,
      min: [0, 'Species count must be non-negative'],
    },
    endangeredSpecies: [String],
    keySpecies: [String],
  },
  threats: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    factors: [String],
    mitigationMeasures: [String],
  },
  ownership: {
    type: {
      type: String,
      enum: ['public', 'private', 'community', 'protected'],
      required: [true, 'Ownership type is required'],
    },
    ownerId: String,
    ownerName: String,
    managementAuthority: String,
  },
  protection: {
    status: {
      type: String,
      enum: ['unprotected', 'protected', 'restricted', 'conservation'],
      default: 'unprotected',
    },
    designation: String,
    protectionLevel: {
      type: Number,
      min: [1, 'Protection level must be between 1 and 10'],
      max: [10, 'Protection level must be between 1 and 10'],
      default: 1,
    },
  },
  monitoring: {
    lastSurvey: {
      type: Date,
      default: Date.now,
    },
    nextSurvey: {
      type: Date,
      required: [true, 'Next survey date is required'],
    },
    surveyFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually', 'biannually'],
      default: 'annually',
    },
    dataQuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      default: 'fair',
    },
  },
  images: {
    satellite: [String],
    aerial: [String],
    ground: [String],
  },
  documents: [{
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['report', 'certificate', 'study', 'other'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'under_review', 'archived'],
    default: 'active',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationDate: Date,
  verifiedBy: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
EcosystemSchema.index({ 'location.geoJSON': '2dsphere' });
EcosystemSchema.index({ type: 1 });
EcosystemSchema.index({ 'location.country': 1 });
EcosystemSchema.index({ status: 1 });
EcosystemSchema.index({ isVerified: 1 });
EcosystemSchema.index({ 'carbonData.totalStored': -1 });
EcosystemSchema.index({ createdAt: -1 });

// Virtual for carbon density
EcosystemSchema.virtual('carbonDensity').get(function() {
  return this.size.area > 0 ? this.carbonData.totalStored / this.size.area : 0;
});

// Pre-save middleware to set geoJSON coordinates
EcosystemSchema.pre('save', function(next) {
  if (this.isModified('location.coordinates')) {
    this.location.geoJSON = {
      type: 'Point',
      coordinates: [this.location.coordinates.lon, this.location.coordinates.lat],
    };
  }
  next();
});

export default mongoose.model<IEcosystem>('Ecosystem', EcosystemSchema);
