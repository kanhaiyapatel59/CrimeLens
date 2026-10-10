import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress,
  useTheme,
  IconButton,
} from '@mui/material'
import {
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { authAPI } from '../api/auth'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
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

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('Email is required')
      return
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await authAPI.requestPasswordReset(email)
      setSuccess(true)
      toast.success('Password reset link sent to your email')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link')
      toast.error(err.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
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
                  Reset Access Key
                </Typography>
                <Typography variant="body2" sx={{ color: textSecondary }}>
                  Enter your registered officer credentials
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
                  Check Official Inbox
                </Typography>
                <Typography variant="body2" sx={{ color: textSecondary, mt: 1 }}>
                  We've sent a verified password reset link to:
                  <br />
                  <strong style={{ color: '#356AE6' }}>{email}</strong>
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary, display: 'block', mt: 2 }}>
                  The cryptographic token will expire in 10 minutes.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => window.location.href = '/login'}
                  sx={{
                    mt: 3,
                    bgcolor: '#356AE6',
                    color: '#fff',
                    borderRadius: 3,
                    py: 1.2,
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '4px 4px 12px rgba(53, 106, 230, 0.4)',
                    '&:hover': { bgcolor: '#254EBF' },
                  }}
                >
                  Return to Sign In
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3, boxShadow: raisedSubtle }}>
                    {error}
                  </Alert>
                )}

                <Typography variant="body2" sx={{ color: textSecondary, mb: 3, lineHeight: 1.6 }}>
                  Enter the email address associated with your police personnel account and we'll send you an encrypted token to reset your password.
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Official Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError(null)
                    }}
                    required
                    placeholder="officer@department.gov.in"
                    InputProps={{
                      startAdornment: (
                        <EmailIcon sx={{ color: textSecondary, mr: 1, fontSize: 20 }} />
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
                  disabled={loading}
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
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Send Reset Link'}
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

export default ForgotPassword