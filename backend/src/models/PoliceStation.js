/**
 * PoliceStation Model - Hierarchical policing structure
 * Critical for: District-level analytics, resource allocation
 */

const mongoose = require('mongoose');

const policeStationSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Station name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Station code is required'],
    unique: true,
    uppercase: true
  },
  
  // Hierarchical Structure
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: [true, 'District is required']
  },
  division: String,
  subDivision: String,
  
  // Location
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: [Number],
    address: {
      street: String,
      city: String,
      pincode: String
    }
  },
  
  // Jurisdiction
  jurisdiction: {
    areas: [String],
    pincodes: [String],
    villages: [String],
    mapPolygon: {
      type: {
        type: String,
        enum: ['Polygon']
      },
      coordinates: [[[Number]]]
    }
  },
  
  // Staff
  staff: {
    total: Number,
    officers: Number,
    constables: Number,
    women: Number,
    vacancies: Number
  },
  
  // Infrastructure
  infrastructure: {
    hasCyberLab: Boolean,
    hasForensicLab: Boolean,
    hasCCTV: Boolean,
    vehicles: Number,
    firearms: Number,
    computers: Number
  },
  
  // Performance Metrics
  performance: {
    crimeRate: Number,
    detectionRate: Number,
    convictionRate: Number,
    responseTime: Number,
    clearanceRate: Number
  },
  
  // Contact
  contact: {
    phone: [String],
    email: String,
    emergency: String
  },
  
  // Leadership
  leadership: {
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    subInspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
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
policeStationSchema.index({ code: 1 });
policeStationSchema.index({ district: 1 });
policeStationSchema.index({ 'location.coordinates': '2dsphere' });

// ============================================
// Virtuals
// ============================================
policeStationSchema.virtual('fullAddress').get(function() {
  return `${this.location.address.street}, ${this.location.address.city}`;
});

// ============================================
// Methods
// ============================================

// Get crime count for station
policeStationSchema.methods.getCrimeCount = async function(startDate, endDate) {
  const CrimeIncident = mongoose.model('CrimeIncident');
  return await CrimeIncident.countDocuments({
    'location.address.policeStation': this._id,
    date: { $gte: startDate, $lte: endDate }
  });
};

const PoliceStation = mongoose.model('PoliceStation', policeStationSchema);

module.exports = PoliceStation;