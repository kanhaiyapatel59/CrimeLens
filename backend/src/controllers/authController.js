/**
 * Authentication Controller
 */

const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcrypt');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const TokenService = require('../services/tokenService');

class AuthController {
  /**
   * Register a new user
   */
  static async register(req, res) {
    try {
      const { firstName, lastName, email, phone, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ResponseHandler.conflict(res, 'Email already registered');
      }

      const defaultRole = await Role.findOne({ isDefault: true });
      if (!defaultRole) {
        return ResponseHandler.error(res, new Error('Default role not found'), 'Role not found');
      }

      const user = new User({
        firstName,
        lastName,
        email,
        phone,
        password,
        role: defaultRole._id,
        isVerified: true
      });

      await user.save();

      const userObject = user.toObject();
      delete userObject.password;

      return ResponseHandler.created(res, userObject, 'Registration successful');
    } catch (error) {
      logger.error('Registration error:', error);
      return ResponseHandler.error(res, error, 'Registration failed');
    }
  }

  /**
   * Login user
   */
  static async login(req, res) {
    try {
      console.log('🔑 [AuthController] JWT_SECRET from env:', process.env.JWT_SECRET ? 'Yes' : 'No');
      console.log('🔑 [AuthController] JWT_SECRET value:', process.env.JWT_SECRET);

      const { email, password } = req.body;
      console.log('🔍 Login attempt for:', email);

      // Find user
      const user = await User.findOne({ email }).select('+password').populate('role');
      
      console.log('👤 User found:', user ? 'YES' : 'NO');
      
      if (!user) {
        console.log('❌ User not found');
        return ResponseHandler.unauthorized(res, 'Invalid credentials');
      }

      console.log('📝 Stored hash:', user.password ? user.password.substring(0, 30) + '...' : 'No hash');
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      console.log('✅ Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        user.loginAttempts += 1;
        await user.save();
        console.log('❌ Invalid password attempt #', user.loginAttempts);
        return ResponseHandler.unauthorized(res, 'Invalid credentials');
      }

      // Reset login attempts
      user.loginAttempts = 0;
      user.lastLogin = new Date();
      await user.save();

      // Generate token using TokenService
      const token = TokenService.generateAccessToken({ 
        userId: user._id, 
        email: user.email,
        role: user.role
      });

      const userObject = user.toObject();
      delete userObject.password;

      console.log('✅ Login successful for:', email);
      console.log('🎫 Token generated:', token.substring(0, 30) + '...');
      
      return ResponseHandler.success(res, {
        user: userObject,
        accessToken: token,
        refreshToken: token
      }, 'Login successful');
    } catch (error) {
      console.error('💥 Login error:', error);
      return ResponseHandler.error(res, error, 'Login failed');
    }
  }

  /**
   * Logout user
   */
  static async logout(req, res) {
    try {
      return ResponseHandler.success(res, null, 'Logout successful');
    } catch (error) {
      return ResponseHandler.error(res, error, 'Logout failed');
    }
  }

  /**
   * Refresh token
   */
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return ResponseHandler.badRequest(res, 'Refresh token required');
      }

      const decoded = TokenService.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId).populate('role');
      
      if (!user) {
        return ResponseHandler.unauthorized(res, 'User not found');
      }

      const newToken = TokenService.generateAccessToken({
        userId: user._id,
        email: user.email,
        role: user.role
      });

      return ResponseHandler.success(res, { accessToken: newToken }, 'Token refreshed');
    } catch (error) {
      logger.error('Refresh token error:', error);
      return ResponseHandler.unauthorized(res, error.message || 'Invalid refresh token');
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId).populate('role');
      
      if (!user) {
        return ResponseHandler.notFound(res, 'User not found');
      }

      const userObject = user.toObject();
      delete userObject.password;

      return ResponseHandler.success(res, userObject, 'Profile fetched');
    } catch (error) {
      logger.error('Get profile error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch profile');
    }
  }

  /**
   * Change password (authenticated user)
   */
  static async changePassword(req, res) {
    try {
      const userId = req.userId;
      const { oldPassword, newPassword } = req.body;

      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        return ResponseHandler.notFound(res, 'User not found');
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      
      if (!isPasswordValid) {
        return ResponseHandler.unauthorized(res, 'Current password is incorrect');
      }

      user.password = newPassword;
      user.passwordChangedAt = new Date();
      await user.save();

      return ResponseHandler.success(res, null, 'Password changed successfully');
    } catch (error) {
      logger.error('Change password error:', error);
      return ResponseHandler.error(res, error, 'Failed to change password');
    }
  }

  /**
   * Update profile (authenticated user)
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.userId;
      const updates = req.body;
      
      // Remove sensitive fields
      delete updates.password;
      delete updates.role;
      delete updates.email;
      
      const user = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
      ).populate('role');

      if (!user) {
        return ResponseHandler.notFound(res, 'User not found');
      }

      const userObject = user.toObject();
      delete userObject.password;

      return ResponseHandler.success(res, userObject, 'Profile updated successfully');
    } catch (error) {
      logger.error('Update profile error:', error);
      return ResponseHandler.error(res, error, 'Failed to update profile');
    }
  }
}

module.exports = AuthController;