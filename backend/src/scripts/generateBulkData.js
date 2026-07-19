const fs = require('fs');
const path = require('path');

const crimes = [];
const locations = [
  { lat: 12.9716, lng: 77.5946, area: 'MG Road' },
  { lat: 12.9784, lng: 77.6408, area: 'Indiranagar' },
  { lat: 12.9352, lng: 77.6245, area: 'Koramangala' },
  { lat: 12.9698, lng: 77.7499, area: 'Whitefield' },
];

const complainants = ['Rajesh Kumar', 'Priya Sharma', 'Sunita Patel', 'Anita Desai'];
const accused = ['Amit Singh', 'Vikram Reddy', 'Ravi Kumar', 'Kiran Raj'];
const crimeTypes = ['Robbery', 'Burglary', 'Chain Snatching', 'Murder', 'Drug Possession', 'Hit and Run', 'Cyber Fraud', 'Armed Robbery'];
const severityMap = {
  'Murder': 1, 'Armed Robbery': 1, 'Robbery': 2, 'Hit and Run': 2,
  'Burglary': 3, 'Chain Snatching': 3, 'Cyber Fraud': 3, 'Drug Possession': 4
};

// Generate 30 crimes spread over 30 days
for (let i = 0; i < 30; i++) {
  const loc = locations[i % locations.length];
  const crimeType = crimeTypes[i % crimeTypes.length];
  const date = new Date(2024, 0, 15 + i); // Jan 15 to Feb 13
  
  crimes.push({
    CrimeNo: `FIR${String(2024001 + i).padStart(7, '0')}`,
    CaseNo: String(2024001 + i),
    CrimeRegisteredDate: date.toISOString().split('T')[0],
    BriefFacts: `${crimeType} at ${loc.area}`,
    GravityOffenceID: severityMap[crimeType] || 3,
    latitude: loc.lat + (Math.random() - 0.5) * 0.01,
    longitude: loc.lng + (Math.random() - 0.5) * 0.01,
    ComplainantName: complainants[i % complainants.length],
    AccusedName: accused[i % accused.length],
    DistrictID: 'DIST001',
    PoliceStationID: `PS${String(1 + i % 6).padStart(3, '0')}`
  });
}

// Save as CSV
const headers = Object.keys(crimes[0]);
let csv = headers.join(',') + '\n';
crimes.forEach(row => {
  const values = headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`);
  csv += values.join(',') + '\n';
});

fs.writeFileSync(path.join(__dirname, '../../trend_data.csv'), csv);
console.log(`✅ Generated ${crimes.length} crimes across 30 days`);
console.log('📄 Upload trend_data.csv through Reports page');
