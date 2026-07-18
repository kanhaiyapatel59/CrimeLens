import React from 'react'
import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'

const HeatMap = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body2" color="textSecondary">
          No heatmap data available
        </Typography>
      </Box>
    )
  }

  // Simple heatmap visualization using divs
  const maxValue = Math.max(...data.map(d => d.count || 0))

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(30px, 1fr))',
          gap: 0.5,
        }}
      >
        {data.map((item, index) => {
          const intensity = maxValue > 0 ? (item.count / maxValue) * 100 : 0
          const color = `rgba(26, 35, 126, ${0.1 + (intensity / 100) * 0.9})`

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
            >
              <Box
                sx={{
                  bgcolor: color,
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: intensity > 50 ? '#fff' : '#1a237e',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.5)',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  },
                }}
              >
                {item.count > 0 && item.count}
              </Box>
            </motion.div>
          )
        })}
      </Box>
    </Box>
  )
}

export default HeatMap