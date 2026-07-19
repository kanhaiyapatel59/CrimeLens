/**
 * CrimeIncident Model - Core entity tracking all criminal incidents
 * Contains comprehensive crime data with geospatial support
 */

const mongoose = require('mongoose');

const crimeIncidentSchema = new mongoose.Schema({
  // Unique identifiers
  firNumber: {
    type: String,
    required: [true, 'FIR number is required'],
    unique: true,
    trim: true,
    index: true
  },
  incidentId: {
    type: String,
    required: [true, 'Incident ID is required'],
    unique: true,
    trim: true
  },
  
  // Core incident data
  crimeType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CrimeType',
    required: [true, 'Crime type is required']
  },
  date: {
    type: Date,
    required: [true, 'Incident date is required']
  },
  time: {
    type: String,
    required: [true, 'Incident time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  
  // Location data
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required']
    },
    address: {
      street: String,
      area: String,
      city: String,
      district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
      },
      policeStation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PoliceStation'
      },
      pincode: String,
      landmark: String
    },
    geofence: {
      type: String,
      enum: ['urban', 'rural', 'semi-urban'],
      default: 'urban'
    }
  },
  
  // Incident details
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [10000, 'Description too long']
  },
  modusOperandi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ModusOperandi'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['reported', 'investigating', 'in_progress', 'resolved', 'closed', 'pending'],
    default: 'reported'
  },
  
  // People involved
  victims: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Victim'
  }],
  suspects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Suspect'
  }],
  offenders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offender'
  }],
  witnesses: [{
    name: String,
    contact: String,
    statement: String
  }],
  
  // Evidence
  evidence: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evidence'
  }],
  
  // Investigation
  investigation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investigation'
  },
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  
  // Reporting
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportingOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportingDate: {
    type: Date,
    default: Date.now
  },
  
  // System fields
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: Date,
  
  // AI/ML fields
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  aiPrediction: {
    crimeCategory: String,
    confidence: Number,
    riskLevel: String,
    predictionDate: Date
  },
  
  // Additional metadata
  metaData: {
    source: {
      type: String,
      enum: ['manual', 'excel_upload', 'api', 'mobile_app', 'police_import', 'bulk_upload'],
      default: 'manual'
    },
    tags: [String],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Soft delete
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
crimeIncidentSchema.index({ firNumber: 1, incidentId: 1 });
crimeIncidentSchema.index({ date: -1, crimeType: 1 });
crimeIncidentSchema.index({ 'location.coordinates': '2dsphere' });
crimeIncidentSchema.index({ status: 1, severity: 1 });
crimeIncidentSchema.index({ riskScore: -1 });

// Compound indexes for analytics
crimeIncidentSchema.index({ date: -1, 'location.address.district': 1 });
crimeIncidentSchema.index({ crimeType: 1, date: -1 });

// ============================================
// Virtual fields
// ============================================
crimeIncidentSchema.virtual('isHighRisk').get(function() {
  return this.riskScore && this.riskScore > 70;
});

crimeIncidentSchema.virtual('year').get(function() {
  return this.date.getFullYear();
});

crimeIncidentSchema.virtual('month').get(function() {
  return this.date.getMonth() + 1;
});

// Ensure virtuals are included in JSON output
crimeIncidentSchema.set('toJSON', { virtuals: true });
crimeIncidentSchema.set('toObject', { virtuals: true });

// ============================================
// Static Methods
// ============================================

// Get crimes by date range
crimeIncidentSchema.statics.getByDateRange = function(startDate, endDate) {
  return this.find({
    date: { $gte: startDate, $lte: endDate },
    deletedAt: null
  });
};

// Get crime count by type
crimeIncidentSchema.statics.getCountByType = function(days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        date: { $gte: date },
        deletedAt: null
      }
    },
    {
      $group: {
        _id: '$crimeType',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'crimetypes',
        localField: '_id',
        foreignField: '_id',
        as: 'crimeTypeInfo'
      }
    },
    {
      $unwind: '$crimeTypeInfo'
    },
    {
      $project: {
        _id: 1,
        count: 1,
        crimeTypeName: '$crimeTypeInfo.name',
        crimeCategory: '$crimeTypeInfo.category'
      }
    }
  ]);
};

// ============================================
// Instance Methods
// ============================================

// Calculate age of incident in days
crimeIncidentSchema.methods.getAgeInDays = function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Check if incident is recent (within 7 days)
crimeIncidentSchema.methods.isRecent = function() {
  return this.getAgeInDays() <= 7;
};

const CrimeIncident = mongoose.model('CrimeIncident', crimeIncidentSchema);

module.exports = CrimeIncident;