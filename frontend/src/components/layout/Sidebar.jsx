import React, { useState } from 'react'
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
  Tooltip,
  IconButton,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Gavel as CrimeIcon,
  Map as MapIcon,
  NetworkCheck as NetworkIcon,
  Chat as ChatIcon,
  Assessment as ReportIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Security as SecurityIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../redux/slices/authSlice'

// ✅ Role-based menu items
const getMenuItems = (role) => {
  const roleName = role?.name || 'viewer'
  
  const allItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/crimes', label: 'Crimes', icon: CrimeIcon },
    { path: '/map', label: 'Crime Map', icon: MapIcon },
    { path: '/network', label: 'Network', icon: NetworkIcon },
    { path: '/ai-chat', label: 'AI Assistant', icon: ChatIcon },
    { path: '/reports', label: 'Reports', icon: ReportIcon },
  ]
  
  const roleAccess = {
    admin: ['/dashboard', '/crimes', '/map', '/network', '/ai-chat', '/reports'],
    scrb_officer: ['/dashboard', '/crimes', '/map', '/network', '/ai-chat', '/reports'],
    district_officer: ['/dashboard', '/crimes', '/map', '/network', '/ai-chat', '/reports'],
    station_officer: ['/dashboard', '/crimes', '/map', '/ai-chat'],
    analyst: ['/dashboard', '/map', '/network', '/ai-chat', '/reports'],
    viewer: ['/dashboard', '/ai-chat'],
  }
  
  const allowedPaths = roleAccess[roleName] || ['/dashboard']
  return allItems.filter(item => allowedPaths.includes(item.path))
}

// ✅ Profile & Settings in Sidebar Bottom
const bottomMenuItems = [
  { path: '/profile', label: 'Profile', icon: PersonIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
]

const Sidebar = ({ open, onClose, isMobile }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const menuItems = getMenuItems(user?.role)

  // ✅ State for collapsible sidebar (desktop only)
  const [collapsed, setCollapsed] = useState(false)
  const [hovered, setHovered] = useState(false)

  // ✅ Determine if sidebar is expanded
  const isExpanded = !collapsed || hovered

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/login')
  }

  // ✅ Toggle sidebar collapse
  const toggleCollapse = () => {
    setCollapsed(!collapsed)
    setHovered(false)
  }

  // ✅ Handle mouse enter/leave for hover expand
  const handleMouseEnter = () => {
    if (collapsed) setHovered(true)
  }

  const handleMouseLeave = () => {
    if (collapsed) setHovered(false)
  }

  const drawerContent = (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        width: isMobile ? 280 : (isExpanded ? 280 : 64),
        height: '100vh',
        backgroundColor: '#1a237e',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
        transition: isMobile ? 'none' : 'width 0.3s ease',
        position: 'relative',
      }}
    >
      {/* Logo with Toggle Button */}
      <Box
        sx={{
          p: isExpanded ? 2.5 : 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'space-between' : 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          minHeight: 64,
        }}
      >
        {isExpanded ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
            {!isMobile && (
              <IconButton 
                onClick={toggleCollapse} 
                size="small" 
                sx={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <ChevronLeftIcon />
              </IconButton>
            )}
          </>
        ) : (
          <>
            <SecurityIcon sx={{ fontSize: 28, color: '#4fc3f7' }} />
            {!isMobile && (
              <IconButton 
                onClick={toggleCollapse} 
                size="small" 
                sx={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  position: 'absolute', 
                  right: 2,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            )}
          </>
        )}
      </Box>

      {/* User Info */}
      <Box
        sx={{
          p: isExpanded ? 2 : 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'flex-start' : 'center',
          gap: isExpanded ? 1.5 : 0,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Tooltip title={!isExpanded ? `${user?.firstName} ${user?.lastName}` : ''} placement="right" arrow>
          <Avatar
            sx={{
              width: isExpanded ? 36 : 32,
              height: isExpanded ? 36 : 32,
              bgcolor: '#4fc3f7',
              color: '#1a237e',
              fontWeight: 600,
              fontSize: '0.9rem',
              flexShrink: 0,
            }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
        </Tooltip>
        {isExpanded && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap fontSize="0.85rem">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', fontSize: '0.65rem', textTransform: 'capitalize' }}>
              {user?.role?.displayName || user?.role?.name?.replace('_', ' ') || 'Officer'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Main Menu */}
      <List sx={{ flex: 1, pt: 1, px: isExpanded ? 1 : 0.5, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip 
                title={!isExpanded ? item.label : ''} 
                placement="right" 
                arrow
              >
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  sx={{
                    borderRadius: 1,
                    py: isExpanded ? 1 : 1.2,
                    px: isExpanded ? 1.5 : 1,
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    minHeight: 40,
                    '&.active': {
                      backgroundColor: 'rgba(79, 195, 247, 0.15)',
                      '& .MuiListItemIcon-root': { color: '#4fc3f7' },
                      '& .MuiListItemText-primary': { color: '#fff', fontWeight: 600 },
                    },
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: 'rgba(255,255,255,0.5)', 
                      minWidth: isExpanded ? 36 : 0,
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ 
                        fontSize: '0.8rem', 
                        color: 'rgba(255,255,255,0.7)',
                        noWrap: true,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          )
        })}
      </List>

      {/* Bottom Menu - Profile & Settings & Logout */}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {bottomMenuItems.map((item) => {
          const IconComponent = item.icon
          return (
            <ListItem key={item.path} disablePadding sx={{ px: isExpanded ? 1 : 0.5, py: 0.5 }}>
              <Tooltip 
                title={!isExpanded ? item.label : ''} 
                placement="right" 
                arrow
              >
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  sx={{
                    borderRadius: 1,
                    py: isExpanded ? 1 : 1.2,
                    px: isExpanded ? 1.5 : 1,
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    minHeight: 40,
                    '&.active': {
                      backgroundColor: 'rgba(79, 195, 247, 0.15)',
                      '& .MuiListItemIcon-root': { color: '#4fc3f7' },
                      '& .MuiListItemText-primary': { color: '#fff', fontWeight: 600 },
                    },
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: 'rgba(255,255,255,0.5)', 
                      minWidth: isExpanded ? 36 : 0,
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ 
                        fontSize: '0.8rem', 
                        color: 'rgba(255,255,255,0.7)',
                        noWrap: true,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          )
        })}

        {/* Logout */}
        <ListItem disablePadding sx={{ px: isExpanded ? 1 : 0.5, pb: 1.5 }}>
          <Tooltip 
            title={!isExpanded ? 'Logout' : ''} 
            placement="right" 
            arrow
          >
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 1,
                py: isExpanded ? 1 : 1.2,
                px: isExpanded ? 1.5 : 1,
                justifyContent: isExpanded ? 'flex-start' : 'center',
                minHeight: 40,
                '&:hover': { backgroundColor: 'rgba(255,0,0,0.1)' },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: 'rgba(255,255,255,0.5)', 
                  minWidth: isExpanded ? 36 : 0,
                  justifyContent: 'center',
                }}
              >
                <LogoutIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {isExpanded && (
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ 
                    fontSize: '0.8rem', 
                    color: 'rgba(255,255,255,0.7)',
                    noWrap: true,
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
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
        width: isMobile ? 280 : (collapsed && !hovered ? 64 : 280),
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isMobile ? 280 : (collapsed && !hovered ? 64 : 280),
          boxSizing: 'border-box',
          borderRight: 'none',
          boxShadow: '2px 0 12px rgba(0,0,0,0.1)',
          position: 'fixed',  // ✅ FIXED - Sidebar stays in place
          top: 0,
          left: 0,
          height: '100vh',  // ✅ Full viewport height
          zIndex: isMobile ? 1300 : 1200,
          transform: isMobile ? 'none' : (open ? 'translateX(0)' : 'translateX(-280px)'),
          transition: isMobile ? 'none' : 'width 0.3s ease, transform 0.25s ease-in-out',
          overflowX: 'hidden',
          backgroundColor: '#1a237e',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}

export default Sidebar