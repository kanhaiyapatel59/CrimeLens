/**
 * Dashboard Validator - Validation for dashboard endpoints
 */

const { query } = require('express-validator');
const mongoose = require('mongoose');

class DashboardValidator {
  /**
   * Validate dashboard filters
   */
  static validateFilters() {
    return [
      query('district')
        .optional()
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid district ID'),
      
      query('policeStation')
        .optional()
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid police station ID'),
      
      query('startDate')
        .optional()
        .isISO8601().withMessage('Invalid start date format'),
      
      query('endDate')
        .optional()
        .isISO8601().withMessage('Invalid end date format'),
      
      query('days')
        .optional()
        .isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
        .toInt()
    ];
  }

  /**
   * Validate chart filters
   */
  static validateChart() {
    return [
      query('type')
        .optional()
        .isIn(['bar', 'line', 'pie', 'doughnut', 'radar'])
        .withMessage('Invalid chart type'),
      
      query('groupBy')
        .optional()
        .isIn(['crimeType', 'district', 'severity', 'status', 'day', 'week', 'month'])
        .withMessage('Invalid group by value'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
        .toInt()
    ];
  }

  /**
   * Validate comparison
   */
  static validateComparison() {
    return [
      query('districts')
        .optional()
        .isArray().withMessage('Districts must be an array')
        .custom(value => value.every(v => mongoose.Types.ObjectId.isValid(v)))
        .withMessage('Invalid district ID in array'),
      
      query('metric')
        .optional()
        .isIn(['total', 'violent', 'property', 'detection', 'conviction'])
        .withMessage('Invalid metric')
    ];
  }
}

module.exports = DashboardValidator;