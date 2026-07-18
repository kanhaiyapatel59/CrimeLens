import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
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
  LinearProgress,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { authAPI } from '../api/auth'
import toast from 'react-hot-toast'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token')
    }
  }, [token])

  const validatePassword = (password) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    setPasswordStrength(strength)
    return strength >= 75
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError(null)
    
    if (name === 'password') {
      validatePassword(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      setError('Invalid reset token')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain an uppercase letter')
      return
    }

    if (!/[a-z]/.test(formData.password)) {
      setError('Password must contain a lowercase letter')
      return
    }

    if (!/[0-9]/.test(formData.password)) {
      setError('Password must contain a number')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await authAPI.resetPassword(token, formData.password)
      setSuccess(true)
      toast.success('Password reset successfully!')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
      toast.error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'error'
    if (passwordStrength < 50) return 'warning'
    if (passwordStrength < 75) return 'info'
    return 'success'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak'
    if (passwordStrength < 50) return 'Fair'
    if (passwordStrength < 75) return 'Good'
    return 'Strong'
  }

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f5f7fa',
        }}
      >
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <SecurityIcon sx={{ fontSize: 64, color: 'error.main' }} />
            <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>
              Invalid Reset Link
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              The password reset link is invalid or has expired.
            </Typography>
            <Button
              component={Link}
              to="/forgot-password"
              variant="contained"
              sx={{ mt: 3 }}
            >
              Request New Link
            </Button>
          </Paper>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
        backgroundImage: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
                <ArrowBackIcon sx={{ cursor: 'pointer' }} />
              </Link>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <SecurityIcon sx={{ fontSize: 36, color: '#1a237e' }} />
                <Typography variant="h5" fontWeight={700}>
                  Set New Password
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Create a new password for your account
                </Typography>
              </Box>
            </Box>

            {success ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckIcon sx={{ fontSize: 80, color: 'success.main' }} />
                </motion.div>
                <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
                  Password Reset Successful!
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Your password has been reset successfully.
                  <br />
                  Redirecting to login...
                </Typography>
                <CircularProgress size={24} sx={{ mt: 3 }} />
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="New Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{ mb: 1 }}
                  InputProps={{
                    startAdornment: (
                      <LockIcon sx={{ color: 'text.secondary', mr: 1 }} />
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

                {formData.password && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        Password Strength
                      </Typography>
                      <Typography
                        variant="caption"
                        color={getPasswordStrengthColor()}
                        fontWeight={600}
                      >
                        {getPasswordStrengthText()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getPasswordStrengthColor(),
                        },
                      }}
                    />
                  </Box>
                )}

                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <LockIcon sx={{ color: 'text.secondary', mr: 1 }} />
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

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || !formData.password}
                  sx={{
                    py: 1.5,
                    bgcolor: '#1a237e',
                    '&:hover': { bgcolor: '#283593' },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Remember your password?{' '}
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
      </Container>
    </Box>
  )
}

export default ResetPassword