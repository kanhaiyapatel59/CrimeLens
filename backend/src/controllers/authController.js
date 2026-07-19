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
      const { 
        firstName, lastName, email, phone, password, 
        policeId, policeIdDocument, department, role 
      } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ 
        $or: [{ email }] 
      });
      
      if (existingUser) {
        return ResponseHandler.conflict(res, 'Email already registered');
      }

      // Get role
      let userRole;
      if (role) {
        userRole = await Role.findOne({ name: role });
      } else {
        userRole = await Role.findOne({ isDefault: true });
      }
      
      if (!userRole) {
        return ResponseHandler.error(res, new Error('Default role not found'), 'Role not found');
      }

      // ✅ Build user object with optional fields
      const userData = {
        firstName,
        lastName,
        email,
        phone,
        password,
        role: userRole._id,
        isVerified: true,
      };

      // ✅ Only add police fields if provided (skip for admin)
      if (policeId && role !== 'admin') {
        userData.policeId = policeId.toUpperCase();
        userData.policeIdDocument = policeIdDocument || 'pending_verification';
        userData.verificationStatus = 'pending';
      } else {
        userData.verificationStatus = 'not_required';
        userData.policeId = `USER${Date.now().toString().slice(-6)}`;
        userData.policeIdDocument = 'auto_verified';
      }

      if (department) {
        userData.department = department;
      }

      const user = new User(userData);
      await user.save();

      const userObject = user.toObject();
      delete userObject.password;

      const message = (policeId && role !== 'admin') 
        ? 'Registration successful. Awaiting admin verification.' 
        : 'Registration successful.';

      return ResponseHandler.created(res, userObject, message);
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

      const { email, password } = req.body;
      console.log('🔍 Login attempt for:', email);

      // Find user
      const user = await User.findOne({ email }).select('+password').populate('role');
      
      console.log('👤 User found:', user ? 'YES' : 'NO');
      
      if (!user) {
        console.log('❌ User not found');
        return ResponseHandler.unauthorized(res, 'Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        return ResponseHandler.unauthorized(res, 'Account deactivated. Contact administrator.');
      }

      // Check verification status
      if (user.verificationStatus === 'pending') {
        return ResponseHandler.unauthorized(res, 'Account pending verification. Please wait for admin approval.');
      }

      if (user.verificationStatus === 'rejected') {
        return ResponseHandler.unauthorized(res, 'Account verification rejected. Contact administrator.');
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

      // Generate separate tokens
      const accessToken = TokenService.generateAccessToken({ 
        userId: user._id, 
        email: user.email,
        role: user.role
      });

      const refreshToken = TokenService.generateRefreshToken({ 
        userId: user._id, 
        email: user.email
      });

      const userObject = user.toObject();
      delete userObject.password;

      console.log('✅ Login successful for:', email);
      
      return ResponseHandler.success(res, {
        user: userObject,
        accessToken: accessToken,
        refreshToken: refreshToken
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

      console.log('🔑 [AuthController] Refreshing token...');

      const decoded = TokenService.verifyRefreshToken(refreshToken);
      
      if (!decoded) {
        return ResponseHandler.unauthorized(res, 'Invalid refresh token');
      }

      const user = await User.findById(decoded.userId).populate('role');
      
      if (!user) {
        return ResponseHandler.unauthorized(res, 'User not found');
      }

      const newAccessToken = TokenService.generateAccessToken({
        userId: user._id,
        email: user.email,
        role: user.role
      });

      console.log('✅ [AuthController] Token refreshed for:', user.email);

      return ResponseHandler.success(res, { 
        accessToken: newAccessToken 
      }, 'Token refreshed successfully');
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
      delete updates.policeId;
      delete updates.verificationStatus;
      
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

  /**
   * Get user logs (placeholder)
   */
  static async getUserLogs(req, res) {
    try {
      return ResponseHandler.success(res, { logs: [] }, 'Logs fetched successfully');
    } catch (error) {
      return ResponseHandler.error(res, error, 'Failed to fetch logs');
    }
  }

  /**
   * Verify email (placeholder)
   */
  static async verifyEmail(req, res) {
    try {
      return ResponseHandler.success(res, null, 'Email verified successfully');
    } catch (error) {
      return ResponseHandler.error(res, error, 'Email verification failed');
    }
  }

  /**
   * Request password reset (placeholder)
   */
  static async requestPasswordReset(req, res) {
    try {
      return ResponseHandler.success(res, null, 'Password reset link sent');
    } catch (error) {
      return ResponseHandler.error(res, error, 'Failed to send reset link');
    }
  }

  /**
   * Reset password (placeholder)
   */
  static async resetPassword(req, res) {
    try {
      return ResponseHandler.success(res, null, 'Password reset successfully');
    } catch (error) {
      return ResponseHandler.error(res, error, 'Password reset failed');
    }
  }
}

module.exports = AuthController;