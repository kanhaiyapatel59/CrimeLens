import React from 'react'
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Box, Typography } from '@mui/material'

const BarChart = ({ data, labels, colors, title, horizontal = false }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body2" color="textSecondary">
          No data available
        </Typography>
      </Box>
    )
  }

  const chartData = data.map((value, index) => ({
    name: labels?.[index] || `Item ${index + 1}`,
    value: value,
    color: colors?.[index] || '#1a237e',
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBar
        data={chartData}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 10, right: 30, left: 20, bottom: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        {horizontal ? (
          <>
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" />
          </>
        ) : (
          <>
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              interval={0}
            />
            <YAxis />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        />
        <Legend />
        <Bar
          dataKey="value"
          fill="#1a237e"
          radius={[4, 4, 0, 0]}
          barSize={40}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </RechartsBar>
    </ResponsiveContainer>
  )
}

import { Cell } from 'recharts'

export default BarChart