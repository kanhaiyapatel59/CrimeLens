const mongoose = require('mongoose');
const CrimeIncident = require('../../models/CrimeIncident');
const CrimeType = require('../../models/CrimeType');
const District = require('../../models/District');
const Victim = require('../../models/Victim');
const Suspect = require('../../models/Suspect');
const User = require('../../models/User');
const logger = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

const masterRecords = [
  { firNumber: 'FIR2026101', incidentId: 'INC2026101', crimeType: 'Robbery', date: '2026-01-15', time: '14:30', description: 'Armed robbery at MG Road jewelry store involving two masked perpetrators', severity: 'high', riskScore: 85, status: 'investigating', latitude: 12.9716, longitude: 77.5946, district: 'Bengaluru Urban', policeStation: 'MG Road PS', victimName: 'Ramesh Kumar', suspectName: 'Kabir Khan' },
  { firNumber: 'FIR2026102', incidentId: 'INC2026102', crimeType: 'Cyber Crime', date: '2026-01-20', time: '23:15', description: 'Phishing scam targeting senior citizens resulting in unauthorized bank transfer', severity: 'critical', riskScore: 92, status: 'reported', latitude: 12.9352, longitude: 77.6101, district: 'Bengaluru Urban', policeStation: 'Indiranagar PS', victimName: 'Sunita Sharma', suspectName: 'Rahul Verma' },
  { firNumber: 'FIR2026103', incidentId: 'INC2026103', crimeType: 'Theft', date: '2026-02-05', time: '03:45', description: 'Grand theft auto reported from Koramangala commercial parking lot overnight', severity: 'medium', riskScore: 55, status: 'in_progress', latitude: 12.9279, longitude: 77.6271, district: 'Bengaluru Urban', policeStation: 'Koramangala PS', victimName: 'Vikram Singh', suspectName: 'Imran Shaikh' },
  { firNumber: 'FIR2026104', incidentId: 'INC2026104', crimeType: 'Burglary', date: '2026-02-18', time: '11:20', description: 'Residential break-in at Jayanagar during daytime hours; gold jewelry stolen', severity: 'medium', riskScore: 48, status: 'resolved', latitude: 12.9304, longitude: 77.5825, district: 'Bengaluru Urban', policeStation: 'Jayanagar PS', victimName: 'Priya Nair', suspectName: 'Unknown Offender' },
  { firNumber: 'FIR2026105', incidentId: 'INC2026105', crimeType: 'Homicide', date: '2026-03-10', time: '19:00', description: 'Homicide investigation opened following incident near Devaraja Market area', severity: 'critical', riskScore: 95, status: 'investigating', latitude: 12.3052, longitude: 76.6551, district: 'Mysuru', policeStation: 'Devaraja PS', victimName: 'Suresh Rao', suspectName: 'David Dsouza' },
  { firNumber: 'FIR2026106', incidentId: 'INC2026106', crimeType: 'Human Trafficking', date: '2026-03-25', time: '01:10', description: 'Inter-state trafficking racket intercepted at Central Railway Station hub', severity: 'high', riskScore: 78, status: 'in_progress', latitude: 12.2958, longitude: 76.6394, district: 'Mysuru', policeStation: 'Mandi PS', victimName: 'Ananya Hegde', suspectName: 'Amit Shah' },
  { firNumber: 'FIR2026107', incidentId: 'INC2026107', crimeType: 'Money Laundering', date: '2026-04-12', time: '16:45', description: 'Shell company financial fraud involving suspicious transactions across accounts', severity: 'high', riskScore: 82, status: 'closed', latitude: 12.9141, longitude: 74.8560, district: 'Coastal Mangaluru', policeStation: 'Pandeshwar PS', victimName: 'Vijay Patil', suspectName: 'Santosh Kumar' },
  { firNumber: 'FIR2026108', incidentId: 'INC2026108', crimeType: 'Narcotics', date: '2026-05-01', time: '08:30', description: 'Seizure of contraband substances at coastal checkpost transport inspect point', severity: 'medium', riskScore: 52, status: 'reported', latitude: 12.8700, longitude: 74.8800, district: 'Coastal Mangaluru', policeStation: 'Bunder PS', victimName: 'Deepa Mehta', suspectName: 'Rohit Shetty' },
  { firNumber: 'FIR2026109', incidentId: 'INC2026109', crimeType: 'Extortion', date: '2026-05-18', time: '21:00', description: 'Protection money extortion attempt against local business owner in Hubballi', severity: 'high', riskScore: 80, status: 'investigating', latitude: 15.3647, longitude: 75.1240, district: 'Hubballi-Dharwad', policeStation: 'Subhash Nagar PS', victimName: 'Rajesh Gupta', suspectName: 'Dinesh Gowda' },
  { firNumber: 'FIR2026110', incidentId: 'INC2026110', crimeType: 'Assault', date: '2026-06-04', time: '13:15', description: 'Physical altercation outside bus terminal resulting in minor injuries', severity: 'medium', riskScore: 60, status: 'resolved', latitude: 15.3500, longitude: 75.1300, district: 'Hubballi-Dharwad', policeStation: 'Old Hubballi PS', victimName: 'Meena Joshi', suspectName: 'Salman Khan' },
  { firNumber: 'FIR2026111', incidentId: 'INC2026111', crimeType: 'Vehicle Theft', date: '2026-06-20', time: '17:50', description: 'Motorcycle stolen from public market complex parking bay in Belagavi', severity: 'low', riskScore: 28, status: 'closed', latitude: 15.8497, longitude: 74.4977, district: 'Belagavi', policeStation: 'Camp PS', victimName: 'Abdul Rahim', suspectName: 'Prakash Naik' },
  { firNumber: 'FIR2026112', incidentId: 'INC2026112', crimeType: 'Arson', date: '2026-07-08', time: '02:30', description: 'Suspicious fire incident at industrial warehouse location under investigation', severity: 'high', riskScore: 88, status: 'investigating', latitude: 15.8600, longitude: 74.5100, district: 'Belagavi', policeStation: 'APMC PS', victimName: 'Kavita Reddy', suspectName: 'Vinay Kumar' },
  { firNumber: 'FIR2026113', incidentId: 'INC2026113', crimeType: 'Kidnapping', date: '2026-07-22', time: '10:05', description: 'Attempted abduction foiled by swift police intervention at highway junction', severity: 'critical', riskScore: 94, status: 'in_progress', latitude: 12.9716, longitude: 77.5946, district: 'Bengaluru Urban', policeStation: 'MG Road PS', victimName: 'Mohan Das', suspectName: 'Mohammad Ali' },
  { firNumber: 'FIR2026114', incidentId: 'INC2026114', crimeType: 'Forgery', date: '2026-08-11', time: '20:40', description: 'Property document forgery and illegal land registration racket uncovered', severity: 'medium', riskScore: 65, status: 'reported', latitude: 12.9352, longitude: 77.6101, district: 'Bengaluru Urban', policeStation: 'Indiranagar PS', victimName: 'Pooja Verma', suspectName: 'Deepak Sharma' },
  { firNumber: 'FIR2026115', incidentId: 'INC2026115', crimeType: 'Domestic Violence', date: '2026-08-25', time: '15:20', description: 'Domestic dispute complaint registered following distress call to hotline', severity: 'low', riskScore: 35, status: 'resolved', latitude: 12.9279, longitude: 77.6271, district: 'Bengaluru Urban', policeStation: 'Koramangala PS', victimName: 'Sanjay Kulkarni', suspectName: 'Ganesh Pujari' }
];

const parseCsvRecords = () => {
  const possiblePaths = [
    path.resolve(__dirname, '../../../sample_csv_data'),
    path.resolve(__dirname, '../../../../sample_csv_data'),
    path.resolve(process.cwd(), 'sample_csv_data'),
    path.resolve(process.cwd(), '../sample_csv_data'),
    path.resolve(__dirname, '../../../sample_csv_data_2'),
    path.resolve(__dirname, '../../../../sample_csv_data_2'),
    path.resolve(process.cwd(), 'sample_csv_data_2'),
    path.resolve(process.cwd(), '../sample_csv_data_2'),
  ];

  const existingDirs = [...new Set(possiblePaths)].filter(p => fs.existsSync(p));
  if (existingDirs.length === 0) return [];

  const recordMap = new Map();

  for (const sampleDir of existingDirs) {
    const files = fs.readdirSync(sampleDir).filter(f => f.endsWith('.csv')).sort();

    for (const file of files) {
      const content = fs.readFileSync(path.join(sampleDir, file), 'utf8');
      const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
      if (lines.length < 2) continue;

      const headers = lines[0].split(',').map(h => h.trim());

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < headers.length) continue;

        const record = {};
        headers.forEach((h, idx) => {
          record[h] = values[idx];
        });

        if (record.firNumber && record.crimeType && !recordMap.has(record.firNumber)) {
          recordMap.set(record.firNumber, {
            firNumber: record.firNumber,
            incidentId: record.incidentId,
            crimeType: record.crimeType,
            date: record.date,
            time: record.time,
            description: record.description,
            severity: record.severity,
            riskScore: parseInt(record.riskScore) || 50,
            status: record.status,
            latitude: parseFloat(record.latitude) || 12.9716,
            longitude: parseFloat(record.longitude) || 77.5946,
            district: record.district,
            policeStation: record.policeStation,
            victimName: record.victimName,
            suspectName: record.suspectName
          });
        }
      }
    }
  }

  return Array.from(recordMap.values());
};

const seedCrimes = async () => {
  try {
    logger.info('🧹 Wiping all existing sample crime incidents, victims, and suspects...');
    await CrimeIncident.deleteMany({});
    await Victim.deleteMany({});
    await Suspect.deleteMany({});

    const types = await CrimeType.find({ isActive: true }).select('_id name').lean();
    const districts = await District.find({ isActive: true }).select('_id name').lean();
    const user = await User.findOne().select('_id').lean();

    const typeMap = {};
    types.forEach(t => { typeMap[t.name.toLowerCase()] = t._id; });
    const defaultType = types[0]?._id;

    const districtMap = {};
    districts.forEach(d => { districtMap[d.name.toLowerCase()] = d._id; });
    const defaultDistrict = districts[0]?._id;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const parsedRecords = parseCsvRecords();
    const records = parsedRecords.length > 0 ? parsedRecords : masterRecords;
    logger.info(`🌱 Seeding ${records.length} crime records in bulk...`);

    const victimsToInsert = [];
    const suspectsToInsert = [];
    const crimesToInsert = [];

    for (const item of records) {
      const dateObj = new Date(item.date);
      const matchedTypeId = typeMap[item.crimeType.toLowerCase()] || defaultType;
      const matchedDistrictId = districtMap[item.district.toLowerCase()] || defaultDistrict;

      const dummyCrimeId = new mongoose.Types.ObjectId();
      let victimId = null;
      let suspectId = null;

      // Create Victim doc
      if (item.victimName) {
        const parts = item.victimName.split(' ');
        victimId = new mongoose.Types.ObjectId();
        victimsToInsert.push({
          _id: victimId,
          firstName: parts[0] || 'Unknown',
          lastName: parts.slice(1).join(' ') || 'Victim',
          contact: { phone: '9845012345' },
          crimes: [{ crime: dummyCrimeId, role: 'primary' }]
        });
      }

      // Create Suspect doc
      if (item.suspectName && item.suspectName !== 'Unknown Offender') {
        const parts = item.suspectName.split(' ');
        const suspectLevel = ['low', 'medium', 'high', 'extreme'].includes(item.severity) ? item.severity : 'high';
        suspectId = new mongoose.Types.ObjectId();
        suspectsToInsert.push({
          _id: suspectId,
          firstName: parts[0] || 'Unknown',
          lastName: parts.slice(1).join(' ') || 'Suspect',
          status: 'under_investigation',
          riskAssessment: { score: item.riskScore, level: suspectLevel },
          currentCrimes: [{ crime: dummyCrimeId, role: 'primary', status: 'active' }]
        });
      }

      // Create Crime Incident doc
      crimesToInsert.push({
        _id: dummyCrimeId,
        firNumber: item.firNumber,
        incidentId: item.incidentId,
        crimeType: matchedTypeId,
        date: dateObj,
        time: item.time,
        dayOfWeek: dayNames[dateObj.getDay()] || 'Monday',
        description: item.description,
        severity: item.severity,
        riskScore: item.riskScore,
        status: item.status,
        victims: victimId ? [victimId] : [],
        suspects: suspectId ? [suspectId] : [],
        location: {
          type: 'Point',
          coordinates: [item.longitude, item.latitude],
          address: {
            city: item.district,
            district: matchedDistrictId,
            street: item.policeStation
          }
        },
        reportedBy: user?._id,
        reportingOfficer: user?._id,
        reportingDate: dateObj,
        metaData: { source: 'police_import' }
      });
    }

    if (victimsToInsert.length > 0) await Victim.insertMany(victimsToInsert);
    if (suspectsToInsert.length > 0) await Suspect.insertMany(suspectsToInsert);
    if (crimesToInsert.length > 0) await CrimeIncident.insertMany(crimesToInsert);

    logger.info(`✅ Successfully seeded ${crimesToInsert.length} crime incidents into database!`);
    return crimesToInsert.length;
  } catch (error) {
    logger.error('❌ Error seeding crimes:', error);
    throw error;
  }
};

module.exports = { seedCrimes };
