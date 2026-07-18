/**
 * AI Service - Integration with Python AI module
 * Handles all AI/ML predictions and analysis
 */

const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.baseURL = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    this.timeout = parseInt(process.env.AI_TIMEOUT) || 30000;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Check AI service health
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      logger.error('AI service health check failed:', error.message);
      return { status: 'unavailable', error: error.message };
    }
  }

  /**
   * Predict crime hotspots
   */
  async predictCrime(locations, days = 30) {
    try {
      const response = await this.client.post('/api/predict/crime', {
        locations,
        days
      });
      
      if (response.data.success) {
        logger.info(`AI crime prediction completed: ${response.data.count} predictions`);
        return response.data;
      } else {
        throw new Error(response.data.error || 'Crime prediction failed');
      }
    } catch (error) {
      logger.error('Crime prediction error:', error.message);
      throw error;
    }
  }

  /**
   * Predict risk scores
   */
  async predictRisk(individuals) {
    try {
      const response = await this.client.post('/api/predict/risk', {
        individuals
      });
      
      if (response.data.success) {
        logger.info(`AI risk prediction completed for ${individuals.length} individuals`);
        return response.data;
      } else {
        throw new Error(response.data.error || 'Risk prediction failed');
      }
    } catch (error) {
      logger.error('Risk prediction error:', error.message);
      throw error;
    }
  }

  /**
   * Detect anomalies
   */
  async detectAnomalies(crimes) {
    try {
      const response = await this.client.post('/api/predict/anomaly', {
        crimes
      });
      
      if (response.data.success) {
        logger.info(`AI anomaly detection completed: ${response.data.anomaly_count} anomalies found`);
        return response.data;
      } else {
        throw new Error(response.data.error || 'Anomaly detection failed');
      }
    } catch (error) {
      logger.error('Anomaly detection error:', error.message);
      throw error;
    }
  }

  /**
   * Detect Modus Operandi patterns
   */
  async detectMO(crimes) {
    try {
      const response = await this.client.post('/api/predict/mo', {
        crimes
      });
      
      if (response.data.success) {
        logger.info(`AI MO detection completed: ${response.data.n_clusters} clusters found`);
        return response.data;
      } else {
        throw new Error(response.data.error || 'MO detection failed');
      }
    } catch (error) {
      logger.error('MO detection error:', error.message);
      throw error;
    }
  }

  /**
   * Train crime predictor model
   */
  async trainCrimePredictor(crimes = null) {
    try {
      const response = await this.client.post('/api/train/crime', {
        crimes
      });
      
      if (response.data.success) {
        logger.info('AI crime predictor trained successfully');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Training failed');
      }
    } catch (error) {
      logger.error('Train crime predictor error:', error.message);
      throw error;
    }
  }

  /**
   * Train risk scorer model
   */
  async trainRiskScorer(data, labels) {
    try {
      const response = await this.client.post('/api/train/risk', {
        data,
        labels
      });
      
      if (response.data.success) {
        logger.info('AI risk scorer trained successfully');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Training failed');
      }
    } catch (error) {
      logger.error('Train risk scorer error:', error.message);
      throw error;
    }
  }

  /**
   * Train anomaly detector
   */
  async trainAnomalyDetector(crimes = null) {
    try {
      const response = await this.client.post('/api/train/anomaly', {
        crimes
      });
      
      if (response.data.success) {
        logger.info('AI anomaly detector trained successfully');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Training failed');
      }
    } catch (error) {
      logger.error('Train anomaly detector error:', error.message);
      throw error;
    }
  }

  /**
   * Train MO detector
   */
  async trainMODetector(crimes = null, nClusters = 8) {
    try {
      const response = await this.client.post('/api/train/mo', {
        crimes,
        n_clusters: nClusters
      });
      
      if (response.data.success) {
        logger.info('AI MO detector trained successfully');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Training failed');
      }
    } catch (error) {
      logger.error('Train MO detector error:', error.message);
      throw error;
    }
  }

  /**
   * Get training status
   */
  async getTrainingStatus() {
    try {
      const response = await this.client.get('/api/train/status');
      return response.data;
    } catch (error) {
      logger.error('Get training status error:', error.message);
      throw error;
    }
  }

  /**
   * Analyze trends
   */
  async analyzeTrends(days = 30, interval = 'day') {
    try {
      const response = await this.client.post('/api/analyze/trends', {
        days,
        interval
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Trend analysis failed');
      }
    } catch (error) {
      logger.error('Trend analysis error:', error.message);
      throw error;
    }
  }

  /**
   * Analyze hotspots
   */
  async analyzeHotspots(days = 30, minCrimes = 3) {
    try {
      const response = await this.client.post('/api/analyze/hotspots', {
        days,
        min_crimes: minCrimes
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Hotspot analysis failed');
      }
    } catch (error) {
      logger.error('Hotspot analysis error:', error.message);
      throw error;
    }
  }

  /**
   * Analyze correlation (socio-economic)
   */
  async analyzeCorrelation(crimes, socioEconomic) {
    try {
      const response = await this.client.post('/api/analyze/correlation', {
        crimes,
        socio_economic: socioEconomic
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Correlation analysis failed');
      }
    } catch (error) {
      logger.error('Correlation analysis error:', error.message);
      throw error;
    }
  }

  /**
   * Get model status
   */
  async getModelStatus() {
    try {
      const status = await this.getTrainingStatus();
      return status;
    } catch (error) {
      return {
        success: false,
        models: {
          crime_predictor: false,
          risk_scorer: false,
          anomaly_detector: false,
          mo_detector: false
        }
      };
    }
  }

  /**
   * Train all models with current data
   */
  async trainAllModels() {
    try {
      // Fetch crime data for training
      const CrimeIncident = require('../models/CrimeIncident');
      const crimes = await CrimeIncident.find({
        deletedAt: null
      }).limit(5000).lean();

      const results = {
        crime_predictor: false,
        risk_scorer: false,
        anomaly_detector: false,
        mo_detector: false,
        errors: []
      };

      // Train crime predictor
      try {
        const result = await this.trainCrimePredictor(crimes);
        results.crime_predictor = result.success;
      } catch (error) {
        results.errors.push(`Crime predictor: ${error.message}`);
      }

      // Train anomaly detector
      try {
        const result = await this.trainAnomalyDetector(crimes);
        results.anomaly_detector = result.success;
      } catch (error) {
        results.errors.push(`Anomaly detector: ${error.message}`);
      }

      // Train MO detector
      try {
        const result = await this.trainMODetector(crimes, 8);
        results.mo_detector = result.success;
      } catch (error) {
        results.errors.push(`MO detector: ${error.message}`);
      }

      // Train risk scorer (would need labeled data)
      // This is a placeholder - in production, you'd need proper labeled data
      results.risk_scorer = false;
      results.errors.push('Risk scorer requires labeled training data');

      return results;
    } catch (error) {
      logger.error('Train all models error:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new AIService();