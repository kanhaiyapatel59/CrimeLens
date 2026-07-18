import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material'
import {
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Email as EmailIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { authAPI } from '../api/auth'
import toast from 'react-hot-toast'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid verification token')
      setLoading(false)
      return
    }

    verifyEmail()
  }, [token])

  const verifyEmail = async () => {
    try {
      await authAPI.verifyEmail(token)
      setSuccess(true)
      toast.success('Email verified successfully!')
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify email')
      toast.error(err.response?.data?.message || 'Failed to verify email')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    // This would typically require email address
    // For now, show a message
    toast.info('Please contact support or try registering again')
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f7fa',
        }}
      >
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            maxWidth: 400,
          }}
        >
          <CircularProgress size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Verifying your email...
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please wait while we confirm your email address.
          </Typography>
        </Paper>
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
              textAlign: 'center',
            }}
          >
            <SecurityIcon sx={{ fontSize: 48, color: '#1a237e' }} />

            {success ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckIcon sx={{ fontSize: 80, color: 'success.main', my: 2 }} />
                </motion.div>
                <Typography variant="h5" fontWeight={700}>
                  Email Verified! ✅
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Your email address has been successfully verified.
                  <br />
                  You can now login to your account.
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                    sx={{
                      bgcolor: '#1a237e',
                      '&:hover': { bgcolor: '#283593' },
                    }}
                  >
                    Go to Login
                  </Button>
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                  Redirecting to login in 5 seconds...
                </Typography>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <ErrorIcon sx={{ fontSize: 80, color: 'error.main', my: 2 }} />
                </motion.div>
                <Typography variant="h5" fontWeight={700} color="error">
                  Verification Failed
                </Typography>
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error || 'Invalid or expired verification token'}
                </Alert>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  The verification link may have expired or been invalid.
                  <br />
                  You can request a new verification email.
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleResendVerification}
                    disabled={resending}
                    sx={{
                      bgcolor: '#1a237e',
                      '&:hover': { bgcolor: '#283593' },
                    }}
                  >
                    {resending ? <CircularProgress size={24} /> : 'Resend Verification Email'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/login')}
                  >
                    Back to Login
                  </Button>
                </Box>
              </>
            )}

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="body2" color="textSecondary">
                Need help?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#1a237e',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Contact Support
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  )
}

export default VerifyEmail