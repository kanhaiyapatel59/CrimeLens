const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;

const connectDatabase = async (retryCount = 0) => {
  const mongoURI = process.env.MONGODB_URI || 
    `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}?authSource=admin`;

  const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  try {
    await mongoose.connect(mongoURI, options);
    logger.info(`Connected to MongoDB: ${process.env.MONGO_DATABASE}`);

    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected, attempting to reconnect...');
      setTimeout(() => connectDatabase(), 5000);
    });

    return mongoose.connection;
  } catch (error) {
    logger.error(`MongoDB connection attempt ${retryCount + 1} failed:`, error.message);

    if (retryCount < MAX_RETRIES) {
      logger.info(`Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      return connectDatabase(retryCount + 1);
    } else {
      logger.error('Max retry attempts reached. Could not connect to MongoDB.');
      throw error;
    }
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
  getConnectionStatus,
};