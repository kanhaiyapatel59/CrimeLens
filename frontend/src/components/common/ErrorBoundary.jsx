import React from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import { Error as ErrorIcon } from '@mui/icons-material'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
            bgcolor: 'var(--neu-bg, #E8ECF3)',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              maxWidth: 500,
              textAlign: 'center',
              borderRadius: 4,
              bgcolor: 'var(--neu-bg, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
              border: '1px solid var(--neu-divider, #D7DDE7)',
            }}
          >
            <ErrorIcon sx={{ fontSize: 56, color: '#D94F55', mb: 2 }} />
            <Typography variant="h5" fontWeight={800} sx={{ color: 'var(--neu-text-primary, #202A3A)', mb: 1 }}>
              System Alert Encountered
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--neu-text-secondary, #5C6779)', mb: 3 }}>
              {this.state.error?.message || 'An unexpected client exception occurred in this module.'}
            </Typography>
            <Button
              variant="contained"
              onClick={this.handleReset}
              sx={{
                bgcolor: '#356AE6',
                color: '#fff',
                borderRadius: 2.5,
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                boxShadow: '3px 3px 10px rgba(53, 106, 230, 0.4)',
                '&:hover': { bgcolor: '#254EBF' },
              }}
            >
              Reload Workstation
            </Button>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary