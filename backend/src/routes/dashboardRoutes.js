/**
 * Dashboard Routes - Analytics and visualization endpoints
 */

const express = require('express');
const router = express.Router();

// Controllers
const DashboardController = require('../controllers/dashboardController');

// Middleware
const AuthMiddleware = require('../middlewares/auth');

// Validators
const DashboardValidator = require('../validators/dashboardValidator');

// ============================================
// Protected Routes (Authentication required)
// ============================================

/**
 * @route GET /api/dashboard/kpis
 * @desc Get Key Performance Indicators
 * @access Private
 */
router.get(
  '/kpis',
  AuthMiddleware.authenticate,
  DashboardValidator.validateFilters(),
  DashboardValidator.checkValidation,
  DashboardController.getKPIs
);

/**
 * @route GET /api/dashboard/charts
 * @desc Get chart data
 * @access Private
 */
router.get(
  '/charts',
  AuthMiddleware.authenticate,
  DashboardValidator.validateFilters(),
  DashboardValidator.validateChart(),
  DashboardValidator.checkValidation,
  DashboardController.getChartData
);

/**
 * @route GET /api/dashboard/overview
 * @desc Get overview summary
 * @access Private
 */
router.get(
  '/overview',
  AuthMiddleware.authenticate,
  DashboardValidator.validateFilters(),
  DashboardValidator.checkValidation,
  DashboardController.getOverview
);

/**
 * @route GET /api/dashboard/districts
 * @desc Get district comparison
 * @access Private
 */
router.get(
  '/districts',
  AuthMiddleware.authenticate,
  DashboardValidator.validateComparison(),
  DashboardValidator.checkValidation,
  DashboardController.getDistrictComparison
);

/**
 * @route GET /api/dashboard/heatmap
 * @desc Get heatmap data
 * @access Private
 */
router.get(
  '/heatmap',
  AuthMiddleware.authenticate,
  DashboardValidator.validateFilters(),
  DashboardValidator.checkValidation,
  DashboardController.getHeatmap
);

/**
 * @route GET /api/dashboard/alerts
 * @desc Get recent alerts
 * @access Private
 */
router.get(
  '/alerts',
  AuthMiddleware.authenticate,
  DashboardValidator.validateFilters(),
  DashboardValidator.checkValidation,
  DashboardController.getAlerts
);

/**
 * @route GET /api/dashboard/timeline
 * @desc Get timeline data
 * @access Private
 */
router.get(
  '/timeline',
  AuthMiddleware.authenticate,
  DashboardValidator.validateFilters(),
  DashboardValidator.checkValidation,
  DashboardController.getTimeline
);

module.exports = router;