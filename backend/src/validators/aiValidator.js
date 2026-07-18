/**
 * AI Validator - Validation for AI endpoints
 */

const { body, query } = require('express-validator');

class AIValidator {
  /**
   * Validate crime prediction
   */
  static validatePredictCrime() {
    return [
      body('locations')
        .isArray({ min: 1 }).withMessage('Locations must be an array with at least 1 item'),
      
      body('locations.*.latitude')
        .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
      
      body('locations.*.longitude')
        .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
      
      body('locations.*.crime_type')
        .optional()
        .isInt().withMessage('Invalid crime type'),
      
      body('locations.*.severity')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid severity'),
      
      body('days')
        .optional()
        .isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
        .toInt()
    ];
  }

  /**
   * Validate risk prediction
   */
  static validatePredictRisk() {
    return [
      body('individuals')
        .isArray({ min: 1 }).withMessage('Individuals must be an array with at least 1 item'),
      
      body('individuals.*.age')
        .optional()
        .isInt({ min: 0, max: 120 }).withMessage('Invalid age'),
      
      body('individuals.*.criminal_count')
        .optional()
        .isInt({ min: 0 }).withMessage('Invalid criminal count'),
      
      body('individuals.*.current_crimes')
        .optional()
        .isInt({ min: 0 }).withMessage('Invalid current crimes count'),
      
      body('individuals.*.severity_score')
        .optional()
        .isInt({ min: 0, max: 10 }).withMessage('Invalid severity score')
    ];
  }

  /**
   * Validate anomaly detection
   */
  static validateDetectAnomalies() {
    return [
      body('crimeIds')
        .optional()
        .isArray().withMessage('Crime IDs must be an array')
    ];
  }

  /**
   * Validate MO detection
   */
  static validateDetectMO() {
    return [
      body('crimeIds')
        .optional()
        .isArray().withMessage('Crime IDs must be an array')
    ];
  }

  /**
   * Validate training
   */
  static validateTrain() {
    return [
      body('modelType')
        .optional()
        .isIn(['all', 'crime', 'risk', 'anomaly', 'mo'])
        .withMessage('Invalid model type')
    ];
  }

  /**
   * Validate trend analysis
   */
  static validateTrends() {
    return [
      query('days')
        .optional()
        .isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
        .toInt(),
      
      query('interval')
        .optional()
        .isIn(['day', 'week', 'month'])
        .withMessage('Invalid interval')
    ];
  }

  /**
   * Validate hotspots
   */
  static validateHotspots() {
    return [
      query('days')
        .optional()
        .isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
        .toInt(),
      
      query('minCrimes')
        .optional()
        .isInt({ min: 1 }).withMessage('Minimum crimes must be at least 1')
        .toInt()
    ];
  }

  /**
   * Check validation results
   */
  static checkValidation(req, res, next) {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation error',
      errors: errorMessages
    });
  }
}

module.exports = AIValidator;