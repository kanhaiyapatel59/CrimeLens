const express = require('express');
const router = express.Router();
const CorrelationController = require('../controllers/correlationController');
const AuthMiddleware = require('../middlewares/auth');

// ✅ Get correlation matrix for all districts
router.get(
  '/matrix',
  AuthMiddleware.authenticate,
  CorrelationController.getCorrelationMatrix
);

// ✅ Get correlation for a specific district
router.get(
  '/district/:districtId',
  AuthMiddleware.authenticate,
  CorrelationController.getDistrictCorrelation
);

// ✅ Seed economic data (Admin only)
router.post(
  '/seed',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('admin'),
  CorrelationController.seedEconomicData
);

module.exports = router;