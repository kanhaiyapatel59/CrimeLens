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
                  Reset Password
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  We'll send you a reset link
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
                  Check Your Email
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  We've sent a password reset link to:
                  <br />
                  <strong>{email}</strong>
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                  The link will expire in 10 minutes.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => window.location.href = '/login'}
                  sx={{
                    mt: 3,
                    bgcolor: '#1a237e',
                    '&:hover': { bgcolor: '#283593' },
                  }}
                >
                  Back to Login
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Enter the email address associated with your account and we'll send you
                  a link to reset your password.
                </Typography>

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  required
                  placeholder="your.email@example.com"
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    bgcolor: '#1a237e',
                    '&:hover': { bgcolor: '#283593' },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
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

export default ForgotPassword