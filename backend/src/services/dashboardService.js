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

    // Apply filters
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

    // Get date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Aggregate KPIs
    const [kpis, recentTrend, districtStats] = await Promise.all([
      // Main KPIs
      CrimeIncident.aggregate([
        { $match: match },
        {
          $facet: {
            total: [{ $count: 'count' }],
            bySeverity: [
              { $group: { _id: '$severity', count: { $sum: 1 } } }
            ],
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],
            highRisk: [
              { $match: { riskScore: { $gte: 70 } } },
              { $count: 'count' }
            ],
            avgRisk: [
              { $group: { _id: null, avg: { $avg: '$riskScore' } } }
            ]
          }
        }
      ]),

      // Recent trend (last 30 days)
      CrimeIncident.aggregate([
        {
          $match: {
            ...match,
            date: { $gte: thirtyDaysAgo }
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
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        { $limit: 30 }
      ]),

      // District stats (top 5)
      CrimeIncident.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$location.address.district',
            count: { $sum: 1 },
            avgRisk: { $avg: '$riskScore' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'districts',
            localField: '_id',
            foreignField: '_id',
            as: 'district'
          }
        },
        { $unwind: '$district' },
        {
          $project: {
            districtName: '$district.name',
            count: 1,
            avgRisk: 1,
            districtCode: '$district.code'
          }
        }
      ])
    ]);

    // Calculate percentage changes
    const previousPeriodMatch = { ...match };
    const previousStart = new Date(filters.startDate || thirtyDaysAgo);
    previousStart.setDate(previousStart.getDate() - 30);
    const previousEnd = new Date(filters.startDate || thirtyDaysAgo);

    const previousPeriod = await CrimeIncident.countDocuments({
      ...previousPeriodMatch,
      date: { $gte: previousStart, $lte: previousEnd }
    });

    const currentPeriod = kpis[0]?.total[0]?.count || 0;
    const percentChange = previousPeriod > 0 
      ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 
      : 0;

    // Format response
    const severityCount = { low: 0, medium: 0, high: 0, critical: 0 };
    kpis[0]?.bySeverity?.forEach(s => {
      severityCount[s._id] = s.count;
    });

    const statusCount = { 
      reported: 0, investigating: 0, in_progress: 0, 
      resolved: 0, closed: 0, pending: 0 
    };
    kpis[0]?.byStatus?.forEach(s => {
      if (statusCount[s._id] !== undefined) {
        statusCount[s._id] = s.count;
      }
    });

    return {
      totalCrimes: currentPeriod,
      percentChange: Math.round(percentChange * 10) / 10,
      severity: severityCount,
      status: statusCount,
      highRiskCount: kpis[0]?.highRisk?.[0]?.count || 0,
      averageRiskScore: Math.round((kpis[0]?.avgRisk?.[0]?.avg || 0) * 10) / 10,
      recentTrend: recentTrend.map(t => ({
        date: `${t._id.year}-${String(t._id.month).padStart(2, '0')}-${String(t._id.day).padStart(2, '0')}`,
        count: t.count
      })),
      topDistricts: districtStats
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
    if (filters.district) {
      match['location.address.district'] = new mongoose.Types.ObjectId(filters.district);
    }
    if (filters.policeStation) {
      match['location.address.policeStation'] = new mongoose.Types.ObjectId(filters.policeStation);
    }

    let groupByField;
    let lookupCollection;
    let lookupField;

    switch (groupBy) {
      case 'crimeType':
        groupByField = '$crimeType';
        lookupCollection = 'crimetypes';
        lookupField = 'name';
        break;
      case 'district':
        groupByField = '$location.address.district';
        lookupCollection = 'districts';
        lookupField = 'name';
        break;
      case 'severity':
        groupByField = '$severity';
        lookupCollection = null;
        break;
      case 'status':
        groupByField = '$status';
        lookupCollection = null;
        break;
      case 'day':
        groupByField = { $dayOfWeek: '$date' };
        lookupCollection = null;
        break;
      case 'week':
        groupByField = { $week: '$date' };
        lookupCollection = null;
        break;
      case 'month':
        groupByField = { $month: '$date' };
        lookupCollection = null;
        break;
      default:
        groupByField = '$crimeType';
        lookupCollection = 'crimetypes';
        lookupField = 'name';
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: groupByField,
          count: { $sum: 1 },
          avgRisk: { $avg: '$riskScore' },
          severity: { $push: '$severity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ];

    // Add lookup for references
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

    // Format data
    const labels = [];
    const values = [];
    const colors = [];

    const colorPalette = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
    ];

    data.forEach((item, index) => {
      let label = item._id;
      
      if (lookupCollection === 'crimetypes' && item.lookup) {
        label = item.lookup.name;
      } else if (lookupCollection === 'districts' && item.lookup) {
        label = item.lookup.name;
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
      } else if (groupBy === 'day') {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        label = days[item._id - 1] || item._id;
      } else if (groupBy === 'week') {
        label = `Week ${item._id}`;
      } else if (groupBy === 'month') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = months[item._id - 1] || item._id;
      }

      labels.push(label);
      values.push(item.count);
      colors.push(colorPalette[index % colorPalette.length]);
    });

    return {
      chartType,
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: colors,
        label: 'Crime Count'
      }],
      metadata: {
        total: values.reduce((a, b) => a + b, 0),
        average: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      }
    };
  }

  /**
   * Get overview summary
   */
  static async getOverview(filters = {}) {
    const match = { deletedAt: null };

    if (filters.district) {
      match['location.address.district'] = new mongoose.Types.ObjectId(filters.district);
    }

    // Get date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const yearStart = new Date(today.getFullYear(), 0, 1);

    const [
      todayCount,
      weekCount,
      monthCount,
      yearCount,
      totalCount,
      recentCrimes,
      districtCount,
      stationCount
    ] = await Promise.all([
      CrimeIncident.countDocuments({ ...match, date: { $gte: today } }),
      CrimeIncident.countDocuments({ ...match, date: { $gte: weekStart } }),
      CrimeIncident.countDocuments({ ...match, date: { $gte: monthStart } }),
      CrimeIncident.countDocuments({ ...match, date: { $gte: yearStart } }),
      CrimeIncident.countDocuments(match),
      CrimeIncident.find(match)
        .populate('crimeType', 'name')
        .populate('location.address.district', 'name')
        .sort({ date: -1 })
        .limit(5)
        .lean(),
      District.countDocuments({ isActive: true }),
      PoliceStation.countDocuments({ isActive: true })
    ]);

    // Calculate trends
    const prevWeek = new Date(weekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    const prevWeekCount = await CrimeIncident.countDocuments({
      ...match,
      date: { $gte: prevWeek, $lt: weekStart }
    });

    const weekTrend = prevWeekCount > 0 
      ? ((weekCount - prevWeekCount) / prevWeekCount) * 100 
      : 0;

    return {
      summary: {
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        thisYear: yearCount,
        total: totalCount,
        weekTrend: Math.round(weekTrend * 10) / 10
      },
      recentCrimes: recentCrimes.map(c => ({
        id: c._id,
        firNumber: c.firNumber,
        crimeType: c.crimeType?.name || 'Unknown',
        district: c.location?.address?.district?.name || 'Unknown',
        date: c.date,
        severity: c.severity,
        status: c.status
      })),
      systemStats: {
        districts: districtCount,
        policeStations: stationCount,
        solvedRate: totalCount > 0 
          ? Math.round((await CrimeIncident.countDocuments({ 
              ...match, 
              status: { $in: ['resolved', 'closed'] } 
            }) / totalCount) * 1000) / 10
          : 0
      }
    };
  }

  /**
   * Get district comparison
   */
  static async getDistrictComparison(filters = {}) {
    const match = { deletedAt: null };

    if (filters.districts && filters.districts.length > 0) {
      match['location.address.district'] = { $in: filters.districts.map(d => new mongoose.Types.ObjectId(d)) };
    }

    const stats = await CrimeIncident.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$location.address.district',
          total: { $sum: 1 },
          violent: {
            $sum: {
              $cond: [
                { $in: ['$severity', ['high', 'critical']] },
                1,
                0
              ]
            }
          },
          resolved: {
            $sum: {
              $cond: [
                { $in: ['$status', ['resolved', 'closed']] },
                1,
                0
              ]
            }
          },
          avgRisk: { $avg: '$riskScore' }
        }
      },
      {
        $lookup: {
          from: 'districts',
          localField: '_id',
          foreignField: '_id',
          as: 'district'
        }
      },
      { $unwind: '$district' },
      {
        $project: {
          districtId: '$_id',
          districtName: '$district.name',
          code: '$district.code',
          total: 1,
          violent: 1,
          resolved: 1,
          avgRisk: { $round: ['$avgRisk', 1] },
          detectionRate: {
            $round: [
              { $multiply: [{ $divide: ['$resolved', { $max: ['$total', 1] }] }, 100] },
              1
            ]
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    return stats;
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
    if (filters.district) {
      match['location.address.district'] = new mongoose.Types.ObjectId(filters.district);
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
          severity: { $max: '$severity' },
          avgRisk: { $avg: '$riskScore' }
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
          avgRisk: { $round: ['$avgRisk', 1] },
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

    if (filters.district) {
      query['location.district'] = new mongoose.Types.ObjectId(filters.district);
    }

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
    if (filters.district) {
      match['location.address.district'] = new mongoose.Types.ObjectId(filters.district);
    }

    const timeline = await CrimeIncident.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 },
          severity: { $push: '$severity' }
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
          severity: 1,
          _id: 0
        }
      }
    ]);

    return timeline;
  }
}

module.exports = DashboardService;