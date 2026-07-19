const CorrelationService = require('../services/correlationService');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

class CorrelationController {
  static async getCorrelationMatrix(req, res) {
    try {
      logger.info('📊 Fetching correlation matrix...');
      const matrix = await CorrelationService.getCorrelationMatrix();
      logger.info(`✅ Correlation matrix fetched: ${matrix.length} districts`);
      return ResponseHandler.success(res, matrix, 'Correlation matrix fetched successfully');
    } catch (error) {
      logger.error('❌ Get correlation matrix error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch correlation matrix');
    }
  }

  static async getDistrictCorrelation(req, res) {
    try {
      const { districtId } = req.params;
      logger.info(`📊 Fetching correlation for district: ${districtId}`);
      const data = await CorrelationService.getDistrictCorrelation(districtId);
      if (!data) {
        return ResponseHandler.notFound(res, 'District not found');
      }
      return ResponseHandler.success(res, data, 'District correlation fetched successfully');
    } catch (error) {
      logger.error('❌ Get district correlation error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch district correlation');
    }
  }

  static async seedEconomicData(req, res) {
    try {
      logger.info('🌱 Seeding economic data...');
      const result = await CorrelationService.seedEconomicData();
      if (result.success) {
        logger.info(`✅ Seeded ${result.seeded} districts`);
        return ResponseHandler.success(res, result, `Seeded ${result.seeded} districts`);
      }
      return ResponseHandler.error(res, new Error(result.error), 'Failed to seed data');
    } catch (error) {
      logger.error('❌ Seed economic data error:', error);
      return ResponseHandler.error(res, error, 'Failed to seed economic data');
    }
  }
}

module.exports = CorrelationController;