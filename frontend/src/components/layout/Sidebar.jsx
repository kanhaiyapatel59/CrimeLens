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
  Chip,
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
  Add as AddIcon,
  Fingerprint as ForensicsIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../redux/slices/authSlice'

// Role-based menu items (preserving all existing routes and roles)
const getMenuItems = (role) => {
  const roleName = role?.name || 'viewer'
  
  const allItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/crimes', label: 'Crime Records', icon: CrimeIcon },
    { path: '/map', label: 'Crime Map', icon: MapIcon },
    { path: '/network', label: 'Criminal Network', icon: NetworkIcon },
    { path: '/forensics', label: 'Tactical Forensics', icon: ForensicsIcon },
    { path: '/ai-chat', label: 'AI Intelligence', icon: ChatIcon },
    { path: '/reports', label: 'Crime Reports', icon: ReportIcon },
  ]
  
  const roleAccess = {
    admin: ['/dashboard', '/crimes', '/map', '/network', '/forensics', '/ai-chat', '/reports'],
    scrb_officer: ['/dashboard', '/crimes', '/map', '/network', '/forensics', '/ai-chat', '/reports'],
    district_officer: ['/dashboard', '/crimes', '/map', '/network', '/forensics', '/ai-chat', '/reports'],
    station_officer: ['/dashboard', '/crimes', '/map', '/forensics', '/ai-chat'],
    analyst: ['/dashboard', '/map', '/network', '/forensics', '/ai-chat', '/reports'],
    viewer: ['/dashboard', '/forensics', '/ai-chat'],
  }
  
  const allowedPaths = roleAccess[roleName] || ['/dashboard']
  return allItems.filter(item => allowedPaths.includes(item.path))
}

const bottomMenuItems = [
  { path: '/profile', label: 'User Profile', icon: PersonIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
]

const Sidebar = ({ open, onClose, isMobile }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const menuItems = getMenuItems(user?.role)

  const [collapsed, setCollapsed] = useState(false)
  const [hovered, setHovered] = useState(false)

  const isExpanded = !collapsed || hovered

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/', { replace: true })
  }

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
    setHovered(false)
  }

  const handleMouseEnter = () => {
    if (collapsed) setHovered(true)
  }

  const handleMouseLeave = () => {
    if (collapsed) setHovered(false)
  }

  const handleItemClick = () => {
    if (isMobile) {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur()
      }
      if (onClose) onClose()
    }
  }

  const drawerContent = (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        width: isMobile ? 270 : (isExpanded ? 270 : 76),
        height: '100vh',
        bgcolor: 'var(--neu-surface, #E8ECF3)',
        color: 'var(--neu-text-primary, #202A3A)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
        transition: isMobile ? 'none' : 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        boxSizing: 'border-box',
        p: isExpanded ? 2 : 1,
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          mb: 2.5,
          p: isExpanded ? 1.5 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'space-between' : 'center',
          minHeight: 56,
          borderRadius: '16px',
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Logo Badge */}
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              bgcolor: '#356AE6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '4px 4px 10px rgba(53, 106, 230, 0.35), -2px -2px 6px rgba(255, 255, 255, 0.8)',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <SecurityIcon sx={{ fontSize: 22 }} />
          </Box>
          {isExpanded && (
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  letterSpacing: '-0.02em',
                  color: '#202A3A',
                  lineHeight: 1.1,
                }}
              >
                Crime<span style={{ color: '#356AE6' }}>Lens</span>
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: '#8893A4',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Police Intelligence
              </Typography>
            </Box>
          )}
        </Box>

        {isExpanded && !isMobile && (
          <IconButton
            onClick={toggleCollapse}
            size="small"
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              color: '#5C6779',
              boxShadow: 'inset 2px 2px 4px #C7CDD7, inset -2px -2px 4px #FFFFFF',
              '&:hover': { color: '#356AE6' },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      {/* User Status Card */}
      {isExpanded ? (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: '16px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#356AE6',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '2px 2px 6px rgba(53, 106, 230, 0.3)',
            }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ overflow: 'hidden', flex: 1 }}>
            <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '0.85rem', color: '#202A3A' }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#239B62' }} />
              <Typography variant="caption" sx={{ color: '#5C6779', fontSize: '0.68rem', fontWeight: 600 }}>
                {user?.role?.displayName || user?.role?.name?.replace('_', ' ') || 'Officer'}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Tooltip title={`${user?.firstName} ${user?.lastName} (${user?.role?.name || 'Officer'})`} placement="right" arrow>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: '#356AE6',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF',
              }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
          </Tooltip>
        </Box>
      )}

      {/* Main Menu Navigation */}
      <List sx={{ flex: 1, py: 0.5, overflowY: 'auto', px: 0 }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <Tooltip
                title={!isExpanded ? item.label : ''}
                placement="right"
                arrow
              >
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={handleItemClick}
                  sx={{
                    borderRadius: '14px',
                    py: 1.1,
                    px: isExpanded ? 1.8 : 1.2,
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    minHeight: 44,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: 'var(--neu-surface, #E8ECF3)',
                    color: '#5C6779',
                    border: '1px solid transparent',
                    '&:hover': {
                      color: '#202A3A',
                      bgcolor: 'rgba(255, 255, 255, 0.5)',
                      boxShadow: '3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF',
                      transform: 'translateY(-1px)',
                    },
                    '&.active': {
                      bgcolor: 'var(--neu-surface, #E8ECF3)',
                      color: '#356AE6 !important',
                      boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
                      border: '1px solid rgba(255, 255, 255, 0.7)',
                      fontWeight: 700,
                      '& .MuiListItemIcon-root': {
                        color: '#356AE6',
                        transform: 'scale(1.08)',
                      },
                      '& .MuiListItemText-primary': {
                        color: '#202A3A',
                        fontWeight: 700,
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'inherit',
                      minWidth: isExpanded ? 34 : 0,
                      justifyContent: 'center',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <IconComponent sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
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

      {/* Quick Action Button (Neumorphic Primary Button like reference "+ Create Project") */}
      {isExpanded && (
        <Box sx={{ px: 0.5, mb: 2 }}>
          <Box
            component={NavLink}
            to="/crimes"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              width: '100%',
              py: 1.2,
              borderRadius: '14px',
              bgcolor: '#356AE6',
              color: '#FFFFFF !important',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: 'var(--neu-shadow-primary-btn, 5px 5px 14px rgba(53, 106, 230, 0.35), -5px -5px 14px rgba(255, 255, 255, 0.9))',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#2955C4',
                transform: 'translateY(-1px)',
                boxShadow: '6px 6px 18px rgba(53, 106, 230, 0.45)',
              },
              '&:active': {
                transform: 'translateY(1px)',
              },
            }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
            <span>New Crime FIR</span>
          </Box>
        </Box>
      )}

      {/* Bottom Section - Profile, Settings & Logout */}
      <Box
        sx={{
          pt: 1.5,
          borderTop: '1px solid var(--neu-divider, #D7DDE7)',
        }}
      >
        {bottomMenuItems.map((item) => {
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
                  onClick={handleItemClick}
                  sx={{
                    borderRadius: '12px',
                    py: 0.9,
                    px: isExpanded ? 1.5 : 1,
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    minHeight: 38,
                    color: '#5C6779',
                    '&:hover': {
                      color: '#202A3A',
                      bgcolor: 'rgba(255, 255, 255, 0.5)',
                      boxShadow: '2px 2px 6px #C7CDD7, -2px -2px 6px #FFFFFF',
                    },
                    '&.active': {
                      color: '#356AE6',
                      boxShadow: 'inset 2px 2px 4px #C7CDD7, inset -2px -2px 4px #FFFFFF',
                      '& .MuiListItemIcon-root': { color: '#356AE6' },
                      '& .MuiListItemText-primary': { color: '#202A3A', fontWeight: 700 },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'inherit',
                      minWidth: isExpanded ? 32 : 0,
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent sx={{ fontSize: 19 }} />
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        noWrap: true,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          )
        })}

        {/* Logout Action */}
        <ListItem disablePadding sx={{ mt: 0.5 }}>
          <Tooltip title={!isExpanded ? 'Logout' : ''} placement="right" arrow>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: '12px',
                py: 0.9,
                px: isExpanded ? 1.5 : 1,
                justifyContent: isExpanded ? 'flex-start' : 'center',
                minHeight: 38,
                color: '#D94F55',
                '&:hover': {
                  bgcolor: 'rgba(217, 79, 85, 0.08)',
                  boxShadow: '2px 2px 6px #C7CDD7, -2px -2px 6px #FFFFFF',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: '#D94F55',
                  minWidth: isExpanded ? 32 : 0,
                  justifyContent: 'center',
                }}
              >
                <LogoutIcon sx={{ fontSize: 19 }} />
              </ListItemIcon>
              {isExpanded && (
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{
                    fontSize: '0.82rem',
                    color: '#D94F55',
                    fontWeight: 700,
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

  const currentWidth = isMobile ? 270 : (!open ? 0 : (collapsed && !hovered ? 76 : 270))

  const handleDrawerClose = (event, reason) => {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur()
    }
    if (onClose) onClose(event, reason)
  }

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={handleDrawerClose}
      ModalProps={{
        keepMounted: true,
        disableAutoFocus: true,
        disableEnforceFocus: true,
        disableRestoreFocus: true,
      }}
      SlideProps={{
        onExited: () => {
          if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur()
          }
        },
      }}
      sx={{
        width: currentWidth,
        flexShrink: 0,
        transition: isMobile ? 'none' : 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: currentWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid var(--neu-divider, #D7DDE7)',
          boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: isMobile ? 1300 : 1200,
          transition: isMobile ? 'none' : 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          display: !open && !isMobile ? 'none' : 'flex',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}

export default Sidebar