import React, { useState } from 'react'
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

  // Hide Header & Footer on AI Chat page
  const isAIChat = location.pathname === '/ai-chat'

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#f0f2f5',
      }}
    >
      <Box sx={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

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
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Header */}
          {!isAIChat && (
            <Header onMenuClick={toggleSidebar} />
          )}

          {/* Page Content */}
          <Box
            sx={{
              flex: 1,
              p: isAIChat ? 0 : { xs: 2, sm: 3, md: 4 },
              backgroundColor: '#f0f2f5',
              minHeight: isAIChat ? '100vh' : 'calc(100vh - 64px)',
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isAIChat ? 'stretch' : 'center',
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: isAIChat ? '100%' : '1200px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                  }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </Box>
          </Box>

          {/* Footer */}
          {!isAIChat && <Footer />}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout