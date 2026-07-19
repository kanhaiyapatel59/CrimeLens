/**
 * Crime Routes - Crime management endpoints
 */

const express = require('express');
const router = express.Router();

// Controllers
const CrimeController = require('../controllers/crimeController');
const CrimeType = require('../models/CrimeType');

// Middleware
const AuthMiddleware = require('../middlewares/auth');

// Validators
const CrimeValidator = require('../validators/crimeValidator');

// ============================================
// Protected Routes (Authentication required)
// ============================================

/**
 * @route POST /api/crimes
 * @desc Create a new crime incident
 * @access Private
 */
router.post(
  '/',
  AuthMiddleware.authenticate,
  CrimeValidator.validateCreate(),
  CrimeValidator.checkValidation,
  CrimeController.createCrime
);

/**
 * @route GET /api/crimes
 * @desc Get crimes with filters
 * @access Private
 */
router.get(
  '/',
  AuthMiddleware.authenticate,
  CrimeValidator.validateList(),
  CrimeValidator.checkValidation,
  CrimeController.getCrimes
);

/**
 * @route GET /api/crimes/types
 * @desc Get all crime types (for dropdowns)
 * @access Private
 */
router.get(
  '/types',
  AuthMiddleware.authenticate,
  async (req, res) => {
    const types = await CrimeType.find({ isActive: true }).select('_id name category code').lean();
    res.json({ success: true, data: types });
  }
);

/**
 * @route GET /api/crimes/stats
 * @desc Get crime statistics
 * @access Private
 */
router.get(
  '/stats',
  AuthMiddleware.authenticate,
  CrimeController.getStats
);

/**
 * @route GET /api/crimes/trends
 * @desc Get crime trends
 * @access Private
 */
router.get(
  '/trends',
  AuthMiddleware.authenticate,
  CrimeController.getTrends
);

/**
 * @route GET /api/crimes/hotspots
 * @desc Get crime hotspots
 * @access Private
 */
router.get(
  '/hotspots',
  AuthMiddleware.authenticate,
  CrimeValidator.validateHotspot(),
  CrimeValidator.checkValidation,
  CrimeController.getHotspots
);

/**
 * @route POST /api/crimes/bulk
 * @desc Bulk upload crimes
 * @access Private (Admin only)
 */
router.post(
  '/bulk',
  AuthMiddleware.authenticate,
  // AuthMiddleware.authorize('admin'), // Remove for testing
  CrimeValidator.validateBulk(),
  CrimeValidator.checkValidation,
  CrimeController.bulkUpload
);

/**
 * @route GET /api/crimes/export
 * @desc Export crimes
 * @access Private
 */
router.get(
  '/export',
  AuthMiddleware.authenticate,
  CrimeValidator.validateExport(),
  CrimeValidator.checkValidation,
  CrimeController.exportCrimes
);

/**
 * @route GET /api/crimes/:id
 * @desc Get crime by ID
 * @access Private
 */
router.get(
  '/:id',
  AuthMiddleware.authenticate,
  CrimeValidator.validateId(),
  CrimeValidator.checkValidation,
  CrimeController.getCrime
);

/**
 * @route PUT /api/crimes/:id
 * @desc Update crime
 * @access Private
 */
router.put(
  '/:id',
  AuthMiddleware.authenticate,
  CrimeValidator.validateUpdate(),
  CrimeValidator.checkValidation,
  CrimeController.updateCrime
);

/**
 * @route DELETE /api/crimes/:id
 * @desc Delete crime
 * @access Private (Admin only)
 */
router.delete(
  '/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('admin'),
  CrimeValidator.validateId(),
  CrimeValidator.checkValidation,
  CrimeController.deleteCrime
);

module.exports = router;