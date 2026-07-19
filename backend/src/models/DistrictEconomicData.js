const mongoose = require('mongoose');

const districtEconomicDataSchema = new mongoose.Schema({
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: true,
    unique: true
  },
  year: { type: Number, default: new Date().getFullYear() },
  gdpPerCapita: { type: Number, default: 0 },
  povertyRate: { type: Number, default: 0 },
  unemploymentRate: { type: Number, default: 0 },
  giniCoefficient: { type: Number, default: 0 },
  populationDensity: { type: Number, default: 0 },
  urbanizationRate: { type: Number, default: 0 },
  literacyRate: { type: Number, default: 0 },
  sexRatio: { type: Number, default: 0 },
  infrastructureIndex: { type: Number, default: 0 },
  educationIndex: { type: Number, default: 0 },
  healthcareIndex: { type: Number, default: 0 },
  policePerCapita: { type: Number, default: 0 },
  source: { type: String, default: 'estimated' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DistrictEconomicData', districtEconomicDataSchema);