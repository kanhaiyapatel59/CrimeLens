import React from 'react'
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
        <Typography variant="subtitle2" sx={{ color: '#356AE6', fontWeight: 800 }}>
          {payload[0].value} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5C6779' }}>cases recorded</span>
        </Typography>
      </Box>
    )
  }
  return null
}

const BarChart = ({ data, labels, colors, horizontal = false }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body2" sx={{ color: '#8893A4', fontWeight: 500 }}>
          No data available
        </Typography>
      </Box>
    )
  }

  const defaultPalette = ['#356AE6', '#5C85F7', '#239B62', '#D99118', '#8B5CF6', '#EC4899', '#06B6D4']

  const chartData = data.map((value, index) => ({
    name: labels?.[index] || `Type ${index + 1}`,
    value,
    color: colors?.[index] || defaultPalette[index % defaultPalette.length],
  }))

  return (
    <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 220, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
        <RechartsBar
          data={chartData}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 12, right: 16, left: horizontal ? 20 : -15, bottom: horizontal ? 10 : 35 }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="var(--neu-divider, #D7DDE7)"
            horizontal={!horizontal}
            vertical={horizontal}
            opacity={0.8}
          />
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#8893A4' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#5C6779', fontWeight: 600 }} axisLine={false} tickLine={false} width={80} />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                angle={-25}
                textAnchor="end"
                height={45}
                interval={0}
                tick={{ fontSize: 10.5, fill: '#687386', fontWeight: 600 }}
                axisLine={{ stroke: 'var(--neu-divider, #D7DDE7)' }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#8893A4' }} axisLine={false} tickLine={false} />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]} barSize={26}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </RechartsBar>
      </ResponsiveContainer>
    </Box>
  )
}

export default BarChart
