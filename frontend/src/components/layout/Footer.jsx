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
        bgcolor: 'var(--neu-surface, #E8ECF3)',
        color: 'var(--neu-text-primary, #202A3A)',
        mt: 'auto',
        pt: 4,
        pb: 3,
        borderTop: '1px solid var(--neu-divider, #D7DDE7)',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '12px',
                  bgcolor: '#356AE6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '4px 4px 10px rgba(53, 106, 230, 0.35)',
                  color: '#fff',
                }}
              >
                <SecurityIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#202A3A' }}>
                Crime<span style={{ color: '#356AE6' }}>Lens</span>
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#5C6779', mb: 2.5, maxWidth: 320, lineHeight: 1.6, fontSize: '0.85rem' }}>
              Karnataka State Police — Next-Generation AI Crime Intelligence & Investigation Management Platform. Transforming complex crime records into actionable intelligence.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[
                { icon: <GitHubIcon sx={{ fontSize: 18 }} />, href: '#' },
                { icon: <LinkedInIcon sx={{ fontSize: 18 }} />, href: '#' },
                { icon: <TwitterIcon sx={{ fontSize: 18 }} />, href: '#' },
              ].map((item, i) => (
                <IconButton
                  key={i}
                  component="a"
                  href={item.href}
                  sx={{
                    bgcolor: 'var(--neu-surface, #E8ECF3)',
                    boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
                    color: '#5C6779',
                    borderRadius: '10px',
                    width: 36,
                    height: 36,
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      color: '#356AE6',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {item.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#202A3A' }}>
              Quick Navigation
            </Typography>
            <Stack spacing={1.2}>
              {[
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/crimes', label: 'Crime Records' },
                { to: '/map', label: 'Crime Map' },
                { to: '/network', label: 'Criminal Network' },
                { to: '/reports', label: 'Intelligence Reports' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    color: '#5C6779',
                    textDecoration: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#356AE6')}
                  onMouseLeave={(e) => (e.target.style.color = '#5C6779')}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Platform Capabilities */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#202A3A' }}>
              Intelligence Suite
            </Typography>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: '#5C6779', fontSize: '0.84rem' }}>
                • Automated Pattern Recognition
              </Typography>
              <Typography variant="body2" sx={{ color: '#5C6779', fontSize: '0.84rem' }}>
                • Modus Operandi Matching
              </Typography>
              <Typography variant="body2" sx={{ color: '#5C6779', fontSize: '0.84rem' }}>
                • Diurnal Geospatial Hotspots
              </Typography>
              <Typography variant="body2" sx={{ color: '#5C6779', fontSize: '0.84rem' }}>
                • Cross-Jurisdiction Suspect Linking
              </Typography>
              <Typography variant="body2" sx={{ color: '#5C6779', fontSize: '0.84rem' }}>
                • SHA-256 Tamper-Proof Chain
              </Typography>
            </Stack>
          </Grid>

          {/* Contact & Jurisdiction */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#202A3A' }}>
              State Headquarters
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon sx={{ fontSize: 18, color: '#356AE6' }} />
                <Typography variant="body2" sx={{ color: '#5C6779', fontSize: '0.84rem' }}>
                  State Crime Records Bureau, Bengaluru
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: 18, color: '#356AE6' }} />
                <Typography variant="body2" sx={{ color: '#5C6779', fontSize: '0.84rem' }}>
                  intel.ksp@crimelens.gov.in
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 18, color: '#356AE6' }} />
                <Typography variant="body2" sx={{ color: '#5C6779', fontSize: '0.84rem' }}>
                  SCRB Control Room: +91 80 2294 2222
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'var(--neu-divider, #D7DDE7)' }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Typography variant="caption" sx={{ color: '#8893A4', fontWeight: 500 }}>
            © {currentYear} CrimeLens. Karnataka State Police Department. Internal Restricted Intelligence System.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            <Typography
              variant="caption"
              sx={{ color: '#5C6779', cursor: 'pointer', fontWeight: 500, '&:hover': { color: '#356AE6' } }}
            >
              Security Policy
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#5C6779', cursor: 'pointer', fontWeight: 500, '&:hover': { color: '#356AE6' } }}
            >
              Terms of Use
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#5C6779', cursor: 'pointer', fontWeight: 500, '&:hover': { color: '#356AE6' } }}
            >
              Audit & Compliance
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer