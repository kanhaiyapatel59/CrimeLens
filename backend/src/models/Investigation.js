/**
 * Investigation Model - Tracks criminal investigations from start to resolution
 * Enterprise features: Timeline tracking, evidence management, case progression
 */

const mongoose = require('mongoose');

const investigationSchema = new mongoose.Schema({
  // Basic Information
  caseNumber: {
    type: String,
    required: [true, 'Case number is required'],
    unique: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Investigation title is required'],
    trim: true
  },
  
  // Crime References
  crimes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CrimeIncident',
    required: true
  }],
  primaryCrime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CrimeIncident',
    required: true
  },
  
  // Investigation Team
  investigatingOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: [{
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['lead', 'assistant', 'forensic', 'cyber', 'intelligence', 'support']
    },
    assignedDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Investigation Timeline
  timeline: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['note', 'milestone', 'evidence_found', 'suspect_identified', 'arrest', 'charge_sheet', 'court_filing']
    },
    description: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    attachments: [String]
  }],
  
  // Current Status
  status: {
    type: String,
    enum: [
      'initiated',
      'preliminary_inquiry',
      'investigation',
      'awaiting_forensic',
      'suspect_interrogation',
      'charge_sheet_filing',
      'court_proceedings',
      'convicted',
      'acquitted',
      'closed',
      'cold_case'
    ],
    default: 'initiated'
  },
  
  // Forensic Information
  forensic: {
    requested: [{
      type: String,
      enum: ['fingerprint', 'dna', 'ballistic', 'digital', 'chemical', 'medical', 'psychiatric']
    }],
    completed: [{
      type: String,
      enum: ['fingerprint', 'dna', 'ballistic', 'digital', 'chemical', 'medical', 'psychiatric']
    }],
    reports: [{
      type: String,
      date: Date,
      summary: String,
      findings: String,
      analyst: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  
  // Evidence Tracking
  evidence: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evidence'
  }],
  
  // Suspects & Offenders
  suspects: [{
    suspect: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Suspect'
    },
    status: {
      type: String,
      enum: ['person_of_interest', 'prime_suspect', 'arrested', 'cleared']
    },
    evidence: [String],
    interrogationNotes: [{
      date: Date,
      officer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String,
      findings: String
    }]
  }],
  offenders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offender'
  }],
  
  // Legal Proceedings
  legal: {
    charges: [{
      section: String,
      description: String,
      filedDate: Date
    }],
    courtCases: [{
      courtName: String,
      caseNumber: String,
      judge: String,
      filingDate: Date,
      nextHearing: Date,
      status: String,
      outcome: String
    }],
    lawyer: {
      name: String,
      contact: String,
      firm: String
    }
  },
  
  // Digital Evidence (Cyber Crime)
  digitalEvidence: {
    devicesSeized: [String],
    digitalForensics: [{
      type: String,
      findings: String,
      date: Date
    }],
    socialMedia: [{
      platform: String,
      account: String,
      analysis: String
    }],
    cyberFootprint: String
  },
  
  // Intelligence & Intelligence
  intelligence: {
    sources: [{
      type: {
        type: String,
        enum: ['informant', 'surveillance', 'technical', 'open_source', 'other']
      },
      reliability: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      information: String,
      date: Date
    }],
    operations: [{
      name: String,
      type: String,
      date: Date,
      outcome: String
    }]
  },
  
  // Leads & Tips
  leads: [{
    source: String,
    description: String,
    date: Date,
    status: {
      type: String,
      enum: ['pending', 'investigating', 'pursued', 'closed']
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    outcome: String
  }],
  
  // Budget & Resources
  resources: {
    budget: Number,
    allocated: Number,
    spent: Number,
    personnel: Number,
    equipment: [String]
  },
  
  // Risk Assessment
  riskAssessment: {
    publicRisk: {
      level: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      factors: [String]
    },
    officerRisk: {
      level: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      factors: [String]
    },
    witnessProtection: {
      required: Boolean,
      provided: Boolean,
      details: String
    }
  },
  
  // Results & Outcome
  outcome: {
    status: {
      type: String,
      enum: ['pending', 'resolved', 'closed', 'cold']
    },
    resolutionDate: Date,
    conviction: Boolean,
    sentence: String,
    appeals: [{
      filedDate: Date,
      status: String,
      outcome: String
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
investigationSchema.index({ status: 1 });
investigationSchema.index({ 'primaryCrime': 1 });
investigationSchema.index({ investigatingOfficer: 1 });
investigationSchema.index({ 'timeline.date': -1 });

// ============================================
// Virtuals
// ============================================
investigationSchema.virtual('duration').get(function() {
  if (!this.outcome.resolutionDate) return null;
  return Math.ceil((this.outcome.resolutionDate - this.createdAt) / (1000 * 60 * 60 * 24));
});

// ============================================
// Static Methods
// ============================================
investigationSchema.statics.getActiveCases = function() {
  return this.find({
    status: { $nin: ['closed', 'cold_case'] },
    deletedAt: null
  }).populate('primaryCrime investigatingOfficer');
};

// ============================================
// Instance Methods
// ============================================
investigationSchema.methods.addTimelineEntry = function(type, description, user) {
  this.timeline.push({
    type,
    description,
    user,
    date: new Date()
  });
  return this.save();
};

investigationSchema.methods.updateStatus = function(newStatus, user, reason) {
  this.status = newStatus;
  this.updatedBy = user;
  this.addTimelineEntry('status_update', `Status changed to ${newStatus}. Reason: ${reason || 'N/A'}`, user);
  return this.save();
};

const Investigation = mongoose.model('Investigation', investigationSchema);

module.exports = Investigation;