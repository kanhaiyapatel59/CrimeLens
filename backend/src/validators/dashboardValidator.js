/**
 * Dashboard Validator
 */

const { query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

class DashboardValidator {
  static validateFilters() {
    return [
      query('district').optional().custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid district ID'),
      query('policeStation').optional().custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid police station ID'),
      query('startDate').optional().custom((value) => {
        if (!value) return true;
        if (isNaN(new Date(value).getTime())) throw new Error('Invalid start date format');
        return true;
      }),
      query('endDate').optional().custom((value) => {
        if (!value) return true;
        if (isNaN(new Date(value).getTime())) throw new Error('Invalid end date format');
        return true;
      }),
      query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365').toInt(),
    ];
  }

  static validateChart() {
    return [
      query('type').optional().isIn(['bar', 'line', 'pie', 'doughnut', 'radar']).withMessage('Invalid chart type'),
      query('groupBy').optional().isIn(['crimeType', 'district', 'severity', 'status', 'day', 'week', 'month']).withMessage('Invalid group by value'),
      query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500').toInt(),
    ];
  }

  static validateComparison() {
    return [
      query('districts').optional().isArray().withMessage('Districts must be an array'),
      query('metric').optional().isIn(['total', 'violent', 'property', 'detection', 'conviction']).withMessage('Invalid metric'),
    ];
  }

  static checkValidation(req, res, next) {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    return res.status(422).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
}

module.exports = DashboardValidator;
