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
  useTheme,
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
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const bgSurface = isDark ? '#1A1E29' : '#E8ECF3'
  const textPrimary = isDark ? '#F0F4FC' : '#202A3A'
  const textSecondary = isDark ? '#9DA8BA' : '#5C6779'
  const dividerColor = isDark ? '#262B3A' : '#D7DDE7'
  const raisedShadow = isDark
    ? '8px 8px 20px #12151D, -8px -8px 20px #222735'
    : '10px 10px 24px #C7CDD7, -10px -10px 24px #FFFFFF'
  const raisedSubtle = isDark
    ? '4px 4px 10px #12151D, -4px -4px 10px #222735'
    : '4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF'
  const insetShadow = isDark
    ? 'inset 3px 3px 7px #12151D, inset -3px -3px 7px #232837'
    : 'inset 4px 4px 8px #C7CDD7, inset -4px -4px 8px #FFFFFF'

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
    if (passwordStrength < 25) return '#D94F55'
    if (passwordStrength < 50) return '#D99118'
    if (passwordStrength < 75) return '#356AE6'
    return '#239B62'
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
          justifyContent: 'center',
          bgcolor: bgSurface,
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: 4.5,
              textAlign: 'center',
              bgcolor: bgSurface,
              boxShadow: raisedShadow,
              border: `1px solid ${dividerColor}`,
            }}
          >
            <SecurityIcon sx={{ fontSize: 64, color: '#D94F55' }} />
            <Typography variant="h5" fontWeight={800} sx={{ mt: 2, color: textPrimary }}>
              Invalid Reset Link
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary, mt: 1 }}>
              The password reset link is invalid or has expired.
            </Typography>
            <Button
              component={Link}
              to="/forgot-password"
              variant="contained"
              sx={{
                mt: 3,
                bgcolor: '#356AE6',
                color: '#fff',
                borderRadius: 3,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '4px 4px 12px rgba(53, 106, 230, 0.4)',
                '&:hover': { bgcolor: '#254EBF' },
              }}
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
        justifyContent: 'center',
        bgcolor: bgSurface,
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4.5,
              bgcolor: bgSurface,
              boxShadow: raisedShadow,
              border: `1px solid ${dividerColor}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: bgSurface,
                    boxShadow: raisedSubtle,
                    color: textPrimary,
                    '&:hover': { bgcolor: bgSurface, boxShadow: insetShadow },
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              </Link>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 3,
                    bgcolor: bgSurface,
                    boxShadow: raisedSubtle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                    color: '#356AE6',
                  }}
                >
                  <SecurityIcon fontSize="medium" />
                </Box>
                <Typography variant="h5" fontWeight={800} sx={{ color: textPrimary, letterSpacing: -0.3 }}>
                  Set New Access Key
                </Typography>
                <Typography variant="body2" sx={{ color: textSecondary }}>
                  Create an encrypted password for your officer profile
                </Typography>
              </Box>
            </Box>

            {success ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    bgcolor: bgSurface,
                    boxShadow: raisedSubtle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    color: '#239B62',
                  }}
                >
                  <CheckIcon sx={{ fontSize: 44, color: '#239B62' }} />
                </Box>
                <Typography variant="h6" fontWeight={800} sx={{ color: textPrimary }}>
                  Password Reset Successful!
                </Typography>
                <Typography variant="body2" sx={{ color: textSecondary, mt: 1 }}>
                  Your access key has been updated and registered.
                  <br />
                  Redirecting to official login terminal...
                </Typography>
                <CircularProgress size={24} sx={{ mt: 3, color: '#356AE6' }} />
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3, boxShadow: raisedSubtle }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <LockIcon sx={{ color: textSecondary, mr: 1, fontSize: 20 }} />
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: bgSurface,
                        boxShadow: insetShadow,
                        borderRadius: 3,
                        '& fieldset': { border: 'none' },
                        '&:hover fieldset': { border: 'none' },
                        '&.Mui-focused fieldset': { border: '1px solid #356AE6' },
                        '& input': { color: textPrimary, fontSize: '0.9rem', py: 1.4 },
                      },
                      '& .MuiInputLabel-root': { color: textSecondary, fontWeight: 600, fontSize: '0.88rem' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#356AE6' },
                    }}
                  />
                </Box>

                {formData.password && (
                  <Box sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                      <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 600 }}>
                        Password Strength
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: getPasswordStrengthColor(), fontWeight: 800 }}
                      >
                        {getPasswordStrengthText()}
                      </Typography>
                    </Box>
                    <Box sx={{ bgcolor: bgSurface, boxShadow: insetShadow, borderRadius: 2, p: 0.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={passwordStrength}
                        sx={{
                          height: 6,
                          borderRadius: 2,
                          bgcolor: 'transparent',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getPasswordStrengthColor(),
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <LockIcon sx={{ color: textSecondary, mr: 1, fontSize: 20 }} />
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: bgSurface,
                        boxShadow: insetShadow,
                        borderRadius: 3,
                        '& fieldset': { border: 'none' },
                        '&:hover fieldset': { border: 'none' },
                        '&.Mui-focused fieldset': { border: '1px solid #356AE6' },
                        '& input': { color: textPrimary, fontSize: '0.9rem', py: 1.4 },
                      },
                      '& .MuiInputLabel-root': { color: textSecondary, fontWeight: 600, fontSize: '0.88rem' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#356AE6' },
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || !formData.password}
                  sx={{
                    py: 1.4,
                    bgcolor: '#356AE6',
                    color: '#fff',
                    borderRadius: 3,
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '4px 4px 14px rgba(53, 106, 230, 0.4)',
                    '&:hover': { bgcolor: '#254EBF' },
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Set New Access Key'}
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 3, borderColor: dividerColor }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                Remember your credentials?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#356AE6',
                    textDecoration: 'none',
                    fontWeight: 700,
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