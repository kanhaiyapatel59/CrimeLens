import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Paper,
  Stack,
} from '@mui/material'
import {
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Map as MapIcon,
  NetworkCheck as NetworkIcon,
  AutoAwesome as AIIcon,
  Speed as SpeedIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'

const Landing = () => {
  const navigate = useNavigate()

  const features = [
    { icon: <AnalyticsIcon />, title: 'Real-time Analytics', desc: 'Monitor crime patterns with interactive dashboards and live data visualization.' },
    { icon: <AIIcon />, title: 'AI-Powered Insights', desc: 'Predict crime hotspots and detect anomalies using advanced machine learning models.' },
    { icon: <MapIcon />, title: 'Geospatial Intelligence', desc: 'Visualize crime distribution on interactive maps with district-level drill-down.' },
    { icon: <NetworkIcon />, title: 'Network Analysis', desc: 'Uncover hidden connections between suspects, victims, and organized crime networks.' },
    { icon: <SpeedIcon />, title: 'Proactive Policing', desc: 'Move from reactive to proactive with predictive risk assessment and early warnings.' },
    { icon: <SecurityIcon />, title: 'Secure & Compliant', desc: 'Enterprise-grade security with role-based access and complete audit trails.' },
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Navbar with Login/Register buttons */}
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1a4e 50%, #0d1b3e 100%)',
          color: '#fff',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SecurityIcon sx={{ fontSize: 40, color: '#4fc3f7' }} />
                  <Typography variant="h4" fontWeight={700}>
                    CrimeLens
                  </Typography>
                  <Chip 
                    label="AI Powered" 
                    size="small" 
                    sx={{ bgcolor: '#4fc3f7', color: '#0a0e27', fontWeight: 600 }} 
                  />
                </Box>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 900,
                    lineHeight: 1.1,
                    mb: 2,
                  }}
                >
                  Smart Policing,
                  <br />
                  <span style={{ 
                    background: 'linear-gradient(135deg, #4fc3f7, #7c4dff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Powered by AI
                  </span>
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1.1rem',
                    opacity: 0.8,
                    mb: 4,
                    maxWidth: '90%',
                    lineHeight: 1.8,
                  }}
                >
                  Transform crime data into actionable intelligence with real-time analytics,
                  AI-powered predictions, and network visualization for smarter policing.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/register')}
                    sx={{
                      bgcolor: '#4fc3f7',
                      color: '#0a0e27',
                      px: 4,
                      py: 1.5,
                      '&:hover': { bgcolor: '#81d4fa' },
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    href="#features"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: '#fff',
                      px: 4,
                      py: 1.5,
                      '&:hover': { borderColor: '#fff' },
                    }}
                  >
                    Learn More
                  </Button>
                </Box>

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 4, mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#4fc3f7' }}>50+</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>Crime Records</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#4fc3f7' }}>98%</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>Detection Rate</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#4fc3f7' }}>24/7</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>Real-time Intelligence</Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center',
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 60, color: '#4fc3f7', mb: 2 }} />
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                    Join the Future of Policing
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
                    Create your account and start leveraging AI-powered crime intelligence.
                  </Typography>
                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate('/login')}
                      sx={{ bgcolor: '#4fc3f7', color: '#0a0e27', '&:hover': { bgcolor: '#81d4fa' } }}
                    >
                      Sign In
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate('/register')}
                      sx={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', '&:hover': { borderColor: '#fff' } }}
                    >
                      Create Account
                    </Button>
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
        <Box sx={{ position: 'absolute', right: -100, top: -100, opacity: 0.05, fontSize: 300 }}>
          <SecurityIcon sx={{ fontSize: 300 }} />
        </Box>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }} id="features">
        <Typography variant="h3" fontWeight={700} textAlign="center" gutterBottom>
          Powerful Features
        </Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
          Everything you need to transform crime data into actionable intelligence
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      bgcolor: '#1a237e',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.desc}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* About Section */}
      <Box sx={{ bgcolor: '#f5f7fa', py: 8 }} id="about">
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h3" fontWeight={700} textAlign="center" gutterBottom>
              About CrimeLens
            </Typography>
            <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
              CrimeLens is an AI-powered crime intelligence platform designed for the Karnataka State Police.
            </Typography>
          </motion.div>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%' }}>
                <Typography variant="h5" fontWeight={600} gutterBottom color="#1a237e">
                  🎯 Our Mission
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  To transform crime data into actionable intelligence, enabling proactive policing
                  and safer communities through cutting-edge AI technology.
                </Typography>
                <Typography variant="h5" fontWeight={600} gutterBottom color="#1a237e" sx={{ mt: 3 }}>
                  👥 Who We Serve
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  • Karnataka State Police<br />
                  • SCRB Officers<br />
                  • District Police<br />
                  • Station Officers<br />
                  • Crime Analysts
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%' }}>
                <Typography variant="h5" fontWeight={600} gutterBottom color="#1a237e">
                  🚀 Key Objectives
                </Typography>
                <Box component="ul" sx={{ pl: 2, '& li': { mb: 1 } }}>
                  <li>Centralize crime data from all districts</li>
                  <li>Apply AI for predictive crime analysis</li>
                  <li>Visualize criminal networks</li>
                  <li>Enable data-driven decision making</li>
                  <li>Enhance public safety through proactive policing</li>
                </Box>
                <Typography variant="h5" fontWeight={600} gutterBottom color="#1a237e" sx={{ mt: 3 }}>
                  🔒 Security & Privacy
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Enterprise-grade security with role-based access, encryption, and complete audit trails.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#1a237e', color: '#fff', py: 6 }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Ready to Transform Policing?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, mb: 4, maxWidth: 600, mx: 'auto' }}>
            Join the future of crime intelligence with AI-powered analytics and real-time insights.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              bgcolor: '#fff',
              color: '#1a237e',
              px: 6,
              py: 1.5,
              '&:hover': { bgcolor: '#e8eaf6' },
            }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#0a0e27', color: 'rgba(255,255,255,0.6)', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mb: 2 }}>
                CrimeLens
              </Typography>
              <Typography variant="body2">AI Powered Crime Intelligence Platform for Karnataka State Police.</Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#fff', mb: 1 }}>Product</Typography>
              <Typography variant="body2">Features</Typography>
              <Typography variant="body2">Integrations</Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#fff', mb: 1 }}>Company</Typography>
              <Typography variant="body2">About</Typography>
              <Typography variant="body2">Blog</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#fff', mb: 1 }}>Contact</Typography>
              <Typography variant="body2">support@crimelens.com</Typography>
              <Typography variant="body2">+91-80-1234-5678</Typography>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', mt: 3, pt: 3, textAlign: 'center' }}>
            <Typography variant="caption">© 2026 CrimeLens. All rights reserved.</Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Landing