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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  useTheme,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  GpsFixed,
  Analytics,
  NetworkCheck,
  AutoAwesome,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../redux/slices/authSlice'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const Register = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = useTheme()
  const { isLoading, error } = useSelector((state) => state.auth)

  const [activeStep, setActiveStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'station_officer',
  })
  const [errors, setErrors] = useState({})

  const steps = ['Personal Info', 'Account Setup', 'Verification']

  const features = [
    { icon: <GpsFixed />, text: 'Geospatial Intelligence' },
    { icon: <Analytics />, text: 'AI-Powered Analytics' },
    { icon: <NetworkCheck />, text: 'Criminal Network Analysis' },
    { icon: <AutoAwesome />, text: 'Predictive Risk Assessment' },
  ]

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 0) {
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.email) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format'
      }
      if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
        newErrors.phone = 'Phone must be 10 digits'
      }
    }

    if (step === 1) {
      if (!formData.password) newErrors.password = 'Password is required'
      else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain an uppercase letter'
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must contain a lowercase letter'
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain a number'
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(1)) return

    try {
      const result = await dispatch(registerUser(formData))
      if (result.meta.requestStatus === 'fulfilled') {
        setActiveStep(2)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    }
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#1a237e' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#1a237e' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
                placeholder="your.email@example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#1a237e' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number (Optional)"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                placeholder="9876543210"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: '#1a237e' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="station_officer">Station Officer</MenuItem>
                  <MenuItem value="district_officer">District Officer</MenuItem>
                  <MenuItem value="scrb_officer">SCRB Officer</MenuItem>
                  <MenuItem value="analyst">Analyst</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#1a237e' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#1a237e' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="caption">
                  Password must contain:
                  <br />• At least 8 characters
                  <br />• One uppercase letter
                  <br />• One lowercase letter
                  <br />• One number
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        )

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
                }}
              >
                <CheckIcon sx={{ fontSize: 60, color: '#fff' }} />
              </Box>
            </motion.div>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 3 }}>
              Registration Successful! 🎉
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, maxWidth: 400, mx: 'auto' }}>
              Please check your email to verify your account.
              <br />
              Redirecting to login...
            </Typography>
            <CircularProgress size={24} sx={{ mt: 3 }} />
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#0a0e27',
        backgroundImage: 'linear-gradient(135deg, #0a0e27 0%, #1a1a4e 50%, #0d1b3e 100%)',
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
                {/* Floating Background */}
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
                    Join the Future of
                    <br />
                    <span style={{ 
                      background: 'linear-gradient(135deg, #4fc3f7, #7c4dff)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      Smart Policing
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
                    Create your account and start leveraging AI-powered crime intelligence
                    for better public safety and proactive policing.
                  </Typography>
                </motion.div>

                {/* Feature Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <Grid container spacing={2}>
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
              </Box>
            </motion.div>
          </Grid>

          {/* Right Side - Register Form */}
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
                <Box sx={{ textAlign: 'center', mb: 3 }}>
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
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                    Create Account
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Join the future of smart policing
                  </Typography>
                </Box>

                <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {error && activeStep < 2 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  {renderStepContent(activeStep)}

                  {activeStep < 2 && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={activeStep === 0}
                        sx={{ flex: 1, borderRadius: 2 }}
                      >
                        Back
                      </Button>
                      {activeStep === 1 ? (
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isLoading}
                          sx={{
                            flex: 2,
                            borderRadius: 2,
                            bgcolor: '#1a237e',
                            '&:hover': { bgcolor: '#283593' },
                          }}
                        >
                          {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{
                            flex: 2,
                            borderRadius: 2,
                            bgcolor: '#1a237e',
                            '&:hover': { bgcolor: '#283593' },
                          }}
                        >
                          Next
                        </Button>
                      )}
                    </Box>
                  )}

                  {activeStep === 2 && (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate('/login')}
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        bgcolor: '#1a237e',
                        '&:hover': { bgcolor: '#283593' },
                      }}
                    >
                      Go to Login
                    </Button>
                  )}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      style={{
                        color: '#1a237e',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Sign In
                    </Link>
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
  )
}

export default Register