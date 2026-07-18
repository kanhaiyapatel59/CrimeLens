/**
 * Token Service - JWT token generation and verification
 * Enterprise: Centralized token management
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class TokenService {
  /**
   * Generate access token (short-lived)
   */
  static generateAccessToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || '15m',
        issuer: 'crimelens',
        audience: 'crimelens-api',
        algorithm: 'HS256'
      }
    );
  }

  /**
   * Generate refresh token (long-lived)
   */
  static generateRefreshToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'crimelens',
        audience: 'crimelens-api',
        algorithm: 'HS256'
      }
    );
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'crimelens',
        audience: 'crimelens-api'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token expired');
      }
      throw new Error('Invalid access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        issuer: 'crimelens',
        audience: 'crimelens-api'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      }
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken(userId) {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate email verification token
   */
  static generateVerificationToken(userId) {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded) return true;
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }

  /**
   * Get remaining time of token
   */
  static getTokenRemainingTime(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded) return 0;
      const now = Date.now();
      const expiry = decoded.exp * 1000;
      return Math.max(0, expiry - now);
    } catch (error) {
      return 0;
    }
  }
}

module.exports = TokenService;