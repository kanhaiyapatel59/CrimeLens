require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');

async function fixPassword() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/crimelens');
    console.log('✅ Connected');
    
    const hash = await bcrypt.hash('Admin@123', 10);
    console.log('New hash:', hash);
    
    const result = await User.updateOne(
      { email: 'admin@crimelens.com' },
      { $set: { password: hash, loginAttempts: 0 } }
    );
    
    console.log('✅ Updated:', result);
    console.log('📧 Email: admin@crimelens.com');
    console.log('🔑 Password: Admin@123');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
fixPassword();
