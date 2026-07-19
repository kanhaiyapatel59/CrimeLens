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
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../redux/slices/authSlice'
import { useThemeContext } from '../../context/ThemeContext'

const Header = ({ onMenuClick }) => {
  const theme = useTheme()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { mode, toggleTheme } = useThemeContext()
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifAnchorEl, setNotifAnchorEl] = useState(null)

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileClose = () => {
    setAnchorEl(null)
  }

  const handleNotifications = (event) => {
    setNotifAnchorEl(event.currentTarget)
  }

  const handleNotifClose = () => {
    setNotifAnchorEl(null)
  }

  const handleLogout = () => {
    handleProfileClose()
    dispatch(logoutUser())
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

          {/* User Avatar - Click shows ONLY Logout */}
          <Chip
            avatar={
              <Avatar sx={{ bgcolor: '#1a237e', color: '#fff' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            }
            label={`${user?.firstName} ${user?.lastName}`}
            onClick={handleProfileMenu}
            sx={{ 
              fontWeight: 500, 
              display: { xs: 'none', sm: 'flex' },
              ml: 0.5,
            }}
          />

          {/* ✅ User Menu - ONLY LOGOUT (No Profile/Settings) */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                minWidth: 150,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }
            }}
          >
            <MenuItem 
              onClick={handleLogout} 
              sx={{ 
                color: 'error.main',
                fontWeight: 500,
                '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.04)' },
              }}
            >
              <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Logout
            </MenuItem>
          </Menu>

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
    </AppBar>
  )
}

export default Header