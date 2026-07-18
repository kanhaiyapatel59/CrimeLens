/**
 * Response Handler - Standardized API responses
 */

const logger = require('./logger');

class ResponseHandler {
  static success(res, data, message = 'Success', statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    return res.status(statusCode).json(response);
  }

  static error(res, error, message = 'Error', statusCode = 500) {
    const response = {
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    };
    
    logger.error(`Error Response: ${statusCode} - ${message}`, error);
    return res.status(statusCode).json(response);
  }

  static created(res, data, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static badRequest(res, message = 'Bad request') {
    return this.error(res, new Error(message), message, 400);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, new Error(message), message, 401);
  }

  static forbidden(res, message = 'Forbidden') {
    return this.error(res, new Error(message), message, 403);
  }

  static notFound(res, message = 'Not found') {
    return this.error(res, new Error(message), message, 404);
  }

  static conflict(res, message = 'Conflict') {
    return this.error(res, new Error(message), message, 409);
  }
}

module.exports = ResponseHandler;