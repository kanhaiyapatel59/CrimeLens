/**
 * AuditLog Model - Complete audit trail for all system actions
 * Critical for: Security, compliance, forensic analysis
 * Enterprise feature: Immutable log, tamper-evident
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Basic Information
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  
  // User Context
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  userEmail: String,
  userIP: String,
  userAgent: String,
  
  // Action Details
  module: {
    type: String,
    enum: [
      'auth',
      'crime',
      'investigation',
      'user',
      'analytics',
      'reports',
      'network',
      'ai',
      'system',
      'admin'
    ],
    required: true
  },
  actionType: {
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'export', 'import', 'login', 'logout'],
    required: true
  },
  
  // Resource Affected
  resource: {
    model: {
      type: String,
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: String
  },
  
  // Data Changes
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    diff: [{
      field: String,
      from: mongoose.Schema.Types.Mixed,
      to: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Query Details (for GET requests)
  query: {
    endpoint: String,
    method: String,
    params: Object,
    body: Object,
    responseStatus: Number
  },
  
  // Security Context
  security: {
    sessionId: String,
    tokenId: String,
    permissionsUsed: [String],
    ipAddress: String,
    geoLocation: {
      country: String,
      city: String,
      latitude: Number,
      longitude: Number
    },
    deviceId: String,
    deviceType: String
  },
  
  // Performance Metrics
  performance: {
    responseTime: Number,
    queryTime: Number,
    dataSize: Number
  },
  
  // Risk Assessment
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  riskFactors: [String],
  
  // Flags & Anomalies
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: String,
  anomalyDetected: Boolean,
  
  // Hash (Tamper-evident)
  hash: {
    previousHash: String,
    currentHash: String,
    verified: Boolean
  },
  
  // Status
  status: {
    type: String,
    enum: ['success', 'failure', 'error', 'warning'],
    default: 'success'
  },
  errorDetails: {
    code: String,
    message: String,
    stack: String
  },
  
  // Retention
  retentionPeriod: {
    type: Number,
    default: 365 // days
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ============================================
// Indexes
// ============================================
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, actionType: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ flagged: 1 });
auditLogSchema.index({ createdAt: -1 });

// ============================================
// Pre-save Hook - Generate Hash
// ============================================
auditLogSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate cryptographic hash of log entry
    const crypto = require('crypto');
    const data = JSON.stringify({
      id: this._id,
      action: this.action,
      user: this.user,
      module: this.module,
      resource: this.resource,
      changes: this.changes,
      createdAt: this.createdAt
    });
    
    this.hash.currentHash = crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
    
    // Get previous hash from last log
    const lastLog = await this.constructor.findOne().sort({ createdAt: -1 });
    if (lastLog) {
      this.hash.previousHash = lastLog.hash.currentHash;
    }
  }
  next();
});

// ============================================
// Static Methods
// ============================================
auditLogSchema.statics.getUserActivity = function(userId, days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return this.find({
    user: userId,
    createdAt: { $gte: date }
  }).sort({ createdAt: -1 });
};

auditLogSchema.statics.getModuleActivity = function(module, days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return this.find({
    module,
    createdAt: { $gte: date }
  }).sort({ createdAt: -1 });
};

auditLogSchema.statics.getAnomalies = function() {
  return this.find({
    flagged: true,
    isArchived: false
  }).sort({ createdAt: -1 });
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;