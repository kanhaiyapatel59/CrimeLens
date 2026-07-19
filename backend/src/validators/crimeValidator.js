/**
 * Crime Validator
 */

const { body, query, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

class CrimeValidator {
  static validateCreate() {
    return [
      body('firNumber').notEmpty().withMessage('FIR number is required').trim(),
      body('incidentId').notEmpty().withMessage('Incident ID is required').trim(),
      body('crimeType')
        .notEmpty().withMessage('Crime type is required')
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid crime type ID'),
      body('date').notEmpty().withMessage('Incident date is required').isISO8601().withMessage('Invalid date format'),
      body('time').notEmpty().withMessage('Incident time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
      body('description').notEmpty().withMessage('Description is required')
        .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
      body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
      body('status').optional().isIn(['reported', 'investigating', 'in_progress', 'resolved', 'closed', 'pending']).withMessage('Invalid status'),
    ];
  }

  static validateUpdate() {
    return [
      param('id').custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid crime ID'),
      body('firNumber').optional().trim(),
      body('description').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
      body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
      body('status').optional().isIn(['reported', 'investigating', 'in_progress', 'resolved', 'closed', 'pending']).withMessage('Invalid status'),
    ];
  }

  static validateList() {
    return [
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
      query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000').toInt(),
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
      query('crimeType').optional().custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid crime type ID'),
      query('district').optional().custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid district ID'),
      query('policeStation').optional().custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid police station ID'),
      query('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
      query('status').optional().isIn(['reported', 'investigating', 'in_progress', 'resolved', 'closed', 'pending']).withMessage('Invalid status'),
      query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term must not be empty'),
    ];
  }

  static validateId() {
    return [
      param('id').custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid ID'),
    ];
  }

  static validateBulk() {
    return [
      body('crimes').optional().isArray().withMessage('Crimes must be an array'),
    ];
  }

  static validateExport() {
    return [
      query('format').optional().isIn(['csv', 'excel', 'json']).withMessage('Invalid export format'),
      query('startDate').optional().custom((value) => {
        if (!value) return true;
        if (isNaN(new Date(value).getTime())) throw new Error('Invalid date format');
        return true;
      }),
      query('endDate').optional().custom((value) => {
        if (!value) return true;
        if (isNaN(new Date(value).getTime())) throw new Error('Invalid date format');
        return true;
      }),
    ];
  }

  static validateHotspot() {
    return [
      query('district').optional().custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid district ID'),
      query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365').toInt(),
      query('radius').optional().isInt({ min: 1, max: 50000 }).withMessage('Radius must be between 1 and 50000 meters').toInt(),
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

module.exports = CrimeValidator;
