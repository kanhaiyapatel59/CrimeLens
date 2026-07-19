import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Divider,
  CircularProgress,
  Grid,
  useTheme,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  Shield,
  GpsFixed,
  Analytics,
  NetworkCheck,
  AutoAwesome,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../redux/slices/authSlice'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = useTheme()
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
    const result = await dispatch(loginUser(formData))
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard')
    }
  }

  const features = [
    { icon: <GpsFixed />, text: 'Geospatial Intelligence' },
    { icon: <Analytics />, text: 'AI-Powered Analytics' },
    { icon: <NetworkCheck />, text: 'Criminal Network Analysis' },
    { icon: <AutoAwesome />, text: 'Predictive Risk Assessment' },
  ]

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f7fa',
          py: 4,
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Grid container spacing={0} alignItems="stretch">
            {/* Left Side - Brand Section */}
            <Grid 
              item 
              xs={12} 
              md={7} 
              sx={{ 
                display: { xs: 'none', md: 'block' },
                position: 'relative',
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                style={{ height: '100%' }}
              >
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    p: 6,
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '24px 0 0 24px',
                    background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.9) 0%, rgba(13, 27, 62, 0.95) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {/* Floating 3D Background Elements */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -100,
                      right: -100,
                      width: 400,
                      height: 400,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(79, 195, 247, 0.15) 0%, transparent 70%)',
                      animation: 'pulse 4s ease-in-out infinite',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -50,
                      left: -50,
                      width: 300,
                      height: 300,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(233, 30, 99, 0.1) 0%, transparent 70%)',
                      animation: 'pulse 6s ease-in-out infinite reverse',
                    }}
                  />

                  {/* Logo */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #4fc3f7, #1a237e)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 32px rgba(79, 195, 247, 0.3)',
                        }}
                      >
                        <SecurityIcon sx={{ fontSize: 36, color: '#fff' }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.5px' }}>
                          CrimeLens
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          AI Powered Crime Intelligence
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>

                  {/* Main Heading */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <Typography
                      variant="h1"
                      sx={{
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                        lineHeight: 1.1,
                        mb: 2,
                        letterSpacing: '-1px',
                      }}
                    >
                      Smart Policing,
                      <br />
                      <span style={{ 
                        background: 'linear-gradient(135deg, #4fc3f7, #7c4dff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        Powered by AI
                      </span>
                    </Typography>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '1.1rem',
                        mb: 4,
                        maxWidth: '90%',
                        lineHeight: 1.8,
                      }}
                    >
                      Transform crime data into actionable intelligence with
                      real-time analytics, predictive insights, and network visualization.
                    </Typography>
                  </motion.div>

                  {/* Feature Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                      {features.map((feature, index) => (
                        <Grid item xs={6} key={index}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 1.5,
                              borderRadius: 2,
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'rgba(255,255,255,0.1)',
                                transform: 'translateX(5px)',
                              },
                            }}
                          >
                            <Box sx={{ color: '#4fc3f7', fontSize: 20 }}>
                              {feature.icon}
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                              {feature.text}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </motion.div>

                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                  >
                    <Box sx={{ display: 'flex', gap: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <Box>
                        <Typography variant="h4" sx={{ color: '#4fc3f7', fontWeight: 700 }}>
                          50+
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          Crime Records
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ color: '#4fc3f7', fontWeight: 700 }}>
                          98%
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          Detection Rate
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ color: '#4fc3f7', fontWeight: 700 }}>
                          24/7
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          Real-time Intelligence
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>

            {/* Right Side - Login Form */}
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                style={{ height: '100%' }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: { xs: 4, md: 6 },
                    borderRadius: { xs: 3, md: '0 24px 24px 0' },
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                      sx={{
                        display: { xs: 'flex', md: 'none' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #4fc3f7, #1a237e)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <SecurityIcon sx={{ fontSize: 28, color: '#fff' }} />
                      </Box>
                      <Typography variant="h5" fontWeight={700}>
                        CrimeLens
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                      Welcome Back
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Sign in to your account to continue
                    </Typography>
                  </Box>

                  <Box component="form" onSubmit={handleSubmit}>
                    {error && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                      </Alert>
                    )}

                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      sx={{ mb: 2 }}
                      placeholder="admin@crimelens.com"
                      InputProps={{
                        sx: { borderRadius: 2 },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      sx={{ mb: 1 }}
                      placeholder="Enter your password"
                      InputProps={{
                        sx: { borderRadius: 2 },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                      <Link
                        to="/forgot-password"
                        style={{
                          color: '#1a237e',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      >
                        Forgot password?
                      </Link>
                    </Box>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isLoading}
                      sx={{
                        py: 1.75,
                        borderRadius: 2,
                        bgcolor: '#1a237e',
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: '#283593',
                          boxShadow: '0 4px 20px rgba(26, 35, 126, 0.4)',
                        },
                      }}
                    >
                      {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>
                  </Box>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="caption" color="textSecondary">
                      OR
                    </Typography>
                  </Divider>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Don't have an account?{' '}
                      <Link
                        to="/register"
                        style={{
                          color: '#1a237e',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Register Now
                      </Link>
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="caption" color="textSecondary">
                      Demo Credentials
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                      Email: admin@crimelens.com
                      <br />
                      Password: Admin@123
                    </Typography>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>

        {/* CSS Animations */}
        <style>
          {`
            @keyframes pulse {
              0%, 100% { transform: scale(1) rotate(0deg); }
              50% { transform: scale(1.1) rotate(5deg); }
            }
          `}
        </style>
      </Box>
    </>
  )
}

export default Login