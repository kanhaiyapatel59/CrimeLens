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
  Button,
  InputBase,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Security as SecurityIcon,
  Search as SearchIcon,
  AccessTime as AccessTimeIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { useThemeContext } from '../../context/ThemeContext'
import ScrbReportDialog from '../common/ScrbReportDialog'

const Header = ({ onMenuClick }) => {
  const { user } = useSelector((state) => state.auth)
  const { mode, toggleTheme } = useThemeContext()
  const location = useLocation()
  const navigate = useNavigate()
  const [notifAnchorEl, setNotifAnchorEl] = useState(null)
  const [openScrbReport, setOpenScrbReport] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleNotifications = (event) => {
    setNotifAnchorEl(event.currentTarget)
  }

  const handleNotifClose = () => {
    setNotifAnchorEl(null)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/crimes?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Get readable page title
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard'
      case '/crimes': return 'Crime Records'
      case '/map': return 'Live Crime Map'
      case '/network': return 'Criminal Network'
      case '/ai-chat': return 'AI Intelligence Assistant'
      case '/reports': return 'Crime Reports & Analytics'
      case '/profile': return 'Officer Profile'
      case '/settings': return 'System Settings'
      default: return 'Crime Intelligence'
    }
  }

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        backgroundColor: 'var(--neu-bg, #E8ECF3)',
        borderBottom: '1px solid var(--neu-divider, #D7DDE7)',
        zIndex: 1100,
        boxShadow: 'none',
        pt: 1,
        pb: 1,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: { xs: 58, md: 66 },
          gap: 2,
        }}
      >
        {/* Left: Mobile Menu Toggle & Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{
              display: { md: 'none' },
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              color: '#202A3A',
              borderRadius: '12px',
              p: 1,
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: 'var(--neu-text-primary, #202A3A)',
                fontSize: { xs: '1.15rem', sm: '1.45rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {getPageTitle()}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--neu-text-muted, #8893A4)',
                fontSize: '0.72rem',
                fontWeight: 500,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Karnataka State Police Intelligence Network
            </Typography>
          </Box>
        </Box>

        {/* Right Section: Inset Search, Live Pill, Theme Toggle, Notif Bell, User Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {/* Global Inset Search Box (matching reference image) */}
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-inset, inset 4px 4px 8px #C7CDD7, inset -4px -4px 8px #FFFFFF)',
              borderRadius: '14px',
              px: 1.8,
              py: 0.6,
              width: 240,
              border: '1px solid rgba(255, 255, 255, 0.4)',
              transition: 'all 0.2s ease',
              '&:focus-within': {
                width: 280,
                border: '1px solid #356AE6',
              },
            }}
          >
            <SearchIcon sx={{ color: '#8893A4', fontSize: 18, mr: 1 }} />
            <InputBase
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                fontSize: '0.82rem',
                color: 'var(--neu-text-primary, #202A3A)',
                width: '100%',
                fontWeight: 500,
              }}
            />
          </Box>

          {/* Operational Status Pill (like green 'Check-in' card in reference image) */}
          <Button
            onClick={() => setOpenScrbReport(true)}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 1,
              bgcolor: '#239B62',
              color: '#FFFFFF !important',
              borderRadius: '12px',
              px: 1.8,
              py: 0.8,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              textTransform: 'none',
              boxShadow: '4px 4px 12px rgba(35, 155, 98, 0.35), -3px -3px 8px rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                bgcolor: '#1C7D4E',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 16 }} />
            <Box sx={{ textAlign: 'left', lineHeight: 1.1 }}>
              <div>SCRB Online</div>
              <div style={{ fontSize: '0.62rem', opacity: 0.85, fontWeight: 500 }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
              </div>
            </Box>
          </Button>

          {/* Neumorphic Notification Bell Button */}
          <IconButton
            onClick={handleNotifications}
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              color: 'var(--neu-text-secondary, #5C6779)',
              borderRadius: '12px',
              width: 40,
              height: 40,
              border: '1px solid rgba(255, 255, 255, 0.5)',
              '&:hover': {
                color: '#356AE6',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Badge
              badgeContent={3}
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: '#D94F55',
                  color: '#fff',
                  fontSize: '0.62rem',
                  height: 16,
                  minWidth: 16,
                },
              }}
            >
              <NotificationsIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>

          {/* Theme Mode Toggle Button */}
          <IconButton
            onClick={toggleTheme}
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              color: mode === 'dark' ? '#EAB043' : '#356AE6',
              borderRadius: '12px',
              width: 40,
              height: 40,
              border: '1px solid rgba(255, 255, 255, 0.5)',
              '&:hover': {
                transform: 'translateY(-1px)',
              },
            }}
          >
            {mode === 'dark' ? (
              <LightModeIcon sx={{ fontSize: 19 }} />
            ) : (
              <DarkModeIcon sx={{ fontSize: 19 }} />
            )}
          </IconButton>

          {/* User Avatar Chip (matching reference profile pill) */}
          <Box
            onClick={() => navigate('/profile')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              p: 0.5,
              pr: { xs: 0.5, sm: 1.8 },
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              borderRadius: '14px',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                borderRadius: '10px',
                bgcolor: '#356AE6',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#202A3A' }}>
                {user?.firstName}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.62rem', color: '#8893A4', fontWeight: 600 }}>
                {user?.role?.displayName || 'Officer'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>

      {/* Neumorphic Live SCRB Threat Matrix Sub-Ribbon */}
      <Box
        sx={{
          mx: { xs: 2, sm: 3, md: 4 },
          mt: 0.8,
          p: 0.8,
          px: 1.5,
          borderRadius: '14px',
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden',
          fontSize: '0.75rem',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150, flexShrink: 0 }}>
          <Chip
            label="LIVE THREAT"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.62rem',
              fontWeight: 800,
              bgcolor: '#D94F55',
              color: '#FFFFFF',
              letterSpacing: '0.04em',
            }}
          />
          <Typography variant="caption" sx={{ color: '#D99118', fontWeight: 700, fontSize: '0.72rem' }}>
            STATUS: ELEVATED (68%)
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
                '100%': { transform: 'translateX(-100%)' },
              },
            }}
          >
            <span style={{ marginRight: 32, color: '#D94F55', fontWeight: 600 }}>
              🚨 ALERT: Sudden 14% Vehicle Theft Surge detected in Division 4 Jurisdiction
            </span>
            <span style={{ marginRight: 32, color: '#D99118', fontWeight: 600 }}>
              ⚡ AI FORECAST: Peak Diurnal Risk Period active for Next 3 Hours
            </span>
            <span style={{ marginRight: 32, color: '#239B62', fontWeight: 600 }}>
              📍 RECENT RECORD: FIR #POL-2026-8819 logged in Bengaluru Central Station
            </span>
            <span style={{ marginRight: 32, color: '#356AE6', fontWeight: 600 }}>
              🔍 LINK ANALYSIS: 4 Suspect Aliases matched across State Crime Database
            </span>
          </Box>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, opacity: 0.85, flexShrink: 0 }}>
          <DotIcon sx={{ fontSize: 10, color: '#239B62' }} />
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#5C6779', fontWeight: 600 }}>
            SECURE LINK 256-BIT
          </Typography>
        </Box>
      </Box>

      {/* Notifications Dropdown Menu */}
      <Menu
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={handleNotifClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 380,
            borderRadius: '16px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
            p: 1,
            border: '1px solid rgba(255, 255, 255, 0.6)',
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ p: 1.5, fontWeight: 700, color: '#202A3A' }}>
          Intelligence Notifications
        </Typography>
        <Divider sx={{ my: 0.5, borderColor: 'var(--neu-divider, #D7DDE7)' }} />
        <MenuItem
          onClick={handleNotifClose}
          sx={{
            borderRadius: '12px',
            my: 0.5,
            p: 1.2,
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.5)' },
          }}
        >
          <Box>
            <Typography variant="body2" fontWeight={600} fontSize="0.84rem" color="#D94F55">
              🔴 Crime Spike Detected
            </Typography>
            <Typography variant="caption" color="textSecondary">
              15 min ago • Bengaluru Central District
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem
          onClick={handleNotifClose}
          sx={{
            borderRadius: '12px',
            my: 0.5,
            p: 1.2,
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.5)' },
          }}
        >
          <Box>
            <Typography variant="body2" fontWeight={600} fontSize="0.84rem" color="#356AE6">
              🤖 AI Prediction Model Ready
            </Typography>
            <Typography variant="caption" color="textSecondary">
              1 hour ago • Risk assessment updated
            </Typography>
          </Box>
        </MenuItem>
        <Divider sx={{ my: 0.5, borderColor: 'var(--neu-divider, #D7DDE7)' }} />
        <MenuItem
          onClick={() => { handleNotifClose(); navigate('/reports') }}
          sx={{ justifyContent: 'center', py: 1 }}
        >
          <Typography variant="caption" color="#356AE6" fontWeight={700}>
            View All Reports & Alerts →
          </Typography>
        </MenuItem>
      </Menu>

      <ScrbReportDialog open={openScrbReport} onClose={() => setOpenScrbReport(false)} />
    </AppBar>
  )
}

export default Header