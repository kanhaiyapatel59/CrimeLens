import React from 'react'
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material'
import { motion } from 'framer-motion'

const FeatureCard = ({ icon, title, description, color = '#1a237e', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card
        sx={{
          borderRadius: 3,
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
          },
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Avatar
            sx={{
              bgcolor: color,
              width: 64,
              height: 64,
              margin: '0 auto 16px',
              color: '#fff',
            }}
          >
            {icon}
          </Avatar>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default FeatureCard