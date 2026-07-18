/**
 * AI Controller - Handles AI-related HTTP requests
 */

const AIService = require('../services/aiService');
const CrimeIncident = require('../models/CrimeIncident');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

class AIController {
  /**
   * Health check for AI service
   */
  static async healthCheck(req, res) {
    try {
      const status = await AIService.healthCheck();
      return ResponseHandler.success(res, status, 'AI service health check');
    } catch (error) {
      logger.error('AI health check error:', error);
      return ResponseHandler.error(res, error, 'AI service unavailable');
    }
  }

  /**
   * Predict crime hotspots
   */
  static async predictCrime(req, res) {
    try {
      const { locations, days = 30 } = req.body;

      if (!locations || !Array.isArray(locations) || locations.length === 0) {
        return ResponseHandler.badRequest(res, 'Locations array is required');
      }

      const result = await AIService.predictCrime(locations, days);
      
      // Store predictions in database
      const Prediction = require('../models/Prediction');
      const predictions = result.predictions.map(p => ({
        type: 'crime_risk',
        prediction: {
          value: p.predicted_crimes,
          confidence: 0.75,
          description: `Predicted crime count for ${p.location.latitude}, ${p.location.longitude}`,
          severity: p.predicted_crimes > 5 ? 'high' : p.predicted_crimes > 2 ? 'medium' : 'low'
        },
        context: {
          location: {
            coordinates: [p.location.longitude, p.location.latitude]
          },
          timeFrame: {
            start: new Date(),
            end: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
          }
        },
        model: {
          name: 'crime_predictor',
          version: '1.0.0',
          type: 'regression'
        },
        generatedBy: 'ai_service',
        status: 'generated'
      }));

      // Save predictions (optional - for historical tracking)
      try {
        await Prediction.insertMany(predictions);
      } catch (saveError) {
        logger.warn('Failed to save predictions:', saveError.message);
      }

      return ResponseHandler.success(res, result, 'Crime predictions generated');
    } catch (error) {
      logger.error('Predict crime error:', error);
      return ResponseHandler.error(res, error, 'Failed to generate crime predictions');
    }
  }

  /**
   * Predict risk scores
   */
  static async predictRisk(req, res) {
    try {
      const { individuals } = req.body;

      if (!individuals || !Array.isArray(individuals) || individuals.length === 0) {
        return ResponseHandler.badRequest(res, 'Individuals array is required');
      }

      const result = await AIService.predictRisk(individuals);
      return ResponseHandler.success(res, result, 'Risk scores generated');
    } catch (error) {
      logger.error('Predict risk error:', error);
      return ResponseHandler.error(res, error, 'Failed to generate risk scores');
    }
  }

  /**
   * Detect anomalies in crimes
   */
  static async detectAnomalies(req, res) {
    try {
      const { crimeIds } = req.body;

      let crimes;
      if (crimeIds && crimeIds.length > 0) {
        // Fetch specific crimes
        crimes = await CrimeIncident.find({
          _id: { $in: crimeIds },
          deletedAt: null
        }).lean();
      } else {
        // Fetch recent crimes
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        crimes = await CrimeIncident.find({
          date: { $gte: thirtyDaysAgo },
          deletedAt: null
        }).limit(100).lean();
      }

      if (!crimes || crimes.length === 0) {
        return ResponseHandler.badRequest(res, 'No crimes found for anomaly detection');
      }

      // Format crimes for AI
      const formattedCrimes = crimes.map(c => ({
        id: c._id,
        date: c.date,
        severity: c.severity,
        crime_type: c.crimeType,
        latitude: c.location?.coordinates?.[1] || 0,
        longitude: c.location?.coordinates?.[0] || 0,
        victim_count: c.victims?.length || 0,
        suspect_count: c.suspects?.length || 0,
        status: c.status
      }));

      const result = await AIService.detectAnomalies(formattedCrimes);
      
      // Add anomaly flags to response
      const anomalies = crimes.map((crime, index) => ({
        crimeId: crime._id,
        firNumber: crime.firNumber,
        isAnomaly: result.anomalies[index] || false,
        anomalyScore: result.anomaly_scores[index] || 0
      }));

      return ResponseHandler.success(res, {
        anomalies,
        anomalyCount: result.anomaly_count,
        normalCount: result.normal_count
      }, 'Anomaly detection completed');
    } catch (error) {
      logger.error('Detect anomalies error:', error);
      return ResponseHandler.error(res, error, 'Failed to detect anomalies');
    }
  }

  /**
   * Detect Modus Operandi patterns
   */
  static async detectMO(req, res) {
    try {
      const { crimeIds } = req.body;

      let crimes;
      if (crimeIds && crimeIds.length > 0) {
        crimes = await CrimeIncident.find({
          _id: { $in: crimeIds },
          deletedAt: null
        }).populate('crimeType').lean();
      } else {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 90);
        
        crimes = await CrimeIncident.find({
          date: { $gte: thirtyDaysAgo },
          deletedAt: null
        }).populate('crimeType').limit(200).lean();
      }

      if (!crimes || crimes.length === 0) {
        return ResponseHandler.badRequest(res, 'No crimes found for MO detection');
      }

      // Format crimes for AI
      const formattedCrimes = crimes.map(c => ({
        id: c._id,
        date: c.date,
        hour: new Date(c.date).getHours(),
        severity: c.severity,
        crime_type: c.crimeType?.code || 0,
        latitude: c.location?.coordinates?.[1] || 0,
        longitude: c.location?.coordinates?.[0] || 0,
        victim_count: c.victims?.length || 0,
        method_type: c.modusOperandi || 0
      }));

      const result = await AIService.detectMO(formattedCrimes);
      
      // Group crimes by cluster
      const clusters = {};
      result.cluster_ids.forEach((clusterId, index) => {
        if (!clusters[clusterId]) {
          clusters[clusterId] = [];
        }
        clusters[clusterId].push({
          crimeId: crimes[index]._id,
          firNumber: crimes[index].firNumber,
          confidence: result.confidence_scores[index]
        });
      });

      return ResponseHandler.success(res, {
        clusters,
        clusterCount: result.n_clusters,
        clusterDetails: Object.keys(clusters).map(id => ({
          id: parseInt(id),
          count: clusters[id].length,
          crimes: clusters[id]
        }))
      }, 'MO detection completed');
    } catch (error) {
      logger.error('Detect MO error:', error);
      return ResponseHandler.error(res, error, 'Failed to detect MO patterns');
    }
  }

  /**
   * Train AI models
   */
  static async trainModels(req, res) {
    try {
      const { modelType } = req.body; // 'all', 'crime', 'anomaly', 'mo'

      let result;
      
      if (modelType === 'all' || !modelType) {
        result = await AIService.trainAllModels();
      } else if (modelType === 'crime') {
        const crime = await AIService.trainCrimePredictor();
        result = { crime_predictor: crime.success, errors: [] };
      } else if (modelType === 'anomaly') {
        const anomaly = await AIService.trainAnomalyDetector();
        result = { anomaly_detector: anomaly.success, errors: [] };
      } else if (modelType === 'mo') {
        const mo = await AIService.trainMODetector();
        result = { mo_detector: mo.success, errors: [] };
      } else {
        return ResponseHandler.badRequest(res, 'Invalid model type');
      }

      return ResponseHandler.success(res, result, 'Model training completed');
    } catch (error) {
      logger.error('Train models error:', error);
      return ResponseHandler.error(res, error, 'Failed to train models');
    }
  }

  /**
   * Get training status
   */
  static async getTrainingStatus(req, res) {
    try {
      const status = await AIService.getTrainingStatus();
      return ResponseHandler.success(res, status, 'Training status fetched');
    } catch (error) {
      logger.error('Get training status error:', error);
      return ResponseHandler.error(res, error, 'Failed to get training status');
    }
  }

  /**
   * Analyze crime trends
   */
  static async analyzeTrends(req, res) {
    try {
      const { days = 30, interval = 'day' } = req.query;
      
      const result = await AIService.analyzeTrends(parseInt(days), interval);
      return ResponseHandler.success(res, result, 'Trend analysis completed');
    } catch (error) {
      logger.error('Analyze trends error:', error);
      return ResponseHandler.error(res, error, 'Failed to analyze trends');
    }
  }

  /**
   * Get crime hotspots
   */
  static async getHotspots(req, res) {
    try {
      const { days = 30, minCrimes = 3 } = req.query;
      
      const result = await AIService.analyzeHotspots(parseInt(days), parseInt(minCrimes));
      return ResponseHandler.success(res, result, 'Hotspot analysis completed');
    } catch (error) {
      logger.error('Get hotspots error:', error);
      return ResponseHandler.error(res, error, 'Failed to get hotspots');
    }
  }

  /**
   * Get AI insights for dashboard
   */
  static async getInsights(req, res) {
    try {
      const [status, hotspots, trends, anomalies] = await Promise.all([
        AIService.getTrainingStatus(),
        AIService.analyzeHotspots(30, 3).catch(() => ({ success: false })),
        AIService.analyzeTrends(30, 'day').catch(() => ({ success: false })),
        AIService.detectAnomalies([]).catch(() => ({ success: false }))
      ]);

      const insights = {
        models: status.models || {},
        hotspots: hotspots.success ? hotspots.hotspots || [] : [],
        trends: trends.success ? trends.trends : null,
        anomalies: anomalies.success ? {
          count: anomalies.anomaly_count || 0,
          detected: anomalies.anomalies || []
        } : null,
        summary: {
          modelCount: Object.values(status.models || {}).filter(v => v).length,
          hotspotCount: hotspots.success ? hotspots.hotspots?.length || 0 : 0,
          anomalyCount: anomalies.success ? anomalies.anomaly_count || 0 : 0
        }
      };

      return ResponseHandler.success(res, insights, 'AI insights fetched');
    } catch (error) {
      logger.error('Get insights error:', error);
      return ResponseHandler.error(res, error, 'Failed to get AI insights');
    }
  }
}

module.exports = AIController;