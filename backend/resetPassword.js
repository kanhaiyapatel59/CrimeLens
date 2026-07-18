require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function resetPassword() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/crimelens');
    console.log('✅ Connected to MongoDB');
    
    const user = await User.findOne({ email: 'admin@crimelens.com' });
    
    if (!user) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }
    
    user.password = 'Admin@123';
    await user.save();
    
    console.log('✅ Password reset successfully!');
    console.log('📧 Email: admin@crimelens.com');
    console.log('🔑 Password: Admin@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
