import React from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { Box, Typography } from '@mui/material'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
          borderRadius: '12px',
          p: 1.5,
          border: '1px solid rgba(255, 255, 255, 0.7)',
        }}
      >
        <Typography variant="caption" sx={{ color: '#8893A4', fontWeight: 600, display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="subtitle2" sx={{ color: '#356AE6', fontWeight: 800, fontSize: '0.95rem' }}>
          {payload[0].value} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5C6779' }}>incidents</span>
        </Typography>
      </Box>
    )
  }
  return null
}

const LineChart = ({ data, color = '#356AE6', secondaryColor = '#239B62' }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body2" sx={{ color: '#8893A4', fontWeight: 500 }}>
          No trend data available for period
        </Typography>
      </Box>
    )
  }

  const chartData = data.map((item, index) => ({
    date: item.date || item._id || item.label || `Day ${index + 1}`,
    count: item.count || item.value || 0,
    forecast: Math.max(0, Math.round((item.count || item.value || 0) * (0.85 + ((index % 3) * 0.1)))),
  }))

  return (
    <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 220, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
        <AreaChart
          data={chartData}
          margin={{ top: 12, right: 16, left: -20, bottom: 10 }}
        >
        <defs>
          <linearGradient id="neuPrimaryGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="neuSecondaryGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.2} />
            <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="4 4"
          stroke="var(--neu-divider, #D7DDE7)"
          vertical={false}
          opacity={0.8}
        />

        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#8893A4', fontWeight: 500 }}
          axisLine={{ stroke: 'var(--neu-divider, #D7DDE7)' }}
          tickLine={false}
          dy={8}
        />

        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#8893A4', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dx={-4}
        />

        <Tooltip content={<CustomTooltip />} />

        {/* Primary Actual Curve */}
        <Area
          type="natural"
          dataKey="count"
          stroke={color}
          strokeWidth={3}
          fill="url(#neuPrimaryGrad)"
          activeDot={{
            r: 6,
            fill: color,
            stroke: '#FFFFFF',
            strokeWidth: 3,
            boxShadow: '0 0 10px rgba(53, 106, 230, 0.5)',
          }}
        />

        {/* Secondary Forecast Curve */}
        <Area
          type="natural"
          dataKey="forecast"
          stroke={secondaryColor}
          strokeWidth={2}
          strokeDasharray="4 4"
          fill="url(#neuSecondaryGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </Box>
  )
}

export default LineChart