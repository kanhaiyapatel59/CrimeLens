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
          <Grid container spacing={2.5}>
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#3f51b5', opacity: 0.8 }} />
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#3f51b5', opacity: 0.8 }} />
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#3f51b5', opacity: 0.8 }} />
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: '#3f51b5', opacity: 0.8 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
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
          <Grid container spacing={2.5}>
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#3f51b5', opacity: 0.8 }} />
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#3f51b5', opacity: 0.8 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: '12px', 
                  backgroundColor: 'rgba(26, 35, 126, 0.04)',
                  border: '1px solid rgba(26, 35, 126, 0.08)',
                  color: '#1a237e'
                }}
              >
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 500, lineHeight: 1.6 }}>
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
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Box
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #66bb6a, #388e3c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
                }}
              >
                <CheckIcon sx={{ fontSize: 50, color: '#fff' }} />
              </Box>
            </motion.div>
            <Typography variant="h5" fontWeight={800} sx={{ mt: 4, color: '#1a237e' }}>
              Registration Successful! 🎉
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1.5, maxWidth: 360, mx: 'auto', lineHeight: 1.6 }}>
              Please check your email to verify your account.
              <br />
              Redirecting to login...
            </Typography>
            <CircularProgress size={28} sx={{ mt: 4, color: '#1a237e' }} />
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
        justifyContent: 'center',
        backgroundColor: '#070a1e',
        backgroundImage: 'radial-gradient(circle at 0% 0%, #161b46 0%, #070a1e 70%)',
        py: { xs: 2, md: 4 },
        px: 2,
      }}
    >
      <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Grid 
          container 
          spacing={0} 
          alignItems="stretch" 
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          sx={{
            maxWidth: '1240px',
            boxShadow: '0 24px 70px rgba(0, 0, 0, 0.4)',
            borderRadius: '24px',
            overflow: 'hidden',
          }}
        >
          {/* Left Side - Brand Section */}
          <Grid 
            item 
            xs={12} 
            md={6.5} 
            sx={{ 
              display: { xs: 'none', md: 'block' },
              position: 'relative',
            }}
          >
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 6,
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(145deg, rgba(16, 24, 78, 0.95) 0%, rgba(7, 12, 41, 0.98) 100%)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {/* Complex Floating Glow Background Elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -150,
                  right: -150,
                  width: 450,
                  height: 450,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(79, 195, 247, 0.12) 0%, transparent 75%)',
                  animation: 'pulse 6s ease-in-out infinite',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -100,
                  left: -100,
                  width: 350,
                  height: 350,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(124, 77, 255, 0.08) 0%, transparent 75%)',
                  animation: 'pulse 8s ease-in-out infinite reverse',
                }}
              />

              {/* Top - Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #4fc3f7 0%, #2196f3 50%, #1a237e 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(33, 150, 243, 0.3)',
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 28, color: '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '0.5px' }}>
                    CrimeLens
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    AI Powered Crime Intelligence
                  </Typography>
                </Box>
              </Box>

              {/* Middle - Main Headings */}
              <Box sx={{ my: 'auto', py: 6 }}>
                <Typography
                  variant="h2"
                  sx={{
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: { md: '3.2rem', lg: '3.8rem' },
                    lineHeight: 1.15,
                    mb: 3,
                    letterSpacing: '-1px',
                  }}
                >
                  Join the Future of
                  <br />
                  <span style={{ 
                    background: 'linear-gradient(135deg, #64b5f6 0%, #7c4dff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Smart Policing
                  </span>
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.65)',
                    fontSize: '1.05rem',
                    maxWidth: '90%',
                    lineHeight: 1.7,
                  }}
                >
                  Create your account and start leveraging AI-powered crime intelligence
                  for better public safety and proactive policing infrastructure.
                </Typography>
              </Box>

              {/* Bottom - Feature Grid Layout */}
              <Grid container spacing={2}>
                {features.map((feature, index) => (
                  <Grid item xs={6} key={index}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: '14px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(5px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.07)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box sx={{ color: '#64b5f6', display: 'flex', alignItems: 'center', fontSize: 22 }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '0.85rem' }}>
                        {feature.text}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Right Side - Register Form */}
          <Grid item xs={12} md={5.5}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                p: { xs: 4, sm: 5, md: 6 },
                borderRadius: 0,
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {/* Small screens Header logo alternative */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    display: { xs: 'flex', md: 'none' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #4fc3f7, #1a237e)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SecurityIcon sx={{ fontSize: 24, color: '#fff' }} />
                  </Box>
                  <Typography variant="h5" fontWeight={800} color="#10184e">
                    CrimeLens
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: '#10184e', letterSpacing: '-0.5px' }}>
                  Create Account
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                  Join the platform for advanced data intelligence
                </Typography>
              </Box>

              {/* Stepper with enhanced responsive typography and shapes */}
              <Stepper 
                activeStep={activeStep} 
                sx={{ 
                  mb: 4,
                  '& .MuiStepIcon-root.Mui-active': { color: '#1a237e' },
                  '& .MuiStepIcon-root.Mui-completed': { color: '#4caf50' },
                  '& .MuiStepLabel-label': { fontWeight: 600, fontSize: '0.8rem' }
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && activeStep < 2 && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                {renderStepContent(activeStep)}

                {activeStep < 2 && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      sx={{ 
                        flex: 1, 
                        borderRadius: '12px', 
                        py: 1.5, 
                        textTransform: 'none',
                        fontWeight: 700,
                        borderWidth: '2px',
                        '&:hover': { borderWidth: '2px' }
                      }}
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
                          borderRadius: '12px',
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 700,
                          bgcolor: '#1a237e',
                          boxShadow: '0 8px 24px rgba(26, 35, 198, 0.25)',
                          '&:hover': { bgcolor: '#101756', boxShadow: 'none' },
                        }}
                      >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{
                          flex: 2,
                          borderRadius: '12px',
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 700,
                          bgcolor: '#1a237e',
                          boxShadow: '0 8px 24px rgba(26, 35, 198, 0.25)',
                          '&:hover': { bgcolor: '#101756', boxShadow: 'none' },
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
                      mt: 3,
                      borderRadius: '12px',
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      bgcolor: '#1a237e',
                      boxShadow: '0 8px 24px rgba(26, 35, 198, 0.25)',
                      '&:hover': { bgcolor: '#101756' },
                    }}
                  >
                    Go to Login
                  </Button>
                )}
              </Box>

              <Divider sx={{ my: 4, opacity: 0.6 }} />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#1a237e',
                      textDecoration: 'none',
                      fontWeight: 700,
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
            50% { transform: scale(1.08) rotate(3deg); opacity: 1; }
          }
        `}
      </style>
    </Box>
  )
}

export default Register