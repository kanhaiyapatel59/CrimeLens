import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Container, Paper, Typography, TextField, Button, IconButton,
  InputAdornment, Alert, Divider, Grid, FormControl, InputLabel, Select,
  MenuItem, Stepper, Step, StepLabel, CircularProgress, Chip,
} from '@mui/material'
import {
  Visibility, VisibilityOff, Security as SecurityIcon, Shield as ShieldIcon,
  ArrowBack as ArrowBackIcon, CheckCircle as CheckIcon, Lock as LockIcon,
  Email as EmailIcon, Person as PersonIcon, Phone as PhoneIcon,
  Badge as BadgeIcon, Business as BusinessIcon, CloudUpload as UploadFileIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../redux/slices/authSlice'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'

const Register = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
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
    policeId: '',
    department: 'Police Station',
    policeIdDocument: null,
  })

  const [errors, setErrors] = useState({})

  const steps = ['Personal Details', 'Police Credentials', 'Security Password']

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 0) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!formData.email.trim()) newErrors.email = 'Official email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email address format'
      }
      if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number must be 10 digits'
      }
    }

    if (step === 1) {
      if (!formData.policeId.trim()) {
        newErrors.policeId = 'Police ID / Badge Number is required'
      } else if (!/^[A-Za-z0-9]{5,15}$/.test(formData.policeId)) {
        newErrors.policeId = 'Must be 5-15 alphanumeric characters'
      }
      if (!formData.department.trim()) {
        newErrors.department = 'Department / Police Station name is required'
      }
      if (!formData.policeIdDocument) {
        newErrors.policeIdDocument = 'Police ID verification document is required'
      }
    }

    if (step === 2) {
      if (!formData.password) newErrors.password = 'Password is required'
      else if (formData.password.length < 8) {
        newErrors.password = 'Must be at least 8 characters long'
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, policeIdDocument: file })
      if (errors.policeIdDocument) {
        setErrors({ ...errors, policeIdDocument: '' })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(2)) return

    const registerData = new FormData()
    registerData.append('firstName', formData.firstName)
    registerData.append('lastName', formData.lastName)
    registerData.append('email', formData.email)
    registerData.append('phone', formData.phone)
    registerData.append('password', formData.password)
    registerData.append('role', formData.role)
    registerData.append('policeId', formData.policeId)
    registerData.append('department', formData.department)
    if (formData.policeIdDocument) {
      registerData.append('policeIdDocument', formData.policeIdDocument)
    }

    const result = await dispatch(registerUser(registerData))
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Station Officer registered successfully!')
      navigate('/dashboard')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#030712', color: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 6 },
            borderRadius: 6,
            bgcolor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Chip
              icon={<ShieldIcon sx={{ color: '#38bdf8 !important' }} />}
              label="LAW ENFORCEMENT ONBOARDING"
              sx={{ bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontWeight: 800, fontSize: '0.7rem', px: 1.5, py: 1.8, mb: 2 }}
            />
            <Typography variant="h3" fontWeight={900} sx={{ color: '#f8fafc', mb: 1, letterSpacing: '-0.02em' }}>
              Register Station Account
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Complete the 3-step verification process to request CrimeLens portal credentials.
            </Typography>
          </Box>

          {/* Stepper Header */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-active': { color: '#38bdf8' },
                      '&.Mui-completed': { color: '#10b981' },
                      color: 'rgba(255,255,255,0.2)',
                    },
                  }}
                >
                  <Typography variant="caption" fontWeight={600} sx={{ color: activeStep === index ? '#38bdf8' : '#94a3b8' }}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 4, borderRadius: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {typeof error === 'string' ? error : error.message || 'Registration failed. Please check your inputs.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Details */}
            {activeStep === 0 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#cbd5e1', display: 'block', mb: 1 }}>FIRST NAME</Typography>
                    <TextField
                      fullWidth
                      name="firstName"
                      placeholder="Kanhaiya"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#38bdf8' }} /></InputAdornment> }}
                      sx={inputStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#cbd5e1', display: 'block', mb: 1 }}>LAST NAME</Typography>
                    <TextField
                      fullWidth
                      name="lastName"
                      placeholder="Patel"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#38bdf8' }} /></InputAdornment> }}
                      sx={inputStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#cbd5e1', display: 'block', mb: 1 }}>OFFICIAL EMAIL ADDRESS</Typography>
                    <TextField
                      fullWidth
                      name="email"
                      placeholder="officer@police.gov.in"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#38bdf8' }} /></InputAdornment> }}
                      sx={inputStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#cbd5e1', display: 'block', mb: 1 }}>CONTACT PHONE NUMBER</Typography>
                    <TextField
                      fullWidth
                      name="phone"
                      placeholder="9845012345"
                      value={formData.phone}
                      onChange={handleChange}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#38bdf8' }} /></InputAdornment> }}
                      sx={inputStyles}
                    />
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {/* Step 2: Police Credentials & Verification */}
            {activeStep === 1 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#cbd5e1', display: 'block', mb: 1 }}>POLICE BADGE ID / BADGE NO.</Typography>
                    <TextField
                      fullWidth
                      name="policeId"
                      placeholder="POL202688"
                      value={formData.policeId}
                      onChange={handleChange}
                      error={!!errors.policeId}
                      helperText={errors.policeId}
                      InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: '#38bdf8' }} /></InputAdornment> }}
                      sx={inputStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#cbd5e1', display: 'block', mb: 1 }}>POLICE STATION / DEPARTMENT</Typography>
                    <TextField
                      fullWidth
                      name="department"
                      placeholder="MG Road Central PS"
                      value={formData.department}
                      onChange={handleChange}
                      error={!!errors.department}
                      helperText={errors.department}
                      InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: '#38bdf8' }} /></InputAdornment> }}
                      sx={inputStyles}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#cbd5e1', display: 'block', mb: 1 }}>ASSIGNED DESIGNATION ROLE</Typography>
                    <FormControl fullWidth sx={inputStyles}>
                      <Select name="role" value={formData.role} onChange={handleChange}>
                        <MenuItem value="station_officer">Station Officer (Standard Access)</MenuItem>
                        <MenuItem value="inspector">Police Inspector (Analyst & Approver)</MenuItem>
                        <MenuItem value="super_admin">Superintendent / Admin (Full Command)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#cbd5e1', display: 'block', mb: 1 }}>OFFICIAL POLICE ID DOCUMENT (PDF / IMAGE)</Typography>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        border: errors.policeIdDocument ? '2px dashed #ef4444' : '2px dashed rgba(56, 189, 248, 0.4)',
                        borderRadius: 3,
                        bgcolor: 'rgba(15, 23, 42, 0.6)',
                        cursor: 'pointer',
                        '&:hover': { borderColor: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.05)' },
                      }}
                      onClick={() => document.getElementById('id-doc-upload').click()}
                    >
                      <input id="id-doc-upload" type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={handleFileUpload} />
                      <UploadFileIcon sx={{ fontSize: 40, color: '#38bdf8', mb: 1 }} />
                      <Typography variant="body2" fontWeight={600}>
                        {formData.policeIdDocument ? `Selected: ${formData.policeIdDocument.name}` : 'Click to Upload Official Badge ID Verification'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">Supported formats: PDF, PNG, JPG (Max 5MB)</Typography>
                    </Paper>
                    {errors.policeIdDocument && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>{errors.policeIdDocument}</Typography>
                    )}
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {/* Step 3: Security Password & Access Credentials */}
            {activeStep === 2 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#cbd5e1', display: 'block', mb: 1 }}>CREATE STRONG PASSWORD</Typography>
                    <TextField
                      fullWidth
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#38bdf8' }} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#94a3b8' }}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={inputStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#cbd5e1', display: 'block', mb: 1 }}>CONFIRM PASSWORD</Typography>
                    <TextField
                      fullWidth
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#38bdf8' }} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: '#94a3b8' }}>
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={inputStyles}
                    />
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {/* Stepper Action Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
                sx={{ color: '#94a3b8', textTransform: 'none', fontWeight: 600 }}
              >
                Back
              </Button>

              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: '#38bdf8',
                    color: '#030712',
                    fontWeight: 800,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#0284c7' },
                  }}
                >
                  Continue Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                  sx={{
                    bgcolor: '#10b981',
                    color: '#030712',
                    fontWeight: 800,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#059669' },
                  }}
                >
                  {isLoading ? 'Registering...' : 'Complete Station Registration'}
                </Button>
              )}
            </Box>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 4 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Already registered as an officer?{' '}
                <Link to="/login" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700 }}>
                  Sign In to Officer Portal →
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 3,
    color: '#f8fafc',
    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
    '&:hover fieldset': { borderColor: '#38bdf8' },
    '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
  },
  '& .MuiSelect-select': { color: '#f8fafc' },
}

export default Register