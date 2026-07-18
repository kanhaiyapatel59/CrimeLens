/**
 * Suspect Model - Tracks suspects in criminal investigations
 * Enterprise: Cross-referencing, behavior analysis
 */

const mongoose = require('mongoose');

const suspectSchema = new mongoose.Schema({
  // Personal Information
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
  aliases: [String],
  dateOfBirth: Date,
  age: Number,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  
  // Physical Description (for identification)
  physicalDescription: {
    height: String,
    weight: String,
    hairColor: String,
    eyeColor: String,
    distinctiveMarks: [String],
    tattoos: [{
      location: String,
      description: String
    }]
  },
  
  // Contact Information
  contact: {
    phone: [String],
    email: String,
    address: {
      street: String,
      city: String,
      district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
      },
      pincode: String
    },
    lastKnownLocation: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number]
    }
  },
  
  // Suspect Status
  status: {
    type: String,
    enum: ['person_of_interest', 'wanted', 'in_custody', 'released', 'under_investigation', 'cleared'],
    default: 'person_of_interest'
  },
  
  // Criminal History
  criminalHistory: [{
    crime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrimeIncident'
    },
    date: Date,
    offenseType: String,
    status: {
      type: String,
      enum: ['convicted', 'acquitted', 'pending', 'discharged']
    },
    sentence: String,
    prisonTerm: String
  }],
  
  // Current Involvement
  currentCrimes: [{
    crime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrimeIncident'
    },
    role: {
      type: String,
      enum: ['primary', 'accomplice', 'accessory', 'conspirator']
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'dismissed']
    },
    evidence: [String]
  }],
  
  // Modus Operandi (MO) - Key for pattern detection
  moPatterns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ModusOperandi'
  }],
  
  // Risk Assessment (AI-driven)
  riskAssessment: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'extreme']
    },
    factors: [String],
    lastAssessed: Date
  },
  
  // Associations (Network Analysis)
  associates: [{
    person: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'associates.model'
    },
    model: {
      type: String,
      enum: ['Suspect', 'Offender', 'Victim']
    },
    relationshipType: {
      type: String,
      enum: ['family', 'friend', 'criminal_associate', 'rival', 'co-worker', 'other']
    },
    strength: {
      type: Number,
      min: 0,
      max: 10
    }
  }],
  
  // Forensics
  forensicData: {
    fingerprints: {
      type: String,
      select: false // Sensitive data
    },
    dnaProfile: {
      type: String,
      select: false
    },
    photographs: [String],
    voicePrint: {
      type: String,
      select: false
    }
  },
  
  // Surveillance
  surveillance: [{
    type: {
      type: String,
      enum: ['physical', 'electronic', 'digital', 'social_media']
    },
    startDate: Date,
    endDate: Date,
    details: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Behavioral Analysis
  behavioralPatterns: {
    routine: String,
    locations: [String],
    socialConnections: String,
    mentalHealth: String
  },
  
  // Investigation Status
  investigationStatus: {
    primaryOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: {
      type: String,
      enum: ['initial', 'evidence_gathering', 'interrogation', 'charging', 'trial'],
      default: 'initial'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  },
  
  // Legal Status
  legalStatus: {
    isArrested: {
      type: Boolean,
      default: false
    },
    arrestDate: Date,
    arrestLocation: String,
    bailStatus: {
      type: String,
      enum: ['none', 'granted', 'denied', 'pending']
    },
    courtCases: [{
      caseNumber: String,
      court: String,
      judge: String,
      status: String,
      nextHearing: Date
    }]
  },
  
  // Intelligence
  intelligence: {
    notes: String,
    sourceReliability: {
      type: String,
      enum: ['low', 'medium', 'high', 'confirmed']
    },
    intelligenceGathered: [{
      date: Date,
      source: String,
      information: String,
      verified: Boolean
    }]
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
suspectSchema.index({ firstName: 1, lastName: 1 });
suspectSchema.index({ status: 1 });
suspectSchema.index({ 'contact.phone': 1 });
suspectSchema.index({ 'riskAssessment.score': -1 });

// ============================================
// Virtuals
// ============================================
suspectSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

suspectSchema.virtual('isWanted').get(function() {
  return this.status === 'wanted';
});

// ============================================
// Methods
// ============================================

// Check if suspect is high risk
suspectSchema.methods.isHighRisk = function() {
  return this.riskAssessment.score >= 70;
};

// Add criminal history
suspectSchema.methods.addCriminalHistory = function(crimeData) {
  this.criminalHistory.push(crimeData);
  this.criminalHistory.sort((a, b) => b.date - a.date);
  return this.save();
};

const Suspect = mongoose.model('Suspect', suspectSchema);

module.exports = Suspect;