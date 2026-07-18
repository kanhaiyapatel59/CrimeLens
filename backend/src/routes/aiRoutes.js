const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middlewares/auth');

// Placeholder routes - will be implemented fully later
router.get('/status', AuthMiddleware.authenticate, (req, res) => {
  res.json({ message: 'AI status endpoint' });
});

router.get('/insights', AuthMiddleware.authenticate, (req, res) => {
  res.json({ message: 'AI insights endpoint' });
});

module.exports = router;