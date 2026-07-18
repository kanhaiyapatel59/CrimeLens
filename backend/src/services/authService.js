/**
 * Authentication Service - Business logic for authentication
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register a new user
   */
  static async register(userData) {
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
        role: defaultRole._id,
        isVerified: true // Auto-verify for now
      });

      await user.save();

      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;

      return {
        user: userObject,
        message: 'Registration successful'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(email, password, ip, userAgent) {
    try {
      // Find user with password
      const user = await User.findOne({ email }).select('+password').populate('role');
      
      if (!user) {
        throw new Error('Invalid credentials');
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
      await user.save();

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: '7d' }
      );

      // Return user without sensitive data
      const userObject = user.toObject();
      delete userObject.password;

      return {
        user: userObject,
        accessToken,
        refreshToken: accessToken // Simple: use same token as refresh
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
      // Simple implementation - just verify and return new token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your_secret_key');
      
      const user = await User.findById(decoded.userId).populate('role');
      if (!user) {
        throw new Error('User not found');
      }

      const newAccessToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: '7d' }
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;