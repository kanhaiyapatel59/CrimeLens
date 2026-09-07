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

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@crimelens.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    // Respond immediately to prevent Render 30s HTTP proxy timeout
    res.status(200).json({
      success: true,
      message: '🚀 Cloud database seeding started in background! Data is populating MongoDB Atlas shortly.',
      defaultCredentials: {
        admin: `${adminEmail} / ${adminPassword}`,
        scrb: 'scrb@crimelens.com / SCRB@123',
      },
    });

    // Execute seeding process asynchronously in background
    (async () => {
      try {
        await seedRoles();
        await seedDistricts();
        await seedCrimeTypes();
        await seedUsers();
        await CorrelationService.seedEconomicData();
        const crimesCount = await seedCrimes();
        logger.info(`🎉 Cloud database seeding completed successfully! Total crimes seeded: ${crimesCount}`);
      } catch (err) {
        logger.error('❌ Background cloud seeding error:', err.message);
      }
    })();

  } catch (error) {
    logger.error('❌ Seeding trigger failed:', error);
    res.status(500).json({
      success: false,
      message: 'Seeding trigger failed',
      error: error.message,
    });
  }
};

router.post('/', handleSeeding);
router.get('/', handleSeeding);

module.exports = router;
