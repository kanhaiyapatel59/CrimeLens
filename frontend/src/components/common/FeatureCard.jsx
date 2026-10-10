import React from 'react'
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material'
import { motion } from 'framer-motion'

const FeatureCard = ({ icon, title, description, color = '#356AE6', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{ height: '100%' }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          height: '100%',
          bgcolor: 'var(--neu-bg, #E8ECF3)',
          boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
          border: '1px solid var(--neu-divider, #D7DDE7)',
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '9px 9px 20px #B8C0CC, -9px -9px 20px #FFFFFF',
          },
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 3.5 }}>
          <Box
            sx={{
              bgcolor: 'var(--neu-bg, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-subtle, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              width: 58,
              height: 58,
              borderRadius: 3.5,
              margin: '0 auto 20px',
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--neu-divider, #D7DDE7)',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: 'var(--neu-text-primary, #202A3A)', mb: 1, fontSize: '1.05rem' }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--neu-text-secondary, #5C6779)', lineHeight: 1.6, fontSize: '0.88rem' }}>
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default FeatureCard