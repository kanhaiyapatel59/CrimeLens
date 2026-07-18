/**
 * Prediction Model - Stores AI/ML predictions and analysis results
 * Critical for: AI-driven insights, proactive policing
 */

const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  // Basic Information
  type: {
    type: String,
    enum: [
      'crime_risk',
      'recidivism',
      'hotspot',
      'trend',
      'anomaly',
      'network',
      'resource_need',
      'victim_profile'
    ],
    required: true
  },
  
  // Prediction Details
  prediction: {
    value: mongoose.Schema.Types.Mixed,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  },
  
  // Context
  context: {
    location: {
      district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
      },
      policeStation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PoliceStation'
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: [Number]
      },
      address: String
    },
    timeFrame: {
      start: Date,
      end: Date
    },
    crimeTypes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrimeType'
    }],
    entities: [{
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'context.entities.model'
      },
      model: {
        type: String,
        enum: ['Victim', 'Suspect', 'Offender', 'CrimeIncident']
      }
    }]
  },
  
  // AI Model Information
  model: {
    name: {
      type: String,
      required: true
    },
    version: String,
    type: {
      type: String,
      enum: ['classification', 'regression', 'clustering', 'time_series', 'nlp', 'graph']
    },
    algorithm: String,
    accuracy: Number,
    precision: Number,
    recall: Number,
    f1Score: Number,
    features: [String],
    trainingDataSize: Number,
    trainingDate: Date
  },
  
  // Features & Factors
  features: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    importance: Number,
    weight: Number
  }],
  contributingFactors: [String],
  
  // Analysis Results
  analysis: {
    patterns: [String],
    anomalies: [String],
    correlations: [{
      factor1: String,
      factor2: String,
      correlation: Number,
      description: String
    }],
    trends: [{
      direction: String,
      magnitude: Number,
      confidence: Number
    }]
  },
  
  // Recommendations
  recommendations: [{
    type: {
      type: String,
      enum: ['prevention', 'resource_allocation', 'investigation', 'patrol', 'awareness']
    },
    description: String,
    priority: {
      type: Number,
      min: 1,
      max: 10
    },
    estimatedImpact: Number,
    resourceNeeded: [String]
  }],
  
  // Validation
  validation: {
    status: {
      type: String,
      enum: ['pending', 'validated', 'rejected', 'partially_validated']
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    validatedAt: Date,
    feedback: String,
    actualOutcome: String
  },
  
  // Performance Tracking
  performance: {
    wasAccurate: Boolean,
    accuracyScore: Number,
    feedbackScore: Number,
    usedInDecision: Boolean,
    outcomeDate: Date,
    actionTaken: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['generated', 'reviewed', 'actioned', 'expired', 'validated']
  },
  expiresAt: Date,
  
  // Audit
  generatedBy: {
    type: String, // System/AI service name
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// ============================================
// Indexes
// ============================================
predictionSchema.index({ type: 1, status: 1 });
predictionSchema.index({ 'context.location.district': 1 });
predictionSchema.index({ 'context.timeFrame.start': 1, 'context.timeFrame.end': 1 });
predictionSchema.index({ 'validation.status': 1 });
predictionSchema.index({ expiresAt: 1 });

// ============================================
// Static Methods
// ============================================
predictionSchema.statics.getActivePredictions = function() {
  return this.find({
    status: { $in: ['generated', 'reviewed'] },
    expiresAt: { $gt: new Date() }
  }).sort({ confidence: -1 });
};

predictionSchema.statics.getPredictionsForDistrict = function(districtId) {
  return this.find({
    'context.location.district': districtId,
    status: { $ne: 'expired' }
  }).sort({ generatedAt: -1 });
};

const Prediction = mongoose.model('Prediction', predictionSchema);

module.exports = Prediction;