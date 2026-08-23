import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Box, Container, Paper, Typography, TextField, Button, IconButton,
  InputAdornment, Alert, Divider, CircularProgress, Grid, Chip, Stack
} from '@mui/material'
import {
  Visibility, VisibilityOff, Shield as ShieldIcon, Email as EmailIcon,
  Lock as LockIcon, ArrowForward as ArrowForwardIcon, GpsFixed as GpsIcon,
  Analytics as AnalyticsIcon, NetworkCheck as NetworkIcon, AutoAwesome as AIIcon,
  Key as KeyIcon
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../redux/slices/authSlice'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state) => state.auth)

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleQuickFill = (email, password) => {
    setFormData({ email, password })
    toast.success(`Loaded credentials for ${email}`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast.error('Please enter both Email and Password')
      return
    }
    const result = await dispatch(loginUser(formData))
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Authenticated successfully!')
      const from = location?.state?.from?.pathname
      navigate(from || '/dashboard')
    }
  }

  const securityBadges = [
    { icon: <GpsIcon sx={{ fontSize: 20, color: '#1a237e' }} />, text: 'GIS Hotspot Density Tracking' },
    { icon: <AnalyticsIcon sx={{ fontSize: 20, color: '#e91e63' }} />, text: 'AI Diurnal Risk Predictions' },
    { icon: <NetworkIcon sx={{ fontSize: 20, color: '#9c27b0' }} />, text: 'Offender Link Graph Analysis' },
    { icon: <AIIcon sx={{ fontSize: 20, color: '#4caf50' }} />, text: 'Groq Live Context Assistant' },
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', color: '#1a237e', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      <Box
        sx={{
          minHeight: 'calc(100vh - 70px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={0} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)', border: '1px solid #e0e0e0' }}>
            
            {/* Left Column: Tactical Intelligence Branding */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 6,
                background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                color: '#ffffff',
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                  <ShieldIcon sx={{ fontSize: 36, color: '#4fc3f7' }} />
                  <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: 0.5, color: '#ffffff' }}>
                    CrimeLens <Chip label="OFFICER PORTAL" size="small" sx={{ bgcolor: '#4fc3f7', color: '#1a237e', fontWeight: 800, fontSize: '0.65rem', ml: 1 }} />
                  </Typography>
                </Box>

                <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1.2, mb: 3, color: '#ffffff' }}>
                  Secure Law Enforcement Intelligence Portal
                </Typography>

                <Typography variant="body1" sx={{ opacity: 0.85, lineHeight: 1.7, mb: 4 }}>
                  Log in with your official credentials to access state-wide FIR heatmaps, criminal link graphs, and Groq AI case synthesis.
                </Typography>

                {/* Badges List */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
                  {securityBadges.map((badge, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                      <Box sx={{ bgcolor: '#ffffff', borderRadius: 1, p: 0.5, display: 'flex' }}>{badge.icon}</Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#ffffff' }}>
                        {badge.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Typography variant="caption" sx={{ opacity: 0.7, borderTop: '1px solid rgba(255, 255, 255, 0.2)', pt: 2.5 }}>
                🔒 256-Bit Encrypted Session • Authorized Police Department Access Only
              </Typography>
            </Grid>

            {/* Right Column: Auth Form */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                bgcolor: '#ffffff',
                p: { xs: 4, sm: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#1a237e', mb: 1 }}>
                    Officer Login
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Enter your official email address & password to sign in.
                  </Typography>
                </Box>

                {/* Demo Quick Fill Buttons */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#f0f4f9', border: '1px dashed #1a237e' }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <KeyIcon sx={{ fontSize: 16 }} /> DEMO ACCOUNT QUICK FILL
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleQuickFill('admin@crimelens.com', 'Admin@123')}
                      sx={{
                        borderColor: '#1a237e',
                        color: '#1a237e',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'rgba(26, 35, 126, 0.08)' }
                      }}
                    >
                      Admin Account
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleQuickFill('scrb@crimelens.com', 'SCRB@123')}
                      sx={{
                        borderColor: '#e91e63',
                        color: '#e91e63',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'rgba(233, 30, 99, 0.08)' }
                      }}
                    >
                      SCRB Officer
                    </Button>
                  </Stack>
                </Paper>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {typeof error === 'string' ? error : error.message || 'Authentication failed. Please check your credentials.'}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#1a237e', display: 'block', mb: 0.8 }}>
                      OFFICIAL EMAIL ADDRESS
                    </Typography>
                    <TextField
                      fullWidth
                      name="email"
                      placeholder="admin@crimelens.com"
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: '#1a237e' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={inputStyles}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: '#1a237e' }}>
                        PASSWORD
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: '#1a237e' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={inputStyles}
                    />
                  </Box>

                  {/* ✅ FIXED LOGIN BUTTON (Never disappears or loses background while loading) */}
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                    sx={{
                      bgcolor: '#1a237e',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '1rem',
                      py: 1.6,
                      borderRadius: 2,
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(26, 35, 126, 0.3)',
                      '&:hover': { bgcolor: '#283593' },
                      '&.Mui-disabled': {
                        bgcolor: '#1a237e',
                        color: '#ffffff',
                        opacity: 0.85,
                      },
                      mb: 4,
                    }}
                  >
                    {isLoading ? 'Authenticating...' : 'Sign In to Officer Portal'}
                  </Button>

                  <Divider sx={{ mb: 3 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ px: 1 }}>
                      NEW POLICE STATION OFFICER?
                    </Typography>
                  </Divider>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Don't have an account?{' '}
                      <Link to="/register" style={{ color: '#1a237e', textDecoration: 'none', fontWeight: 700 }}>
                        Register Station Account →
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#fafafa',
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: '#1a237e' },
    '&.Mui-focused fieldset': { borderColor: '#1a237e' },
  },
}

export default Login