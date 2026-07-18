const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middlewares/auth');

// Placeholder routes - will be implemented fully later
router.get('/graph', AuthMiddleware.authenticate, (req, res) => {
  res.json({ message: 'Network graph endpoint' });
});

router.get('/stats', AuthMiddleware.authenticate, (req, res) => {
  res.json({ message: 'Network stats endpoint' });
});

module.exports = router;