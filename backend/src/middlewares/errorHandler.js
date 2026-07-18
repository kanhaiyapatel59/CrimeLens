/**
 * Error Handler Middleware - Global error handling
 * Enterprise: Centralized error handling with logging
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.userId
  });

  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Determine error message
  let message = err.message || 'Internal server error';
  
  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}`,
      field
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      field: err.path
    });
  }

  // JSON Web Token errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Rate limiting error
  if (err.name === 'RateLimitError') {
    return res.status(429).json({
      success: false,
      message: 'Too many requests'
    });
  }

  // Development vs Production errors
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
      error: err
    });
  }

  // Production: Don't leak error details
  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : message
  });
};

module.exports = { errorHandler };