import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  Security as SecurityIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  const toggleDrawer = (open) => () => setDrawerOpen(open)

  const menuItems = [
    { label: 'Capabilities', path: '#features' },
    { label: 'Intelligence Modules', path: '#modules' },
    { label: 'Jurisdiction', path: '#about' },
  ]

  const drawerContent = (
    <Box sx={{ width: 280, p: 2.5, bgcolor: 'var(--neu-surface, #E8ECF3)', height: '100%' }} role="presentation">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon sx={{ color: '#356AE6', fontSize: 24 }} />
          <Typography variant="h6" fontWeight={800} color="#202A3A">
            CrimeLens
          </Typography>
        </Box>
        <IconButton onClick={toggleDrawer(false)} sx={{ color: '#5C6779' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2, borderColor: 'var(--neu-divider, #D7DDE7)' }} />

      {isAuthPage ? (
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => { toggleDrawer(false)(); navigate('/') }}
              sx={{
                borderRadius: '12px',
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              }}
            >
              <ListItemText primary="← Back to Login" />
            </ListItemButton>
          </ListItem>
        </List>
      ) : (
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
              <ListItemButton href={item.path} sx={{ borderRadius: '10px' }}>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, color: '#5C6779' }} />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ my: 1.5, borderColor: 'var(--neu-divider, #D7DDE7)' }} />
          <ListItem disablePadding sx={{ mb: 1.5 }}>
            <ListItemButton
              onClick={() => { toggleDrawer(false)(); navigate('/login') }}
              sx={{
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                color: '#356AE6',
                fontWeight: 700,
              }}
            >
              <ListItemText primary="Sign In" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => { toggleDrawer(false)(); navigate('/register') }}
              sx={{
                bgcolor: '#356AE6',
                borderRadius: '12px',
                color: '#fff',
                textAlign: 'center',
                boxShadow: '4px 4px 12px rgba(53, 106, 230, 0.35)',
                '&:hover': { bgcolor: '#2955C4' },
              }}
            >
              <ListItemText primary="Officer Portal Register" />
            </ListItemButton>
          </ListItem>
        </List>
      )}
    </Box>
  )

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        backgroundColor: 'var(--neu-bg, #E8ECF3)',
        borderBottom: '1px solid var(--neu-divider, #D7DDE7)',
        py: 0.5,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 60, px: { xs: 2, sm: 4 } }}>
        {/* Logo */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#356AE6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '3px 3px 8px rgba(53, 106, 230, 0.35)',
              color: '#fff',
            }}
          >
            <SecurityIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight={800} color="#202A3A" sx={{ fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
            Crime<span style={{ color: '#356AE6' }}>Lens</span>
          </Typography>
        </Box>

        {/* Desktop Menu */}
        {!isMobile ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isAuthPage ? (
              <Button
                onClick={() => navigate('/')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#202A3A',
                  bgcolor: 'var(--neu-surface, #E8ECF3)',
                  boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
                  borderRadius: '12px',
                  px: 2.2,
                  py: 0.8,
                  '&:hover': { color: '#356AE6' },
                }}
              >
                ← Back to Portal
              </Button>
            ) : (
              <>
                <Button
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#202A3A',
                    borderRadius: '12px',
                    px: 2.5,
                    py: 0.8,
                    bgcolor: 'var(--neu-surface, #E8ECF3)',
                    boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    '&:hover': { color: '#356AE6' },
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: '#356AE6',
                    '&:hover': { bgcolor: '#2955C4' },
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '12px',
                    px: 3,
                    py: 0.8,
                    boxShadow: 'var(--neu-shadow-primary-btn, 5px 5px 14px rgba(53, 106, 230, 0.35), -5px -5px 14px rgba(255, 255, 255, 0.9))',
                  }}
                >
                  Officer Register
                </Button>
              </>
            )}
          </Box>
        ) : (
          <IconButton
            onClick={toggleDrawer(true)}
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              borderRadius: '10px',
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          ModalProps={{
            disableAutoFocus: true,
            disableRestoreFocus: true,
          }}
        >
          {drawerContent}
        </Drawer>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar