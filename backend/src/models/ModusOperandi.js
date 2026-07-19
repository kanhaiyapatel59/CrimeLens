/**
 * Modus Operandi Model - Tracks criminal patterns and methods
 * Critical for: Pattern detection, repeat offender tracking, AI predictions
 */

const mongoose = require('mongoose');

const modusOperandiSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'MO name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'MO code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  
  // Crime Type Association
  crimeTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CrimeType'
  }],
  
  // Methodology Details
  methodology: {
    planning: {
      type: String,
      enum: ['spontaneous', 'planned', 'organized', 'highly_organized']
    },
    entry: String,
    approach: String,
    escape: String,
    toolsUsed: [String],
    techniques: [String],
    timeline: String
  },
  
  // Target Selection
  targeting: {
    victims: [{
      type: {
        type: String,
        enum: ['individual', 'property', 'business', 'institution']
      },
      profiles: [String],
      preferences: String,
      avoidance: String
    }],
    locations: [{
      type: {
        type: String,
        enum: ['residential', 'commercial', 'public', 'remote', 'urban', 'rural']
      },
      specificLocations: [String]
    }],
    timing: {
      preferredTime: {
        from: String,
        to: String
      },
      preferredDays: [String],
      seasonalPatterns: [String]
    }
  },
  
  // Behavioral Patterns
  behavior: {
    signatureTraits: [String],
    rituals: [String],
    escalation: {
      type: String,
      enum: ['none', 'gradual', 'sudden']
    },
    riskTaking: {
      type: String,
      enum: ['low', 'medium', 'high', 'extreme']
    }
  },
  
  // Detection & Avoidance
  avoidance: {
    counterMeasures: [String],
    antiForensics: [String],
    camouflage: String,
    deception: String
  },
  
  // Crime Scene Indicators
  crimeScene: {
    characteristics: [String],
    signatures: [String],
    staging: {
      present: Boolean,
      description: String
    },
    evidenceLeft: [String],
    evidenceTaken: [String]
  },
  
  // Statistical Profile
  statistics: {
    frequency: Number,
    successRate: Number,
    averageVictims: Number,
    geographicalSpread: Number,
    timeToComplete: String
  },
  
  // AI/ML Features
  predictiveFeatures: {
    probability: Number,
    riskFactors: [String],
    preventionStrategies: [String],
    detectionIndicators: [String]
  },
  
  // Associated Offenders
  associatedOffenders: [{
    offender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offender'
    },
    proficiency: {
      type: String,
      enum: ['novice', 'intermediate', 'expert', 'master']
    },
    instancesUsed: Number
  }],
  
  // Evolution Tracking
  evolution: [{
    date: Date,
    description: String,
    newElement: String,
    observedIn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrimeIncident'
    }
  }],
  
  // Severity
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isKnown: {
    type: Boolean,
    default: true
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
modusOperandiSchema.index({ crimeTypes: 1 });
modusOperandiSchema.index({ 'statistics.frequency': -1 });
modusOperandiSchema.index({ severity: 1 });

// ============================================
// Static Methods
// ============================================
modusOperandiSchema.statics.getByCrimeType = function(crimeTypeId) {
  return this.find({
    crimeTypes: crimeTypeId,
    isActive: true
  }).sort({ 'statistics.frequency': -1 });
};

modusOperandiSchema.statics.getHighFrequency = function(threshold = 5) {
  return this.find({
    'statistics.frequency': { $gte: threshold },
    isActive: true
  }).sort({ 'statistics.frequency': -1 });
};

// ============================================
// Instance Methods
// ============================================
modusOperandiSchema.methods.addEvolution = function(description, newElement, crimeId) {
  this.evolution.push({
    date: new Date(),
    description,
    newElement,
    observedIn: crimeId
  });
  return this.save();
};

const ModusOperandi = mongoose.model('ModusOperandi', modusOperandiSchema);

module.exports = ModusOperandi;