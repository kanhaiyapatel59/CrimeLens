/**
 * AI Routes - AI/ML endpoints
 */

const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const AuthMiddleware = require('../middlewares/auth');

// Protected routes
router.post('/chat', AuthMiddleware.authenticate, AIController.chat);
router.post('/analyze', AuthMiddleware.authenticate, AIController.analyzePatterns);
router.post('/predict-hotspots', AuthMiddleware.authenticate, AIController.predictHotspots);
router.post('/analyze-network', AuthMiddleware.authenticate, AIController.analyzeNetwork);
router.post('/generate-report', AuthMiddleware.authenticate, AIController.generateReport);
router.post('/query', AuthMiddleware.authenticate, AIController.query);

module.exports = router;