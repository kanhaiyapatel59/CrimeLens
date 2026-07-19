import React from 'react'
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Divider,
  Stack,
} from '@mui/material'
import {
  Security as SecurityIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a237e',
        color: '#fff',
        mt: 'auto',
        pt: 4,
        pb: 2,
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <SecurityIcon sx={{ fontSize: 32, color: '#4fc3f7' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                CrimeLens
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: 2, maxWidth: 300 }}>
              AI Powered Crime Intelligence Platform for Karnataka State Police.
              Transforming crime data into actionable intelligence.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                component="a"
                href="#"
                sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#4fc3f7' } }}
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                component="a"
                href="#"
                sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#4fc3f7' } }}
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                component="a"
                href="#"
                sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#4fc3f7' } }}
              >
                <TwitterIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              <Link
                to="/dashboard"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e) => e.target.style.color = '#4fc3f7'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
              >
                Dashboard
              </Link>
              <Link
                to="/crimes"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e) => e.target.style.color = '#4fc3f7'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
              >
                Crime Records
              </Link>
              <Link
                to="/map"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e) => e.target.style.color = '#4fc3f7'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
              >
                Crime Map
              </Link>
              <Link
                to="/network"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e) => e.target.style.color = '#4fc3f7'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
              >
                Network Analysis
              </Link>
            </Stack>
          </Grid>

          {/* Features */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Features
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ opacity: 0.6, fontSize: '0.85rem' }}>
                AI Analytics
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.6, fontSize: '0.85rem' }}>
                Network Visualization
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.6, fontSize: '0.85rem' }}>
                Geospatial Intelligence
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.6, fontSize: '0.85rem' }}>
                Predictive Risk Analysis
              </Typography>
            </Stack>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Contact
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: 18, opacity: 0.6 }} />
                <Typography variant="body2" sx={{ opacity: 0.6, fontSize: '0.85rem' }}>
                  support@crimelens.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 18, opacity: 0.6 }} />
                <Typography variant="body2" sx={{ opacity: 0.6, fontSize: '0.85rem' }}>
                  +91-80-1234-5678
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon sx={{ fontSize: 18, opacity: 0.6 }} />
                <Typography variant="body2" sx={{ opacity: 0.6, fontSize: '0.85rem' }}>
                  Karnataka State Police, Bengaluru
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            © {currentYear} CrimeLens. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography
              variant="caption"
              sx={{ opacity: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            >
              Privacy Policy
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            >
              Terms of Service
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            >
              GDPR Compliance
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer