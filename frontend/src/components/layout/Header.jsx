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
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../redux/slices/authSlice'

const Header = ({ onMenuClick }) => {
  const theme = useTheme()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
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
        backgroundColor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton onClick={handleNotifications}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Theme Toggle */}
          <IconButton>
            {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* User */}
          <Chip
            avatar={
              <Avatar sx={{ bgcolor: '#1a237e', color: '#fff' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            }
            label={`${user?.firstName} ${user?.lastName}`}
            onClick={handleProfileMenu}
            sx={{ fontWeight: 500, display: { xs: 'none', sm: 'flex' } }}
          />

          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfileClose}>
              <PersonIcon sx={{ mr: 1 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleProfileClose}>
              <SettingsIcon sx={{ mr: 1 }} /> Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
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
              sx: { width: 350, maxHeight: 400 },
            }}
          >
            <Typography variant="subtitle2" sx={{ p: 2, fontWeight: 600 }}>
              Notifications
            </Typography>
            <Divider />
            <MenuItem onClick={handleNotifClose}>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  🔴 Crime Spike Detected
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  15 minutes ago • Bengaluru District
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotifClose}>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  🤖 AI Prediction Ready
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  1 hour ago • Risk assessment updated
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotifClose}>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  📊 Weekly Report Generated
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  3 hours ago • View report
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleNotifClose} sx={{ justifyContent: 'center' }}>
              <Typography variant="body2" color="primary">
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