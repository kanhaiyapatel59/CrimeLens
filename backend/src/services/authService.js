/**
 * Authentication Service - Business logic for authentication
 * Enterprise: Separation of concerns, reusable business logic
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const TokenService = require('./tokenService');
const EmailService = require('./emailService');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register a new user
   */
  static async register(userData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if email already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Get default role
      const defaultRole = await Role.findOne({ isDefault: true, isActive: true });
      if (!defaultRole) {
        throw new Error('Default role not found. Please run database seeders.');
      }

      // Create user
      const user = new User({
        ...userData,
        role: defaultRole._id
      });

      await user.save({ session });

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
      user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      
      await user.save({ session });

      // Log registration
      const auditLog = new AuditLog({
        action: 'User Registration',
        description: `User ${user.email} registered`,
        user: user._id,
        userEmail: user.email,
        module: 'auth',
        actionType: 'create',
        resource: {
          model: 'User',
          id: user._id,
          name: user.email
        },
        status: 'success'
      });
      await auditLog.save({ session });

      await session.commitTransaction();
      session.endSession();

      // Send verification email
      try {
        await EmailService.sendVerificationEmail(user.email, verificationToken);
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }

      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;
      delete userObject.verificationToken;
      delete userObject.verificationTokenExpires;

      return {
        user: userObject,
        message: 'Registration successful. Please verify your email.'
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(email, password, ip, userAgent) {
    try {
      // Find user with password
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user is locked
      if (user.isLocked && user.lockedUntil > Date.now()) {
        throw new Error('Account locked. Please try again later.');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account deactivated. Contact administrator.');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        user.loginAttempts += 1;
        
        if (user.loginAttempts >= 5) {
          user.isLocked = true;
          user.lockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
        }
        
        await user.save();
        throw new Error('Invalid credentials');
      }

      // Reset login attempts on success
      user.loginAttempts = 0;
      user.isLocked = false;
      user.lockedUntil = null;
      user.lastLogin = new Date();

      // Update devices
      if (ip && userAgent) {
        const device = user.devices.find(d => d.deviceId === ip);
        if (device) {
          device.lastActive = new Date();
        } else {
          user.devices.push({
            deviceId: ip,
            deviceType: userAgent.includes('Mobile') ? 'mobile' : 'desktop',
            lastActive: new Date(),
            ip,
            userAgent
          });
        }
      }

      // Generate tokens
      const accessToken = TokenService.generateAccessToken({
        userId: user._id,
        email: user.email,
        role: user.role
      });

      const refreshToken = TokenService.generateRefreshToken({
        userId: user._id,
        email: user.email
      });

      // Store refresh token
      user.currentSessionId = refreshToken;
      await user.save();

      // Log login
      const auditLog = new AuditLog({
        action: 'User Login',
        description: `User ${user.email} logged in`,
        user: user._id,
        userEmail: user.email,
        module: 'auth',
        actionType: 'login',
        resource: {
          model: 'User',
          id: user._id,
          name: user.email
        },
        status: 'success',
        security: {
          ipAddress: ip,
          deviceType: userAgent
        }
      });
      await auditLog.save();

      // Return user without sensitive data
      const userObject = user.toObject();
      delete userObject.password;
      delete userObject.verificationToken;
      delete userObject.verificationTokenExpires;

      return {
        user: userObject,
        accessToken,
        refreshToken
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout(userId, token) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Clear session
      user.currentSessionId = null;
      await user.save();

      // Log logout
      const auditLog = new AuditLog({
        action: 'User Logout',
        description: `User ${user.email} logged out`,
        user: user._id,
        userEmail: user.email,
        module: 'auth',
        actionType: 'logout',
        resource: {
          model: 'User',
          id: user._id,
          name: user.email
        },
        status: 'success'
      });
      await auditLog.save();

      return { message: 'Logged out successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken) {
    try {
      const decoded = TokenService.verifyRefreshToken(refreshToken);
      
      if (!decoded) {
        throw new Error('Invalid refresh token');
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.currentSessionId !== refreshToken) {
        throw new Error('Invalid session');
      }

      // Generate new access token
      const newAccessToken = TokenService.generateAccessToken({
        userId: user._id,
        email: user.email,
        role: user.role
      });

      return { accessToken: newAccessToken };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      
      await user.save();

      // Send password reset email
      await EmailService.sendPasswordResetEmail(email, resetToken);

      return { 
        message: 'Password reset link sent to your email',
        token: resetToken // Only for testing
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(token, newPassword) {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordChangedAt = new Date();

      await user.save();

      // Log password reset
      const auditLog = new AuditLog({
        action: 'Password Reset',
        description: `User ${user.email} reset their password`,
        user: user._id,
        userEmail: user.email,
        module: 'auth',
        actionType: 'update',
        resource: {
          model: 'User',
          id: user._id,
          name: user.email
        },
        status: 'success'
      });
      await auditLog.save();

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(token) {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await User.findOne({
        verificationToken: hashedToken,
        verificationTokenExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;

      await user.save();

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new Error('User not found');
      }

      const isPasswordValid = await user.comparePassword(oldPassword);
      
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      user.password = newPassword;
      user.passwordChangedAt = new Date();
      await user.save();

      // Log password change
      const auditLog = new AuditLog({
        action: 'Password Change',
        description: `User ${user.email} changed their password`,
        user: user._id,
        userEmail: user.email,
        module: 'auth',
        actionType: 'update',
        resource: {
          model: 'User',
          id: user._id,
          name: user.email
        },
        status: 'success'
      });
      await auditLog.save();

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;
