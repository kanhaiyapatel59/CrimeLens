/**
 * Authentication Controller (handlers)
 *
 * This file exports handler functions used by backend/src/routes/authRoutes.js.
 * It intentionally contains NO Express router; only functions.
 */

const AuthService = require('../services/authService');
const ResponseHandler = require('../utils/responseHandler');

const AuthController = {
  register: async (req, res) => {
    try {
      const { user } = await AuthService.register(req.body);
      return ResponseHandler.created(res, user, 'Registration successful');
    } catch (err) {
      return ResponseHandler.error(res, err, err.message || 'Registration failed', 400);
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'] || '';

      const result = await AuthService.login(email, password, ip, userAgent);
      return ResponseHandler.success(res, result, 'Login successful');
    } catch (err) {
      return ResponseHandler.unauthorized(res, err.message || 'Invalid credentials');
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      return ResponseHandler.success(res, result, 'Token refreshed successfully');
    } catch (err) {
      return ResponseHandler.unauthorized(res, err.message || 'Invalid refresh token');
    }
  },

  logout: async (req, res) => {
    try {
      // Middleware attaches req.userId
      const userId = req.userId;
      const token = req.headers.authorization?.split(' ')[1];

      const result = await AuthService.logout(userId, token);
      return ResponseHandler.success(res, result, 'Logged out successfully');
    } catch (err) {
      return ResponseHandler.error(res, err, err.message || 'Logout failed', 400);
    }
  },

  getProfile: async (req, res) => {
    try {
      // Minimal profile response; extend if you attach full user in middleware
      const user = req.user;
      return ResponseHandler.success(res, user, 'Profile fetched successfully');
    } catch (err) {
      return ResponseHandler.error(res, err, err.message || 'Failed to fetch profile', 400);
    }
  },

  // Optional endpoints referenced elsewhere in the codebase
  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.userId;
      const result = await AuthService.changePassword(userId, oldPassword, newPassword);
      return ResponseHandler.success(res, result, 'Password changed successfully');
    } catch (err) {
      return ResponseHandler.error(res, err, err.message || 'Failed to change password', 400);
    }
  },

  updateProfile: async (req, res) => {
    // Not implemented in current service; keep stub to prevent server crash if wired.
    return ResponseHandler.badRequest(res, 'Not implemented');
  },

  getUserLogs: async (req, res) => {
    return ResponseHandler.badRequest(res, 'Not implemented');
  },

  verifyEmail: async (req, res) => {
    try {
      const { token } = req.body;
      const result = await AuthService.verifyEmail(token);
      return ResponseHandler.success(res, result, 'Email verified successfully');
    } catch (err) {
      return ResponseHandler.error(res, err, err.message || 'Verification failed', 400);
    }
  },

  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;
      const result = await AuthService.requestPasswordReset(email);
      return ResponseHandler.success(res, result, 'Password reset requested');
    } catch (err) {
      return ResponseHandler.error(res, err, err.message || 'Request failed', 400);
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      const result = await AuthService.resetPassword(token, newPassword);
      return ResponseHandler.success(res, result, 'Password reset successfully');
    } catch (err) {
      return ResponseHandler.error(res, err, err.message || 'Reset failed', 400);
    }
  },
};

module.exports = AuthController;

