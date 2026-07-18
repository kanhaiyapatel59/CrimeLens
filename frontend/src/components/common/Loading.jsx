import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { motion } from 'framer-motion'

const Loading = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <CircularProgress size={48} />
      </motion.div>
      <Typography variant="body2" color="textSecondary">
        {message}
      </Typography>
    </Box>
  )

  if (fullScreen) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          bgcolor: '#f5f7fa',
        }}
      >
        {content}
      </Box>
    )
  }

  return content
}

export default Loading