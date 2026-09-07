require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const { seedCrimes } = require('./src/database/seeds/crimeSeeder');
  const count = await seedCrimes();
  console.log(`🎉 Seeded exactly ${count} master crime records successfully!`);
  mongoose.disconnect();
  process.exit(0);
}).catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
