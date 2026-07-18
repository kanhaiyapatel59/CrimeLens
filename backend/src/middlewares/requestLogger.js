/**
 * Request Logger Middleware - Log all incoming requests
 * Enterprise: Complete request logging for audit and debugging
 */

const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.http(`→ ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.userId,
    body: req.method !== 'GET' ? req.body : undefined
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.http(`← ${req.method} ${req.url} ${res.statusCode} ${duration}ms`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.userId
    });

    // Log errors
    if (res.statusCode >= 400) {
      logger.error(`Request failed: ${req.method} ${req.url}`, {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        error: data
      });
    }

    originalSend.call(this, data);
  };

  next();
};

module.exports = { requestLogger };