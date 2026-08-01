import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Button, Grid, Chip, Paper, Stack,
  Card, CardContent, Avatar, Divider, Container as MuiContainer,
} from '@mui/material'
import {
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Map as MapIcon,
  NetworkCheck as NetworkIcon,
  AutoAwesome as AIIcon,
  Speed as SpeedIcon,
  ArrowForward as ArrowForwardIcon,
  Shield as ShieldIcon,
  GpsFixed as GpsIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon,
  VerifiedUser as VerifiedIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'

const Landing = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <GpsIcon sx={{ fontSize: 32, color: '#38bdf8' }} />,
      title: 'Geospatial Heatmaps & Diurnal Radar',
      desc: 'Real-time spatial density tracking across districts with 24-hour diurnal surge risk forecasting.',
      badge: 'GIS & Radar'
    },
    {
      icon: <NetworkIcon sx={{ fontSize: 32, color: '#ec4899' }} />,
      title: 'Criminological Link Graph Analysis',
      desc: 'Visualize offender networks, modus operandi signatures, and cross-jurisdiction co-offenders with 10x deep zoom.',
      badge: 'Link Analysis'
    },
    {
      icon: <AIIcon sx={{ fontSize: 32, color: '#a855f7' }} />,
      title: 'Groq AI Copilot Assistant',
      desc: 'Human-like conversational intelligence with real-time MongoDB context, FIR lookups, and dossier synthesis.',
      badge: 'Groq LLM'
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 32, color: '#3b82f6' }} />,
      title: 'Repeat Offender Profiler',
      desc: 'Automated cross-district suspect tracking linking aliases, police station jurisdictions, and FIR histories.',
      badge: 'Offender Profiler'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 32, color: '#10b981' }} />,
      title: 'Bulk CSV & Data Ingestion',
      desc: 'Universal CSV parser supporting instant multi-district FIR imports with automated CrimeType categorization.',
      badge: 'Data Engine'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 32, color: '#f59e0b' }} />,
      title: 'Enterprise Audit & RBAC Security',
      desc: 'Role-based access control (Super Admin, Station Officer, Inspector) with end-to-end encrypted session persistence.',
      badge: 'Encrypted'
    },
  ]

  const stats = [
    { value: '500+', label: 'FIR Incidents Tracked' },
    { value: '99.4%', label: 'Network Match Accuracy' },
    { value: '24/7', label: 'Real-Time Diurnal Radar' },
    { value: '10x', label: 'Deep Graph Zoom Engine' },
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#030712', color: '#f9fafb', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 8, md: 14 },
          pb: { xs: 10, md: 16 },
          background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(56, 189, 248, 0.25), rgba(255, 255, 255, 0))',
        }}
      >
        {/* Glowing Background Orbs */}
        <Box sx={{ position: 'absolute', top: '15%', left: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: '25%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto', mb: 6 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Chip
                icon={<VerifiedIcon sx={{ color: '#38bdf8 !important', fontSize: '1rem' }} />}
                label="NEXT-GEN POLICING & CRIMINOLOGICAL INTELLIGENCE PLATFORM"
                sx={{
                  bgcolor: 'rgba(56, 189, 248, 0.1)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: 1,
                  px: 1.5,
                  py: 2,
                  mb: 3,
                  borderRadius: 5,
                }}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.8rem', md: '4.8rem' },
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: '-0.03em',
                  mb: 3,
                }}
              >
                Smart Policing,{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #38bdf8 0%, #a855f7 50%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Powered by AI
                </span>
              </Typography>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1.05rem', md: '1.25rem' },
                  color: '#9ca3af',
                  lineHeight: 1.7,
                  mb: 5,
                  maxWidth: 760,
                  mx: 'auto',
                }}
              >
                Transform raw FIR case records into real-time geospatial heatmaps, offender network link graphs, and predictive diurnal risk intelligence.
              </Typography>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/login')}
                  sx={{
                    bgcolor: '#38bdf8',
                    color: '#030712',
                    fontWeight: 800,
                    fontSize: '1rem',
                    px: 4,
                    py: 1.8,
                    borderRadius: 3,
                    boxShadow: '0 0 30px rgba(56, 189, 248, 0.4)',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#0284c7', boxShadow: '0 0 40px rgba(56, 189, 248, 0.6)' },
                  }}
                >
                  Officer Portal Login
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#f3f4f6',
                    fontWeight: 700,
                    fontSize: '1rem',
                    px: 4,
                    py: 1.8,
                    borderRadius: 3,
                    textTransform: 'none',
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    '&:hover': { borderColor: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.08)' },
                  }}
                >
                  Register Station Officer
                </Button>
              </Stack>
            </motion.div>
          </Box>

          {/* Stats Bar */}
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {stats.map((stat, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderRadius: 3,
                      bgcolor: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <Typography
                      variant="h3"
                      fontWeight={900}
                      sx={{
                        background: 'linear-gradient(135deg, #38bdf8, #a855f7)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 0.5,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9ca3af', fontWeight: 600 }}>
                      {stat.label}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Feature Showcase Grid */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#090d16', borderTop: '1px solid rgba(255,255,255,0.06)' }} id="features">
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 1.5, mb: 1 }}>
              TACTICAL CAPABILITIES
            </Typography>
            <Typography variant="h2" fontWeight={800} sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-0.02em' }}>
              Engineered for Law Enforcement Excellence
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feat, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.08 }}>
                  <Card
                    sx={{
                      height: '100%',
                      bgcolor: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 4,
                      p: 1,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        borderColor: 'rgba(56, 189, 248, 0.4)',
                        boxShadow: '0 20px 40px rgba(56, 189, 248, 0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', display: 'inline-flex' }}>
                          {feat.icon}
                        </Box>
                        <Chip label={feat.badge} size="small" sx={{ bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontWeight: 700, fontSize: '0.65rem' }} />
                      </Box>

                      <Typography variant="h6" fontWeight={700} sx={{ color: '#f9fafb', mb: 1.5 }}>
                        {feat.title}
                      </Typography>

                      <Typography variant="body2" sx={{ color: '#9ca3af', lineHeight: 1.7 }}>
                        {feat.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Security & CTA Footer Banner */}
      <Box sx={{ py: 8, bgcolor: '#030712', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <ShieldIcon sx={{ fontSize: 56, color: '#38bdf8', mb: 2 }} />
          <Typography variant="h3" fontWeight={800} sx={{ mb: 2 }}>
            Ready to Upgrade Your Station Intelligence?
          </Typography>
          <Typography variant="body1" sx={{ color: '#9ca3af', mb: 4, maxWidth: 600, mx: 'auto' }}>
            Access real-time district FIR maps, Groq AI Copilot, and criminal link analysis with state-level security.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              bgcolor: '#38bdf8',
              color: '#030712',
              fontWeight: 800,
              px: 5,
              py: 1.8,
              borderRadius: 3,
              fontSize: '1rem',
              '&:hover': { bgcolor: '#0284c7' },
            }}
          >
            Request Official Access
          </Button>
          <Typography variant="caption" display="block" sx={{ color: '#6b7280', mt: 3 }}>
            CrimeLens Police Intelligence Platform © 2026. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default Landing