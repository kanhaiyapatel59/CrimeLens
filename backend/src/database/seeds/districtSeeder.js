/**
 * District Seeder - Creates Karnataka districts
 */

const District = require('../../models/District');
const logger = require('../../utils/logger');

const districts = [
  {
    name: 'Bengaluru Urban',
    code: 'BLR',
    division: 'Bengaluru',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716]
    },
    demographics: {
      population: { total: 10839900, male: 5594900, female: 5245000, rural: 2000000, urban: 8839900 },
      area: { total: 2196 },
      literacyRate: 87.67,
      sexRatio: 937,
      populationDensity: 4381
    },
    socioEconomic: {
      gdpPerCapita: 350000,
      povertyRate: 8.5,
      unemploymentRate: 4.5,
      urbanizationRate: 85.6,
      infrastructureIndex: 95,
      educationIndex: 92,
      healthcareIndex: 90
    },
    isActive: true
  },
  {
    name: 'Bengaluru Rural',
    code: 'BLR_R',
    division: 'Bengaluru',
    location: {
      type: 'Point',
      coordinates: [77.4498, 13.2230]
    },
    demographics: {
      population: { total: 1409000, male: 723000, female: 686000, rural: 1200000, urban: 209000 },
      area: { total: 2259 },
      literacyRate: 78.45,
      sexRatio: 949,
      populationDensity: 624
    },
    socioEconomic: {
      gdpPerCapita: 180000,
      povertyRate: 12.3,
      unemploymentRate: 6.2,
      urbanizationRate: 14.8,
      infrastructureIndex: 72,
      educationIndex: 68,
      healthcareIndex: 65
    },
    isActive: true
  },
  {
    name: 'Mysuru',
    code: 'MYS',
    division: 'Mysuru',
    location: {
      type: 'Point',
      coordinates: [76.6387, 12.2958]
    },
    demographics: {
      population: { total: 3300000, male: 1650000, female: 1650000, rural: 1800000, urban: 1500000 },
      area: { total: 6854 },
      literacyRate: 82.56,
      sexRatio: 982,
      populationDensity: 481
    },
    socioEconomic: {
      gdpPerCapita: 210000,
      povertyRate: 9.8,
      unemploymentRate: 5.1,
      urbanizationRate: 45.5,
      infrastructureIndex: 82,
      educationIndex: 78,
      healthcareIndex: 75
    },
    isActive: true
  },
  {
    name: 'Belagavi',
    code: 'BEL',
    division: 'Belagavi',
    location: {
      type: 'Point',
      coordinates: [74.5059, 15.8497]
    },
    demographics: {
      population: { total: 4970000, male: 2520000, female: 2450000, rural: 3500000, urban: 1470000 },
      area: { total: 13415 },
      literacyRate: 73.48,
      sexRatio: 972,
      populationDensity: 370
    },
    socioEconomic: {
      gdpPerCapita: 160000,
      povertyRate: 15.2,
      unemploymentRate: 7.8,
      urbanizationRate: 29.6,
      infrastructureIndex: 68,
      educationIndex: 62,
      healthcareIndex: 60
    },
    isActive: true
  },
  {
    name: 'Kalaburagi',
    code: 'KAL',
    division: 'Kalaburagi',
    location: {
      type: 'Point',
      coordinates: [76.8360, 17.3297]
    },
    demographics: {
      population: { total: 2560000, male: 1300000, female: 1260000, rural: 1900000, urban: 660000 },
      area: { total: 10951 },
      literacyRate: 65.82,
      sexRatio: 969,
      populationDensity: 234
    },
    socioEconomic: {
      gdpPerCapita: 120000,
      povertyRate: 22.5,
      unemploymentRate: 9.2,
      urbanizationRate: 25.8,
      infrastructureIndex: 58,
      educationIndex: 52,
      healthcareIndex: 50
    },
    isActive: true
  },
  {
    name: 'Dakshina Kannada',
    code: 'DK',
    division: 'Mysuru',
    location: {
      type: 'Point',
      coordinates: [74.8567, 12.9185]
    },
    demographics: {
      population: { total: 2080000, male: 1030000, female: 1050000, rural: 1200000, urban: 880000 },
      area: { total: 4866 },
      literacyRate: 88.62,
      sexRatio: 1018,
      populationDensity: 427
    },
    socioEconomic: {
      gdpPerCapita: 280000,
      povertyRate: 7.2,
      unemploymentRate: 4.2,
      urbanizationRate: 42.3,
      infrastructureIndex: 88,
      educationIndex: 85,
      healthcareIndex: 82
    },
    isActive: true
  },
  {
    name: 'Hassan',
    code: 'HAS',
    division: 'Mysuru',
    location: {
      type: 'Point',
      coordinates: [76.1134, 13.0065]
    },
    demographics: {
      population: { total: 1770000, male: 885000, female: 885000, rural: 1400000, urban: 370000 },
      area: { total: 6814 },
      literacyRate: 79.45,
      sexRatio: 1005,
      populationDensity: 260
    },
    socioEconomic: {
      gdpPerCapita: 150000,
      povertyRate: 14.8,
      unemploymentRate: 6.5,
      urbanizationRate: 20.9,
      infrastructureIndex: 65,
      educationIndex: 60,
      healthcareIndex: 58
    },
    isActive: true
  },
  {
    name: 'Tumakuru',
    code: 'TUM',
    division: 'Bengaluru',
    location: {
      type: 'Point',
      coordinates: [77.1080, 13.3299]
    },
    demographics: {
      population: { total: 2670000, male: 1350000, female: 1320000, rural: 2100000, urban: 570000 },
      area: { total: 10597 },
      literacyRate: 75.12,
      sexRatio: 978,
      populationDensity: 252
    },
    socioEconomic: {
      gdpPerCapita: 140000,
      povertyRate: 16.3,
      unemploymentRate: 7.1,
      urbanizationRate: 21.3,
      infrastructureIndex: 62,
      educationIndex: 58,
      healthcareIndex: 55
    },
    isActive: true
  }
];

const seedDistricts = async () => {
  try {
    logger.info('🌱 Seeding districts...');

    for (const districtData of districts) {
      const existingDistrict = await District.findOne({ code: districtData.code });
      
      if (existingDistrict) {
        await District.updateOne({ code: districtData.code }, districtData);
        logger.info(`✅ Updated district: ${districtData.name}`);
      } else {
        await District.create(districtData);
        logger.info(`✅ Created district: ${districtData.name}`);
      }
    }

    logger.info('✅ Districts seeded successfully!');
  } catch (error) {
    logger.error('❌ Error seeding districts:', error);
    throw error;
  }
};

const deleteDistricts = async () => {
  try {
    await District.deleteMany({});
    logger.info('✅ All districts deleted');
  } catch (error) {
    logger.error('❌ Error deleting districts:', error);
    throw error;
  }
};

module.exports = { seedDistricts, deleteDistricts };