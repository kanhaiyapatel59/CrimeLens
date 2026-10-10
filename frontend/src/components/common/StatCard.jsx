import React from 'react'
import { Card, CardContent, Typography, Box, Avatar, Chip } from '@mui/material'
import { TrendingUp, TrendingDown } from '@mui/icons-material'
import { motion } from 'framer-motion'

const StatCard = ({ title, value, change, icon: IconComponent, color = '#356AE6', sparkline = null }) => {
  const isPositive = typeof change === 'string' ? change.startsWith('+') : change > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -3 }}
    >
      <Box
        sx={{
          borderRadius: '20px',
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
          p: 2.5,
          border: '1px solid rgba(255, 255, 255, 0.65)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 140,
        }}
      >
        {/* Top Row: Icon + Title + Mini Trend Wave */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
              }}
            >
              {IconComponent && <IconComponent sx={{ fontSize: 18 }} />}
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--neu-text-secondary, #687386)',
                fontWeight: 600,
                fontSize: '0.82rem',
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </Typography>
          </Box>

          {/* Decorative Sparkline Wave Curve */}
          <Box sx={{ opacity: 0.75 }}>
            <svg width="44" height="20" viewBox="0 0 44 20" fill="none">
              <path
                d={isPositive ? "M1 15C10 15 12 5 22 8C32 11 34 2 43 4" : "M1 5C10 5 12 15 22 12C32 9 34 18 43 16"}
                stroke={isPositive ? "#239B62" : "#D94F55"}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </Box>
        </Box>

        {/* Middle & Bottom: Large Metric Value & Trend Pill */}
        <Box sx={{ mt: 1.5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.6rem', sm: '1.85rem' },
              color: 'var(--neu-text-primary, #202A3A)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>

          {change !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.4,
                  bgcolor: isPositive ? 'rgba(35, 155, 98, 0.12)' : 'rgba(217, 79, 85, 0.12)',
                  color: isPositive ? '#239B62' : '#D94F55',
                  px: 1,
                  py: 0.3,
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {isPositive ? (
                  <TrendingUp sx={{ fontSize: 13 }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 13 }} />
                )}
                <span>{change}</span>
              </Box>

              <Typography variant="caption" sx={{ color: 'var(--neu-text-muted, #8893A4)', fontSize: '0.7rem' }}>
                vs prev cycle
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </motion.div>
  )
}

export default StatCard