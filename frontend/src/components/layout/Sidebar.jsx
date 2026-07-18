import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Gavel as CrimeIcon,
  Map as MapIcon,
  NetworkCheck as NetworkIcon,
  Chat as ChatIcon,
  Assessment as ReportIcon,
  Logout as LogoutIcon,
  Security as SecurityIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../redux/slices/authSlice'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { path: '/crimes', label: 'Crimes', icon: CrimeIcon },
  { path: '/map', label: 'Crime Map', icon: MapIcon },
  { path: '/network', label: 'Network', icon: NetworkIcon },
  { path: '/ai-chat', label: 'AI Assistant', icon: ChatIcon },
  { path: '/reports', label: 'Reports', icon: ReportIcon },
]

const Sidebar = ({ open, onClose, isMobile }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/login')
  }

  const drawerContent = (
    <Box
      sx={{
        width: 260,
        height: '100%',
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
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <SecurityIcon sx={{ fontSize: 28, color: '#4fc3f7' }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            CrimeLens
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.6rem' }}>
            AI Crime Intelligence
          </Typography>
        </Box>
      </Box>

      {/* User */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: '#4fc3f7',
            color: '#1a237e',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" fontWeight={600} noWrap fontSize="0.85rem">
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', fontSize: '0.65rem' }}>
            {user?.role?.displayName || 'Officer'}
          </Typography>
        </Box>
      </Box>

      {/* Menu */}
      <List sx={{ flex: 1, pt: 1, px: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              end={item.path === '/dashboard'}
              sx={{
                borderRadius: 1,
                py: 1,
                px: 1.5,
                '&.active': {
                  backgroundColor: 'rgba(79, 195, 247, 0.15)',
                  '& .MuiListItemIcon-root': { color: '#4fc3f7' },
                  '& .MuiListItemText-primary': { color: '#fff', fontWeight: 600 },
                },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
              }}
            >
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.5)', minWidth: 36 }}>
                <item.icon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout */}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', p: 1.5 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              py: 1,
              px: 1.5,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
            }}
          >
            <ListItemIcon sx={{ color: 'rgba(255,255,255,0.5)', minWidth: 36 }}>
              <LogoutIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  )

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          borderRight: 'none',
          boxShadow: '2px 0 12px rgba(0,0,0,0.1)',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: isMobile ? 1300 : 1100,
          // ✅ Slide in/out animation
          transform: isMobile ? 'none' : (open ? 'translateX(0)' : 'translateX(-260px)'),
          transition: 'transform 0.25s ease-in-out',
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}

export default Sidebar