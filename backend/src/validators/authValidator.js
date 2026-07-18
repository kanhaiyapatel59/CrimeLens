/**
 * Authentication Validators - Request validation for auth endpoints
 * Enterprise: Input validation, sanitization, security
 */

const { body, validationResult } = require('express-validator');

class AuthValidator {
  /**
   * Validate registration
   */
  static validateRegister() {
    return [
      body('firstName')
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
        .trim()
        .escape(),
      
      body('lastName')
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
        .trim()
        .escape(),
      
      body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail()
        .trim(),
      
      body('phone')
        .optional()
        .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
      
      body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character'),
      
      body('confirmPassword')
        .notEmpty().withMessage('Confirm password is required')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match')
    ];
  }

  /**
   * Validate login
   */
  static validateLogin() {
    return [
      body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail()
        .trim(),
      
      body('password')
        .notEmpty().withMessage('Password is required')
    ];
  }

  /**
   * Validate password reset request
   */
  static validatePasswordResetRequest() {
    return [
      body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail()
        .trim()
    ];
  }

  /**
   * Validate password reset
   */
  static validatePasswordReset() {
    return [
      body('token')
        .notEmpty().withMessage('Token is required')
        .isLength({ min: 32 }).withMessage('Invalid token format'),
      
      body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character'),
      
      body('confirmPassword')
        .notEmpty().withMessage('Confirm password is required')
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage('Passwords do not match')
    ];
  }

  /**
   * Validate change password
   */
  static validateChangePassword() {
    return [
      body('oldPassword')
        .notEmpty().withMessage('Current password is required'),
      
      body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character'),
      
      body('confirmPassword')
        .notEmpty().withMessage('Confirm password is required')
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage('Passwords do not match')
    ];
  }

  /**
   * Validate verification
   */
  static validateVerification() {
    return [
      body('token')
        .notEmpty().withMessage('Verification token is required')
        .isLength({ min: 32 }).withMessage('Invalid token format')
    ];
  }

  /**
   * Validate refresh token
   */
  static validateRefreshToken() {
    return [
      body('refreshToken')
        .notEmpty().withMessage('Refresh token is required')
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

module.exports = AuthValidator;