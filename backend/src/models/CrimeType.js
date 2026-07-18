/**
 * CrimeType Model - Classification of crimes for analytics and AI
 * Critical for: Crime categorization, analytics, prediction
 */

const mongoose = require('mongoose');

const crimeTypeSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Crime name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Crime code is required'],
    unique: true,
    uppercase: true
  },
  
  // Classification
  category: {
    type: String,
    enum: [
      'violent_crime',
      'property_crime',
      'economic_crime',
      'drug_related',
      'cyber_crime',
      'organised_crime',
      'traffic_offense',
      'public_order',
      'sexual_offense',
      'white_collar',
      'terrorism',
      'other'
    ],
    required: [true, 'Category is required']
  },
  subCategory: String,
  
  // Legal Details
  ipcSections: [String],
  bnsSections: [String],
  bailability: {
    type: String,
    enum: ['bailable', 'non_bailable', 'cognizable', 'non_cognizable']
  },
  
  // Severity
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  punishment: {
    minSentence: String,
    maxSentence: String,
    fine: String
  },
  
  // Statistics (for AI/ML)
  statistics: {
    nationalAverage: Number,
    stateAverage: Number,
    convictionRate: Number,
    underreportingEstimate: Number
  },
  
  // Predictive Features (for AI)
  predictiveFeatures: {
    seasonalPattern: {
      peakMonths: [Number],
      peakDays: [String],
      peakHours: [String]
    },
    riskFactors: [String],
    preventionMeasures: [String]
  },
  
  // Modus Operandi Patterns
  moPatterns: [{
    type: {
      type: String,
      enum: ['individual', 'group', 'organized']
    },
    commonMethods: [String],
    victimProfiles: [String],
    locationTypes: [String]
  }],
  
  // Visual indicators (for dashboard)
  visual: {
    color: {
      type: String,
      default: '#000000'
    },
    icon: String,
    emoji: String
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmerging: {
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
  }
}, {
  timestamps: true
});

// ============================================
// Indexes
// ============================================
crimeTypeSchema.index({ name: 1, category: 1 });
crimeTypeSchema.index({ severity: 1 });

// ============================================
// Methods
// ============================================

// Get crimes by category
crimeTypeSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true });
};

// Get high severity crimes
crimeTypeSchema.statics.getHighSeverity = function() {
  return this.find({ 
    severity: { $in: ['high', 'critical'] },
    isActive: true 
  });
};

const CrimeType = mongoose.model('CrimeType', crimeTypeSchema);

module.exports = CrimeType;