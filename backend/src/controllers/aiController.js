/**
 * AI Controller - Handles AI-related HTTP requests
 */

const AIService = require('../services/aiService');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

class AIController {
  /**
   * Chat with AI
   */
  static async chat(req, res) {
    try {
      const { message, context, history } = req.body;
      
      if (!message) {
        return ResponseHandler.badRequest(res, 'Message is required');
      }

      logger.info(`💬 AI Chat request: ${message.substring(0, 50)}...`);
      
      const result = await AIService.chat(message, context, history);
      
      if (result.success) {
        return ResponseHandler.success(res, {
          response: result.response,
          usage: result.usage
        }, 'AI response generated');
      } else {
        logger.error('❌ AI service error:', result.error);
        return ResponseHandler.error(res, new Error(result.error), result.error);
      }
    } catch (error) {
      logger.error('❌ AI Chat error:', error);
      return ResponseHandler.error(res, error, 'Failed to get AI response');
    }
  }

  /**
   * Analyze crime patterns
   */
  static async analyzePatterns(req, res) {
    try {
      const { crimeData } = req.body;
      
      if (!crimeData) {
        return ResponseHandler.badRequest(res, 'Crime data is required');
      }

      const result = await AIService.analyzeCrimePatterns(crimeData);
      
      if (result.success) {
        return ResponseHandler.success(res, result.response, 'Pattern analysis complete');
      } else {
        return ResponseHandler.error(res, new Error(result.error), result.error);
      }
    } catch (error) {
      logger.error('❌ Pattern analysis error:', error);
      return ResponseHandler.error(res, error, 'Failed to analyze patterns');
    }
  }

  /**
   * Predict hotspots
   */
  static async predictHotspots(req, res) {
    try {
      const { locations, timeframe } = req.body;
      
      if (!locations) {
        return ResponseHandler.badRequest(res, 'Locations data is required');
      }

      const result = await AIService.predictHotspots(locations, timeframe);
      
      if (result.success) {
        return ResponseHandler.success(res, result.response, 'Hotspot prediction complete');
      } else {
        return ResponseHandler.error(res, new Error(result.error), result.error);
      }
    } catch (error) {
      logger.error('❌ Hotspot prediction error:', error);
      return ResponseHandler.error(res, error, 'Failed to predict hotspots');
    }
  }

  /**
   * Analyze suspect network
   */
  static async analyzeNetwork(req, res) {
    try {
      const { suspectData } = req.body;
      
      if (!suspectData) {
        return ResponseHandler.badRequest(res, 'Suspect data is required');
      }

      const result = await AIService.analyzeSuspectNetwork(suspectData);
      
      if (result.success) {
        return ResponseHandler.success(res, result.response, 'Network analysis complete');
      } else {
        return ResponseHandler.error(res, new Error(result.error), result.error);
      }
    } catch (error) {
      logger.error('❌ Network analysis error:', error);
      return ResponseHandler.error(res, error, 'Failed to analyze network');
    }
  }

  /**
   * Generate report summary
   */
  static async generateReport(req, res) {
    try {
      const { reportData } = req.body;
      
      if (!reportData) {
        return ResponseHandler.badRequest(res, 'Report data is required');
      }

      const result = await AIService.generateReportSummary(reportData);
      
      if (result.success) {
        return ResponseHandler.success(res, result.response, 'Report generated');
      } else {
        return ResponseHandler.error(res, new Error(result.error), result.error);
      }
    } catch (error) {
      logger.error('❌ Report generation error:', error);
      return ResponseHandler.error(res, error, 'Failed to generate report');
    }
  }

  /**
   * Quick query
   */
  static async query(req, res) {
    try {
      const { question, context } = req.body;
      
      if (!question) {
        return ResponseHandler.badRequest(res, 'Question is required');
      }

      const result = await AIService.quickQuery(question, context);
      
      if (result.success) {
        return ResponseHandler.success(res, result.response, 'Query answered');
      } else {
        return ResponseHandler.error(res, new Error(result.error), result.error);
      }
    } catch (error) {
      logger.error('❌ Quick query error:', error);
      return ResponseHandler.error(res, error, 'Failed to answer query');
    }
  }
}

module.exports = AIController;