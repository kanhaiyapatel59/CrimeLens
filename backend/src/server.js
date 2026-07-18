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
const path = require('path');
const crimeRoutes = require('./routes/crimeRoutes');  // ← ADD THIS
const dashboardRoutes = require('./routes/dashboardRoutes'); 
const networkRoutes = require('./routes/networkRoutes');  // ← ADD THIS
const aiRoutes = require('./routes/aiRoutes');  // ← ADD THIS

// Import custom modules
const logger = require('./utils/logger');
const { connectDatabase } = require('./database/connection');
const { errorHandler } = require('./middlewares/errorHandler');
const { requestLogger } = require('./middlewares/requestLogger');

// Import routes
const authRoutes = require('./routes/authRoutes');

const app = express();
const httpServer = createServer(app);

// ============================================
// Security & Performance Middleware
// ============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Compression
app.use(compression());

// JSON parsing with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Request logging
app.use(requestLogger);

// ============================================
// Socket.IO Configuration
// ============================================

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  },
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

// Make io accessible to routes
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

// API routes - FIXED: Removed the problematic middleware
app.use('/api/auth', authRoutes);
app.use('/api/crimes', crimeRoutes);
app.use('/api/dashboard', dashboardRoutes);  // ← ADD THIS

app.use('/api/network', networkRoutes); 
app.use('/api/ai', aiRoutes);  // ← ADD THIS

// TODO: Add more routes as we build them
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/crimes', require('./routes/crimeRoutes'));
// app.use('/api/analytics', require('./routes/analyticsRoutes'));
// app.use('/api/districts', require('./routes/districtRoutes'));
// app.use('/api/stations', require('./routes/stationRoutes'));
// app.use('/api/investigations', require('./routes/investigationRoutes'));
// app.use('/api/evidence', require('./routes/evidenceRoutes'));
// app.use('/api/networks', require('./routes/networkRoutes'));
// app.use('/api/predictions', require('./routes/predictionRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler - FIXED: Properly placed after all routes
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

    // Connect to Redis (optional - uncomment when ready)
    // await connectRedis();
    // logger.info('✅ Redis connected successfully');

    // Start server
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

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing connections...');
  
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      logger.info('Database connections closed');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
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
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

startServer();

module.exports = { app, httpServer, io };