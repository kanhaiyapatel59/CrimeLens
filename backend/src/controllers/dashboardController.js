/**
 * Dashboard Controller - Handles dashboard HTTP requests
 */

const DashboardService = require('../services/dashboardService');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

class DashboardController {
  /**
   * Get KPIs
   */
  static async getKPIs(req, res) {
    try {
      const { district, policeStation, startDate, endDate, days } = req.query;
      
      const filters = { district, policeStation, startDate, endDate, days };
      const kpis = await DashboardService.getKPIs(filters);

      return ResponseHandler.success(res, kpis, 'KPIs fetched successfully');
    } catch (error) {
      logger.error('Get KPIs error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch KPIs');
    }
  }

  /**
   * Get chart data
   */
  static async getChartData(req, res) {
    try {
      const { 
        type = 'bar', 
        groupBy = 'crimeType', 
        limit = 10,
        district,
        policeStation,
        startDate,
        endDate,
        days
      } = req.query;

      const filters = { district, policeStation, startDate, endDate, days };
      const chartData = await DashboardService.getChartData(filters, type, groupBy, parseInt(limit));

      return ResponseHandler.success(res, chartData, 'Chart data fetched successfully');
    } catch (error) {
      logger.error('Get chart data error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch chart data');
    }
  }

  /**
   * Get overview
   */
  static async getOverview(req, res) {
    try {
      const { district, policeStation } = req.query;
      
      const filters = { district, policeStation };
      const overview = await DashboardService.getOverview(filters);

      return ResponseHandler.success(res, overview, 'Overview fetched successfully');
    } catch (error) {
      logger.error('Get overview error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch overview');
    }
  }

  /**
   * Get district comparison
   */
  static async getDistrictComparison(req, res) {
    try {
      const { districts, metric } = req.query;
      
      const filters = { 
        districts: districts ? (Array.isArray(districts) ? districts : [districts]) : [],
        metric
      };
      
      const comparison = await DashboardService.getDistrictComparison(filters);

      return ResponseHandler.success(res, comparison, 'District comparison fetched successfully');
    } catch (error) {
      logger.error('Get district comparison error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch district comparison');
    }
  }

  /**
   * Get heatmap data
   */
  static async getHeatmap(req, res) {
    try {
      const { district, startDate, endDate, days } = req.query;
      
      const filters = { district, startDate, endDate, days };
      const heatmap = await DashboardService.getHeatmapData(filters);

      return ResponseHandler.success(res, heatmap, 'Heatmap data fetched successfully');
    } catch (error) {
      logger.error('Get heatmap error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch heatmap data');
    }
  }

  /**
   * Get recent alerts
   */
  static async getAlerts(req, res) {
    try {
      const { district } = req.query;
      
      const filters = { district };
      const alerts = await DashboardService.getRecentAlerts(filters);

      return ResponseHandler.success(res, alerts, 'Alerts fetched successfully');
    } catch (error) {
      logger.error('Get alerts error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch alerts');
    }
  }

  /**
   * Get timeline
   */
  static async getTimeline(req, res) {
    try {
      const { district, startDate, endDate, days } = req.query;
      
      const filters = { district, startDate, endDate, days };
      const timeline = await DashboardService.getTimeline(filters);

      return ResponseHandler.success(res, timeline, 'Timeline fetched successfully');
    } catch (error) {
      logger.error('Get timeline error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch timeline');
    }
  }
}

module.exports = DashboardController;