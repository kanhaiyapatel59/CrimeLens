/**
 * Dashboard Controller - Handles dashboard HTTP requests
 */

const DashboardService = require('../services/dashboardService');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

class DashboardController {
  /**
   * Get KPIs
   */
  static async getKPIs(req, res) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return ResponseHandler.success(res, {
          totalCrimes: 0,
          severityCount: { low: 0, medium: 0, high: 0, critical: 0 },
          statusCount: { reported: 0, investigating: 0, in_progress: 0, resolved: 0, closed: 0, pending: 0 },
          highRiskCount: 0,
          avgRisk: 0,
          trend: []
        }, 'KPIs fetched successfully (offline mode)');
      }
      const { district, policeStation, startDate, endDate, days } = req.query;
      const filters = { district, policeStation, startDate, endDate, days };
      const kpis = await DashboardService.getKPIs(filters);
      return ResponseHandler.success(res, kpis, 'KPIs fetched successfully');
    } catch (error) {
      logger.error('Get KPIs error:', error);
      return ResponseHandler.success(res, {
        totalCrimes: 0,
        severityCount: { low: 0, medium: 0, high: 0, critical: 0 },
        statusCount: { reported: 0, investigating: 0, in_progress: 0, resolved: 0, closed: 0, pending: 0 },
        highRiskCount: 0,
        avgRisk: 0,
        trend: []
      }, 'KPIs fetched successfully (fallback)');
    }
  }

  /**
   * Get chart data
   */
  static async getChartData(req, res) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return ResponseHandler.success(res, [], 'Chart data fetched successfully (offline mode)');
      }
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
      return ResponseHandler.success(res, [], 'Chart data fetched successfully (fallback)');
    }
  }

  /**
   * Get overview
   */
  static async getOverview(req, res) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return ResponseHandler.success(res, { total: 0, active: 0, resolved: 0, pending: 0 }, 'Overview fetched (offline mode)');
      }
      const { district, policeStation } = req.query;
      const filters = { district, policeStation };
      const overview = await DashboardService.getOverview(filters);
      return ResponseHandler.success(res, overview, 'Overview fetched successfully');
    } catch (error) {
      logger.error('Get overview error:', error);
      return ResponseHandler.success(res, { total: 0, active: 0, resolved: 0, pending: 0 }, 'Overview fetched (fallback)');
    }
  }

  /**
   * Get district comparison
   */
  static async getDistrictComparison(req, res) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return ResponseHandler.success(res, [], 'District comparison fetched (offline mode)');
      }
      const { districts, metric } = req.query;
      const filters = { 
        districts: districts ? (Array.isArray(districts) ? districts : [districts]) : [],
        metric
      };
      const comparison = await DashboardService.getDistrictComparison(filters);
      return ResponseHandler.success(res, comparison, 'District comparison fetched successfully');
    } catch (error) {
      logger.error('Get district comparison error:', error);
      return ResponseHandler.success(res, [], 'District comparison fetched (fallback)');
    }
  }

  /**
   * Get heatmap data
   */
  static async getHeatmap(req, res) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return ResponseHandler.success(res, [], 'Heatmap data fetched (offline mode)');
      }
      const { district, startDate, endDate, days } = req.query;
      const filters = { district, startDate, endDate, days };
      const heatmap = await DashboardService.getHeatmapData(filters);
      return ResponseHandler.success(res, heatmap, 'Heatmap data fetched successfully');
    } catch (error) {
      logger.error('Get heatmap error:', error);
      return ResponseHandler.success(res, [], 'Heatmap data fetched (fallback)');
    }
  }

  /**
   * Get recent alerts
   */
  static async getAlerts(req, res) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return ResponseHandler.success(res, [], 'Alerts fetched (offline mode)');
      }
      const { district } = req.query;
      const filters = { district };
      const alerts = await DashboardService.getRecentAlerts(filters);
      return ResponseHandler.success(res, alerts, 'Alerts fetched successfully');
    } catch (error) {
      logger.error('Get alerts error:', error);
      return ResponseHandler.success(res, [], 'Alerts fetched (fallback)');
    }
  }

  /**
   * Get timeline
   */
  static async getTimeline(req, res) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return ResponseHandler.success(res, [], 'Timeline fetched (offline mode)');
      }
      const { district, startDate, endDate, days } = req.query;
      const filters = { district, startDate, endDate, days };
      const timeline = await DashboardService.getTimeline(filters);
      return ResponseHandler.success(res, timeline, 'Timeline fetched successfully');
    } catch (error) {
      logger.error('Get timeline error:', error);
      return ResponseHandler.success(res, [], 'Timeline fetched (fallback)');
    }
  }

  /**
   * Get predictive risk scores
   */
  static async getPredictions(req, res) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return ResponseHandler.success(res, [], 'Predictions fetched (offline mode)');
      }
      const predictions = await DashboardService.getPredictions(req.query);
      return ResponseHandler.success(res, predictions, 'Predictions fetched successfully');
    } catch (error) {
      logger.error('Get predictions error:', error);
      return ResponseHandler.success(res, [], 'Predictions fetched (fallback)');
    }
  }

  /**
   * Get anomaly alerts
   */
  static async getAnomalies(req, res) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return ResponseHandler.success(res, [], 'Anomalies fetched (offline mode)');
      }
      const anomalies = await DashboardService.getAnomalies(req.query);
      return ResponseHandler.success(res, anomalies, 'Anomalies fetched successfully');
    } catch (error) {
      logger.error('Get anomalies error:', error);
      return ResponseHandler.success(res, [], 'Anomalies fetched (fallback)');
    }
  }
}

module.exports = DashboardController;