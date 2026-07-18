/**
 * Generate Sample Police Data for Testing
 */

const fs = require('fs');
const path = require('path');

const sampleData = [
  {
    CrimeNo: '104430006202600001',
    CaseNo: '202600001',
    CrimeRegisteredDate: '2024-01-15',
    BriefFacts: 'Robbery at MG Road - Cash and valuables stolen from a jewelry store',
    GravityOffenceID: 2,
    latitude: 12.9716,
    longitude: 77.5946,
    ComplainantName: 'Rajesh Kumar',
    AccusedName: 'Amit Singh',
    DistrictID: 'DIST001',
    PoliceStationID: 'PS001'
  },
  {
    CrimeNo: '104430006202600002',
    CaseNo: '202600002',
    CrimeRegisteredDate: '2024-01-16',
    BriefFacts: 'Burglary at Indiranagar - Laptop, cash and jewelry stolen',
    GravityOffenceID: 3,
    latitude: 12.9784,
    longitude: 77.6408,
    ComplainantName: 'Priya Sharma',
    AccusedName: 'Vikram Reddy',
    DistrictID: 'DIST001',
    PoliceStationID: 'PS002'
  },
  {
    CrimeNo: '104430006202600003',
    CaseNo: '202600003',
    CrimeRegisteredDate: '2024-01-17',
    BriefFacts: 'Chain snatching in Koramangala - Gold chain stolen from elderly woman',
    GravityOffenceID: 3,
    latitude: 12.9352,
    longitude: 77.6245,
    ComplainantName: 'Sunita Patel',
    AccusedName: 'Ravi Kumar',
    DistrictID: 'DIST001',
    PoliceStationID: 'PS001'
  },
  {
    CrimeNo: '104430006202600004',
    CaseNo: '202600004',
    CrimeRegisteredDate: '2024-01-18',
    BriefFacts: 'Murder case in Whitefield - Victim found dead with stab wounds',
    GravityOffenceID: 1,
    latitude: 12.9698,
    longitude: 77.7499,
    ComplainantName: 'Anita Desai',
    AccusedName: 'Kiran Raj',
    DistrictID: 'DIST002',
    PoliceStationID: 'PS003'
  },
  {
    CrimeNo: '104430006202600005',
    CaseNo: '202600005',
    CrimeRegisteredDate: '2024-01-19',
    BriefFacts: 'Drug possession in Electronic City - 2kg of narcotics seized',
    GravityOffenceID: 4,
    latitude: 12.8399,
    longitude: 77.6770,
    ComplainantName: 'Mohan Kumar',
    AccusedName: 'Sanjay Singh',
    DistrictID: 'DIST001',
    PoliceStationID: 'PS004'
  },
  {
    CrimeNo: '104430006202600006',
    CaseNo: '202600006',
    CrimeRegisteredDate: '2024-01-20',
    BriefFacts: 'Hit and run accident in Jayanagar - Pedestrian killed',
    GravityOffenceID: 2,
    latitude: 12.9304,
    longitude: 77.5825,
    ComplainantName: 'Lakshmi Narayan',
    AccusedName: 'Prakash Rao',
    DistrictID: 'DIST001',
    PoliceStationID: 'PS005'
  },
  {
    CrimeNo: '104430006202600007',
    CaseNo: '202600007',
    CrimeRegisteredDate: '2024-01-21',
    BriefFacts: 'Cyber fraud in Rajajinagar - 5 lakhs fraudulently transferred',
    GravityOffenceID: 3,
    latitude: 12.9985,
    longitude: 77.5543,
    ComplainantName: 'Suresh Reddy',
    AccusedName: 'Unknown',
    DistrictID: 'DIST001',
    PoliceStationID: 'PS001'
  },
  {
    CrimeNo: '104430006202600008',
    CaseNo: '202600008',
    CrimeRegisteredDate: '2024-01-22',
    BriefFacts: 'Armed robbery at Bank in Malleswaram - 10 lakhs stolen',
    GravityOffenceID: 1,
    latitude: 13.0030,
    longitude: 77.5685,
    ComplainantName: 'Bank Manager',
    AccusedName: 'Gang Members',
    DistrictID: 'DIST001',
    PoliceStationID: 'PS006'
  }
];

// Generate CSV
function generateCSV(data) {
  const headers = Object.keys(data[0]);
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csv += values.join(',') + '\n';
  });
  
  return csv;
}

// Generate JSON
function generateJSON(data) {
  return JSON.stringify(data, null, 2);
}

// Save files
const csvPath = path.join(__dirname, '../../sample_crime_data.csv');
const jsonPath = path.join(__dirname, '../../sample_crime_data.json');

fs.writeFileSync(csvPath, generateCSV(sampleData));
fs.writeFileSync(jsonPath, generateJSON(sampleData));

console.log(`✅ Sample data generated!`);
console.log(`📄 CSV: ${csvPath}`);
console.log(`📄 JSON: ${jsonPath}`);
console.log(`📊 ${sampleData.length} records created`);
