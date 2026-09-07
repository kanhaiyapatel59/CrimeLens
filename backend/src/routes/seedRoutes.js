const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { seedRoles } = require('../database/seeds/roleSeeder');
const { seedDistricts } = require('../database/seeds/districtSeeder');
const { seedCrimeTypes } = require('../database/seeds/crimeTypeSeeder');
const { seedUsers } = require('../database/seeds/userSeeder');
const { seedCrimes } = require('../database/seeds/crimeSeeder');
const CorrelationService = require('../services/correlationService');

const handleSeeding = async (req, res) => {
  try {
    logger.info('🚀 Direct API seed request received...');

    await seedRoles();
    await seedDistricts();
    await seedCrimeTypes();
    await seedUsers();
    await CorrelationService.seedEconomicData();
    const crimesCount = await seedCrimes();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@crimelens.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    res.status(200).json({
      success: true,
      message: '🎉 Database seeded successfully with sample roles, districts, crime types, users, and crime incidents!',
      seededCounts: {
        crimes: crimesCount,
      },
      defaultCredentials: {
        admin: `${adminEmail} / ${adminPassword}`,
        scrb: 'scrb@crimelens.com / SCRB@123',
      },
    });
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    res.status(500).json({
      success: false,
      message: 'Seeding failed',
      error: error.message,
    });
  }
};

router.post('/', handleSeeding);
router.get('/', handleSeeding);

module.exports = router;
