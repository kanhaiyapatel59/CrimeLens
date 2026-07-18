/**
 * User Seeder - Creates default admin user
 */

const User = require('../../models/User');
const Role = require('../../models/Role');
const District = require('../../models/District');
const logger = require('../../utils/logger');

const seedUsers = async () => {
  try {
    logger.info('🌱 Seeding users...');

    // Get admin role
    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      throw new Error('Admin role not found. Please run role seeder first.');
    }

    // Get default district (Bengaluru Urban)
    const district = await District.findOne({ code: 'BLR' });

    // Admin user
    const adminData = {
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@crimelens.com',
      phone: '9876543210',
      password: 'Admin@123',
      role: adminRole._id,
      district: district ? district._id : null,
      isActive: true,
      isVerified: true
    };

    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      // Update existing admin
      await User.updateOne({ email: adminData.email }, adminData);
      logger.info(`✅ Updated admin user: ${adminData.email}`);
    } else {
      // Create admin
      const admin = new User(adminData);
      await admin.save();
      logger.info(`✅ Created admin user: ${adminData.email}`);
    }

    // SCRB Officer
    const scrbRole = await Role.findOne({ name: 'scrb_officer' });
    if (scrbRole) {
      const scrbData = {
        firstName: 'SCRB',
        lastName: 'Officer',
        email: 'scrb@crimelens.com',
        phone: '9876543211',
        password: 'SCRB@123',
        role: scrbRole._id,
        district: district ? district._id : null,
        isActive: true,
        isVerified: true
      };

      const existingScrb = await User.findOne({ email: scrbData.email });
      
      if (existingScrb) {
        await User.updateOne({ email: scrbData.email }, scrbData);
        logger.info(`✅ Updated SCRB officer: ${scrbData.email}`);
      } else {
        const scrb = new User(scrbData);
        await scrb.save();
        logger.info(`✅ Created SCRB officer: ${scrbData.email}`);
      }
    }

    logger.info('✅ Users seeded successfully!');
    logger.info('📝 Default credentials:');
    logger.info('   Admin: admin@crimelens.com / Admin@123');
    logger.info('   SCRB: scrb@crimelens.com / SCRB@123');
  } catch (error) {
    logger.error('❌ Error seeding users:', error);
    throw error;
  }
};

const deleteUsers = async () => {
  try {
    await User.deleteMany({});
    logger.info('✅ All users deleted');
  } catch (error) {
    logger.error('❌ Error deleting users:', error);
    throw error;
  }
};

module.exports = { seedUsers, deleteUsers };