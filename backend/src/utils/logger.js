/**
 * Logger Utility - Enterprise-grade logging with Winston
 * Supports: Console, File rotation, JSON formatting
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log formats
const formats = {
  json: winston.format.json(),
  timestamp: winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  printf: winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level.toUpperCase()} ${service ? `[${service}]` : ''} ${message} ${metaStr}`;
  }),
  colorize: winston.format.colorize({ all: true }),
};

// Determine log level based on environment
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Create logger instance
const logger = winston.createLogger({
  level: logLevel,
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  },
  defaultMeta: {
    service: 'crimelens-backend',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport (always enabled with colors)
    new winston.transports.Console({
      format: winston.format.combine(
        formats.timestamp,
        formats.colorize,
        formats.printf
      ),
    }),
  ],
});

// Add file transports in all environments (with rotation)
// Error log file
logger.add(
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: winston.format.combine(formats.timestamp, formats.json),
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    tailable: true,
  })
);

// Combined log file
logger.add(
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: winston.format.combine(formats.timestamp, formats.json),
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    tailable: true,
  })
);

// HTTP requests log file
logger.add(
  new winston.transports.File({
    filename: path.join(logDir, 'http.log'),
    level: 'http',
    format: winston.format.combine(formats.timestamp, formats.json),
    maxsize: 10485760,
    maxFiles: 5,
    tailable: true,
  })
);

// Custom methods for specific log types
logger.withService = (serviceName) => {
  return logger.child({ service: serviceName });
};

logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.userId,
  };

  if (res.statusCode >= 400) {
    logger.error('Request failed', logData);
  } else {
    logger.http('Request completed', logData);
  }
};

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Don't exit, let the process handle it gracefully
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

module.exports = logger;
