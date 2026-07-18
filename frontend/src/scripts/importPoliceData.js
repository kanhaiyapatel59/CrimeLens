/**
 * Police Data Import Script
 * Imports data from CSV/Excel files matching the Police FIR ER Diagram
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');

// Models
const CrimeIncident = require('../models/CrimeIncident');
const Victim = require('../models/Victim');
const Suspect = require('../models/Suspect');
const Offender = require('../models/Offender');
const User = require('../models/User');
const PoliceStation = require('../models/PoliceStation');
const District = require('../models/District');
const CrimeType = require('../models/CrimeType');
const Investigation = require('../models/Investigation');
const Evidence = require('../models/Evidence');

class PoliceDataImporter {
  constructor() {
    this.stats = {
      casesImported: 0,
      victimsImported: 0,
      suspectsImported: 0,
      errors: []
    };
  }

  async connectDB() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crimelens');
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  /**
   * Import from CSV file
   */
  async importFromCSV(filePath, tableName) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log(`📊 Read ${results.length} records from ${tableName}`);
          resolve(results);
        })
        .on('error', reject);
    });
  }

  /**
   * Import from Excel file
   */
  async importFromExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log(`📊 Read ${data.length} records from Excel`);
    return data;
  }

  /**
   * Map CaseMaster to CrimeIncident
   */
  mapCaseToCrime(caseData) {
    // Parse CrimeNo format: 1 digit Category + 4 digit District + 4 digit Station + 4 digit Year + 5 digit Serial
    const crimeNo = caseData.CrimeNo || '';
    const caseNo = caseData.CaseNo || '';
    
    // Extract components from CrimeNo
    let category = crimeNo.substring(0, 1) || '';
    let districtCode = crimeNo.substring(1, 5) || '';
    let stationCode = crimeNo.substring(5, 9) || '';
    let year = crimeNo.substring(9, 13) || '';
    let serial = crimeNo.substring(13, 18) || '';

    return {
      firNumber: crimeNo,
      incidentId: caseNo || crimeNo,
      date: caseData.CrimeRegisteredDate ? new Date(caseData.CrimeRegisteredDate) : new Date(),
      time: caseData.IncidentFromDate ? new Date(caseData.IncidentFromDate).toTimeString().slice(0, 5) : '00:00',
      description: caseData.BriefFacts || 'Imported from police data',
      severity: this.mapGravityToSeverity(caseData.GravityOffenceID),
      status: this.mapCaseStatus(caseData.CaseStatusID),
      location: {
        coordinates: [
          parseFloat(caseData.longitude) || 77.5946,
          parseFloat(caseData.latitude) || 12.9716
        ],
        address: {
          street: '',
          area: '',
          city: '',
          district: caseData.DistrictID || '',
          policeStation: caseData.PoliceStationID || '',
          pincode: '',
          landmark: ''
        }
      },
      metaData: {
        source: 'police_import',
        originalData: caseData,
        caseCategory: caseData.CaseCategoryID,
        gravityOffence: caseData.GravityOffenceID,
        crimeMajorHead: caseData.CrimeMajorHeadID,
        crimeMinorHead: caseData.CrimeMinorHeadID,
        courtId: caseData.CourtID
      }
    };
  }

  /**
   * Map GravityOffenceID to severity
   */
  mapGravityToSeverity(gravityId) {
    const mapping = {
      1: 'critical',
      2: 'high',
      3: 'medium',
      4: 'low'
    };
    return mapping[gravityId] || 'medium';
  }

  /**
   * Map CaseStatusID to status
   */
  mapCaseStatus(statusId) {
    const mapping = {
      1: 'reported',
      2: 'investigating',
      3: 'in_progress',
      4: 'resolved',
      5: 'closed'
    };
    return mapping[statusId] || 'reported';
  }

  /**
   * Main import function
   */
  async importData(caseDataArray) {
    console.log('🚀 Starting police data import...');
    
    let imported = 0;
    let failed = 0;

    for (const caseData of caseDataArray) {
      try {
        // 1. Create Crime Incident
        const crimeData = this.mapCaseToCrime(caseData);
        const crime = new CrimeIncident(crimeData);
        await crime.save();
        this.stats.casesImported++;
        imported++;

        // 2. Import Complainant as Victim
        if (caseData.ComplainantName) {
          const victim = new Victim({
            firstName: caseData.ComplainantName.split(' ')[0] || '',
            lastName: caseData.ComplainantName.split(' ').slice(1).join(' ') || '',
            age: caseData.AgeYear || 0,
            contact: {
              phone: caseData.ComplainantPhone || '',
              email: caseData.ComplainantEmail || ''
            },
            crimes: [{ crime: crime._id, role: 'primary' }],
            createdBy: null
          });
          await victim.save();
          this.stats.victimsImported++;
        }

        // 3. Import Accused as Suspects
        if (caseData.AccusedName) {
          const suspect = new Suspect({
            firstName: caseData.AccusedName.split(' ')[0] || '',
            lastName: caseData.AccusedName.split(' ').slice(1).join(' ') || '',
            age: caseData.AccusedAge || 0,
            status: 'under_investigation',
            currentCrimes: [{ crime: crime._id, role: 'primary', status: 'active' }],
            createdBy: null
          });
          await suspect.save();
          this.stats.suspectsImported++;
        }

        // 4. Create Investigation
        const investigation = new Investigation({
          caseNumber: crime.firNumber,
          title: `Investigation for ${crime.firNumber}`,
          primaryCrime: crime._id,
          crimes: [crime._id],
          status: 'initiated',
          createdBy: null
        });
        await investigation.save();

        // Update crime with investigation reference
        crime.investigation = investigation._id;
        await crime.save();

        console.log(`✅ Imported case: ${crime.firNumber}`);

      } catch (error) {
        failed++;
        this.stats.errors.push({
          record: caseData,
          error: error.message
        });
        console.error(`❌ Failed to import: ${error.message}`);
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`✅ Cases Imported: ${this.stats.casesImported}`);
    console.log(`✅ Victims Imported: ${this.stats.victimsImported}`);
    console.log(`✅ Suspects Imported: ${this.stats.suspectsImported}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Errors: ${this.stats.errors.length}`);

    return this.stats;
  }
}

// Run import
const importer = new PoliceDataImporter();

// Example: Import from JSON file
async function runImport() {
  await importer.connectDB();

  // Sample data based on police ER diagram
  const sampleData = [
    {
      CrimeNo: '104430006202600001',
      CaseNo: '202600001',
      CrimeRegisteredDate: '2026-01-15T10:30:00',
      IncidentFromDate: '2026-01-15T09:00:00',
      BriefFacts: 'Robbery at MG Road, Bengaluru. Cash and valuables stolen.',
      GravityOffenceID: 2,
      CaseStatusID: 2,
      latitude: 12.9716,
      longitude: 77.5946,
      ComplainantName: 'Rajesh Kumar',
      AgeYear: 35,
      AccusedName: 'Amit Singh',
      AccusedAge: 28,
      PoliceStationID: 'PS001',
      DistrictID: 'DIST001',
      CaseCategoryID: 1,
      CrimeMajorHeadID: 1,
      CrimeMinorHeadID: 1,
      CourtID: 1
    },
    // Add more sample records...
  ];

  await importer.importData(sampleData);
  process.exit(0);
}

runImport();