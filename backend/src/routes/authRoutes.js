const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const AuthMiddleware = require('../middlewares/auth');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

// Protected routes
router.post('/logout', AuthMiddleware.authenticate, AuthController.logout);
router.get('/profile', AuthMiddleware.authenticate, AuthController.getProfile);
router.post('/change-password', AuthMiddleware.authenticate, AuthController.changePassword);
router.put('/profile', AuthMiddleware.authenticate, AuthController.updateProfile);

module.exports = router;