/**
 * Evidence Model - Tracks all evidence collected during investigations
 * Enterprise features: Chain of custody, digital evidence, forensic tracking
 */

const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  // Basic Information
  evidenceNumber: {
    type: String,
    required: [true, 'Evidence number is required'],
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Evidence name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  
  // Evidence Type
  type: {
    type: String,
    enum: [
      'physical',
      'digital',
      'biological',
      'documentary',
      'photographic',
      'video',
      'audio',
      'weapon',
      'drugs',
      'financial',
      'other'
    ],
    required: true
  },
  subType: String,
  
  // Crime & Investigation
  crime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CrimeIncident',
    required: true
  },
  investigation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investigation'
  },
  
  // Chain of Custody
  custody: [{
    date: {
      type: Date,
      default: Date.now
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    location: String,
    purpose: String,
    status: {
      type: String,
      enum: ['transferred', 'received', 'examined', 'returned']
    },
    remarks: String,
    signature: String
  }],
  
  // Location & Storage
  location: {
    collectedFrom: {
      address: String,
      latitude: Number,
      longitude: Number
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['crime_scene', 'forensic_lab', 'police_station', 'evidence_room', 'court']
      },
      default: 'police_station'
    },
    storageDetails: {
      room: String,
      cabinet: String,
      shelf: String,
      box: String
    }
  },
  
  // Collection Details
  collection: {
    date: {
      type: Date,
      required: true
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    method: String,
    conditions: String,
    photographs: [String]
  },
  
  // Forensic Analysis
  forensic: {
    requested: {
      type: Date
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    analysis: [{
      type: {
        type: String,
        enum: ['fingerprint', 'dna', 'ballistic', 'chemical', 'digital', 'handwriting', 'other']
      },
      laboratory: String,
      analyst: String,
      date: Date,
      results: String,
      reportUrl: String,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'inconclusive']
      }
    }],
    findings: String,
    analysisReport: String
  },
  
  // Digital Evidence (for cyber crimes)
  digitalMetadata: {
    fileType: String,
    fileSize: Number,
    hash: String,
    createdDate: Date,
    modifiedDate: Date,
    metadata: Object,
    extractionTool: String,
    integrityVerified: Boolean
  },
  
  // Physical Evidence
  physicalAttributes: {
    weight: String,
    dimensions: String,
    color: String,
    condition: {
      type: String,
      enum: ['pristine', 'good', 'damaged', 'degraded']
    },
    markings: String
  },
  
  // Evidence Status
  status: {
    type: String,
    enum: ['collected', 'in_custody', 'in_analysis', 'completed', 'released', 'destroyed'],
    default: 'collected'
  },
  
  // Admissibility
  admissibility: {
    isAdmissible: {
      type: Boolean,
      default: true
    },
    courtApproved: Boolean,
    challenged: Boolean,
    challengeReason: String,
    rulings: [{
      court: String,
      date: Date,
      ruling: String
    }]
  },
  
  // Disposal
  disposal: {
    date: Date,
    method: {
      type: String,
      enum: ['returned', 'destroyed', 'retained', 'transferred']
    },
    authorizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  },
  
  // Relationships
  relatedEvidence: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evidence'
  }],
  relatedSuspects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Suspect'
  }],
  
  // Smart Tags (AI-generated)
  tags: [String],
  aiClassification: {
    category: String,
    confidence: Number,
    suggestedActions: [String]
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
evidenceSchema.index({ evidenceNumber: 1 });
evidenceSchema.index({ crime: 1, investigation: 1 });
evidenceSchema.index({ type: 1 });
evidenceSchema.index({ status: 1 });
evidenceSchema.index({ 'collection.date': -1 });
evidenceSchema.index({ tags: 1 });

// ============================================
// Instance Methods
// ============================================
evidenceSchema.methods.addCustodyTransfer = function(from, to, purpose, remarks) {
  this.custody.push({
    date: new Date(),
    from,
    to,
    purpose,
    remarks,
    status: 'transferred'
  });
  return this.save();
};

evidenceSchema.methods.markReceived = function(user) {
  const lastTransfer = this.custody[this.custody.length - 1];
  if (lastTransfer) {
    lastTransfer.status = 'received';
    lastTransfer.to = user;
  }
  return this.save();
};

const Evidence = mongoose.model('Evidence', evidenceSchema);

module.exports = Evidence;