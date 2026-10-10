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
  useTheme,
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
      
      // Auto redirect after 5 seconds
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
          bgcolor: bgSurface,
          p: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4.5,
            textAlign: 'center',
            maxWidth: 420,
            bgcolor: bgSurface,
            boxShadow: raisedShadow,
            border: `1px solid ${dividerColor}`,
          }}
        >
          <CircularProgress size={44} sx={{ color: '#356AE6' }} />
          <Typography variant="h6" fontWeight={800} sx={{ mt: 2.5, color: textPrimary }}>
            Verifying Officer Credential...
          </Typography>
          <Typography variant="body2" sx={{ color: textSecondary, mt: 0.5 }}>
            Validating cryptographic authorization token against police registry
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
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: bgSurface,
                boxShadow: raisedSubtle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                color: '#356AE6',
              }}
            >
              <SecurityIcon fontSize="medium" />
            </Box>

            {success ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Box
                    sx={{
                      width: 76,
                      height: 76,
                      borderRadius: '50%',
                      bgcolor: bgSurface,
                      boxShadow: raisedSubtle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      my: 2.5,
                      color: '#239B62',
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 48, color: '#239B62' }} />
                  </Box>
                </motion.div>
                <Typography variant="h5" fontWeight={800} sx={{ color: textPrimary, letterSpacing: -0.3 }}>
                  Official Email Verified!
                </Typography>
                <Typography variant="body2" sx={{ color: textSecondary, mt: 1 }}>
                  Your official police email address has been successfully verified.
                  <br />
                  You may now sign in to your authorized investigation workstation.
                </Typography>
                <Box sx={{ mt: 3.5, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                    sx={{
                      bgcolor: '#356AE6',
                      color: '#fff',
                      borderRadius: 3,
                      px: 4,
                      py: 1.2,
                      fontWeight: 700,
                      textTransform: 'none',
                      boxShadow: '4px 4px 12px rgba(53, 106, 230, 0.4)',
                      '&:hover': { bgcolor: '#254EBF' },
                    }}
                  >
                    Sign In to Workstation
                  </Button>
                </Box>
                <Typography variant="caption" sx={{ color: textSecondary, display: 'block', mt: 2.5 }}>
                  Redirecting to official terminal in 5 seconds...
                </Typography>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Box
                    sx={{
                      width: 76,
                      height: 76,
                      borderRadius: '50%',
                      bgcolor: bgSurface,
                      boxShadow: raisedSubtle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      my: 2.5,
                      color: '#D94F55',
                    }}
                  >
                    <ErrorIcon sx={{ fontSize: 48, color: '#D94F55' }} />
                  </Box>
                </motion.div>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#D94F55', letterSpacing: -0.3 }}>
                  Verification Token Expired
                </Typography>
                <Alert severity="error" sx={{ mt: 2, borderRadius: 3, boxShadow: raisedSubtle }}>
                  {error || 'Invalid or expired verification token'}
                </Alert>
                <Typography variant="body2" sx={{ color: textSecondary, mt: 2 }}>
                  The verification link may have expired or was already redeemed.
                  <br />
                  You can request a new verification email below.
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleResendVerification}
                    disabled={resending}
                    sx={{
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
                    {resending ? <CircularProgress size={20} color="inherit" /> : 'Resend Verification Email'}
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    sx={{
                      bgcolor: bgSurface,
                      boxShadow: raisedSubtle,
                      color: textPrimary,
                      borderRadius: 3,
                      py: 1.2,
                      fontWeight: 600,
                      textTransform: 'none',
                      border: `1px solid ${dividerColor}`,
                      '&:hover': { bgcolor: bgSurface, boxShadow: insetShadow },
                    }}
                  >
                    Back to Sign In
                  </Button>
                </Box>
              </>
            )}

            <Divider sx={{ my: 3, borderColor: dividerColor }} />

            <Box>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                Need technical assistance?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#356AE6',
                    textDecoration: 'none',
                    fontWeight: 700,
                  }}
                >
                  Contact IT Support Desk
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