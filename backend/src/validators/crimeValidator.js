/**
 * Crime Validator - Validation for crime-related endpoints
 */

const { body, query, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

class CrimeValidator {
  /**
   * Validate crime creation
   */
  static validateCreate() {
    return [
      body('firNumber')
        .notEmpty().withMessage('FIR number is required')
        .trim()
        .isLength({ min: 5, max: 50 }).withMessage('FIR number must be 5-50 characters'),
      
      body('incidentId')
        .notEmpty().withMessage('Incident ID is required')
        .trim()
        .isLength({ min: 5, max: 50 }).withMessage('Incident ID must be 5-50 characters'),
      
      body('crimeType')
        .notEmpty().withMessage('Crime type is required')
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid crime type ID'),
      
      body('date')
        .notEmpty().withMessage('Incident date is required')
        .isISO8601().withMessage('Invalid date format'),
      
      body('time')
        .notEmpty().withMessage('Incident time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Invalid time format (HH:MM)'),
      
      body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 10000 }).withMessage('Description must be 10-10000 characters'),
      
      body('severity')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid severity level'),
      
      body('status')
        .optional()
        .isIn(['reported', 'investigating', 'in_progress', 'resolved', 'closed', 'pending'])
        .withMessage('Invalid status')
    ];
  }

  /**
   * Validate crime update
   */
  static validateUpdate() {
    return [
      param('id')
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid crime ID'),
      
      body('firNumber')
        .optional()
        .trim()
        .isLength({ min: 5, max: 50 }).withMessage('FIR number must be 5-50 characters'),
      
      body('description')
        .optional()
        .isLength({ min: 10, max: 10000 }).withMessage('Description must be 10-10000 characters'),
      
      body('severity')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid severity level'),
      
      body('status')
        .optional()
        .isIn(['reported', 'investigating', 'in_progress', 'resolved', 'closed', 'pending'])
        .withMessage('Invalid status')
    ];
  }

  /**
   * Validate crime list filters
   */
  static validateList() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer')
        .toInt(),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
        .toInt(),
      
      query('startDate')
        .optional()
        .isISO8601().withMessage('Invalid start date format'),
      
      query('endDate')
        .optional()
        .isISO8601().withMessage('Invalid end date format'),
      
      query('crimeType')
        .optional()
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid crime type ID'),
      
      query('severity')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid severity level'),
      
      query('status')
        .optional()
        .isIn(['reported', 'investigating', 'in_progress', 'resolved', 'closed', 'pending'])
        .withMessage('Invalid status'),
      
      query('search')
        .optional()
        .trim()
        .isLength({ min: 1 }).withMessage('Search term must not be empty')
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
   * Validate bulk upload
   */
  static validateBulk() {
    return [
      body('crimes')
        .notEmpty().withMessage('Crimes array is required')
        .isArray({ min: 1 }).withMessage('Must have at least one crime')
    ];
  }

  /**
   * Validate export format
   */
  static validateExport() {
    return [
      query('format')
        .optional()
        .isIn(['csv', 'excel', 'json'])
        .withMessage('Invalid export format'),
      
      query('startDate')
        .optional()
        .isISO8601().withMessage('Invalid start date format'),
      
      query('endDate')
        .optional()
        .isISO8601().withMessage('Invalid end date format')
    ];
  }

  /**
   * Validate hotspot parameters
   */
  static validateHotspot() {
    return [
      query('district')
        .optional()
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid district ID'),
      
      query('days')
        .optional()
        .isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
        .toInt(),
      
      query('radius')
        .optional()
        .isInt({ min: 1, max: 50000 }).withMessage('Radius must be between 1 and 50000 meters')
        .toInt()
    ];
  }

  /**
   * Check validation results
   */
  static checkValidation(req, res, next) {
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

module.exports = CrimeValidator;