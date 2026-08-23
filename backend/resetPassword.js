require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function resetPassword() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/crimelens');
    console.log('✅ Connected to MongoDB');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@crimelens.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const user = await User.findOne({ email: adminEmail });
    
    if (!user) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }
    
    user.password = adminPassword;
    await user.save();
    
    console.log('✅ Password reset successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
