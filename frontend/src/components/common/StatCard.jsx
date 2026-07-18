import React from 'react'
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material'
import { TrendingUp, TrendingDown } from '@mui/icons-material'
import { motion } from 'framer-motion'

const StatCard = ({ title, value, change, icon, color = '#1a237e' }) => {
  const isPositive = change > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            transform: 'translateY(-4px)',
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="caption" color="textSecondary" fontWeight={500}>
                {title}
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {value}
              </Typography>
              {change !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  {isPositive ? (
                    <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                  )}
                  <Typography
                    variant="caption"
                    color={isPositive ? 'success.main' : 'error.main'}
                    fontWeight={600}
                    sx={{ ml: 0.5 }}
                  >
                    {Math.abs(change)}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                    vs last month
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar
              sx={{
                bgcolor: color,
                width: 48,
                height: 48,
                borderRadius: 2,
              }}
            >
              {React.cloneElement(icon, { sx: { color: '#fff' } })}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default StatCard