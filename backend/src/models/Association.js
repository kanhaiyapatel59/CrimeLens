/**
 * Association Model - Maps relationships between entities (people, places, events)
 * Critical for: Link analysis, relationship discovery, network mapping
 */

const mongoose = require('mongoose');

const associationSchema = new mongoose.Schema({
  // Basic Information
  type: {
    type: String,
    enum: [
      'person_person',
      'person_location',
      'person_crime',
      'person_evidence',
      'location_location',
      'crime_crime',
      'network_person',
      'network_network'
    ],
    required: true
  },
  strength: {
    type: Number,
    min: 0,
    max: 10,
    required: true,
    default: 1
  },
  
  // First Entity
  entity1: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'entity1.model'
    },
    model: {
      type: String,
      enum: [
        'User', 'Victim', 'Suspect', 'Offender', 
        'PoliceStation', 'District', 'CrimeIncident',
        'Evidence', 'CriminalNetwork', 'ModusOperandi'
      ],
      required: true
    },
    name: String
  },
  
  // Second Entity
  entity2: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'entity2.model'
    },
    model: {
      type: String,
      enum: [
        'User', 'Victim', 'Suspect', 'Offender', 
        'PoliceStation', 'District', 'CrimeIncident',
        'Evidence', 'CriminalNetwork', 'ModusOperandi'
      ],
      required: true
    },
    name: String
  },
  
  // Relationship Details
  relationship: {
    category: {
      type: String,
      enum: [
        'familial', 'social', 'criminal', 'professional', 
        'financial', 'communication', 'location', 'involvement',
        'membership', 'rivalry', 'alliance'
      ]
    },
    subCategory: String,
    description: String,
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    evidenceCount: Number
  },
  
  // Temporal Information
  temporal: {
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['one_time', 'occasional', 'regular', 'frequent', 'constant']
    }
  },
  
  // Spatial Information
  spatial: {
    locations: [{
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number],
      address: String
    }],
    meetingPoints: [String],
    distanceBetween: Number
  },
  
  // Evidence Supporting Association
  supportingEvidence: [{
    evidence: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evidence'
    },
    description: String,
    date: Date,
    reliability: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  
  // Source of Association
  source: {
    type: {
      type: String,
      enum: ['manual', 'intelligence', 'ai_detected', 'forensic', 'witness']
    },
    detectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    detectedDate: {
      type: Date,
      default: Date.now
    },
    confidenceScore: Number,
    algorithmUsed: String
  },
  
  // AI/ML Features
  aiAnalysis: {
    predictedType: String,
    confidence: Number,
    riskScore: Number,
    importanceScore: Number,
    features: [String],
    explanation: String
  },
  
  // Risk Assessment
  riskProfile: {
    criminalityRisk: {
      score: Number,
      level: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      }
    },
    threatLevel: {
      score: Number,
      level: String
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent']
    },
    factors: [String]
  },
  
  // Visualization Data
  visualization: {
    edgeColor: String,
    edgeStyle: {
      type: String,
      enum: ['solid', 'dashed', 'dotted']
    },
    edgeWidth: Number,
    animation: {
      type: String,
      enum: ['none', 'pulse', 'flow']
    },
    label: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspected', 'confirmed', 'debunked'],
    default: 'suspected'
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
associationSchema.index({ entity1: 1, entity2: 1 });
associationSchema.index({ 'entity1.id': 1, 'entity1.model': 1 });
associationSchema.index({ 'entity2.id': 1, 'entity2.model': 1 });
associationSchema.index({ type: 1, strength: -1 });
associationSchema.index({ 'relationship.category': 1 });
associationSchema.index({ 'riskProfile.priority': 1 });

// ============================================
// Static Methods
// ============================================
associationSchema.statics.getAssociationsForEntity = function(entityId, model) {
  return this.find({
    $or: [
      { 'entity1.id': entityId, 'entity1.model': model },
      { 'entity2.id': entityId, 'entity2.model': model }
    ],
    status: { $ne: 'debunked' }
  }).sort({ strength: -1 });
};

associationSchema.statics.getCriminalNetwork = function() {
  return this.find({
    'relationship.category': 'criminal',
    status: 'confirmed'
  }).sort({ strength: -1 });
};

const Association = mongoose.model('Association', associationSchema);

module.exports = Association;