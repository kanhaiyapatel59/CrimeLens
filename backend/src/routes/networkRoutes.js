/**
 * Network Routes - Criminal network analysis endpoints
 */

const express = require('express');
const router = express.Router();

// Controllers
const NetworkController = require('../controllers/networkController');

// Middleware
const AuthMiddleware = require('../middlewares/auth');

// Validators
const NetworkValidator = require('../validators/networkValidator');

// ============================================
// Protected Routes (Authentication required)
// ============================================

/**
 * @route GET /api/network/nodes
 * @desc Get network nodes
 * @access Private
 */
router.get(
  '/nodes',
  AuthMiddleware.authenticate,
  NetworkValidator.validateFilters(),
  NetworkValidator.checkValidation,
  NetworkController.getNodes
);

/**
 * @route GET /api/network/edges
 * @desc Get network edges
 * @access Private
 */
router.get(
  '/edges',
  AuthMiddleware.authenticate,
  NetworkValidator.validateFilters(),
  NetworkValidator.checkValidation,
  NetworkController.getEdges
);

/**
 * @route GET /api/network/graph
 * @desc Get full graph data
 * @access Private
 */
router.get(
  '/graph',
  AuthMiddleware.authenticate,
  NetworkValidator.validateFilters(),
  NetworkValidator.checkValidation,
  NetworkController.getGraph
);

/**
 * @route GET /api/network/path
 * @desc Find path between nodes
 * @access Private
 */
router.get(
  '/path',
  AuthMiddleware.authenticate,
  NetworkValidator.validatePath(),
  NetworkValidator.checkValidation,
  NetworkController.findPath
);

/**
 * @route GET /api/network/centrality/:id
 * @desc Get node centrality
 * @access Private
 */
router.get(
  '/centrality/:id',
  AuthMiddleware.authenticate,
  NetworkValidator.validateId(),
  NetworkValidator.checkValidation,
  NetworkController.getCentrality
);

/**
 * @route GET /api/network/communities
 * @desc Detect communities
 * @access Private
 */
router.get(
  '/communities',
  AuthMiddleware.authenticate,
  NetworkValidator.validateCommunities(),
  NetworkValidator.checkValidation,
  NetworkController.getCommunities
);

/**
 * @route GET /api/network/suspect/:id
 * @desc Get suspect's network
 * @access Private
 */
router.get(
  '/suspect/:id',
  AuthMiddleware.authenticate,
  NetworkValidator.validateId(),
  NetworkValidator.checkValidation,
  NetworkController.getSuspectNetwork
);

/**
 * @route GET /api/network/crime/:id
 * @desc Get crime network
 * @access Private
 */
router.get(
  '/crime/:id',
  AuthMiddleware.authenticate,
  NetworkValidator.validateId(),
  NetworkValidator.checkValidation,
  NetworkController.getCrimeNetwork
);

/**
 * @route GET /api/network/statistics
 * @desc Get network statistics
 * @access Private
 */
router.get(
  '/statistics',
  AuthMiddleware.authenticate,
  NetworkController.getStats
);

module.exports = router;