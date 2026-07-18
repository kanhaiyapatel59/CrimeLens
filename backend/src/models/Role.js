/**
 * Role Model - Defines system roles and permissions
 * Enterprise RBAC implementation with granular permissions
 */

const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    enum: ['admin', 'scrb_officer', 'district_officer', 'station_officer', 'analyst', 'viewer']
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  
  // Granular permissions (bit-based or string array)
  permissions: [{
    resource: {
      type: String,
      enum: ['crimes', 'users', 'stations', 'districts', 'analytics', 'reports', 'network', 'ai']
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'approve', 'export', 'manage']
    }]
  }],
  
  // Hierarchical level (higher = more power)
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  
  // Default role for new users
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
roleSchema.index({ name: 1 });
roleSchema.index({ level: 1 });

// Static method to get default role
roleSchema.statics.getDefaultRole = function() {
  return this.findOne({ isDefault: true, isActive: true });
};

// Check if role has permission
roleSchema.methods.hasPermission = function(resource, action) {
  const permission = this.permissions.find(p => p.resource === resource);
  if (!permission) return false;
  return permission.actions.includes(action);
};

// Check if role is admin
roleSchema.methods.isAdmin = function() {
  return this.name === 'admin' || this.level >= 9;
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;