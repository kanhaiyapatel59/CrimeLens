/**
 * District Model - Administrative hierarchy for crime analytics
 * Critical for: District-level drill-down, state-wide analysis
 * Enterprise feature: GeoJSON support for mapping
 */

const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'District name is required'],
    unique: true,
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: [true, 'District code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  
  // Administrative Hierarchy
  state: {
    type: String,
    default: 'Karnataka',
    required: true
  },
  division: {
    type: String,
    enum: ['Bengaluru', 'Belagavi', 'Kalaburagi', 'Mysuru'],
    required: true
  },
  
  // Geographic Information
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    }
  },
  boundary: {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon']
    },
    coordinates: [[[Number]]] // GeoJSON Polygon
  },
  
  // Demographics
  demographics: {
    population: {
      total: Number,
      male: Number,
      female: Number,
      rural: Number,
      urban: Number,
      year: Number
    },
    area: {
      total: Number, // in sq km
      rural: Number,
      urban: Number
    },
    literacyRate: Number,
    sexRatio: Number,
    populationDensity: Number
  },
  
  // Socio-Economic Indicators (for AI correlation)
  socioEconomic: {
    gdpPerCapita: Number,
    povertyRate: Number,
    unemploymentRate: Number,
    urbanizationRate: Number,
    infrastructureIndex: Number,
    educationIndex: Number,
    healthcareIndex: Number
  },
  
  // Policing Infrastructure
  policing: {
    policeStations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoliceStation'
    }],
    policeCount: Number,
    policePerCapita: Number,
    crimeBranchOffices: Number
  },
  
  // Crime Statistics (cached for performance)
  crimeStats: {
    totalCrimes: {
      type: Number,
      default: 0
    },
    crimeRate: Number, // per 100,000 population
    violentCrimeRate: Number,
    propertyCrimeRate: Number,
    detectionRate: Number,
    convictionRate: Number,
    lastUpdated: Date
  },
  
  // Administrative Contacts
  administration: {
    deputyCommissioner: {
      name: String,
      phone: String,
      email: String
    },
    superintendentPolice: {
      name: String,
      phone: String,
      email: String
    },
    emergencyContact: {
      phone: String,
      email: String
    }
  },
  
  // Risk Assessment (AI-driven)
  riskProfile: {
    overallRisk: {
      type: Number,
      min: 0,
      max: 100
    },
    crimeRisk: Number,
    communalRisk: Number,
    disasterRisk: Number,
    lastAssessment: Date
  },
  
  // Hotspot Analysis (for mapping)
  hotspots: [{
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: [Number],
    crimeType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrimeType'
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    lastUpdated: Date
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isSensitive: {
    type: Boolean,
    default: false // For districts with high crime/terrorism risk
  },
  
  // Audit Fields
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
// Indexes for Performance
// ============================================
districtSchema.index({ name: 1, code: 1 });
districtSchema.index({ division: 1 });
districtSchema.index({ 'location.coordinates': '2dsphere' });
districtSchema.index({ 'crimeStats.crimeRate': -1 });
districtSchema.index({ 'riskProfile.overallRisk': -1 });

// ============================================
// Virtuals
// ============================================
districtSchema.virtual('fullName').get(function() {
  return `${this.name} District`;
});

districtSchema.virtual('crimeDensity').get(function() {
  if (!this.demographics.population.total || !this.crimeStats.totalCrimes) return 0;
  return (this.crimeStats.totalCrimes / this.demographics.population.total) * 100000;
});

// ============================================
// Static Methods
// ============================================

// Get all districts with crime statistics
districtSchema.statics.getAllWithCrimeStats = function() {
  return this.find({ isActive: true })
    .populate('policing.policeStations')
    .select('name code crimeStats demographics riskProfile');
};

// Get district by code
districtSchema.statics.findByCode = function(code) {
  return this.findOne({ code: code.toUpperCase(), isActive: true });
};

// Get high-risk districts
districtSchema.statics.getHighRiskDistricts = function(threshold = 70) {
  return this.find({
    'riskProfile.overallRisk': { $gte: threshold },
    isActive: true
  }).sort({ 'riskProfile.overallRisk': -1 });
};

// ============================================
// Instance Methods
// ============================================

// Update crime statistics
districtSchema.methods.updateCrimeStats = async function() {
  const CrimeIncident = mongoose.model('CrimeIncident');
  
  const stats = await CrimeIncident.aggregate([
    {
      $match: {
        'location.address.district': this._id,
        deletedAt: null
      }
    },
    {
      $group: {
        _id: null,
        totalCrimes: { $sum: 1 },
        violentCrimes: {
          $sum: {
            $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.crimeStats.totalCrimes = stats[0].totalCrimes || 0;
    this.crimeStats.violentCrimeRate = stats[0].violentCrimes || 0;
    this.crimeStats.crimeRate = (stats[0].totalCrimes / (this.demographics.population.total / 100000)) || 0;
    this.crimeStats.lastUpdated = new Date();
    await this.save();
  }
  
  return this;
};

// Get crime time series for district
districtSchema.methods.getCrimeTimeSeries = async function(days = 30) {
  const CrimeIncident = mongoose.model('CrimeIncident');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await CrimeIncident.aggregate([
    {
      $match: {
        'location.address.district': this._id,
        date: { $gte: startDate },
        deletedAt: null
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

// Calculate risk profile
districtSchema.methods.calculateRiskProfile = async function() {
  // This would call AI service in production
  // For now, calculate based on crime stats and socio-economic factors
  
  const crimeWeight = 0.4;
  const socioWeight = 0.3;
  const popDensityWeight = 0.3;
  
  const crimeRisk = Math.min((this.crimeStats.crimeRate || 0) / 100, 100);
  const socioRisk = this.socioEconomic.povertyRate || 0;
  const densityRisk = Math.min((this.demographics.populationDensity || 0) / 1000, 100);
  
  this.riskProfile.overallRisk = Math.round(
    (crimeRisk * crimeWeight) + 
    (socioRisk * socioWeight) + 
    (densityRisk * popDensityWeight)
  );
  
  this.riskProfile.crimeRisk = Math.round(crimeRisk);
  this.riskProfile.lastAssessment = new Date();
  
  await this.save();
  return this.riskProfile;
};

const District = mongoose.model('District', districtSchema);

module.exports = District;
