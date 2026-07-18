/**
 * Crime Controller - Handles crime-related HTTP requests
 */

const CrimeService = require('../services/crimeService');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

class CrimeController {
  /**
   * Create a new crime incident
   */
  static async createCrime(req, res) {
    try {
      const userId = req.userId;
      const crimeData = req.body;

      const crime = await CrimeService.createCrime(crimeData, userId);

      return ResponseHandler.created(res, crime, 'Crime incident created successfully');
    } catch (error) {
      logger.error('Create crime error:', error);
      
      if (error.message.includes('already exists')) {
        return ResponseHandler.conflict(res, error.message);
      }
      
      return ResponseHandler.error(res, error, 'Failed to create crime incident');
    }
  }

  /**
   * Get crime by ID
   */
  static async getCrime(req, res) {
    try {
      const { id } = req.params;
      const crime = await CrimeService.getCrimeById(id);

      return ResponseHandler.success(res, crime, 'Crime fetched successfully');
    } catch (error) {
      logger.error('Get crime error:', error);
      
      if (error.message === 'Crime not found') {
        return ResponseHandler.notFound(res, error.message);
      }
      
      return ResponseHandler.error(res, error, 'Failed to fetch crime');
    }
  }

  /**
   * Get crimes with filters
   */
  static async getCrimes(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        startDate,
        endDate,
        crimeType,
        district,
        policeStation,
        severity,
        status,
        search
      } = req.query;

      const filters = {
        startDate,
        endDate,
        crimeType,
        district,
        policeStation,
        severity,
        status,
        search
      };

      const result = await CrimeService.getCrimes(filters, parseInt(page), parseInt(limit));

      return ResponseHandler.success(res, result, 'Crimes fetched successfully');
    } catch (error) {
      logger.error('Get crimes error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch crimes');
    }
  }

  /**
   * Update crime
   */
  static async updateCrime(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const updateData = req.body;

      const crime = await CrimeService.updateCrime(id, updateData, userId);

      return ResponseHandler.success(res, crime, 'Crime updated successfully');
    } catch (error) {
      logger.error('Update crime error:', error);
      
      if (error.message === 'Crime not found') {
        return ResponseHandler.notFound(res, error.message);
      }
      
      return ResponseHandler.error(res, error, 'Failed to update crime');
    }
  }

  /**
   * Delete crime (soft delete)
   */
  static async deleteCrime(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const result = await CrimeService.deleteCrime(id, userId);

      return ResponseHandler.success(res, result, 'Crime deleted successfully');
    } catch (error) {
      logger.error('Delete crime error:', error);
      
      if (error.message === 'Crime not found') {
        return ResponseHandler.notFound(res, error.message);
      }
      
      return ResponseHandler.error(res, error, 'Failed to delete crime');
    }
  }

  /**
   * Get crime statistics
   */
  static async getStats(req, res) {
    try {
      const { startDate, endDate, district, policeStation } = req.query;

      const filters = { startDate, endDate, district, policeStation };
      const stats = await CrimeService.getCrimeStats(filters);

      return ResponseHandler.success(res, stats, 'Crime statistics fetched successfully');
    } catch (error) {
      logger.error('Get crime stats error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch crime statistics');
    }
  }

  /**
   * Get crime trends
   */
  static async getTrends(req, res) {
    try {
      const { startDate, endDate, district, crimeType } = req.query;

      const filters = { startDate, endDate, district, crimeType };
      const trends = await CrimeService.getCrimeTrends(filters);

      return ResponseHandler.success(res, trends, 'Crime trends fetched successfully');
    } catch (error) {
      logger.error('Get crime trends error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch crime trends');
    }
  }

  /**
   * Get crime hotspots
   */
  static async getHotspots(req, res) {
    try {
      const { district, days = 30, radius = 1000 } = req.query;

      const filters = { district, days: parseInt(days), radius: parseInt(radius) };
      const hotspots = await CrimeService.getHotspots(filters);

      return ResponseHandler.success(res, hotspots, 'Crime hotspots fetched successfully');
    } catch (error) {
      logger.error('Get hotspots error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch crime hotspots');
    }
  }

  /**
   * Bulk upload crimes
   */
  static async bulkUpload(req, res) {
    try {
      const userId = req.userId;
      const { crimes } = req.body;

      const result = await CrimeService.bulkUpload(crimes, userId);

      return ResponseHandler.success(res, result, 'Bulk upload completed');
    } catch (error) {
      logger.error('Bulk upload error:', error);
      return ResponseHandler.error(res, error, 'Bulk upload failed');
    }
  }

  /**
   * Export crimes
   */
  static async exportCrimes(req, res) {
    try {
      const { format = 'json', startDate, endDate } = req.query;

      const filters = { startDate, endDate };
      const crimes = await CrimeService.exportCrimes(filters);

      // Handle different formats
      if (format === 'csv') {
        // TODO: Implement CSV export
        return ResponseHandler.success(res, crimes, 'Crimes exported successfully');
      } else if (format === 'excel') {
        // TODO: Implement Excel export
        return ResponseHandler.success(res, crimes, 'Crimes exported successfully');
      } else {
        // Default: JSON
        return ResponseHandler.success(res, crimes, 'Crimes exported successfully');
      }
    } catch (error) {
      logger.error('Export crimes error:', error);
      return ResponseHandler.error(res, error, 'Failed to export crimes');
    }
  }
}

module.exports = CrimeController;