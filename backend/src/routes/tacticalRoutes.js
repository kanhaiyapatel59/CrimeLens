/**
 * Tactical Intelligence Routes
 */

const express = require('express');
const router = express.Router();
const TacticalController = require('../controllers/tacticalController');
const AuthMiddleware = require('../middlewares/auth');

// All tactical routes protected by authentication
router.use(AuthMiddleware.authenticate);

// 1. M.O. Pattern Clusters & Linkage
router.get('/mo-patterns', TacticalController.getMoPatterns);
router.get('/mo-linkage', TacticalController.matchMoLinkage);
router.post('/mo-linkage', TacticalController.matchMoLinkage);

// 2. Predictive Patrol Routing
router.get('/patrol-routes', TacticalController.getPatrolRoute);
router.post('/patrol-routes', TacticalController.getPatrolRoute);

// 3. Biometrics & Facial / Sketch Desk
router.get('/biometrics', TacticalController.getBiometrics);

// 4. CDR & Tower Dump Co-Location
router.get('/cdr-analysis', TacticalController.getCdrAnalysis);

// 5. Tactical BOLO Desk
router.get('/bolo', TacticalController.getBoloAlerts);

// 6. Cryptographic Evidence Locker
router.get('/evidence-locker', TacticalController.getEvidenceLocker);
router.post('/evidence-locker/verify', TacticalController.verifyHash);

module.exports = router;
