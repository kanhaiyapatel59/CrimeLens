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
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        return ResponseHandler.success(res, { crimes: [], total: 0, page: 1, pages: 0 }, 'Crimes fetched (offline mode)');
      }
      const { page = 1, limit = 20, startDate, endDate, crimeType, district, policeStation, severity, status, timeOfDay, search } = req.query;
      const result = await CrimeService.getCrimes(
        { startDate, endDate, crimeType, district, policeStation, severity, status, timeOfDay, search },
        parseInt(page), parseInt(limit)
      );
      return ResponseHandler.success(res, result, 'Crimes fetched successfully');
    } catch (error) {
      logger.error('Get crimes error:', error);
      return ResponseHandler.success(res, { crimes: [], total: 0, page: 1, pages: 0 }, 'Crimes fetched (fallback)');
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
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        return ResponseHandler.error(res, 'Database connection is not ready. Please verify MongoDB is running.', 503);
      }

      const userId = req.userId;
      const validUserId = (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : null;
      let { crimes, duplicateMode = 'update' } = req.body;
      if (!duplicateMode && req.query.duplicateMode) {
        duplicateMode = req.query.duplicateMode;
      }

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

      const CrimeType = require('../models/CrimeType');
      const District = require('../models/District');
      const Victim = require('../models/Victim');
      const Suspect = require('../models/Suspect');

      // Preload active CrimeTypes and Districts in parallel for high performance
      const [allTypes, allDistricts] = await Promise.all([
        CrimeType.find({ isActive: true }).lean(),
        District.find({ isActive: true }).lean(),
      ]);

      let defaultCrimeType = allTypes[0];
      if (!defaultCrimeType) {
        defaultCrimeType = await CrimeType.create({ name: 'General Crime', code: 'GEN100', category: 'other', severity: 'medium' });
        allTypes.push(defaultCrimeType);
      }
      const defaultDistrictId = allDistricts[0]?._id || null;

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

      // Detect external format (CrimeNo/GravityOffenceID) and normalize
      const isExternalFormat = crimes[0] && ('CrimeNo' in crimes[0] || 'GravityOffenceID' in crimes[0]);
      if (isExternalFormat) {
        const districtByCode = {};
        allDistricts.forEach(d => { if (d.code) districtByCode[d.code.toUpperCase()] = d._id; });

        crimes = crimes.map(r => ({
          firNumber: String(r.CrimeNo || r.CaseNo || ''),
          incidentId: String(r.CaseNo || r.CrimeNo || ''),
          crimeType: allTypes[Math.max(0, parseInt(r.GravityOffenceID || 1) - 1)]?._id || defaultCrimeType._id,
          date: r.CrimeRegisteredDate || new Date(),
          description: r.BriefFacts || 'Imported crime record',
          severity: 'medium',
          status: 'reported',
          location: {
            type: 'Point',
            coordinates: [parseFloat(r.longitude) || 77.5946, parseFloat(r.latitude) || 12.9716],
            address: {
              city: 'Bengaluru',
              district: districtByCode[(r.DistrictID || '').toUpperCase()] || defaultDistrictId,
            },
          },
        }));
      }

      const results = {
        success: [],
        created: [],
        updated: [],
        skipped: [],
        failed: [],
        total: crimes.length
      };
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      for (let i = 0; i < crimes.length; i++) {
        const r = crimes[i];
        let firNumber = null;
        try {
          firNumber = getVal(r, 'firNumber', 'fir_number', 'firNo', 'fir_no', 'crimeNo', 'crime_no', 'caseNo', 'case_no', 'caseNumber', 'case_number', 'fir');
          let incidentId = getVal(r, 'incidentId', 'incident_id', 'incidentNo', 'incident_no', 'caseNo', 'case_no', 'crimeNo', 'crime_no');
          const crimeTypeVal = getVal(r, 'crimeType', 'crime_type', 'category', 'type', 'gravityOffenceID');
          const dateStr = getVal(r, 'date', 'crimeRegisteredDate', 'incident_date', 'registeredDate');
          const description = getVal(r, 'description', 'briefFacts', 'details', 'facts') || 'Imported crime incident record';
          const severityRaw = (getVal(r, 'severity', 'gravity') || 'medium').toLowerCase();
          const statusRaw = (getVal(r, 'status', 'caseStatus') || 'reported').toLowerCase().replace(' ', '_');
          const timeVal = getVal(r, 'time', 'incidentTime') || '00:00';
          const riskScoreVal = parseInt(getVal(r, 'riskScore', 'risk_score', 'risk'), 10);
          const victimName = getVal(r, 'victimName', 'victim_name', 'victim');
          const suspectName = getVal(r, 'suspectName', 'suspect_name', 'suspect');
          const districtVal = getVal(r, 'district', 'districtName', 'districtId', 'districtID');
          const policeStationVal = getVal(r, 'policeStation', 'police_station', 'ps', 'station');

          // Auto-generate identifiers if omitted in uploaded dataset
          if (!firNumber && incidentId) {
            firNumber = `FIR-${incidentId.replace(/^INC-?/i, '')}`;
          }
          if (!firNumber) {
            firNumber = `FIR${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`;
          }
          if (!incidentId) {
            incidentId = `INC-${firNumber}`;
          }

          // Resolve CrimeType
          let resolvedCrimeTypeId = defaultCrimeType._id;
          if (crimeTypeVal) {
            if (mongoose.Types.ObjectId.isValid(crimeTypeVal)) {
              const matchedById = allTypes.find(t => String(t._id) === String(crimeTypeVal));
              resolvedCrimeTypeId = matchedById ? matchedById._id : defaultCrimeType._id;
            } else {
              const ctLower = crimeTypeVal.toLowerCase();
              const matchedByName = allTypes.find(t => t.name.toLowerCase() === ctLower);
              if (matchedByName) {
                resolvedCrimeTypeId = matchedByName._id;
              } else {
                let category = 'violent_crime';
                if (ctLower.includes('burglary') || ctLower.includes('theft') || ctLower.includes('robbery') || ctLower.includes('snatching')) {
                  category = 'property_crime';
                } else if (ctLower.includes('cyber') || ctLower.includes('phishing') || ctLower.includes('otp') || ctLower.includes('fraud') || ctLower.includes('atm')) {
                  category = 'cyber_crime';
                } else if (ctLower.includes('drug') || ctLower.includes('narcotic')) {
                  category = 'drug_related';
                } else if (ctLower.includes('extortion') || ctLower.includes('syndicate') || ctLower.includes('gang')) {
                  category = 'organised_crime';
                }

                const newCt = new CrimeType({
                  name: crimeTypeVal,
                  code: crimeTypeVal.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() + Math.floor(100 + Math.random() * 900),
                  category: category,
                  severity: ['low', 'medium', 'high', 'critical'].includes(severityRaw) ? severityRaw : 'medium',
                });
                await newCt.save();
                allTypes.push(newCt.toObject());
                resolvedCrimeTypeId = newCt._id;
              }
            }
          }

          // Resolve Coordinates
          let coordinates = [77.5946, 12.9716];
          if (r.location && Array.isArray(r.location.coordinates) && r.location.coordinates.length === 2) {
            const pLng = parseFloat(r.location.coordinates[0]);
            const pLat = parseFloat(r.location.coordinates[1]);
            if (!isNaN(pLng) && !isNaN(pLat)) coordinates = [pLng, pLat];
          } else {
            const pLng = parseFloat(getVal(r, 'longitude', 'long', 'lng', 'lon'));
            const pLat = parseFloat(getVal(r, 'latitude', 'lat'));
            if (!isNaN(pLng) && !isNaN(pLat)) coordinates = [pLng, pLat];
          }

          // Resolve District
          let matchedDistrictId = null;
          if (districtVal) {
            const dNorm = districtVal.toLowerCase().replace(/[^a-z0-9]/g, '');
            const matched = allDistricts.find(d => 
              d.name.toLowerCase().replace(/[^a-z0-9]/g, '') === dNorm || 
              (d.code && d.code.toLowerCase().replace(/[^a-z0-9]/g, '') === dNorm) ||
              d.name.toLowerCase().includes(districtVal.toLowerCase()) ||
              districtVal.toLowerCase().includes(d.name.toLowerCase())
            );
            if (matched) matchedDistrictId = matched._id;
          }

          const parsedDate = new Date(dateStr || new Date());
          const date = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
          const validSeverity = ['low', 'medium', 'high', 'critical'].includes(severityRaw) ? severityRaw : 'medium';
          const validStatus = ['reported', 'investigating', 'in_progress', 'resolved', 'closed', 'pending'].includes(statusRaw) ? statusRaw : 'reported';
          const formattedTime = /^\d{1,2}:\d{2}$/.test(timeVal) ? (timeVal.length === 4 ? `0${timeVal}` : timeVal) : '00:00';

          const dummyCrimeId = new mongoose.Types.ObjectId();
          const victimIds = [];
          const suspectIds = [];

          // Link or create Victim document
          if (victimName && victimName !== 'Unknown' && victimName !== 'N/A') {
            const parts = victimName.split(' ');
            const victim = new Victim({
              firstName: parts[0] || 'Unknown',
              lastName: parts.slice(1).join(' ') || 'Victim',
              contact: { phone: '9845012345' },
              crimes: [{ crime: dummyCrimeId, role: 'primary' }],
            });
            await victim.save();
            victimIds.push(victim._id);
          }

          // Link or create Suspect document
          if (suspectName && suspectName !== 'Unknown Offender' && suspectName !== 'Unknown' && suspectName !== 'N/A') {
            const parts = suspectName.split(' ');
            const suspectLevel = ['low', 'medium', 'high', 'critical'].includes(validSeverity) ? validSeverity : 'high';
            const suspect = new Suspect({
              firstName: parts[0] || 'Unknown',
              lastName: parts.slice(1).join(' ') || 'Suspect',
              status: 'under_investigation',
              riskAssessment: { score: !isNaN(riskScoreVal) ? riskScoreVal : 75, level: suspectLevel },
              currentCrimes: [{ crime: dummyCrimeId, role: 'primary', status: 'active' }],
            });
            await suspect.save();
            suspectIds.push(suspect._id);
          }

          // Check for duplicate FIR / Incident ID
          let existing = await CrimeIncident.findOne({ firNumber, deletedAt: null });
          if (!existing && incidentId) {
            existing = await CrimeIncident.findOne({ incidentId, deletedAt: null });
          }

          if (existing) {
            if (duplicateMode === 'skip') {
              results.skipped.push({ firNumber, reason: 'FIR already exists in database (skipped)' });
              continue;
            } else if (duplicateMode === 'auto_rename') {
              const uniqueSuffix = `_${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
              firNumber = `${firNumber}${uniqueSuffix}`;
              incidentId = `${incidentId}${uniqueSuffix}`;
              // Fall through to create as a new incident
            } else if (duplicateMode === 'update') {
              // Update existing incident record with uploaded data
              if (resolvedCrimeTypeId) existing.crimeType = resolvedCrimeTypeId;
              if (date) existing.date = date;
              if (formattedTime) existing.time = formattedTime;
              existing.dayOfWeek = dayNames[date.getDay()] || existing.dayOfWeek || 'Monday';
              if (description) existing.description = description;
              if (validSeverity) existing.severity = validSeverity;
              if (!isNaN(riskScoreVal)) existing.riskScore = Math.min(100, Math.max(0, riskScoreVal));
              if (validStatus) existing.status = validStatus;
              if (coordinates && coordinates.length === 2) existing.location.coordinates = coordinates;
              if (matchedDistrictId) existing.location.address.district = matchedDistrictId;
              if (policeStationVal) {
                existing.location.address.street = policeStationVal;
                existing.location.address.area = policeStationVal;
              }
              if (victimIds.length > 0) existing.victims = [...(existing.victims || []), ...victimIds];
              if (suspectIds.length > 0) existing.suspects = [...(existing.suspects || []), ...suspectIds];
              await existing.save();

              results.updated.push({ firNumber: existing.firNumber, id: existing._id });
              results.success.push({ firNumber: existing.firNumber, id: existing._id, action: 'updated' });
              continue;
            } else {
              // 'reject' mode
              results.failed.push({
                firNumber,
                error: 'FIR number already exists. Select "Update" or "Auto-rename" mode to import duplicates.'
              });
              continue;
            }
          }

          const crime = new CrimeIncident({
            _id: dummyCrimeId,
            firNumber,
            incidentId,
            crimeType: resolvedCrimeTypeId,
            date: date,
            time: formattedTime,
            dayOfWeek: dayNames[date.getDay()] || 'Monday',
            description,
            severity: validSeverity,
            riskScore: !isNaN(riskScoreVal) ? Math.min(100, Math.max(0, riskScoreVal)) : 50,
            status: validStatus,
            victims: victimIds,
            suspects: suspectIds,
            location: {
              type: 'Point',
              coordinates,
              address: {
                city: getVal(r, 'city') || districtVal || 'Bengaluru',
                district: matchedDistrictId || defaultDistrictId,
                street: policeStationVal || getVal(r, 'street', 'area') || '',
                area: policeStationVal || '',
                landmark: getVal(r, 'landmark') || '',
              },
            },
            reportedBy: validUserId,
            reportingOfficer: validUserId,
            reportingDate: new Date(),
            metaData: { source: 'bulk_upload' },
          });

          await crime.save();
          results.created.push({ firNumber: crime.firNumber, id: crime._id });
          results.success.push({ firNumber: crime.firNumber, id: crime._id, action: 'created' });
        } catch (err) {
          const rowIdent = firNumber || getVal(r, 'firNumber', 'crimeNo', 'caseNo') || `Row ${i + 1}`;
          results.failed.push({ firNumber: rowIdent, error: err.message || 'Row rejected' });
        }
      }

      const summaryParts = [];
      if (results.created.length > 0) summaryParts.push(`${results.created.length} created`);
      if (results.updated.length > 0) summaryParts.push(`${results.updated.length} updated`);
      if (results.skipped.length > 0) summaryParts.push(`${results.skipped.length} skipped`);
      if (results.failed.length > 0) summaryParts.push(`${results.failed.length} failed`);
      const message = `Processed ${results.total} records (${summaryParts.join(', ') || '0 processed'})`;

      return ResponseHandler.success(res, results, message);
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
