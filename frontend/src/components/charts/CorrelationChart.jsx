import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Box, Typography } from '@mui/material'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value
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
          {payload[0].payload.name}
        </Typography>
        <Typography variant="subtitle2" sx={{ color: val > 0 ? '#356AE6' : '#239B62', fontWeight: 800 }}>
          {(val * 100).toFixed(1)}% <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5C6779' }}>Correlation Factor</span>
        </Typography>
      </Box>
    )
  }
  return null
}

const CorrelationChart = ({ data, title, height = 280 }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography variant="body2" sx={{ color: '#8893A4', fontWeight: 500 }}>
          No correlation data available
        </Typography>
      </Box>
    )
  }

  const chartData = data.map((item) => ({
    name: item.name || item.factor,
    value: item.value || item.correlation || 0,
    color: (item.value || item.correlation) > 0 ? '#356AE6' : '#239B62',
  }))

  return (
    <Box sx={{ width: '100%', height }}>
      {title && (
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#202A3A', mb: 1 }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--neu-divider, #D7DDE7)" opacity={0.7} />
          <XAxis type="number" domain={[-1, 1]} tick={{ fontSize: 10, fill: '#8893A4' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#5C6779', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default CorrelationChart
