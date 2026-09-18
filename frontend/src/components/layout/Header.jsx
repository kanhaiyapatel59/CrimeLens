import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  useTheme,
  Button,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Security as SecurityIcon,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { useThemeContext } from '../../context/ThemeContext'
import ScrbReportDialog from '../common/ScrbReportDialog'

const Header = ({ onMenuClick }) => {
  const theme = useTheme()
  const { user } = useSelector((state) => state.auth)
  const { mode, toggleTheme } = useThemeContext()
  const [notifAnchorEl, setNotifAnchorEl] = useState(null)
  const [openScrbReport, setOpenScrbReport] = useState(false)

  const handleNotifications = (event) => {
    setNotifAnchorEl(event.currentTarget)
  }

  const handleNotifClose = () => {
    setNotifAnchorEl(null)
  }

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuClick}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Welcome back, {user?.firstName}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          </Box>
        </Box>

        {/* Right */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* SCRB Briefing Button */}
          <Button
            variant="contained"
            size="small"
            startIcon={<SecurityIcon />}
            onClick={() => setOpenScrbReport(true)}
            sx={{
              bgcolor: '#1a237e',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.75rem',
              display: { xs: 'none', md: 'flex' },
              '&:hover': { bgcolor: '#283593' }
            }}
          >
            SCRB Briefing
          </Button>

          {/* Notifications */}
          <IconButton onClick={handleNotifications}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* ✅ Dark/Light Mode Toggle */}
          <IconButton 
            onClick={toggleTheme}
            size="small"
            sx={{ 
              ml: 0.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 0.8,
            }}
          >
            {mode === 'dark' ? (
              <LightModeIcon fontSize="small" sx={{ color: '#ffb74d' }} />
            ) : (
              <DarkModeIcon fontSize="small" sx={{ color: '#1a237e' }} />
            )}
          </IconButton>

          {/* User Avatar Badge */}
          <Chip
            avatar={
              <Avatar sx={{ bgcolor: '#1a237e', color: '#fff' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            }
            label={`${user?.firstName} ${user?.lastName}`}
            sx={{ 
              fontWeight: 500, 
              display: { xs: 'none', sm: 'flex' },
              ml: 0.5,
            }}
          />

          {/* Notifications Menu */}
          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleNotifClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: { width: 340, maxHeight: 400, borderRadius: 2 },
            }}
          >
            <Typography variant="subtitle2" sx={{ p: 2, fontWeight: 600 }}>
              Notifications
            </Typography>
            <Divider />
            <MenuItem onClick={handleNotifClose}>
              <Box>
                <Typography variant="body2" fontWeight={500} fontSize="0.85rem">
                  🔴 Crime Spike Detected
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  15 min ago • Bengaluru District
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotifClose}>
              <Box>
                <Typography variant="body2" fontWeight={500} fontSize="0.85rem">
                  🤖 AI Prediction Ready
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  1 hour ago • Risk assessment updated
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleNotifClose} sx={{ justifyContent: 'center' }}>
              <Typography variant="body2" color="primary" fontSize="0.8rem">
                View All Notifications
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* 🚨 LIVE SCRB COMMAND TICKER & THREAT MATRIX SUB-BAR */}
      <Box 
        sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? '#0d1117' : '#1a237e', 
          color: '#fff', 
          px: 2, 
          py: 0.5, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          fontSize: '0.75rem',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 160 }}>
          <Chip 
            label="SCRB LIVE TICKER" 
            size="small" 
            color="error" 
            sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, letterSpacing: 0.5 }} 
          />
          <Typography variant="caption" sx={{ color: '#ffd700', fontWeight: 700, fontSize: '0.7rem' }}>
            MATRIX: ELEVATED (68%)
          </Typography>
        </Box>

        {/* Marquee Ticker */}
        <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap', flexGrow: 1, mx: 2 }}>
          <Box 
            component="div"
            sx={{ 
              display: 'inline-block', 
              animation: 'scrollTicker 28s linear infinite',
              '@keyframes scrollTicker': {
                '0%': { transform: 'translateX(100%)' },
                '100%': { transform: 'translateX(-100%)' }
              }
            }}
          >
            <span style={{ marginRight: 30, color: '#f87171', fontWeight: 600 }}>
              🚨 ALERT: Sudden 14% Vehicle Theft Surge detected in Division 4 Jurisdiction
            </span>
            <span style={{ marginRight: 30, color: '#fbbf24', fontWeight: 600 }}>
              ⚡ AI FORECAST: Peak Diurnal Risk Period active for Next 3 Hours
            </span>
            <span style={{ marginRight: 30, color: '#34d399', fontWeight: 600 }}>
              📍 RECENT RECORD: FIR #POL-2026-8819 logged in Bengaluru Central Station
            </span>
            <span style={{ marginRight: 30, color: '#a78bfa', fontWeight: 600 }}>
              🔍 LINK ANALYSIS: 4 Suspect Aliases matched across State Crime Database
            </span>
          </Box>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, opacity: 0.9 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#67e8f9', fontWeight: 700 }}>
            {new Date().toLocaleTimeString()} IST
          </Typography>
        </Box>
      </Box>

      <ScrbReportDialog open={openScrbReport} onClose={() => setOpenScrbReport(false)} />
    </AppBar>
  )
}

export default Header