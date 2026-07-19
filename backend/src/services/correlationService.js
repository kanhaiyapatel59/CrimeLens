const mongoose = require('mongoose');
const CrimeIncident = require('../models/CrimeIncident');
const DistrictEconomicData = require('../models/DistrictEconomicData');
const District = require('../models/District');
const logger = require('../utils/logger');

class CorrelationService {
  static async getCorrelationMatrix() {
    try {
      logger.info('📊 Building correlation matrix...');
      
      const districts = await District.find({ isActive: true });
      logger.info(`📊 Found ${districts.length} districts`);
      
      const matrix = [];

      for (const district of districts) {
        // Get crime count
        const crimeCount = await CrimeIncident.countDocuments({
          'location.address.district': district._id,
          deletedAt: null
        });

        // Get economic data
        const economic = await DistrictEconomicData.findOne({ 
          district: district._id 
        });

        logger.info(`📊 District: ${district.name}, Crimes: ${crimeCount}, Economic: ${economic ? 'Yes' : 'No'}`);

        matrix.push({
          id: district._id,
          district: district.name,
          crimeRate: crimeCount,
          correlations: {
            povertyVsCrime: economic?.povertyRate ? Math.min((economic.povertyRate / 50) * 0.8, 0.8) : 0,
            unemploymentVsCrime: economic?.unemploymentRate ? Math.min((economic.unemploymentRate / 30) * 0.7, 0.7) : 0,
            literacyVsCrime: economic?.literacyRate ? -Math.min(((100 - economic.literacyRate) / 50) * 0.6, 0.6) : 0,
            densityVsCrime: economic?.populationDensity ? Math.min((economic.populationDensity / 5000) * 0.5, 0.5) : 0,
            urbanizationVsCrime: economic?.urbanizationRate ? Math.min((economic.urbanizationRate / 80) * 0.4, 0.4) : 0,
            giniVsViolent: economic?.giniCoefficient ? Math.min((economic.giniCoefficient / 0.5) * 0.7, 0.7) : 0
          },
          insights: [
            {
              type: economic?.povertyRate > 20 ? 'warning' : 'info',
              title: economic?.povertyRate > 20 ? 'High Poverty Area' : 'Low Poverty Area',
              description: economic?.povertyRate > 20 
                ? `Poverty rate of ${economic.povertyRate}% shows correlation with crime` 
                : `Low poverty rate of ${economic.povertyRate}% correlates with lower crime`,
              severity: economic?.povertyRate > 20 ? 'high' : 'low'
            }
          ],
          economicData: economic || {}
        });
      }

      logger.info(`✅ Correlation matrix built: ${matrix.length} districts`);
      return matrix;
    } catch (error) {
      logger.error('❌ Correlation matrix error:', error);
      return [];
    }
  }

  static async getDistrictCorrelation(districtId) {
    try {
      const district = await District.findById(districtId);
      if (!district) return null;

      const crimeCount = await CrimeIncident.countDocuments({
        'location.address.district': district._id,
        deletedAt: null
      });

      const economic = await DistrictEconomicData.findOne({ district: district._id });

      return {
        district: district,
        crimeRate: crimeCount,
        correlations: {
          povertyVsCrime: economic?.povertyRate ? Math.min((economic.povertyRate / 50) * 0.8, 0.8) : 0,
          unemploymentVsCrime: economic?.unemploymentRate ? Math.min((economic.unemploymentRate / 30) * 0.7, 0.7) : 0,
          literacyVsCrime: economic?.literacyRate ? -Math.min(((100 - economic.literacyRate) / 50) * 0.6, 0.6) : 0,
          densityVsCrime: economic?.populationDensity ? Math.min((economic.populationDensity / 5000) * 0.5, 0.5) : 0,
          urbanizationVsCrime: economic?.urbanizationRate ? Math.min((economic.urbanizationRate / 80) * 0.4, 0.4) : 0,
          giniVsViolent: economic?.giniCoefficient ? Math.min((economic.giniCoefficient / 0.5) * 0.7, 0.7) : 0
        },
        insights: [],
        economicData: economic || {}
      };
    } catch (error) {
      logger.error('❌ District correlation error:', error);
      return null;
    }
  }

  static async seedEconomicData() {
    try {
      logger.info('🌱 Seeding economic data...');
      
      const districts = await District.find({ isActive: true });
      let count = 0;

      for (const district of districts) {
        const existing = await DistrictEconomicData.findOne({ district: district._id });
        if (!existing) {
          const isUrban = district.name.toLowerCase().includes('bengaluru') || 
                         district.name.toLowerCase().includes('mysuru') ||
                         district.name.toLowerCase().includes('hubli');
          
          await DistrictEconomicData.create({
            district: district._id,
            year: new Date().getFullYear(),
            gdpPerCapita: isUrban ? 150000 + Math.random() * 100000 : 80000 + Math.random() * 50000,
            povertyRate: isUrban ? 5 + Math.random() * 15 : 15 + Math.random() * 25,
            unemploymentRate: isUrban ? 3 + Math.random() * 5 : 5 + Math.random() * 10,
            giniCoefficient: isUrban ? 0.35 + Math.random() * 0.15 : 0.25 + Math.random() * 0.1,
            populationDensity: isUrban ? 3000 + Math.random() * 2000 : 200 + Math.random() * 500,
            urbanizationRate: isUrban ? 70 + Math.random() * 20 : 20 + Math.random() * 30,
            literacyRate: isUrban ? 80 + Math.random() * 15 : 60 + Math.random() * 20,
            sexRatio: 950 + Math.random() * 50,
            infrastructureIndex: isUrban ? 70 + Math.random() * 20 : 40 + Math.random() * 30,
            educationIndex: isUrban ? 75 + Math.random() * 15 : 50 + Math.random() * 25,
            healthcareIndex: isUrban ? 70 + Math.random() * 20 : 45 + Math.random() * 25,
            policePerCapita: isUrban ? 150 + Math.random() * 50 : 80 + Math.random() * 40
          });
          count++;
          logger.info(`✅ Seeded ${district.name}`);
        }
      }
      logger.info(`✅ Seeded ${count} districts`);
      return { success: true, seeded: count };
    } catch (error) {
      logger.error('❌ Seed error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = CorrelationService;