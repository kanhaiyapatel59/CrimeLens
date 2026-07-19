require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const CrimeIncident = require('./src/models/CrimeIncident');
  const CrimeType = require('./src/models/CrimeType');
  const District = require('./src/models/District');
  const User = require('./src/models/User');

  const types = await CrimeType.find({ isActive: true }).select('_id name').lean();
  const districts = await District.find({ isActive: true }).select('_id name').lean();
  const user = await User.findOne().select('_id').lean();

  if (!types.length || !districts.length) {
    console.error('No crime types or districts found. Run seeders first.');
    process.exit(1);
  }

  const severities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['reported', 'investigating', 'in_progress', 'resolved', 'closed'];
  const descriptions = [
    'Suspect broke into residential property and stole valuables worth significant amount.',
    'Victim was assaulted near the market area during evening hours by unknown persons.',
    'Vehicle was stolen from parking lot overnight, CCTV footage being reviewed.',
    'Fraudulent transaction detected in bank account, cybercrime unit notified.',
    'Physical altercation between two groups resulted in injuries to multiple persons.',
    'Narcotics found during routine vehicle check at the checkpoint.',
    'Missing person reported by family, search operation initiated.',
    'Arson suspected at commercial establishment, fire department involved.',
    'Kidnapping attempt foiled by bystanders, suspect apprehended at scene.',
    'Domestic violence complaint filed, victim taken to shelter home.',
  ];

  // Bengaluru coordinates with slight variation
  const baseCoords = [
    [77.5946, 12.9716], [77.6101, 12.9352], [77.5667, 13.0012],
    [77.6408, 12.9141], [77.5800, 12.9500], [77.6200, 12.9800],
    [77.5500, 12.9300], [77.6000, 13.0100], [77.5750, 12.9600],
    [77.6300, 12.9400],
  ];

  const crimes = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const type = types[Math.floor(Math.random() * types.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    const coords = baseCoords[Math.floor(Math.random() * baseCoords.length)];
    // Add small random offset so markers don't stack
    const lng = coords[0] + (Math.random() - 0.5) * 0.05;
    const lat = coords[1] + (Math.random() - 0.5) * 0.05;

    const hours = Math.floor(Math.random() * 24);
    const mins = Math.floor(Math.random() * 60);
    const time = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    crimes.push({
      firNumber: `FIR-2024-${String(i + 1).padStart(4, '0')}`,
      incidentId: `INC-2024-${String(i + 1).padStart(4, '0')}`,
      crimeType: type._id,
      date,
      time,
      dayOfWeek: dayNames[date.getDay()],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng.toFixed(4)), parseFloat(lat.toFixed(4))],
        address: {
          city: 'Bengaluru',
          district: district._id,
        },
      },
      riskScore: Math.floor(Math.random() * 100),
      reportedBy: user?._id,
      reportingOfficer: user?._id,
      reportingDate: date,
      metaData: { source: 'manual' },
    });
  }

  // Delete existing seed data first to avoid duplicates
  await CrimeIncident.deleteMany({ firNumber: /^FIR-2024-/ });

  const inserted = await CrimeIncident.insertMany(crimes);
  console.log(`✅ Seeded ${inserted.length} crime records successfully`);

  // Verify
  const total = await CrimeIncident.countDocuments({ deletedAt: null });
  console.log(`📊 Total crimes in DB: ${total}`);

  mongoose.disconnect();
}).catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
