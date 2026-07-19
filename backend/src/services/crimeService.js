/**
 * Crime Service - Business logic for crime management
 */

const mongoose = require('mongoose');
const CrimeIncident = require('../models/CrimeIncident');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

class CrimeService {
  /**
   * Create a new crime incident
   */
  static async createCrime(crimeData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if FIR number already exists
      const existing = await CrimeIncident.findOne({ 
        firNumber: crimeData.firNumber,
        deletedAt: null 
      });

      if (existing) {
        throw new Error('FIR number already exists');
      }

      // Check if incident ID already exists
      const existingIncident = await CrimeIncident.findOne({
        incidentId: crimeData.incidentId,
        deletedAt: null
      });

      if (existingIncident) {
        throw new Error('Incident ID already exists');
      }

      // Set day of week
      const date = new Date(crimeData.date);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      crimeData.dayOfWeek = days[date.getDay()];

      // Create crime
      const crime = new CrimeIncident({
        ...crimeData,
        reportedBy: userId,
        reportingOfficer: userId,
        reportingDate: new Date()
      });

      await crime.save({ session });

      // Log creation
      const auditLog = new AuditLog({
        action: 'Create Crime',
        description: `Crime incident ${crime.firNumber} created`,
        user: userId,
        module: 'crime',
        actionType: 'create',
        resource: {
          model: 'CrimeIncident',
          id: crime._id,
          name: crime.firNumber
        },
        changes: {
          after: crime.toObject()
        },
        status: 'success'
      });
      await auditLog.save({ session });

      await session.commitTransaction();
      session.endSession();

      return crime.populate([
        { path: 'crimeType' },
        { path: 'location.address.district' },
        { path: 'location.address.policeStation' },
        { path: 'victims' },
        { path: 'suspects' }
      ]);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get crime by ID
   */
  static async getCrimeById(crimeId) {
    const crime = await CrimeIncident.findOne({
      _id: crimeId,
      deletedAt: null
    })
    .populate('crimeType')
    .populate('location.address.district')
    .populate('location.address.policeStation')
    .populate('victims')
    .populate('suspects')
    .populate('offenders')
    .populate('evidence')
    .populate('investigation')
    .populate('reportedBy', 'firstName lastName email')
    .populate('reportingOfficer', 'firstName lastName email');

    if (!crime) {
      throw new Error('Crime not found');
    }

    return crime;
  }

  /**
   * Get crimes with filters and pagination
   */
  static async getCrimes(filters = {}, page = 1, limit = 20) {
    const query = { deletedAt: null };

    // Apply filters
    if (filters.startDate) {
      query.date = { ...query.date, $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      query.date = { ...query.date, $lte: new Date(filters.endDate) };
    }
    if (filters.crimeType) {
      query.crimeType = filters.crimeType;
    }
    if (filters.district) {
      query['location.address.district'] = filters.district;
    }
    if (filters.policeStation) {
      query['location.address.policeStation'] = filters.policeStation;
    }
    if (filters.severity) {
      query.severity = filters.severity;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.search) {
      query.$or = [
        { firNumber: { $regex: filters.search, $options: 'i' } },
        { incidentId: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query with population
    const [crimes, total] = await Promise.all([
      CrimeIncident.find(query)
        .populate('crimeType')
        .populate('location.address.district')
        .populate('location.address.policeStation')
        .populate('reportedBy', 'firstName lastName email')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CrimeIncident.countDocuments(query)
    ]);

    return {
      crimes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update crime
   */
  static async updateCrime(crimeId, updateData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get existing crime
      const existingCrime = await CrimeIncident.findById(crimeId);
      if (!existingCrime || existingCrime.deletedAt) {
        throw new Error('Crime not found');
      }

      // Store before state for audit
      const beforeState = existingCrime.toObject();

      // Update date's day of week if date is updated
      if (updateData.date) {
        const date = new Date(updateData.date);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        updateData.dayOfWeek = days[date.getDay()];
      }

      // Update crime
      const updatedCrime = await CrimeIncident.findByIdAndUpdate(
        crimeId,
        {
          ...updateData,
          updatedBy: userId
        },
        { new: true, runValidators: true }
      );

      if (!updatedCrime) {
        throw new Error('Crime not found');
      }

      // Log update
      const auditLog = new AuditLog({
        action: 'Update Crime',
        description: `Crime incident ${updatedCrime.firNumber} updated`,
        user: userId,
        module: 'crime',
        actionType: 'update',
        resource: {
          model: 'CrimeIncident',
          id: updatedCrime._id,
          name: updatedCrime.firNumber
        },
        changes: {
          before: beforeState,
          after: updatedCrime.toObject()
        },
        status: 'success'
      });
      await auditLog.save({ session });

      await session.commitTransaction();
      session.endSession();

      return updatedCrime.populate([
        { path: 'crimeType' },
        { path: 'location.address.district' },
        { path: 'location.address.policeStation' },
        { path: 'victims' },
        { path: 'suspects' }
      ]);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Delete crime (soft delete)
   */
  static async deleteCrime(crimeId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const crime = await CrimeIncident.findById(crimeId);
      if (!crime || crime.deletedAt) {
        throw new Error('Crime not found');
      }

      // Soft delete
      crime.deletedAt = new Date();
      crime.deletedBy = userId;
      await crime.save({ session });

      // Log deletion
      const auditLog = new AuditLog({
        action: 'Delete Crime',
        description: `Crime incident ${crime.firNumber} deleted`,
        user: userId,
        module: 'crime',
        actionType: 'delete',
        resource: {
          model: 'CrimeIncident',
          id: crime._id,
          name: crime.firNumber
        },
        changes: {
          before: crime.toObject()
        },
        status: 'success'
      });
      await auditLog.save({ session });

      await session.commitTransaction();
      session.endSession();

      return { message: 'Crime deleted successfully' };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get crime statistics
   */
  static async getCrimeStats(filters = {}) {
    const match = { deletedAt: null };

    if (filters.startDate) {
      match.date = { ...match.date, $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      match.date = { ...match.date, $lte: new Date(filters.endDate) };
    }
    if (filters.district) {
      match['location.address.district'] = new mongoose.Types.ObjectId(filters.district);
    }
    if (filters.policeStation) {
      match['location.address.policeStation'] = new mongoose.Types.ObjectId(filters.policeStation);
    }

    const stats = await CrimeIncident.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalCrimes: { $sum: 1 },
          bySeverity: {
            $push: '$severity'
          },
          byStatus: {
            $push: '$status'
          },
          byCrimeType: {
            $push: '$crimeType'
          },
          averageRiskScore: { $avg: '$riskScore' },
          highRiskCount: {
            $sum: {
              $cond: [{ $gte: ['$riskScore', 70] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'crimetypes',
          localField: 'byCrimeType',
          foreignField: '_id',
          as: 'crimeTypes'
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        totalCrimes: 0,
        bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
        byStatus: { reported: 0, investigating: 0, in_progress: 0, resolved: 0, closed: 0, pending: 0 },
        byCrimeType: [],
        averageRiskScore: 0,
        highRiskCount: 0
      };
    }

    const result = stats[0];
    
    // Count severity
    const severityCount = { low: 0, medium: 0, high: 0, critical: 0 };
    result.bySeverity.forEach(s => {
      if (severityCount[s] !== undefined) severityCount[s]++;
    });

    // Count status
    const statusCount = { reported: 0, investigating: 0, in_progress: 0, resolved: 0, closed: 0, pending: 0 };
    result.byStatus.forEach(s => {
      if (statusCount[s] !== undefined) statusCount[s]++;
    });

    // Count crime types
    const crimeTypeCount = {};
    result.byCrimeType.forEach(id => {
      const idStr = id.toString();
      crimeTypeCount[idStr] = (crimeTypeCount[idStr] || 0) + 1;
    });

    const crimeTypes = result.crimeTypes.map(ct => ({
      _id: ct._id,
      name: ct.name,
      count: crimeTypeCount[ct._id.toString()] || 0,
      category: ct.category,
      severity: ct.severity,
      color: ct.visual?.color || '#000'
    }));

    return {
      totalCrimes: result.totalCrimes,
      bySeverity: severityCount,
      byStatus: statusCount,
      byCrimeType: crimeTypes,
      averageRiskScore: result.averageRiskScore || 0,
      highRiskCount: result.highRiskCount || 0
    };
  }

  /**
   * Get crime trends over time
   */
  static async getCrimeTrends(filters = {}) {
    const match = { deletedAt: null };

    if (filters.startDate) {
      match.date = { ...match.date, $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      match.date = { ...match.date, $lte: new Date(filters.endDate) };
    }
    if (filters.district) {
      match['location.address.district'] = new mongoose.Types.ObjectId(filters.district);
    }
    if (filters.crimeType) {
      match.crimeType = new mongoose.Types.ObjectId(filters.crimeType);
    }

    const trends = await CrimeIncident.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          count: { $sum: 1 },
          crimes: { $push: '$$ROOT' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          count: 1,
          _id: 0
        }
      }
    ]);

    return trends;
  }

  /**
   * Get crime hotspots
   */
  static async getHotspots(filters = {}) {
    const match = { deletedAt: null };

    if (filters.district) {
      match['location.address.district'] = new mongoose.Types.ObjectId(filters.district);
    }
    if (filters.days) {
      const date = new Date();
      date.setDate(date.getDate() - filters.days);
      match.date = { $gte: date };
    }

    const hotspots = await CrimeIncident.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            coordinates: '$location.coordinates'
          },
          count: { $sum: 1 },
          crimes: { $push: '$$ROOT' },
          severity: { $max: '$severity' },
          lastOccurrence: { $max: '$date' }
        }
      },
      {
        $project: {
          location: {
            type: 'Point',
            coordinates: '$_id.coordinates'
          },
          count: 1,
          severity: 1,
          lastOccurrence: 1,
          crimeTypes: {
            $map: {
              input: '$crimes',
              as: 'crime',
              in: '$$crime.crimeType'
            }
          },
          _id: 0
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    return hotspots;
  }

  /**
   * Bulk upload crimes
   */
  static async bulkUpload(crimes, userId) {
    const results = {
      success: [],
      failed: [],
      total: crimes.length
    };

    for (const crimeData of crimes) {
      try {
        const crime = await this.createCrime(crimeData, userId);
        results.success.push({
          firNumber: crime.firNumber,
          id: crime._id
        });
      } catch (error) {
        results.failed.push({
          firNumber: crimeData.firNumber || 'Unknown',
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Export crimes
   */
  static async exportCrimes(filters = {}) {
    const query = { deletedAt: null };

    if (filters.startDate) {
      query.date = { ...query.date, $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      query.date = { ...query.date, $lte: new Date(filters.endDate) };
    }

    const crimes = await CrimeIncident.find(query)
      .populate('crimeType')
      .populate('location.address.district')
      .populate('location.address.policeStation')
      .lean();

    return crimes;
  }
}

module.exports = CrimeService;