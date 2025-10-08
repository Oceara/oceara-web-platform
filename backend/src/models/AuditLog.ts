import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  userId: string;
  userEmail?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestUrl?: string;
  statusCode?: number;
  responseTime?: number;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      index: true,
    },
    userName: {
      type: String,
    },
    action: {
      type: String,
      required: true,
      index: true,
      enum: [
        // Project actions
        'CREATE_PROJECT',
        'UPDATE_PROJECT',
        'DELETE_PROJECT',
        'APPROVE_PROJECT',
        'REJECT_PROJECT',
        'REQUEST_PROJECT_CHANGES',
        'VIEW_PROJECT_DETAILS',
        'VIEW_PROJECTS',
        
        // Verification actions
        'SUBMIT_VERIFICATION',
        'APPROVE_VERIFICATION',
        'REJECT_VERIFICATION',
        'UPDATE_VERIFICATION',
        
        // Carbon credit actions
        'MINT_CARBON_CREDITS',
        'TRANSFER_CARBON_CREDITS',
        'RETIRE_CARBON_CREDITS',
        'VERIFY_CARBON_CREDITS',
        
        // AI/ML actions
        'AI_OVERRIDE',
        'RUN_AI_MODEL',
        'VIEW_AI_RESULTS',
        
        // Blockchain actions
        'BLOCKCHAIN_TRANSACTION',
        'VIEW_BLOCKCHAIN_DATA',
        
        // User actions
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_REGISTER',
        'UPDATE_USER_PROFILE',
        'CHANGE_USER_ROLE',
        
        // Admin actions
        'EXPORT_REPORT',
        'GENERATE_REPORT',
        'VIEW_AUDIT_LOGS',
        'SYSTEM_CONFIGURATION',
        
        // Data actions
        'UPLOAD_DATA',
        'DELETE_DATA',
        'DOWNLOAD_DATA',
        
        // Other
        'OTHER'
      ],
    },
    resource: {
      type: String,
      required: true,
      index: true,
      enum: [
        'project',
        'verification',
        'carbon_credit',
        'ai_result',
        'blockchain_transaction',
        'user',
        'report',
        'audit_log',
        'data_file',
        'system',
        'other'
      ],
    },
    resourceId: {
      type: String,
      index: true,
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      index: true,
    },
    userAgent: {
      type: String,
    },
    requestMethod: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    requestUrl: {
      type: String,
    },
    statusCode: {
      type: Number,
    },
    responseTime: {
      type: Number, // in milliseconds
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ severity: 1, timestamp: -1 });

// TTL index - automatically delete logs older than 1 year (optional)
// AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

// Static methods
AuditLogSchema.statics.getByUserId = function(userId: string, limit: number = 50) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

AuditLogSchema.statics.getByResource = function(resource: string, resourceId?: string, limit: number = 50) {
  const query: any = { resource };
  if (resourceId) {
    query.resourceId = resourceId;
  }
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit);
};

AuditLogSchema.statics.getByAction = function(action: string, limit: number = 50) {
  return this.find({ action })
    .sort({ timestamp: -1 })
    .limit(limit);
};

AuditLogSchema.statics.getRecent = function(limit: number = 100) {
  return this.find()
    .sort({ timestamp: -1 })
    .limit(limit);
};

AuditLogSchema.statics.getStatistics = async function(startDate?: Date, endDate?: Date) {
  const matchStage: any = {};
  
  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) matchStage.timestamp.$gte = startDate;
    if (endDate) matchStage.timestamp.$lte = endDate;
  }

  const pipeline = [
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    {
      $facet: {
        actionBreakdown: [
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        resourceBreakdown: [
          { $group: { _id: '$resource', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        topUsers: [
          { $group: { _id: '$userId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ],
        severityBreakdown: [
          { $group: { _id: '$severity', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  
  return {
    totalLogs: result[0].totalCount[0]?.count || 0,
    actionBreakdown: result[0].actionBreakdown.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    resourceBreakdown: result[0].resourceBreakdown.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    severityBreakdown: result[0].severityBreakdown.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    topUsers: result[0].topUsers.map((item: any) => ({
      userId: item._id,
      count: item.count
    }))
  };
};

AuditLogSchema.statics.deleteOldLogs = function(daysToKeep: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({ timestamp: { $lt: cutoffDate } });
};

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
