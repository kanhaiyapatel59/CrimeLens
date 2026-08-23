require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');

async function fixPassword() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/crimelens');
    console.log('✅ Connected');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@crimelens.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const hash = await bcrypt.hash(adminPassword, 10);
    console.log('New hash:', hash);
    
    const result = await User.updateOne(
      { email: adminEmail },
      { $set: { password: hash, loginAttempts: 0 } }
    );
    
    console.log('✅ Updated:', result);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
fixPassword();
