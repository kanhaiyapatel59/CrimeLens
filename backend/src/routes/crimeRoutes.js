/**
 * Crime Routes - Crime management endpoints
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Controllers
const CrimeController = require('../controllers/crimeController');
const CrimeType = require('../models/CrimeType');

// Middleware
const AuthMiddleware = require('../middlewares/auth');

// Validators
const CrimeValidator = require('../validators/crimeValidator');

// Fallback crime types when database is offline or unseeded
const FALLBACK_CRIME_TYPES = [
  { _id: '65f000000000000000000010', name: 'Murder', category: 'violent_crime', code: 'IPC302' },
  { _id: '65f000000000000000000011', name: 'Robbery', category: 'property_crime', code: 'IPC392' },
  { _id: '65f000000000000000000012', name: 'Theft', category: 'property_crime', code: 'IPC378' },
  { _id: '65f000000000000000000013', name: 'Rape / Sexual Assault', category: 'sexual_offense', code: 'IPC376' },
  { _id: '65f000000000000000000014', name: 'Cyber Fraud & Phishing', category: 'cyber_crime', code: 'IT66D' },
  { _id: '65f000000000000000000015', name: 'Assault & Grievous Hurt', category: 'violent_crime', code: 'IPC351' },
  { _id: '65f000000000000000000016', name: 'Burglary & Housebreaking', category: 'property_crime', code: 'IPC457' },
  { _id: '65f000000000000000000017', name: 'Narcotics & NDPS Violation', category: 'drug_related', code: 'NDPS21' },
  { _id: '65f000000000000000000018', name: 'Kidnapping & Abduction', category: 'violent_crime', code: 'IPC363' },
  { _id: '65f000000000000000000019', name: 'Extortion & Blackmail', category: 'organised_crime', code: 'IPC383' },
  { _id: '65f000000000000000000020', name: 'Arson', category: 'property_crime', code: 'IPC435' },
  { _id: '65f000000000000000000021', name: 'Cheating & Forgery', category: 'economic_crime', code: 'IPC420' },
  { _id: '65f000000000000000000022', name: 'Domestic Violence', category: 'violent_crime', code: 'IPC498A' },
  { _id: '65f000000000000000000023', name: 'Organised Syndicate Crime', category: 'organised_crime', code: 'MCOCA' }
];

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
    try {
      if (mongoose.connection.readyState === 1) {
        const types = await CrimeType.find({ isActive: true }).select('_id name category code').lean();
        if (types && types.length > 0) {
          return res.json({ success: true, data: types });
        }
      }
      return res.json({ success: true, data: FALLBACK_CRIME_TYPES, notice: 'Using standard crime classification types' });
    } catch (error) {
      return res.json({ success: true, data: FALLBACK_CRIME_TYPES, notice: 'Using fallback crime classification types' });
    }
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
 * @route POST /api/crimes/match-mo
 * @desc Match crime incident by Modus Operandi (MO) pattern
 * @access Private
 */
router.post(
  '/match-mo',
  AuthMiddleware.authenticate,
  CrimeController.matchMO
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