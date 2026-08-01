import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Box, Container, Paper, Typography, TextField, Button, IconButton,
  InputAdornment, Alert, Divider, CircularProgress, Grid, Chip,
} from '@mui/material'
import {
  Visibility, VisibilityOff, Security as SecurityIcon, Shield as ShieldIcon,
  Email as EmailIcon, Lock as LockIcon, ArrowForward as ArrowForwardIcon,
  GpsFixed as GpsIcon, Analytics as AnalyticsIcon, NetworkCheck as NetworkIcon,
  AutoAwesome as AIIcon, CheckCircle as CheckIcon,
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
    { icon: <GpsIcon sx={{ fontSize: 20, color: '#38bdf8' }} />, text: 'GIS Hotspot Tracking' },
    { icon: <AnalyticsIcon sx={{ fontSize: 20, color: '#a855f7' }} />, text: 'AI Risk Predictions' },
    { icon: <NetworkIcon sx={{ fontSize: 20, color: '#ec4899' }} />, text: 'Criminal Network Graphs' },
    { icon: <AIIcon sx={{ fontSize: 20, color: '#10b981' }} />, text: 'Groq Live Context Assistant' },
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#030712', color: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      <Box
        sx={{
          minHeight: 'calc(100vh - 70px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 2,
          position: 'relative',
          background: 'radial-gradient(ellipse 70% 70% at 50% 30%, rgba(56, 189, 248, 0.15), rgba(0, 0, 0, 0))',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={0} sx={{ borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
            
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
                background: 'linear-gradient(135deg, #0b1329 0%, #111c3a 50%, #080f24 100%)',
                position: 'relative',
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                  <ShieldIcon sx={{ fontSize: 36, color: '#38bdf8' }} />
                  <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
                    CrimeLens <Chip label="OFFICER PORTAL" size="small" sx={{ bgcolor: '#38bdf8', color: '#030712', fontWeight: 800, fontSize: '0.65rem', ml: 1 }} />
                  </Typography>
                </Box>

                <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1.15, mb: 3, letterSpacing: '-0.02em' }}>
                  Secure Access to{' '}
                  <span style={{ background: 'linear-gradient(135deg, #38bdf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Real-Time Crime Analytics
                  </span>
                </Typography>

                <Typography variant="body1" sx={{ color: '#9ca3af', lineHeight: 1.7, mb: 4 }}>
                  Log in with your official police credentials to access criminal link graphs, district FIR heatmaps, and Groq AI case synthesis.
                </Typography>

                {/* Badges List */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                  {securityBadges.map((badge, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      {badge.icon}
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#e5e7eb' }}>
                        {badge.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Typography variant="caption" sx={{ color: '#6b7280', borderTop: '1px solid rgba(255, 255, 255, 0.08)', pt: 3 }}>
                🔒 MIL-SPEC 256-Bit Encrypted Session • Law Enforcement Authorization Required
              </Typography>
            </Grid>

            {/* Right Column: Sleek Auth Form */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                bgcolor: '#0f172a',
                p: { xs: 4, sm: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#f8fafc', mb: 1 }}>
                    Officer Login
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Enter your official police email address & password to sign in.
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {typeof error === 'string' ? error : error.message || 'Authentication failed. Please check your credentials.'}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#cbd5e1', display: 'block', mb: 1 }}>
                      OFFICIAL EMAIL ADDRESS
                    </Typography>
                    <TextField
                      fullWidth
                      name="email"
                      placeholder="officer@police.gov.in"
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: '#38bdf8' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(15, 23, 42, 0.8)',
                          borderRadius: 3,
                          color: '#f8fafc',
                          '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                          '&:hover fieldset': { borderColor: '#38bdf8' },
                          '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: '#cbd5e1' }}>
                        PASSWORD
                      </Typography>
                      <Link to="/forgot-password" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
                        Forgot password?
                      </Link>
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
                            <LockIcon sx={{ color: '#38bdf8' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#94a3b8' }}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(15, 23, 42, 0.8)',
                          borderRadius: 3,
                          color: '#f8fafc',
                          '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                          '&:hover fieldset': { borderColor: '#38bdf8' },
                          '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
                        },
                      }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                    sx={{
                      bgcolor: '#38bdf8',
                      color: '#030712',
                      fontWeight: 800,
                      fontSize: '1rem',
                      py: 1.8,
                      borderRadius: 3,
                      textTransform: 'none',
                      boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)',
                      '&:hover': { bgcolor: '#0284c7' },
                      mb: 4,
                    }}
                  >
                    {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
                  </Button>

                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', px: 1 }}>
                      NEW POLICE STATION OFFICER?
                    </Typography>
                  </Divider>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      Don't have an account?{' '}
                      <Link to="/register" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700 }}>
                        Register Officer Station Account →
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

export default Login