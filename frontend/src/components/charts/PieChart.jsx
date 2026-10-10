import React from 'react'
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Box, Typography } from '@mui/material'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0]
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
          {data.name}
        </Typography>
        <Typography variant="subtitle2" sx={{ color: data.payload.color || '#356AE6', fontWeight: 800 }}>
          {data.value} cases
        </Typography>
      </Box>
    )
  }
  return null
}

const PieChart = ({ data, labels, colors }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body2" sx={{ color: '#8893A4', fontWeight: 500 }}>
          No severity data available
        </Typography>
      </Box>
    )
  }

  const defaultPalette = ['#239B62', '#D99118', '#D94F55', '#E91E63']

  const chartData = data.map((value, index) => ({
    name: labels?.[index] || `Category ${index + 1}`,
    value: Number(value) || 0,
    color: colors?.[index] || defaultPalette[index % defaultPalette.length],
  }))

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 180, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
          <RechartsPie>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="var(--neu-surface, #E8ECF3)"
              strokeWidth={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </RechartsPie>
        </ResponsiveContainer>

        {/* Center Donut Label */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#202A3A', lineHeight: 1 }}>
            {total}
          </Typography>
          <Typography variant="caption" sx={{ color: '#8893A4', fontSize: '0.65rem', fontWeight: 600 }}>
            TOTAL
          </Typography>
        </Box>
      </Box>

      {/* Neumorphic Legend Pills */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
        {chartData.map((item, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.6,
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'inset 1.5px 1.5px 3px #CBD1DB, inset -1.5px -1.5px 3px #FFFFFF',
              borderRadius: '20px',
              px: 1.2,
              py: 0.4,
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#5C6779',
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
            <span>{item.name}:</span>
            <span style={{ color: '#202A3A', fontWeight: 700 }}>{item.value}</span>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default PieChart