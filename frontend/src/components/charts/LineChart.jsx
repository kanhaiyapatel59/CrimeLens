import React from 'react'
import {
  Line as RechartsLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line,
} from 'recharts'
import { Box, Typography } from '@mui/material'

const LineChart = ({ data, color = '#1a237e' }) => {
  // ✅ Check if data exists and has length
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body2" color="textSecondary">
          No data available
        </Typography>
      </Box>
    )
  }

  // ✅ Map data properly
  const chartData = data.map((item) => ({
    date: item.date || item._id || item.label || '',
    count: item.count || item.value || 0,
  }))

  // ✅ Check if chartData has valid data
  if (chartData.length === 0 || chartData.every(d => d.count === 0)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body2" color="textSecondary">
          No data available
        </Typography>
      </Box>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
      >
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={color} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
          angle={-30}
          textAnchor="end"
          height={50}
        />
        <YAxis allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          formatter={(value) => [`${value} crimes`, 'Count']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="count"
          stroke={color}
          fill="url(#colorCount)"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={3}
          dot={{ r: 4, fill: color }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default LineChart