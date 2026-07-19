/**
 * Offender Model - Track convicted criminals for repeat offender analysis
 * Critical for: Repeat offender tracking, MO identification
 */

const mongoose = require('mongoose');

const offenderSchema = new mongoose.Schema({
  // Core Identity
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
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  
  // Unique IDs
  prisonerId: {
    type: String,
    sparse: true
  },
  aadhaar: {
    type: String,
    select: false
  },
  
  // Criminal Profile
  criminalProfile: {
    type: {
      type: String,
      enum: ['first_time', 'repeat', 'habitual', 'professional']
    },
    primaryCrimeType: String,
    yearsCriminal: Number,
    numberOfConvictions: {
      type: Number,
      default: 0
    }
  },
  
  // Offense History
  offenses: [{
    crime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrimeIncident'
    },
    convictionDate: Date,
    offenseType: String,
    sentence: {
      type: String,
      enum: ['imprisonment', 'fine', 'probation', 'community_service', 'death']
    },
    sentenceDuration: String,
    prison: {
      name: String,
      location: String
    },
    releasedDate: Date,
    paroleStatus: String
  }],
  
  // Modus Operandi (Critical for pattern detection)
  modusOperandi: {
    primary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ModusOperandi'
    },
    secondary: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ModusOperandi'
    }],
    signatureTraits: [String],
    victimPreferences: String,
    locationPreferences: String,
    timePreferences: String
  },
  
  // Recidivism
  recidivism: {
    isRepeatOffender: {
      type: Boolean,
      default: false
    },
    recidivismRate: Number,
    timeToReoffend: String,
    previousOffenses: Number
  },
  
  // Risk Prediction (AI)
  riskPrediction: {
    recidivismRisk: {
      score: Number,
      level: {
        type: String,
        enum: ['low', 'medium', 'high', 'very_high']
      },
      factors: [String],
      lastUpdated: Date
    },
    violenceRisk: {
      score: Number,
      level: String,
      factors: [String]
    },
    escapeRisk: {
      score: Number,
      level: String
    }
  },
  
  // Social Connections (Network Analysis)
  networks: [{
    type: {
      type: String,
      enum: ['gang', 'family', 'associates', 'prison_contacts']
    },
    members: [{
      person: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'networks.members.model'
      },
      model: {
        type: String,
        enum: ['Suspect', 'Offender']
      },
      relationship: String
    }],
    strength: Number
  }],
  
  // Prison Information
  prisonInfo: {
    institution: String,
    cellBlock: String,
    status: {
      type: String,
      enum: ['incarcerated', 'released', 'escaped', 'transferred', 'deceased']
    },
    admissionDate: Date,
    expectedRelease: Date,
    actualRelease: Date
  },
  
  // Rehabilitation
  rehabilitation: {
    programs: [{
      name: String,
      startDate: Date,
      endDate: Date,
      completion: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'failed']
      }
    }],
    counseling: [{
      type: String,
      date: Date,
      notes: String
    }]
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'incarcerated', 'parole', 'released', 'deceased'],
    default: 'active'
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
  deletedAt: Date
}, {
  timestamps: true
});

// ============================================
// Indexes
// ============================================
offenderSchema.index({ firstName: 1, lastName: 1 });
// prisonerId index handled by unique:true on field
offenderSchema.index({ 'criminalProfile.numberOfConvictions': -1 });
offenderSchema.index({ 'riskPrediction.recidivismRisk.level': 1 });

// ============================================
// Virtuals
// ============================================
offenderSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// ============================================
// Methods
// ============================================

// Check if high risk for recidivism
offenderSchema.methods.isHighRecidivismRisk = function() {
  return this.riskPrediction.recidivismRisk.level === 'high' || 
         this.riskPrediction.recidivismRisk.level === 'very_high';
};

// Get offense count
offenderSchema.methods.getOffenseCount = function() {
  return this.offenses.length;
};

const Offender = mongoose.model('Offender', offenderSchema);

module.exports = Offender;