import React from 'react'
import { Box, CircularProgress, Typography, Paper } from '@mui/material'
import { motion } from 'framer-motion'

const Loading = ({ message = 'Loading records...', fullScreen = false }) => {
  const content = (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 4,
        borderRadius: 4,
        bgcolor: 'var(--neu-bg, #E8ECF3)',
        boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
        border: '1px solid var(--neu-divider, #D7DDE7)',
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
      >
        <CircularProgress size={44} sx={{ color: '#356AE6' }} />
      </motion.div>
      <Typography variant="body2" sx={{ color: 'var(--neu-text-secondary, #5C6779)', fontWeight: 600 }}>
        {message}
      </Typography>
    </Paper>
  )

  if (fullScreen) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          bgcolor: 'var(--neu-bg, #E8ECF3)',
        }}
      >
        {content}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      {content}
    </Box>
  )
}

export default Loading