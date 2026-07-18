import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Gavel as CrimeIcon,
  Map as MapIcon,
  NetworkCheck as NetworkIcon,
  Chat as ChatIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Security as SecurityIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../redux/slices/authSlice'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { path: '/crimes', label: 'Crimes', icon: CrimeIcon },
  { path: '/map', label: 'Crime Map', icon: MapIcon },
  { path: '/network', label: 'Network Analysis', icon: NetworkIcon },
  { path: '/ai-chat', label: 'AI Assistant', icon: ChatIcon },
  { path: '/reports', label: 'Reports', icon: ReportIcon },
]

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  const content = (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        backgroundColor: '#1a237e',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <SecurityIcon sx={{ fontSize: 32, color: '#4fc3f7' }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            CrimeLens
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            AI Crime Intelligence
          </Typography>
        </Box>
      </Box>

      {/* User Info */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: '#4fc3f7',
            color: '#1a237e',
            fontWeight: 700,
          }}
        >
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {user?.role?.displayName || 'Officer'}
          </Typography>
        </Box>
      </Box>

      {/* Menu */}
      <List sx={{ flex: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                borderRadius: '0 20px 20px 0',
                mr: 2,
                '&.active': {
                  backgroundColor: 'rgba(79, 195, 247, 0.2)',
                  '& .MuiListItemIcon-root': {
                    color: '#4fc3f7',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#4fc3f7',
                    fontWeight: 600,
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                <item.icon />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.8)',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Bottom Actions */}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.8)',
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  )

  return isMobile ? (
    <Drawer anchor="left" open={open} onClose={onClose}>
      {content}
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      open
      sx={{
        '& .MuiDrawer-paper': {
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 280,
          borderRight: 'none',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        },
      }}
    >
      {content}
    </Drawer>
  )
}

export default Sidebar