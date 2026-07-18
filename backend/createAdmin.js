require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');
const Role = require('./src/models/Role');

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/crimelens');
    console.log('Connected to MongoDB');

    // Get admin role
    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      console.log('Creating admin role...');
      const newRole = new Role({
        name: 'admin',
        displayName: 'Administrator',
        description: 'System Administrator',
        level: 10,
        permissions: [],
        isDefault: false,
        isActive: true
      });
      await newRole.save();
      console.log('Admin role created');
    }

    // Get role again
    const role = await Role.findOne({ name: 'admin' });
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@crimelens.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const admin = new User({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@crimelens.com',
      phone: '9876543210',
      password: hashedPassword,
      role: role._id,
      isActive: true,
      isVerified: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@crimelens.com');
    console.log('Password: Admin@123');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
