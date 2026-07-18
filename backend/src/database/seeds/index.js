/**
 * Main Seeder - Run all seeders in correct order
 * Usage: node src/database/seeds/index.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const logger = require('../../utils/logger');
const { connectDatabase } = require('../connection');

// Import seeders
const { seedRoles, deleteRoles } = require('./roleSeeder');
const { seedDistricts, deleteDistricts } = require('./districtSeeder');
const { seedCrimeTypes, deleteCrimeTypes } = require('./crimeTypeSeeder');
const { seedUsers, deleteUsers } = require('./userSeeder');

const runSeeders = async () => {
  try {
    logger.info('🚀 Starting database seeding...');
    logger.info('📊 Seeding order: Roles → Districts → Crime Types → Users');

    // Connect to database
    await connectDatabase();
    logger.info('✅ Database connected');

    // Seed in correct order (dependencies first)
    await seedRoles();
    await seedDistricts();
    await seedCrimeTypes();
    await seedUsers();

    logger.info('🎉 Database seeding completed successfully!');
    logger.info('📝 Default Credentials:');
    logger.info('   Admin: admin@crimelens.com / Admin@123');
    logger.info('   SCRB: scrb@crimelens.com / SCRB@123');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

const deleteAll = async () => {
  try {
    logger.info('🗑️ Deleting all data...');

    await connectDatabase();
    
    await deleteUsers();
    await deleteCrimeTypes();
    await deleteDistricts();
    await deleteRoles();

    logger.info('✅ All data deleted successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Deletion failed:', error);
    process.exit(1);
  }
};

// Run based on command line argument
const args = process.argv.slice(2);
if (args.includes('--delete')) {
  deleteAll();
} else {
  runSeeders();
}