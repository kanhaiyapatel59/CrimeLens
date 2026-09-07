const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'crime_summary',
        'crime_analysis',
        'network_analysis',
        'ai_insights',
        'district_comparison',
        'trend_analysis',
      ],
      default: 'crime_summary',
    },
    format: {
      type: String,
      enum: ['pdf', 'excel', 'csv', 'json'],
      default: 'pdf',
    },
    dateRange: {
      type: String,
      enum: ['last_7_days', 'last_30_days', 'last_90_days', 'all_time'],
      default: 'last_30_days',
    },
    filters: {
      includeCharts: { type: Boolean, default: true },
      includeMap: { type: Boolean, default: false },
      district: { type: String, default: null },
      policeStation: { type: String, default: null },
    },
    summaryStats: {
      totalCrimes: { type: Number, default: 0 },
      highRiskCount: { type: Number, default: 0 },
      resolvedCount: { type: Number, default: 0 },
      activeCount: { type: Number, default: 0 },
      averageRiskScore: { type: Number, default: 0 },
    },
    fileSize: {
      type: String,
      default: '1.5 MB',
    },
    status: {
      type: String,
      enum: ['completed', 'processing', 'failed'],
      default: 'completed',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);
