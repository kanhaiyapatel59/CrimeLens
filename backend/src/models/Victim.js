/**
 * Victim Model - Stores information about crime victims
 * Enterprise features: PII protection, soft delete, tracking
 */

const mongoose = require('mongoose');

const victimSchema = new mongoose.Schema({
  // Personal Information (PII - Protected)
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  dateOfBirth: Date,
  age: Number,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  
  // Contact Information
  contact: {
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Invalid phone number']
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email']
    },
    address: {
      street: String,
      city: String,
      district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
      },
      pincode: String
    }
  },
  
  // Victim Profile
  occupation: String,
  education: String,
  incomeLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'unknown']
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed', 'other']
  },
  
  // Incident Involvement
  crimes: [{
    crime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrimeIncident'
    },
    role: {
      type: String,
      enum: ['primary', 'secondary', 'witness', 'bystander']
    },
    injuries: {
      type: String,
      enum: ['none', 'minor', 'serious', 'critical', 'fatal']
    },
    isReported: {
      type: Boolean,
      default: true
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Victim Support
  supportNeeded: [{
    type: String,
    enum: ['counseling', 'medical', 'legal', 'financial', 'protection']
  }],
  supportProvided: [{
    type: String,
    enum: ['counseling', 'medical', 'legal', 'financial', 'protection']
  }],
  
  // Protection Status
  protectionStatus: {
    type: String,
    enum: ['none', 'under_protection', 'witness_protection', 'relocated']
  },
  
  // Victimization History
  isRepeatVictim: {
    type: Boolean,
    default: false
  },
  previousVictimizations: [{
    crime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrimeIncident'
    },
    date: Date,
    description: String
  }],
  
  // Relationships
  relationships: [{
    type: {
      type: String,
      enum: ['family', 'friend', 'colleague', 'stranger', 'neighbor', 'other']
    },
    person: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relationships.model'
    },
    model: {
      type: String,
      enum: ['Victim', 'Suspect', 'Offender']
    },
    description: String
  }],
  
  // Sensitive Information (Encrypted in production)
  sensitive: {
    aadhaar: String, // Will be encrypted
    pan: String, // Will be encrypted
    medicalRecords: String // Will be encrypted
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'archived', 'deceased'],
    default: 'active'
  },
  
  // Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// ============================================
// Indexes
// ============================================
victimSchema.index({ firstName: 1, lastName: 1 });
victimSchema.index({ 'contact.phone': 1 });
victimSchema.index({ status: 1 });

// ============================================
// Methods
// ============================================

// Get full name
victimSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Check if victim has active protection
victimSchema.methods.isProtected = function() {
  return this.protectionStatus !== 'none';
};

const Victim = mongoose.model('Victim', victimSchema);

module.exports = Victim;