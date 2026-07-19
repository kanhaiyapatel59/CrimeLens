/**
 * Upload Controller - Handles data upload and extraction
 */

const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const CrimeIncident = require('../models/CrimeIncident');
const Victim = require('../models/Victim');
const Suspect = require('../models/Suspect');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV, Excel, and JSON files are allowed'));
    }
  }
});

class UploadController {
  /**
   * Upload and extract data from file
   */
  static async uploadData(req, res) {
    try {
      if (!req.file) {
        return ResponseHandler.badRequest(res, 'No file uploaded');
      }

      const filePath = req.file.path;
      const ext = path.extname(req.file.originalname).toLowerCase();
      let data = [];

      // Extract data based on file type
      if (ext === '.csv') {
        data = await UploadController.parseCSV(filePath);
      } else if (ext === '.xlsx' || ext === '.xls') {
        data = UploadController.parseExcel(filePath);
      } else if (ext === '.json') {
        data = UploadController.parseJSON(filePath);
      }

      // Clean up file
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        logger.warn('Could not delete uploaded file:', e.message);
      }

      // Map data to CrimeLens schema
      const mappedData = UploadController.mapPoliceData(data);

      // Import data
      const result = await UploadController.importMappedData(mappedData);

      return ResponseHandler.success(res, result, 'Data imported successfully');
    } catch (error) {
      logger.error('Upload error:', error);
      return ResponseHandler.error(res, error, 'Failed to process upload');
    }
  }

  /**
   * Parse CSV file
   */
  static parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  /**
   * Parse Excel file
   */
  static parseExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  }

  /**
   * Parse JSON file
   */
  static parseJSON(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  }

  /**
   * Map police data to CrimeLens schema - UPDATED with victims/suspects
   */
  static mapPoliceData(data) {
    return data.map(record => ({
      firNumber: String(record.CrimeNo || record.firNumber || `FIR${Date.now()}`),
      incidentId: String(record.CaseNo || record.incidentId || `INC${Date.now()}`),
      crimeType: record.CrimeType || record.crimeType || '6a5b1fac7b17180638046a6b',
      date: record.CrimeRegisteredDate || record.date || new Date(),
      description: record.BriefFacts || record.description || 'Imported from police data',
      severity: UploadController.mapSeverity(record.GravityOffenceID || record.severity),
      status: UploadController.mapStatus(record.CaseStatusID || record.status || 'reported'),
      // ✅ NEW: Support victims and suspects from CSV
      victims: record.victims || record.Victims || '',
      suspects: record.suspects || record.Suspects || '',
      location: {
        coordinates: [
          parseFloat(record.longitude) || 77.5946,
          parseFloat(record.latitude) || 12.9716
        ],
        address: {
          street: record.Street || '',
          area: record.Area || '',
          city: record.City || 'Bengaluru',
          district: record.DistrictID || '',
          policeStation: record.PoliceStationID || '',
          pincode: record.Pincode || '',
          landmark: record.Landmark || ''
        }
      },
      complainant: {
        name: record.ComplainantName || record.complainantName || '',
        age: record.AgeYear || record.age || 0
      },
      accused: {
        name: record.AccusedName || record.accusedName || '',
        age: record.AccusedAge || record.age || 0
      }
    }));
  }

  /**
   * Map severity
   */
  static mapSeverity(value) {
    const map = {
      1: 'critical',
      2: 'high',
      3: 'medium',
      4: 'low',
      'critical': 'critical',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    };
    return map[value] || 'medium';
  }

  /**
   * Map status
   */
  static mapStatus(value) {
    const map = {
      1: 'reported',
      2: 'investigating',
      3: 'in_progress',
      4: 'resolved',
      5: 'closed',
      'reported': 'reported',
      'investigating': 'investigating',
      'in_progress': 'in_progress',
      'resolved': 'resolved',
      'closed': 'closed'
    };
    return map[value] || 'reported';
  }

  /**
   * Import mapped data - UPDATED with victims/suspects creation
   */
  static async importMappedData(mappedData) {
    const results = {
      success: [],
      failed: [],
      total: mappedData.length,
      crimes: 0,
      victims: 0,
      suspects: 0
    };

    for (const record of mappedData) {
      try {
        // ✅ Create crime
        const crime = new CrimeIncident({
          firNumber: record.firNumber,
          incidentId: record.incidentId,
          crimeType: record.crimeType,
          date: new Date(record.date),
          description: record.description,
          severity: record.severity,
          status: record.status,
          location: record.location,
          metaData: {
            source: 'police_import',
            complainant: record.complainant,
            accused: record.accused,
            victims: record.victims,
            suspects: record.suspects
          }
        });
        await crime.save();
        results.crimes++;

        // ✅ Create Victims from CSV (pipe separated)
        if (record.victims && typeof record.victims === 'string') {
          const victimNames = record.victims.split('|').map(v => v.trim()).filter(v => v);
          for (const name of victimNames) {
            const parts = name.split(' ');
            const victim = new Victim({
              firstName: parts[0] || name,
              lastName: parts.slice(1).join(' ') || '',
              crimes: [{ crime: crime._id, role: 'primary' }],
              createdBy: null
            });
            await victim.save();
            results.victims++;

            // ✅ Update crime with victim reference
            await CrimeIncident.findByIdAndUpdate(crime._id, {
              $push: { victims: victim._id }
            });
          }
        }

        // ✅ Create Suspects from CSV (pipe separated)
        if (record.suspects && typeof record.suspects === 'string') {
          const suspectNames = record.suspects.split('|').map(s => s.trim()).filter(s => s);
          for (const name of suspectNames) {
            const parts = name.split(' ');
            const suspect = new Suspect({
              firstName: parts[0] || name,
              lastName: parts.slice(1).join(' ') || '',
              status: 'under_investigation',
              currentCrimes: [{ crime: crime._id, role: 'primary', status: 'active' }],
              createdBy: null
            });
            await suspect.save();
            results.suspects++;

            // ✅ Update crime with suspect reference
            await CrimeIncident.findByIdAndUpdate(crime._id, {
              $push: { suspects: suspect._id }
            });
          }
        }

        // ✅ Create victim from complainant (if exists and no victims were added)
        if (record.complainant.name && results.victims === 0) {
          const victim = new Victim({
            firstName: record.complainant.name.split(' ')[0] || '',
            lastName: record.complainant.name.split(' ').slice(1).join(' ') || '',
            age: record.complainant.age || 0,
            crimes: [{ crime: crime._id, role: 'primary' }],
            createdBy: null
          });
          await victim.save();
          results.victims++;
          await CrimeIncident.findByIdAndUpdate(crime._id, {
            $push: { victims: victim._id }
          });
        }

        // ✅ Create suspect from accused (if exists and no suspects were added)
        if (record.accused.name && results.suspects === 0) {
          const suspect = new Suspect({
            firstName: record.accused.name.split(' ')[0] || '',
            lastName: record.accused.name.split(' ').slice(1).join(' ') || '',
            age: record.accused.age || 0,
            status: 'under_investigation',
            currentCrimes: [{ crime: crime._id, role: 'primary', status: 'active' }],
            createdBy: null
          });
          await suspect.save();
          results.suspects++;
          await CrimeIncident.findByIdAndUpdate(crime._id, {
            $push: { suspects: suspect._id }
          });
        }

        results.success.push({ firNumber: record.firNumber, id: crime._id });
        console.log(`✅ Created: ${record.firNumber} with ${results.victims} victims and ${results.suspects} suspects`);
      } catch (error) {
        console.error(`❌ Failed: ${record.firNumber} - ${error.message}`);
        results.failed.push({ 
          record: record.firNumber || 'Unknown', 
          error: error.message 
        });
      }
    }

    console.log(`📊 Import Summary: ${results.crimes} crimes, ${results.victims} victims, ${results.suspects} suspects`);
    return results;
  }
}

module.exports = { UploadController, upload };