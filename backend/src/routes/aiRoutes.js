/**
 * AI Routes - AI/ML endpoints
 */

const express = require('express');
const router = express.Router();

// Controllers
const AIController = require('../controllers/aiController');

// Middleware
const AuthMiddleware = require('../middlewares/auth');

// Validators
const AIValidator = require('../validators/aiValidator');

// ============================================
// Protected Routes (Authentication required)
// ============================================

/**
 * @route GET /api/ai/health
 * @desc AI service health check
 * @access Private
 */
router.get(
  '/health',
  AuthMiddleware.authenticate,
  AIController.healthCheck
);

/**
 * @route GET /api/ai/status
 * @desc Get training status
 * @access Private
 */
router.get(
  '/status',
  AuthMiddleware.authenticate,
  AIController.getTrainingStatus
);

/**
 * @route GET /api/ai/insights
 * @desc Get AI insights for dashboard
 * @access Private
 */
router.get(
  '/insights',
  AuthMiddleware.authenticate,
  AIController.getInsights
);

/**
 * @route POST /api/ai/predict/crime
 * @desc Predict crime hotspots
 * @access Private
 */
router.post(
  '/predict/crime',
  AuthMiddleware.authenticate,
  AIValidator.validatePredictCrime(),
  AIValidator.checkValidation,
  AIController.predictCrime
);

/**
 * @route POST /api/ai/predict/risk
 * @desc Predict risk scores
 * @access Private
 */
router.post(
  '/predict/risk',
  AuthMiddleware.authenticate,
  AIValidator.validatePredictRisk(),
  AIValidator.checkValidation,
  AIController.predictRisk
);

/**
 * @route POST /api/ai/detect/anomalies
 * @desc Detect anomalies
 * @access Private
 */
router.post(
  '/detect/anomalies',
  AuthMiddleware.authenticate,
  AIValidator.validateDetectAnomalies(),
  AIValidator.checkValidation,
  AIController.detectAnomalies
);

/**
 * @route POST /api/ai/detect/mo
 * @desc Detect Modus Operandi patterns
 * @access Private
 */
router.post(
  '/detect/mo',
  AuthMiddleware.authenticate,
  AIValidator.validateDetectMO(),
  AIValidator.checkValidation,
  AIController.detectMO
);

/**
 * @route POST /api/ai/train
 * @desc Train AI models
 * @access Private (Admin only)
 */
router.post(
  '/train',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('admin'),
  AIValidator.validateTrain(),
  AIValidator.checkValidation,
  AIController.trainModels
);

/**
 * @route GET /api/ai/trends
 * @desc Analyze crime trends
 * @access Private
 */
router.get(
  '/trends',
  AuthMiddleware.authenticate,
  AIValidator.validateTrends(),
  AIValidator.checkValidation,
  AIController.analyzeTrends
);

/**
 * @route GET /api/ai/hotspots
 * @desc Get crime hotspots
 * @access Private
 */
router.get(
  '/hotspots',
  AuthMiddleware.authenticate,
  AIValidator.validateHotspots(),
  AIValidator.checkValidation,
  AIController.getHotspots
);

module.exports = router;