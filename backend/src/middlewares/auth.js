/**
 * Authentication Middleware - JWT verification and RBAC
 * Enterprise: Centralized auth logic, role-based access control
 */

const TokenService = require('../services/tokenService');
const User = require('../models/User');
const ResponseHandler = require('../utils/responseHandler');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

class AuthMiddleware {
  /**
   * Verify JWT token
   */
  static async authenticate(req, res, next) {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      console.log('🔑 [Auth] Auth Header:', authHeader ? 'Present' : 'Missing');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ [Auth] No token provided');
        return ResponseHandler.unauthorized(res, 'No token provided');
      }

      const token = authHeader.split(' ')[1];
      console.log('🔑 [Auth] Token received:', token.substring(0, 30) + '...');

      // Verify token
      let decoded;
      try {
        decoded = TokenService.verifyAccessToken(token);
        console.log('✅ [Auth] Token decoded successfully:', decoded);
      } catch (error) {
        console.log('❌ [Auth] Token verification failed:', error.message);
        return ResponseHandler.unauthorized(res, error.message);
      }

      // Get user
      const user = await User.findById(decoded.userId)
        .populate('role')
        .lean();

      if (!user) {
        console.log('❌ [Auth] User not found:', decoded.userId);
        return ResponseHandler.unauthorized(res, 'User not found');
      }

      console.log('✅ [Auth] User found:', user.email);

      // Check if user is active
      if (!user.isActive) {
        console.log('❌ [Auth] User inactive:', user.email);
        return ResponseHandler.unauthorized(res, 'Account deactivated');
      }

      // Check if user is deleted
      if (user.deletedAt) {
        console.log('❌ [Auth] User deleted:', user.email);
        return ResponseHandler.unauthorized(res, 'Account deleted');
      }

      // Check if password changed after token issued
      if (user.passwordChangedAt) {
        const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
        if (decoded.iat < changedTimestamp) {
          console.log('❌ [Auth] Password changed after token issued');
          return ResponseHandler.unauthorized(res, 'Password changed. Please login again.');
        }
      }

      // Attach user to request
      req.user = user;
      req.userId = user._id;
      req.userRole = user.role;

      console.log('✅ [Auth] Authentication successful for:', user.email);
      next();
    } catch (error) {
      console.error('❌ [Auth] Authentication error:', error.message);
      logger.error('Authentication error:', error);
      return ResponseHandler.unauthorized(res, 'Authentication failed');
    }
  }

  /**
   * Check if user has specific role
   */
  static authorize(...roles) {
    return async (req, res, next) => {
      try {
        const user = req.user;
        
        if (!user) {
          return ResponseHandler.unauthorized(res, 'User not authenticated');
        }

        const userRole = user.role;
        const hasRole = roles.includes(userRole.name);

        if (!hasRole) {
          logger.warn(`Authorization denied for user ${user.email}. Required: ${roles.join(', ')}, Has: ${userRole.name}`);
          return ResponseHandler.forbidden(res, 'Insufficient permissions');
        }

        next();
      } catch (error) {
        logger.error('Authorization error:', error);
        return ResponseHandler.forbidden(res, 'Authorization failed');
      }
    };
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(resource, action) {
    return async (req, res, next) => {
      try {
        const user = req.user;
        
        if (!user) {
          return ResponseHandler.unauthorized(res, 'User not authenticated');
        }

        const userRole = user.role;
        const hasPermission = userRole.permissions.some(
          p => p.resource === resource && p.actions.includes(action)
        );

        // Admin role has all permissions
        const isAdmin = userRole.name === 'admin' || userRole.level >= 9;

        if (!hasPermission && !isAdmin) {
          logger.warn(`Permission denied for user ${user.email}. Resource: ${resource}, Action: ${action}`);
          return ResponseHandler.forbidden(res, 'Insufficient permissions');
        }

        // Log permission check
        const auditLog = new AuditLog({
          action: 'Permission Check',
          description: `User ${user.email} accessed ${resource}:${action}`,
          user: user._id,
          userEmail: user.email,
          module: 'auth',
          actionType: 'read',
          resource: {
            model: 'Permission',
            id: user._id,
            name: `${resource}:${action}`
          },
          status: 'success'
        });
        await auditLog.save();

        next();
      } catch (error) {
        logger.error('Permission error:', error);
        return ResponseHandler.forbidden(res, 'Permission check failed');
      }
    };
  }

  /**
   * Check if user owns the resource or has admin role
   */
  static ownsResource(model, resourceIdField = 'id') {
    return async (req, res, next) => {
      try {
        const user = req.user;
        const resourceId = req.params[resourceIdField];
        const Model = require(`../models/${model}`);

        const resource = await Model.findById(resourceId);
        
        if (!resource) {
          return ResponseHandler.notFound(res, 'Resource not found');
        }

        // Check if user is admin
        const isAdmin = user.role.name === 'admin' || user.role.level >= 9;

        // Check if user owns the resource
        const isOwner = resource.createdBy && 
          resource.createdBy.toString() === user._id.toString();

        if (!isOwner && !isAdmin) {
          return ResponseHandler.forbidden(res, 'You do not own this resource');
        }

        req.resource = resource;
        next();
      } catch (error) {
        logger.error('Resource ownership check error:', error);
        return ResponseHandler.forbidden(res, 'Resource ownership check failed');
      }
    };
  }
}

module.exports = AuthMiddleware;