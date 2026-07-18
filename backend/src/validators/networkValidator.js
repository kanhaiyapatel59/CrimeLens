/**
 * Network Validator - Validation for network analysis endpoints
 */

const { query, param } = require('express-validator');
const mongoose = require('mongoose');

class NetworkValidator {
  /**
   * Validate network filters
   */
  static validateFilters() {
    return [
      query('depth')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Depth must be between 1 and 5')
        .toInt(),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
        .toInt(),
      
      query('minStrength')
        .optional()
        .isInt({ min: 1, max: 10 }).withMessage('Strength must be between 1 and 10')
        .toInt(),
      
      query('type')
        .optional()
        .isIn(['all', 'criminal', 'social', 'financial', 'location'])
        .withMessage('Invalid relationship type')
    ];
  }

  /**
   * Validate ID param
   */
  static validateId() {
    return [
      param('id')
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid ID')
    ];
  }

  /**
   * Validate path finding
   */
  static validatePath() {
    return [
      query('source')
        .notEmpty().withMessage('Source node is required')
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid source ID'),
      
      query('target')
        .notEmpty().withMessage('Target node is required')
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid target ID'),
      
      query('maxDepth')
        .optional()
        .isInt({ min: 1, max: 10 }).withMessage('Max depth must be between 1 and 10')
        .toInt()
    ];
  }

  /**
   * Validate community detection
   */
  static validateCommunities() {
    return [
      query('algorithm')
        .optional()
        .isIn(['louvain', 'girvan_newman', 'label_propagation'])
        .withMessage('Invalid community detection algorithm'),
      
      query('minCommunitySize')
        .optional()
        .isInt({ min: 2 }).withMessage('Minimum community size must be at least 2')
        .toInt()
    ];
  }
}

module.exports = NetworkValidator;