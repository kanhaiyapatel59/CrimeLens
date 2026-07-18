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
    console.log('🔑 [TokenService] Generating access token for:', payload.email);
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || '7d',
        issuer: 'crimelens',
        audience: 'crimelens-api',
        algorithm: 'HS256'
      }
    );
    console.log('✅ [TokenService] Access token generated');
    return token;
  }

  /**
   * Generate refresh token (long-lived)
   */
  static generateRefreshToken(payload) {
    console.log('🔑 [TokenService] Generating refresh token for:', payload.email);
    const token = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'crimelens',
        audience: 'crimelens-api',
        algorithm: 'HS256'
      }
    );
    console.log('✅ [TokenService] Refresh token generated');
    return token;
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token) {
    try {
      console.log('🔑 [TokenService] Verifying token:', token.substring(0, 30) + '...');
      console.log('🔑 [TokenService] Using JWT_SECRET:', process.env.JWT_SECRET ? 'Yes' : 'No');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'crimelens',
        audience: 'crimelens-api'
      });
      
      console.log('✅ [TokenService] Token verified successfully for:', decoded.email);
      return decoded;
    } catch (error) {
      console.log('❌ [TokenService] Token verification failed:', error.message);
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token signature');
      }
      throw new Error('Invalid access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token) {
    try {
      console.log('🔑 [TokenService] Verifying refresh token');
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        issuer: 'crimelens',
        audience: 'crimelens-api'
      });
      console.log('✅ [TokenService] Refresh token verified');
      return decoded;
    } catch (error) {
      console.log('❌ [TokenService] Refresh token verification failed:', error.message);
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