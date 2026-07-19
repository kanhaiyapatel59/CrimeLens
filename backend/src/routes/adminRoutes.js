const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const AuthMiddleware = require('../middlewares/auth');
const AuthValidator = require('../validators/authValidator');

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  AuthValidator.validateRegister(),
  AuthValidator.checkValidation,
  AuthController.register
);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  AuthValidator.validateLogin(),
  AuthValidator.checkValidation,
  AuthController.login
);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh-token',
  AuthValidator.validateRefreshToken(),
  AuthValidator.checkValidation,
  AuthController.refreshToken
);

/**
 * @route POST /api/auth/verify-email
 * @desc Verify email
 * @access Public
 */
router.post(
  '/verify-email',
  AuthValidator.validateVerification(),
  AuthValidator.checkValidation,
  AuthController.verifyEmail
);

/**
 * @route POST /api/auth/request-password-reset
 * @desc Request password reset
 * @access Public
 */
router.post(
  '/request-password-reset',
  AuthValidator.validatePasswordResetRequest(),
  AuthValidator.checkValidation,
  AuthController.requestPasswordReset
);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password
 * @access Public
 */
router.post(
  '/reset-password',
  AuthValidator.validatePasswordReset(),
  AuthValidator.checkValidation,
  AuthController.resetPassword
);

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post(
  '/logout',
  AuthMiddleware.authenticate,
  AuthController.logout
);

/**
 * @route POST /api/auth/change-password
 * @desc Change password
 * @access Private
 */
router.post(
  '/change-password',
  AuthMiddleware.authenticate,
  AuthValidator.validateChangePassword(),
  AuthValidator.checkValidation,
  AuthController.changePassword
);

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get(
  '/profile',
  AuthMiddleware.authenticate,
  AuthController.getProfile
);

/**
 * @route PUT /api/auth/profile
 * @desc Update current user profile
 * @access Private
 */
router.put(
  '/profile',
  AuthMiddleware.authenticate,
  AuthController.updateProfile
);

/**
 * @route GET /api/auth/logs
 * @desc Get user audit logs
 * @access Private
 */
router.get(
  '/logs',
  AuthMiddleware.authenticate,
  AuthController.getUserLogs
);

module.exports = router;