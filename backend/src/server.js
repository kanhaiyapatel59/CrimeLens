/**
 * CrimeLens Backend Server
 * Enterprise-grade Express server with security, logging, and monitoring
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

// Routes
const authRoutes = require('./routes/authRoutes');
const crimeRoutes = require('./routes/crimeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const networkRoutes = require('./routes/networkRoutes');
const aiRoutes = require('./routes/aiRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes'); // ✅ Added Admin Routes reference
const correlationRoutes = require('./routes/correlationRoutes');

// Utils & Middleware
const logger = require('./utils/logger');
const { connectDatabase } = require('./database/connection');
const { errorHandler } = require('./middlewares/errorHandler');
const { requestLogger } = require('./middlewares/requestLogger');


const app = express();
const httpServer = createServer(app);


// ============================================
// CORS - ULTIMATE FIX (Place this FIRST)
// ============================================
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];

// Manual CORS headers for all requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow all origins in development, or check against allowed list
  if (process.env.NODE_ENV === 'development' || !origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  }
  
  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// CORS middleware (official)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        console.log('Blocked CORS from:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
  })
);

// ============================================
// Security & Performance Middleware
// ============================================

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Compression
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb'
  })
);

// Rate limiting
// NOTE: Dashboard pages make multiple concurrent requests; keep this permissive in dev.
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS
    ? Number(process.env.RATE_LIMIT_WINDOW_MS)
    : 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply only to high-volume API endpoints if possible.
app.use('/api', limiter);

// Request logger
app.use(requestLogger);

// ============================================
// Socket.IO Configuration
// ============================================

const io = new Server(httpServer, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  }
});

io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);

  socket.on('subscribe', (data) => {
    socket.join(data.room);
    logger.info(`Client ${socket.id} subscribed to ${data.room}`);
  });

  socket.on('unsubscribe', (data) => {
    socket.leave(data.room);
    logger.info(`Client ${socket.id} unsubscribed from ${data.room}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

app.set('io', io);

// ============================================
// Routes
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('../package.json').version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/crimes', crimeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes); // ✅ Added Admin Routes registration
app.use('/api/correlation', correlationRoutes);

// Districts lookup endpoint
const District = require('./models/District');
const AuthMiddleware = require('./middlewares/auth');
app.get('/api/districts', AuthMiddleware.authenticate, async (req, res) => {
  const districts = await District.find({ isActive: true }).select('_id name code').lean();
  res.json({ success: true, data: districts });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// ============================================
// Database Connection & Server Start
// ============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // Start server (handle EADDRINUSE gracefully)
    httpServer.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use (EADDRINUSE). Is another dev server running?`);
        logger.error(err);
        // Exit with non-zero so nodemon doesn't get stuck
        process.exit(1);
      }

      logger.error('HTTP server error:', err);
    });

    httpServer.listen(PORT, () => {
      logger.info(`🚀 CrimeLens Backend running on port ${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 URL: http://localhost:${PORT}`);
      logger.info(`🛠️  Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown (idempotent)
let isShuttingDown = false;
let shutdownTimeout = null;

const gracefulShutdown = () => {
  if (isShuttingDown) {
    // Prevent repeated shutdown spam / re-entrancy during teardown
    return;
  }
  isShuttingDown = true;

  logger.info('Received shutdown signal, closing connections...');

  // Stop accepting new connections
  try {
    httpServer.close(() => {
      // Close Mongo connection
      mongoose.connection.close(false, () => {
        logger.info('Database connections closed');
        process.exit(0);
      });
    });
  } catch (e) {
    logger.error('Error during httpServer.close:', e);
    // Fall through to forced shutdown
  }

  // Force close after 10 seconds (schedule once)
  shutdownTimeout = setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  // Avoid repeated shutdown triggers
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

startServer();

module.exports = { app, httpServer, io };