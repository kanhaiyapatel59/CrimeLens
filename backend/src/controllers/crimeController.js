/**
 * Crime Controller - Handles crime-related HTTP requests
 */

const CrimeService = require('../services/crimeService');
const CrimeIncident = require('../models/CrimeIncident');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

class CrimeController {
  static async createCrime(req, res) {
    try {
      const crime = await CrimeService.createCrime(req.body, req.userId);
      return ResponseHandler.created(res, crime, 'Crime incident created successfully');
    } catch (error) {
      logger.error('Create crime error:', error);
      if (error.message.includes('already exists')) return ResponseHandler.conflict(res, error.message);
      return ResponseHandler.error(res, error, 'Failed to create crime incident');
    }
  }

  static async getCrime(req, res) {
    try {
      const crime = await CrimeService.getCrimeById(req.params.id);
      return ResponseHandler.success(res, crime, 'Crime fetched successfully');
    } catch (error) {
      logger.error('Get crime error:', error);
      if (error.message === 'Crime not found') return ResponseHandler.notFound(res, error.message);
      return ResponseHandler.error(res, error, 'Failed to fetch crime');
    }
  }

  static async getCrimes(req, res) {
    try {
      const { page = 1, limit = 20, startDate, endDate, crimeType, district, policeStation, severity, status, timeOfDay, search } = req.query;
      const result = await CrimeService.getCrimes(
        { startDate, endDate, crimeType, district, policeStation, severity, status, timeOfDay, search },
        parseInt(page), parseInt(limit)
      );
      return ResponseHandler.success(res, result, 'Crimes fetched successfully');
    } catch (error) {
      logger.error('Get crimes error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch crimes');
    }
  }

  static async matchMO(req, res) {
    try {
      const { query } = req.body;
      const result = await CrimeService.matchMO(query);
      return ResponseHandler.success(res, result, 'MO pattern matching complete');
    } catch (error) {
      logger.error('MO match error:', error);
      return ResponseHandler.error(res, error, 'Failed to match MO pattern');
    }
  }

  static async updateCrime(req, res) {
    try {
      const crime = await CrimeService.updateCrime(req.params.id, req.body, req.userId);
      return ResponseHandler.success(res, crime, 'Crime updated successfully');
    } catch (error) {
      logger.error('Update crime error:', error);
      if (error.message === 'Crime not found') return ResponseHandler.notFound(res, error.message);
      return ResponseHandler.error(res, error, 'Failed to update crime');
    }
  }

  static async deleteCrime(req, res) {
    try {
      const result = await CrimeService.deleteCrime(req.params.id, req.userId);
      return ResponseHandler.success(res, result, 'Crime deleted successfully');
    } catch (error) {
      logger.error('Delete crime error:', error);
      if (error.message === 'Crime not found') return ResponseHandler.notFound(res, error.message);
      return ResponseHandler.error(res, error, 'Failed to delete crime');
    }
  }

  static async getStats(req, res) {
    try {
      const { startDate, endDate, district, policeStation } = req.query;
      const stats = await CrimeService.getCrimeStats({ startDate, endDate, district, policeStation });
      return ResponseHandler.success(res, stats, 'Crime statistics fetched successfully');
    } catch (error) {
      logger.error('Get crime stats error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch crime statistics');
    }
  }

  static async getTrends(req, res) {
    try {
      const { startDate, endDate, district, crimeType } = req.query;
      const trends = await CrimeService.getCrimeTrends({ startDate, endDate, district, crimeType });
      return ResponseHandler.success(res, trends, 'Crime trends fetched successfully');
    } catch (error) {
      logger.error('Get crime trends error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch crime trends');
    }
  }

  static async getHotspots(req, res) {
    try {
      const { district, days = 30, radius = 1000 } = req.query;
      const hotspots = await CrimeService.getHotspots({ district, days: parseInt(days), radius: parseInt(radius) });
      return ResponseHandler.success(res, hotspots, 'Crime hotspots fetched successfully');
    } catch (error) {
      logger.error('Get hotspots error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch crime hotspots');
    }
  }

  static async bulkUpload(req, res) {
    try {
      const userId = req.userId;
      let { crimes } = req.body;

      if (!Array.isArray(crimes)) {
        if (typeof crimes === 'string') {
          try { crimes = JSON.parse(crimes); } catch (e) {
            return ResponseHandler.badRequest(res, 'Invalid JSON format');
          }
        } else {
          return ResponseHandler.badRequest(res, 'Crimes must be an array');
        }
      }

      if (!crimes || crimes.length === 0) {
        return ResponseHandler.badRequest(res, 'No crimes to upload');
      }

      // Detect external format (CrimeNo/GravityOffenceID) and normalize
      const isExternalFormat = crimes[0] && ('CrimeNo' in crimes[0] || 'GravityOffenceID' in crimes[0]);
      if (isExternalFormat) {
        const CrimeType = require('../models/CrimeType');
        const District = require('../models/District');
        const crimeTypes = await CrimeType.find({ isActive: true }).sort({ _id: 1 }).select('_id').lean();
        const districts = await District.find({ isActive: true }).select('_id code').lean();
        const districtByCode = {};
        districts.forEach(d => { districtByCode[d.code.toUpperCase()] = d._id; });

        crimes = crimes.map(r => ({
          firNumber: String(r.CrimeNo || r.CaseNo || ''),
          incidentId: String(r.CaseNo || r.CrimeNo || ''),
          crimeType: crimeTypes[Math.max(0, parseInt(r.GravityOffenceID || 1) - 1)]?._id,
          date: r.CrimeRegisteredDate || new Date(),
          description: r.BriefFacts || 'Imported crime record',
          severity: 'medium',
          status: 'reported',
          location: {
            type: 'Point',
            coordinates: [parseFloat(r.longitude) || 77.5946, parseFloat(r.latitude) || 12.9716],
            address: {
              city: 'Bengaluru',
              district: districtByCode[(r.DistrictID || '').toUpperCase()] || null,
            },
          },
        }));
      }

      const results = { success: [], failed: [], total: crimes.length };
      const CrimeType = require('../models/CrimeType');
      const mongoose = require('mongoose');

      // Helper function for flexible case-insensitive CSV key extraction
      const getVal = (row, ...keys) => {
        if (!row || typeof row !== 'object') return null;
        const rowKeys = Object.keys(row);
        for (const k of keys) {
          const targetClean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          const matchKey = rowKeys.find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === targetClean);
          if (matchKey && row[matchKey] !== undefined && row[matchKey] !== null) {
            const val = String(row[matchKey]).trim().replace(/\r/g, '');
            if (val !== '') return val;
          }
        }
        return null;
      };

      // Get first active CrimeType as global fallback
      let defaultCrimeType = await CrimeType.findOne({ isActive: true });
      if (!defaultCrimeType) {
        defaultCrimeType = new CrimeType({ name: 'General Crime', code: 'GEN100', category: 'other', severity: 'medium' });
        await defaultCrimeType.save();
      }

      for (const r of crimes) {
        try {
          const firNumber = getVal(r, 'firNumber', 'fir_number', 'firNo', 'crimeNo', 'caseNo', 'fir');
          let incidentId = getVal(r, 'incidentId', 'incident_id', 'incidentNo', 'caseNo', 'crimeNo');
          let crimeTypeVal = getVal(r, 'crimeType', 'crime_type', 'category', 'type', 'gravityOffenceID');
          const dateStr = getVal(r, 'date', 'crimeRegisteredDate', 'incident_date', 'registeredDate');
          const description = getVal(r, 'description', 'briefFacts', 'details', 'facts') || 'Imported crime incident record';
          const severity = (getVal(r, 'severity', 'gravity') || 'medium').toLowerCase();
          const status = (getVal(r, 'status', 'caseStatus') || 'reported').toLowerCase().replace(' ', '_');
          const timeVal = getVal(r, 'time', 'incidentTime') || '00:00';

          if (!incidentId && firNumber) {
            incidentId = `INC-${firNumber}`;
          }

          if (!firNumber || !incidentId) {
            results.failed.push({ firNumber: firNumber || 'Unknown', error: 'Missing required firNumber or incidentId field' });
            continue;
          }

          // Resolve CrimeType
          let resolvedCrimeTypeId = defaultCrimeType._id;
          if (crimeTypeVal) {
            if (mongoose.Types.ObjectId.isValid(crimeTypeVal)) {
              const foundCt = await CrimeType.findById(crimeTypeVal);
              if (foundCt) {
                resolvedCrimeTypeId = foundCt._id;
              } else {
                // If ObjectId string doesn't exist in DB, create/use default
                let namedCt = await CrimeType.findOne({ name: 'Robbery' }) || defaultCrimeType;
                resolvedCrimeTypeId = namedCt._id;
              }
            } else {
              // String name (e.g. "Armed Robbery")
              let ct = await CrimeType.findOne({ name: new RegExp('^' + crimeTypeVal + '$', 'i') });
              if (!ct) {
                const nameLower = crimeTypeVal.toLowerCase();
                let category = 'violent_crime';
                if (nameLower.includes('burglary') || nameLower.includes('theft') || nameLower.includes('robbery') || nameLower.includes('snatching')) {
                  category = 'property_crime';
                } else if (nameLower.includes('cyber') || nameLower.includes('phishing') || nameLower.includes('otp') || nameLower.includes('fraud') || nameLower.includes('atm')) {
                  category = 'cyber_crime';
                } else if (nameLower.includes('drug') || nameLower.includes('narcotic')) {
                  category = 'drug_related';
                } else if (nameLower.includes('extortion') || nameLower.includes('syndicate') || nameLower.includes('gang')) {
                  category = 'organised_crime';
                }

                ct = new CrimeType({
                  name: crimeTypeVal,
                  code: crimeTypeVal.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() + Math.floor(100 + Math.random() * 900),
                  category: category,
                  severity: ['low', 'medium', 'high', 'critical'].includes(severity) ? severity : 'medium'
                });
                await ct.save();
              }
              resolvedCrimeTypeId = ct._id;
            }
          }

          // Check for duplicate FIR
          const existing = await CrimeIncident.findOne({ firNumber, deletedAt: null });
          if (existing) {
            results.failed.push({ firNumber, error: 'FIR number already exists' });
            continue;
          }

          // Check for duplicate incidentId
          const existingInc = await CrimeIncident.findOne({ incidentId, deletedAt: null });
          if (existingInc) {
            results.failed.push({ firNumber, error: 'Incident ID already exists' });
            continue;
          }

          const date = new Date(dateStr || new Date());
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const validSeverity = ['low', 'medium', 'high', 'critical'].includes(severity) ? severity : 'medium';
          const validStatus = ['reported', 'investigating', 'in_progress', 'resolved', 'closed', 'pending'].includes(status) ? status : 'reported';

          const crime = new CrimeIncident({
            firNumber,
            incidentId,
            crimeType: resolvedCrimeTypeId,
            date: isNaN(date.getTime()) ? new Date() : date,
            time: /^\d{2}:\d{2}$/.test(timeVal) ? timeVal : '00:00',
            dayOfWeek: dayNames[date.getDay()] || 'Monday',
            description,
            severity: validSeverity,
            status: validStatus,
            location: {
              type: 'Point',
              coordinates: [77.5946, 12.9716],
              address: {}
            },
            reportedBy: userId,
            reportingOfficer: userId,
            reportingDate: new Date(),
            metaData: { source: 'excel_upload' }
          });

          await crime.save();
          results.success.push({ firNumber: crime.firNumber, id: crime._id });
        } catch (err) {
          results.failed.push({ firNumber: r.firNumber || r.CrimeNo || 'Unknown', error: err.message });
        }
      }

      const message = `Uploaded ${results.success.length} of ${results.total} crimes`;
      return ResponseHandler.success(res, results, results.failed.length > 0 ? `${message} (${results.failed.length} failed)` : message);
    } catch (error) {
      logger.error('Bulk upload error:', error);
      return ResponseHandler.error(res, error, 'Bulk upload failed');
    }
  }

  static async exportCrimes(req, res) {
    try {
      const { format = 'json', startDate, endDate } = req.query;
      const crimes = await CrimeService.exportCrimes({ startDate, endDate });
      return ResponseHandler.success(res, crimes, 'Crimes exported successfully');
    } catch (error) {
      logger.error('Export crimes error:', error);
      return ResponseHandler.error(res, error, 'Failed to export crimes');
    }
  }
}

module.exports = CrimeController;
