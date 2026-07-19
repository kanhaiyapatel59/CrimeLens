const express = require('express');
const router = express.Router();
const NetworkController = require('../controllers/networkController');
const AuthMiddleware = require('../middlewares/auth');

router.get('/nodes',           AuthMiddleware.authenticate, NetworkController.getNodes);
router.get('/edges',           AuthMiddleware.authenticate, NetworkController.getEdges);
router.get('/graph',           AuthMiddleware.authenticate, NetworkController.getGraph);
router.get('/path',            AuthMiddleware.authenticate, NetworkController.findPath);
router.get('/communities',     AuthMiddleware.authenticate, NetworkController.getCommunities);
router.get('/statistics',      AuthMiddleware.authenticate, NetworkController.getStats);
router.get('/centrality/:id',  AuthMiddleware.authenticate, NetworkController.getCentrality);
router.get('/suspect/:id',     AuthMiddleware.authenticate, NetworkController.getSuspectNetwork);
router.get('/crime/:id',       AuthMiddleware.authenticate, NetworkController.getCrimeNetwork);

module.exports = router;
