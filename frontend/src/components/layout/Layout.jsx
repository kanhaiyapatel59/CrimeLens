import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'

const Layout = () => {
  const theme = useTheme()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f0f2f5' }}>
      <Box sx={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100%',
            ml: !isMobile && sidebarOpen ? '260px' : '0px',
            transition: 'margin-left 0.25s ease-in-out',
            overflowX: 'hidden',
            position: 'relative',
          }}
        >
          <Header onMenuClick={toggleSidebar} />
          
          <Box
            sx={{
              flex: 1,
              p: { xs: 2, sm: 3, md: 4 },
              backgroundColor: '#f0f2f5',
              minHeight: 'calc(100vh - 64px)',
              width: '100%',
              maxWidth: '100%',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: '1200px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  style={{ width: '100%' }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </Box>
          </Box>

          <Footer />
        </Box>
      </Box>
    </Box>
  )
}

export default Layout