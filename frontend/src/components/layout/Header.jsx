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
        backgroundColor: '#fff',
        borderBottom: '1px solid #e8ecf1',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ minHeight: 64, justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        {/* Left */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuClick}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
              Welcome back, {user?.firstName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
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
          <IconButton onClick={handleNotifications}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Chip
            avatar={
              <Avatar sx={{ bgcolor: '#1a237e', color: '#fff', width: 28, height: 28, fontSize: '0.75rem' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            }
            label={`${user?.firstName} ${user?.lastName}`}
            onClick={handleProfileMenu}
            sx={{
              fontWeight: 500,
              borderRadius: 2,
              display: { xs: 'none', sm: 'flex' },
              '& .MuiChip-label': { px: 1.5, fontSize: '0.8rem' },
            }}
          />

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfileClose}>
              <PersonIcon sx={{ mr: 1, fontSize: 20 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleProfileClose}>
              <SettingsIcon sx={{ mr: 1, fontSize: 20 }} /> Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Logout
            </MenuItem>
          </Menu>

          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleNotifClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { width: 340, maxHeight: 400 } }}
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