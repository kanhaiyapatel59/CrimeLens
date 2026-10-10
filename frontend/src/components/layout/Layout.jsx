import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'
import GlobalAiCopilot from '../common/GlobalAiCopilot'

const Layout = () => {
  const theme = useTheme()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  // Cleanly close and blur on mobile when navigating
  React.useEffect(() => {
    if (isMobile) {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur()
      }
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile, location.pathname])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Hide Header & Footer on AI Chat page for immersive experience
  const isAIChat = location.pathname === '/ai-chat'

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'var(--neu-bg, #E8ECF3)',
      }}
    >
      <Box sx={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Neumorphic Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            minWidth: 0,
            overflow: 'hidden',
            position: 'relative',
            bgcolor: 'var(--neu-bg, #E8ECF3)',
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
              p: isAIChat ? 0 : { xs: 2, sm: 2.5, md: 3.5 },
              bgcolor: 'var(--neu-bg, #E8ECF3)',
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
                maxWidth: isAIChat ? '100%' : '1440px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
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

      {/* Global Floating AI Copilot Assistant */}
      {!isAIChat && <GlobalAiCopilot />}
    </Box>
  )
}

export default Layout