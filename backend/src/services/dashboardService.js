/**
 * Dashboard Service - Business logic for dashboard analytics
 */

const mongoose = require('mongoose');
const CrimeIncident = require('../models/CrimeIncident');
const District = require('../models/District');
const PoliceStation = require('../models/PoliceStation');
const logger = require('../utils/logger');

class DashboardService {
  /**
   * Get KPIs (Key Performance Indicators)
   */
  static async getKPIs(filters = {}) {
    const match = { deletedAt: null };

    if (filters.startDate) {
      match.date = { ...match.date, $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      match.date = { ...match.date, $lte: new Date(filters.endDate) };
    }

    // Count total crimes
    const totalCrimes = await CrimeIncident.countDocuments(match);

    // Count by severity
    const bySeverity = await CrimeIncident.aggregate([
      { $match: match },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Count by status
    const byStatus = await CrimeIncident.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // High risk count
    const highRiskCount = await CrimeIncident.countDocuments({
      ...match,
      riskScore: { $gte: 70 }
    });

    // Average risk score
    const avgRisk = await CrimeIncident.aggregate([
      { $match: match },
      { $group: { _id: null, avg: { $avg: '$riskScore' } } }
    ]);

    const severityCount = { low: 0, medium: 0, high: 0, critical: 0 };
    bySeverity.forEach(s => {
      if (severityCount[s._id] !== undefined) {
        severityCount[s._id] = s.count;
      }
    });

    const statusCount = { 
      reported: 0, investigating: 0, in_progress: 0, 
      resolved: 0, closed: 0, pending: 0 
    };
    byStatus.forEach(s => {
      if (statusCount[s._id] !== undefined) {
        statusCount[s._id] = s.count;
      }
    });

    // ✅ FIXED: Get ALL trend data (not just last 30 days)
    // Get the minimum date from the database
    const minDateResult = await CrimeIncident.aggregate([
      { $match: match },
      { $group: { _id: null, minDate: { $min: '$date' } } }
    ]);
    
    const minDate = minDateResult[0]?.minDate || new Date('2024-01-01');
    
    // If startDate filter is provided, use it, otherwise use min date
    const startDate = filters.startDate ? new Date(filters.startDate) : minDate;
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();

    const recentTrend = await CrimeIncident.aggregate([
      {
        $match: {
          ...match,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // ✅ Debug log
    console.log('📊 Recent Trend length:', recentTrend.length);

    return {
      totalCrimes,
      percentChange: 0,
      severity: severityCount,
      status: statusCount,
      highRiskCount,
      averageRiskScore: Math.round((avgRisk[0]?.avg || 0) * 10) / 10,
      recentTrend: recentTrend.map(t => ({
        date: `${t._id.year}-${String(t._id.month).padStart(2, '0')}-${String(t._id.day).padStart(2, '0')}`,
        count: t.count
      })),
      topDistricts: []
    };
  }

  /**
   * Get chart data
   */
  static async getChartData(filters = {}, chartType = 'bar', groupBy = 'crimeType', limit = 10) {
    const match = { deletedAt: null };

    if (filters.startDate) {
      match.date = { ...match.date, $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      match.date = { ...match.date, $lte: new Date(filters.endDate) };
    }

    let groupByField;
    let lookupCollection;

    switch (groupBy) {
      case 'crimeType':
        groupByField = '$crimeType';
        lookupCollection = 'crimetypes';
        break;
      case 'district':
        groupByField = '$location.address.district';
        lookupCollection = 'districts';
        break;
      case 'severity':
        groupByField = '$severity';
        lookupCollection = null;
        break;
      case 'status':
        groupByField = '$status';
        lookupCollection = null;
        break;
      default:
        groupByField = '$crimeType';
        lookupCollection = 'crimetypes';
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: groupByField,
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ];

    if (lookupCollection) {
      pipeline.push({
        $lookup: {
          from: lookupCollection,
          localField: '_id',
          foreignField: '_id',
          as: 'lookup'
        }
      });
      pipeline.push({ $unwind: { path: '$lookup', preserveNullAndEmptyArrays: true } });
    }

    const data = await CrimeIncident.aggregate(pipeline);

    const labels = [];
    const values = [];

    data.forEach((item) => {
      let label = item._id || 'Unknown';
      
      if (item.lookup) {
        label = item.lookup.name || label;
      } else if (groupBy === 'severity') {
        const severityMap = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
        label = severityMap[item._id] || item._id;
      } else if (groupBy === 'status') {
        const statusMap = {
          reported: 'Reported',
          investigating: 'Investigating',
          in_progress: 'In Progress',
          resolved: 'Resolved',
          closed: 'Closed',
          pending: 'Pending'
        };
        label = statusMap[item._id] || item._id;
      }

      labels.push(label);
      values.push(item.count);
    });

    const colors = ['#1a237e', '#3949ab', '#5c6bc0', '#7986cb', '#9fa8da', '#c5cae9', '#e8eaf6'];

    return {
      chartType,
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, values.length),
        borderColor: colors.slice(0, values.length),
        label: 'Crime Count'
      }],
      metadata: {
        total: values.reduce((a, b) => a + b, 0)
      }
    };
  }

  /**
   * Get overview summary
   */
  static async getOverview(filters = {}) {
    const match = { deletedAt: null };

    // Get date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
      CrimeIncident.countDocuments({ ...match, date: { $gte: today } }),
      CrimeIncident.countDocuments({ ...match, date: { $gte: weekStart } }),
      CrimeIncident.countDocuments({ ...match, date: { $gte: monthStart } }),
      CrimeIncident.countDocuments(match)
    ]);

    const districtCount = await District.countDocuments({ isActive: true });
    const stationCount = await PoliceStation.countDocuments({ isActive: true });

    return {
      summary: {
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        total: totalCount,
        weekTrend: 0
      },
      recentCrimes: [],
      systemStats: {
        districts: districtCount,
        policeStations: stationCount,
        solvedRate: 0
      }
    };
  }

  /**
   * Get district comparison
   */
  static async getDistrictComparison(filters = {}) {
    return [];
  }

  /**
   * Get heatmap data
   */
  static async getHeatmapData(filters = {}) {
    const match = { deletedAt: null };

    if (filters.startDate) {
      match.date = { ...match.date, $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      match.date = { ...match.date, $lte: new Date(filters.endDate) };
    }

    const heatmapData = await CrimeIncident.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            lat: { $arrayElemAt: ['$location.coordinates', 1] },
            lng: { $arrayElemAt: ['$location.coordinates', 0] }
          },
          count: { $sum: 1 },
          severity: { $max: '$severity' }
        }
      },
      {
        $project: {
          location: {
            lat: '$_id.lat',
            lng: '$_id.lng'
          },
          count: 1,
          severity: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } },
      { $limit: 100 }
    ]);

    return heatmapData;
  }

  /**
   * Get recent alerts
   */
  static async getRecentAlerts(filters = {}) {
    const Alert = require('../models/Alert');
    
    const query = {
      status: { $in: ['active', 'dispatched'] },
      isExpired: false
    };

    const alerts = await Alert.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ severity: -1, createdAt: -1 })
      .limit(10);

    return alerts;
  }

  /**
   * Get timeline data
   */
  static async getTimeline(filters = {}) {
    const match = { deletedAt: null };

    if (filters.startDate) {
      match.date = { ...match.date, $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      match.date = { ...match.date, $lte: new Date(filters.endDate) };
    }

    const timeline = await CrimeIncident.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: 1
            }
          },
          count: 1,
          _id: 0
        }
      }
    ]);

    return timeline;
  }
}

module.exports = DashboardService;