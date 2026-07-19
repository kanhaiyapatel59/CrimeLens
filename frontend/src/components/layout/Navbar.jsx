import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
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
    { label: 'Features', path: '#features' },
    { label: 'About', path: '#about' },
  ]

  // Mobile drawer content
  const drawerContent = (
    <Box sx={{ width: 280, p: 2 }} role="presentation">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          CrimeLens
        </Typography>
        <IconButton onClick={toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {isAuthPage ? (
        // Mobile - Auth pages
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => { toggleDrawer(false)(); navigate('/') }}>
              <ListItemText primary="← Back to Home" />
            </ListItemButton>
          </ListItem>
        </List>
      ) : (
        // Mobile - Landing page
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton href={item.path}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ my: 1 }} />
          <ListItem disablePadding>
            <ListItemButton onClick={() => { toggleDrawer(false)(); navigate('/login') }}>
              <ListItemText primary="Login" sx={{ color: 'primary.main' }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => { toggleDrawer(false)(); navigate('/register') }}
              sx={{
                bgcolor: '#1a237e',
                borderRadius: 1,
                color: '#fff',
                '&:hover': { bgcolor: '#283593' },
              }}
            >
              <ListItemText primary="Register" sx={{ textAlign: 'center' }} />
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
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        py: 0.5,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56 }}>
        {/* Logo */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <SecurityIcon sx={{ color: '#1a237e', fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700} color="#1a237e" sx={{ fontSize: '1.1rem' }}>
            CrimeLens
          </Typography>
        </Box>

        {/* Desktop Menu */}
        {!isMobile ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthPage ? (
              // Desktop - Auth pages: Show Back to Home
              <Button
                onClick={() => navigate('/')}
                sx={{ textTransform: 'none', fontWeight: 500, color: '#1a237e' }}
                startIcon={<span>←</span>}
              >
                Back to Home
              </Button>
            ) : (
              // Desktop - Landing page: Show normal menu
              <>
                {menuItems.map((item) => (
                  <Button
                    key={item.label}
                    href={item.path}
                    color="inherit"
                    sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.9rem' }}
                  >
                    {item.label}
                  </Button>
                ))}
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: '#1a237e',
                    color: '#1a237e',
                    borderRadius: 2,
                    px: 3,
                    '&:hover': { bgcolor: 'rgba(26, 35, 126, 0.04)' },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: '#1a237e',
                    '&:hover': { bgcolor: '#283593' },
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 2,
                    px: 3,
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        ) : (
          <IconButton onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        )}

        {/* Mobile Drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
          {drawerContent}
        </Drawer>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar