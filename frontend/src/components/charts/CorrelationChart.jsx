import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Box, Typography, Paper } from '@mui/material'

const CorrelationChart = ({ data, title, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography variant="body2" color="textSecondary">
          No correlation data available
        </Typography>
      </Box>
    )
  }

  const chartData = data.map(item => ({
    name: item.name || item.factor,
    value: item.value || item.correlation,
    color: item.value > 0 ? '#e91e63' : '#4caf50',
  }))

  return (
    <Box sx={{ width: '100%', height }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        {title || 'Correlation Factors'}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[-1, 1]} />
          <YAxis type="category" dataKey="name" width={100} />
          <Tooltip
            formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Correlation']}
            contentStyle={{
              backgroundColor: '#fff',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          />
          <Legend />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
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
