/**
 * CriminalNetwork Model - Maps organized crime networks and relationships
 * Critical for: Network analysis, organized crime detection
 */

const mongoose = require('mongoose');

const criminalNetworkSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Network name is required'],
    trim: true,
    index: true
  },
  alias: [String],
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  
  // Network Type
  type: {
    type: String,
    enum: [
      'gang',
      'organized_crime',
      'terrorist',
      'drug_cartel',
      'cyber_crime',
      'human_trafficking',
      'arms_trafficking',
      'financial_crime',
      'street_gang',
      'other'
    ],
    required: true
  },
  subType: String,
  
  // Structure
  structure: {
    type: {
      type: String,
      enum: ['hierarchical', 'cellular', 'networked', 'hybrid']
    },
    leadership: [{
      person: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'structure.leadership.model'
      },
      model: {
        type: String,
        enum: ['Suspect', 'Offender']
      },
      role: String,
      rank: String,
      since: Date
    }],
    size: Number,
    reach: Number, // Geographical reach
    operationalLevel: {
      type: String,
      enum: ['local', 'regional', 'national', 'international']
    }
  },
  
  // Members
  members: [{
    person: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'members.model'
    },
    model: {
      type: String,
      enum: ['Suspect', 'Offender']
    },
    role: {
      type: String,
      enum: ['leader', 'deputy', 'member', 'associate', 'informant']
    },
    joinedDate: Date,
    leftDate: Date,
    notes: String,
    rank: Number
  }],
  
  // Activities
  activities: [{
    type: {
      type: String,
      enum: ['crime', 'meeting', 'communication', 'transaction', 'movement']
    },
    date: Date,
    description: String,
    location: String,
    participants: [String],
    evidence: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evidence'
    }]
  }],
  
  // Criminal Operations
  operations: [{
    name: String,
    type: String,
    date: Date,
    location: String,
    description: String,
    outcome: String,
    relatedCrimes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrimeIncident'
    }]
  }],
  
  // Financial Network
  finances: {
    estimatedWorth: Number,
    primarySources: [String],
    moneyLaunderingMethods: [String],
    assets: [{
      type: String,
      value: Number,
      location: String,
      status: {
        type: String,
        enum: ['active', 'seized', 'frozen', 'liquidated']
      }
    }],
    transactions: [{
      date: Date,
      amount: Number,
      from: String,
      to: String,
      purpose: String
    }]
  },
  
  // Communication Network
  communications: {
    primaryMethods: [String],
    encrypted: Boolean,
    platforms: [String],
    patterns: {
      frequency: String,
      peakTimes: [String],
      keyContacts: [String]
    }
  },
  
  // Territory & Turf
  territory: {
    primaryAreas: [String],
    districts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District'
    }],
    landmarks: [String],
    mapData: {
      type: {
        type: String,
        enum: ['Polygon', 'MultiPolygon']
      },
      coordinates: [[[Number]]]
    }
  },
  
  // Intelligence
  intelligence: {
    threatLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    capabilities: [String],
    vulnerabilities: [String],
    allies: [{
      network: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CriminalNetwork'
      },
      relationship: String,
      strength: Number
    }],
    rivals: [{
      network: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CriminalNetwork'
      },
      relationship: String,
      strength: Number
    }],
    intelligenceGathered: [{
      date: Date,
      source: String,
      information: String,
      reliability: {
        type: String,
        enum: ['low', 'medium', 'high', 'confirmed']
      }
    }]
  },
  
  // Law Enforcement
  lawEnforcement: {
    primaryAgency: String,
    investigationUnit: String,
    investigatingOfficers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    caseNumbers: [String],
    status: {
      type: String,
      enum: ['monitoring', 'investigating', 'infiltrated', 'dismantled', 'inactive']
    },
    successes: [String],
    challenges: [String]
  },
  
  // Risk Assessment (AI)
  riskAssessment: {
    overallRisk: {
      score: Number,
      level: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      factors: [String]
    },
    recidivismRisk: Number,
    expansionRisk: Number,
    influenceRisk: Number,
    lastUpdated: Date
  },
  
  // Visual Data (for network visualization)
  visualData: {
    graph: {
      nodes: [{
        id: String,
        label: String,
        type: String,
        size: Number,
        color: String,
        attributes: Object
      }],
      edges: [{
        source: String,
        target: String,
        type: String,
        weight: Number,
        label: String
      }]
    },
    clusters: [{
      id: String,
      name: String,
      members: [String],
      description: String
    }]
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isDismantled: {
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
criminalNetworkSchema.index({ name: 1 });
criminalNetworkSchema.index({ type: 1 });
criminalNetworkSchema.index({ 'intelligence.threatLevel': 1 });
criminalNetworkSchema.index({ 'territory.districts': 1 });
criminalNetworkSchema.index({ 'members.person': 1 });

// ============================================
// Virtuals
// ============================================
criminalNetworkSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// ============================================
// Methods
// ============================================
criminalNetworkSchema.methods.addMember = function(person, model, role) {
  this.members.push({ person, model, role, joinedDate: new Date() });
  this.structure.size = this.members.length;
  return this.save();
};

criminalNetworkSchema.methods.removeMember = function(personId) {
  const member = this.members.find(m => m.person.toString() === personId.toString());
  if (member) {
    member.leftDate = new Date();
  }
  this.structure.size = this.members.filter(m => !m.leftDate).length;
  return this.save();
};

const CriminalNetwork = mongoose.model('CriminalNetwork', criminalNetworkSchema);

module.exports = CriminalNetwork;