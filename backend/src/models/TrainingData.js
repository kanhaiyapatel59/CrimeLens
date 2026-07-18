/**
 * TrainingData Model - Manages datasets for AI/ML model training
 * Critical for: ML pipeline, model improvement
 */

const mongoose = require('mongoose');

const trainingDataSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Dataset name is required'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Dataset Metadata
  type: {
    type: String,
    enum: [
      'crime_classification',
      'recidivism_prediction',
      'anomaly_detection',
      'network_analysis',
      'text_analysis',
      'time_series',
      'geospatial'
    ],
    required: true
  },
  version: {
    type: String,
    required: true
  },
  
  // Source Information
  source: {
    type: {
      type: String,
      enum: ['crime_records', 'external', 'synthetic', 'user_upload']
    },
    dataRange: {
      start: Date,
      end: Date
    },
    sourceSystem: String,
    ingestionDate: Date
  },
  
  // Data Statistics
  statistics: {
    totalRecords: {
      type: Number,
      required: true
    },
    features: [String],
    targetVariable: String,
    classDistribution: [{
      label: String,
      count: Number,
      percentage: Number
    }],
    missingValues: Number,
    duplicateRecords: Number,
    dataQualityScore: Number
  },
  
  // Data Schema
  schema: {
    fields: [{
      name: String,
      type: {
        type: String,
        enum: ['string', 'number', 'boolean', 'date', 'array', 'object']
      },
      description: String,
      required: Boolean,
      constraints: Object
    }],
    relationships: [{
      field: String,
      references: String,
      type: String
    }]
  },
  
  // Processing Information
  processing: {
    steps: [{
      name: String,
      description: String,
      date: Date,
      parameters: Object
    }],
    transformations: [String],
    normalizations: [String],
    featureEngineering: [{
      name: String,
      description: String,
      derivation: String
    }]
  },
  
  // Data Quality
  quality: {
    completeness: Number,
    accuracy: Number,
    consistency: Number,
    timeliness: Number,
    overallScore: Number,
    issues: [{
      type: String,
      description: String,
      severity: String,
      resolution: String
    }]
  },
  
  // Annotations
  annotations: {
    labelers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      labelsAdded: Number,
      accuracy: Number
    }],
    validation: {
      validators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      agreementScore: Number,
      conflicts: Number
    }
  },
  
  // Training Information
  training: {
    modelsTrained: [{
      modelName: String,
      version: String,
      date: Date,
      accuracy: Number,
      parameters: Object
    }],
    performanceMetrics: {
      accuracy: Number,
      precision: Number,
      recall: Number,
      f1Score: Number,
      rocAuc: Number
    },
    crossValidation: {
      folds: Number,
      averageScore: Number,
      standardDeviation: Number
    }
  },
  
  // Data Access
  access: {
    public: Boolean,
    authorizedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    authorizedRoles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }]
  },
  
  // Storage
  storage: {
    location: String, // S3/Cloudinary path
    fileFormat: {
      type: String,
      enum: ['csv', 'json', 'parquet', 'arrow']
    },
    fileSize: Number,
    compressed: Boolean,
    checksum: String
  },
  
  // Version Control
  versionControl: {
    previousVersion: String,
    changeLog: [{
      version: String,
      date: Date,
      changes: String,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    isLatest: {
      type: Boolean,
      default: true
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'preparing', 'ready', 'processing', 'available', 'archived']
  },
  lifecycleStage: {
    type: String,
    enum: ['development', 'testing', 'production', 'deprecated']
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
trainingDataSchema.index({ name: 1, version: 1 });
trainingDataSchema.index({ type: 1 });
trainingDataSchema.index({ status: 1 });
trainingDataSchema.index({ 'statistics.totalRecords': -1 });
trainingDataSchema.index({ 'quality.overallScore': -1 });

// ============================================
// Virtuals
// ============================================
trainingDataSchema.virtual('isReadyForTraining').get(function() {
  return this.status === 'available' && 
         this.quality.overallScore > 70 &&
         this.lifecycleStage === 'production';
});

// ============================================
// Methods
// ============================================
trainingDataSchema.methods.addModelTraining = function(modelName, version, accuracy, parameters) {
  this.training.modelsTrained.push({
    modelName,
    version,
    date: new Date(),
    accuracy,
    parameters
  });
  
  this.training.performanceMetrics.accuracy = accuracy;
  return this.save();
};

trainingDataSchema.methods.updateQuality = function(completeness, accuracy, consistency) {
  this.quality.completeness = completeness;
  this.quality.accuracy = accuracy;
  this.quality.consistency = consistency;
  this.quality.overallScore = (completeness + accuracy + consistency) / 3;
  return this.save();
};

const TrainingData = mongoose.model('TrainingData', trainingDataSchema);

module.exports = TrainingData;