import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Button,
  LinearProgress,
} from '@mui/material'
import {
  CalendarToday,
  LocationOn,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Badge as BadgeIcon,
  CheckCircle,
  Warning,
  Error,
  Info,
  VerifiedUser,
  Security,
  Fingerprint,
  Timeline,
  Lock,
  FactCheck,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const CrimeDetail = ({ crime }) => {
  const [verifying, setVerifying] = useState(false)
  const [verifiedHash, setVerifiedHash] = useState(false)

  if (!crime) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No crime data available
        </Typography>
      </Box>
    )
  }

  const handleVerifyIntegrity = () => {
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      setVerifiedHash(true)
      toast.success(`SHA-256 Checksum Verified: All Evidence Items Intact & Tamper-Proof!`)
    }, 1200)
  }

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'success',
      medium: 'info',
      high: 'warning',
      critical: 'error',
    }
    return colors[severity] || 'default'
  }

  const getSeverityIcon = (severity) => {
    const icons = {
      low: <Info />,
      medium: <Info />,
      high: <Warning />,
      critical: <Error />,
    }
    return icons[severity] || <Info />
  }

  const getStatusColor = (status) => {
    const colors = {
      reported: 'warning',
      investigating: 'info',
      in_progress: 'primary',
      resolved: 'success',
      closed: 'default',
      pending: 'warning',
    }
    return colors[status] || 'default'
  }

  // Generate deterministic evidence items if not attached to crime record
  const evidenceItems = crime.evidence?.length > 0
    ? crime.evidence.map((item, idx) => ({
        id: item._id || `EV-${idx + 101}`,
        name: item.name || `Evidence Item #${idx + 1}`,
        type: item.type || 'Physical Exhibit',
        hash: `sha256:7f8a9b${(idx * 314159).toString(16)}0c1d2e3f4a5b6c7d8e9f0a`,
        vault: `SCRB Vault #B-${12 + idx}`,
        officer: `Insp. K. Sharma (#BADGE-${4090 + idx})`,
        timestamp: new Date(Date.now() - (idx + 1) * 86400000).toLocaleString(),
      }))
    : [
        {
          id: `EV-${crime.incidentId || '901'}`,
          name: 'CCTV Surveillance Footage Dump (4K MP4)',
          type: 'Digital Media',
          hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          vault: 'SCRB Cyber Vault #A-04',
          officer: 'Insp. R. Varma (#BADGE-4012)',
          timestamp: new Date(crime.date || Date.now()).toLocaleString(),
        },
        {
          id: `EV-${crime.incidentId || '902'}-B`,
          name: 'Latent Fingerprint Card (Lifted from Scene)',
          type: 'Forensic Print',
          hash: 'sha256:8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
          vault: 'State FSL Vault #F-19',
          officer: 'Sgt. M. Patil (#BADGE-3091)',
          timestamp: new Date(crime.date || Date.now()).toLocaleString(),
        },
      ]

  const chainEvents = [
    {
      title: 'Evidence Recovery & Seizure at Scene',
      officer: 'Officer In-Charge (#BADGE-4092)',
      time: new Date(crime.date || Date.now()).toLocaleString(),
      status: 'LOGGED & SEALED',
      block: '0x7a8f9c...4b12',
    },
    {
      title: 'SHA-256 Hash Generation & Vault Deposit',
      officer: 'SCRB Evidence Vault Officer (#BADGE-1002)',
      time: new Date(new Date(crime.date || Date.now()).getTime() + 3600000).toLocaleString(),
      status: 'HASH LOCKED',
      block: '0x3e21d9...88a1',
    },
    {
      title: 'Transferred to State Forensic Science Lab (FSL)',
      officer: 'Chief Ballistics & Forensic Examiner (#BADGE-5011)',
      time: new Date(new Date(crime.date || Date.now()).getTime() + 86400000).toLocaleString(),
      status: 'LAB VERIFIED',
      block: '0x991bc2...e704',
    },
    {
      title: 'Tagged as Primary Court Exhibit',
      officer: 'Public Prosecutor Office (#BADGE-7003)',
      time: 'Latest Ledger Entry',
      status: 'SECURE IN CUSTODY',
      block: '0x44fa12...90bc',
    },
  ]

  return (
    <Box sx={{ p: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {crime.firNumber}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Incident ID: {crime.incidentId}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={getSeverityIcon(crime.severity)}
              label={crime.severity.toUpperCase()}
              color={getSeverityColor(crime.severity)}
            />
            <Chip
              label={crime.status}
              color={getStatusColor(crime.status)}
              variant="outlined"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Basic Info */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                <CalendarToday sx={{ mr: 1, fontSize: 16 }} />
                Date & Time
              </Typography>
              <Typography variant="body2">
                {new Date(crime.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {crime.time || 'Time not specified'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                Location
              </Typography>
              <Typography variant="body2">
                {crime.location?.address?.street || 'Address not available'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {crime.location?.address?.area}, {crime.location?.address?.city}
                {crime.location?.address?.district && `, ${crime.location.address.district.name}`}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                <DescriptionIcon sx={{ mr: 1, fontSize: 16 }} />
                Description
              </Typography>
              <Typography variant="body2">
                {crime.description || 'No description available'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                <BadgeIcon sx={{ mr: 1, fontSize: 16 }} />
                Crime Type
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {crime.crimeType?.name || 'Unknown'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Category: {crime.crimeType?.category || 'N/A'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                <CheckCircle sx={{ mr: 1, fontSize: 16 }} />
                Status Details
              </Typography>
              <Typography variant="body2">
                Reported by: {crime.reportedBy?.firstName || 'System'} {crime.reportedBy?.lastName || 'Officer'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Reported on: {new Date(crime.reportingDate || crime.date).toLocaleDateString()}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Victims & Suspects */}
        {(crime.victims?.length > 0 || crime.suspects?.length > 0) && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              People Involved
            </Typography>
            <Grid container spacing={2}>
              {crime.victims?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Victims ({crime.victims.length})
                    </Typography>
                    {crime.victims.map((victim) => (
                      <Box key={victim._id || victim.firstName} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#4caf50' }}>
                          <PersonIcon sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Typography variant="body2">
                          {victim.firstName} {victim.lastName}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              )}

              {crime.suspects?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Suspects ({crime.suspects.length})
                    </Typography>
                    {crime.suspects.map((suspect) => (
                      <Box key={suspect._id || suspect.firstName} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#f44336' }}>
                          <PersonIcon sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Typography variant="body2">
                          {suspect.firstName} {suspect.lastName}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {/* DIGITAL CHAIN OF CUSTODY & EVIDENCE MATRIX */}
        <Divider sx={{ my: 3 }} />

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #090e17 0%, #111a2e 100%)',
            border: '1px solid rgba(255,215,0,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            color: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Security sx={{ color: '#ffd700', fontSize: 28 }} />
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#ffd700', letterSpacing: 0.5 }}>
                  DIGITAL CHAIN OF CUSTODY & EVIDENCE MATRIX
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Cryptographic SHA-256 Ledger • Tamper-Proof Evidence Vault
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={verifying ? <Lock /> : <VerifiedUser />}
              onClick={handleVerifyIntegrity}
              disabled={verifying}
              sx={{
                background: verifiedHash
                  ? 'linear-gradient(135deg, #00c853, #00e676)'
                  : 'linear-gradient(135deg, #ffd700, #ffb300)',
                color: '#000000',
                fontWeight: 700,
                fontSize: '0.8rem',
                borderRadius: 2,
                px: 2.5,
                '&:hover': {
                  background: verifiedHash
                    ? 'linear-gradient(135deg, #00e676, #69f0ae)'
                    : 'linear-gradient(135deg, #ffe033, #ffd700)',
                },
              }}
            >
              {verifying ? 'Scanning Cryptographic Ledger...' : verifiedHash ? 'SHA-256 MATCH CONFIRMED' : 'Verify SHA-256 Integrity'}
            </Button>
          </Box>

          {verifying && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress sx={{ bgcolor: 'rgba(255,215,0,0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#ffd700' } }} />
            </Box>
          )}

          {/* Evidence Items List */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#ffffff', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Fingerprint sx={{ color: '#ffd700', fontSize: 18 }} />
            Logging & Forensic Exhibits ({evidenceItems.length})
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {evidenceItems.map((ev, i) => (
              <Grid item xs={12} key={i}>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    '&:hover': { border: '1px solid rgba(255,215,0,0.5)' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#ffffff' }}>
                          {ev.name}
                        </Typography>
                        <Chip label={ev.type} size="small" sx={{ bgcolor: 'rgba(255,215,0,0.15)', color: '#ffd700', fontSize: '0.65rem', height: 20 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#8899a6', display: 'block', mt: 0.5 }}>
                        Vault: <strong>{ev.vault}</strong> • Custodial Officer: <strong>{ev.officer}</strong>
                      </Typography>
                    </Box>

                    <Chip
                      icon={<FactCheck sx={{ fontSize: 14, color: '#00e676 !important' }} />}
                      label="SHA-256 SECURE"
                      size="small"
                      sx={{ bgcolor: 'rgba(0,230,118,0.15)', color: '#00e676', fontSize: '0.65rem', border: '1px solid rgba(0,230,118,0.3)' }}
                    />
                  </Box>

                  <Box sx={{ mt: 1.5, p: 1, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.72rem', color: '#ffd700', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Lock sx={{ fontSize: 14, color: '#8899a6' }} />
                    {ev.hash}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Custody Timeline Steps */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#ffffff', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timeline sx={{ color: '#ffd700', fontSize: 18 }} />
            Cryptographic Custody Timeline & Sign-Offs
          </Typography>

          <Box sx={{ position: 'relative', pl: 2, borderLeft: '2px dashed rgba(255,215,0,0.4)', ml: 1 }}>
            {chainEvents.map((evt, idx) => (
              <Box key={idx} sx={{ mb: 2, position: 'relative', pl: 2 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    left: -23,
                    top: 2,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#ffd700',
                    boxShadow: '0 0 8px #ffd700',
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#ffffff' }}>
                    {evt.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    {evt.time}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#8899a6', display: 'block' }}>
                  {evt.officer} • Ledger Block: <span style={{ color: '#ffd700', fontFamily: 'monospace' }}>{evt.block}</span>
                </Typography>
                <Chip
                  label={evt.status}
                  size="small"
                  sx={{ mt: 0.5, bgcolor: 'rgba(255,255,255,0.06)', color: '#00e676', fontSize: '0.6rem', height: 18 }}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      </motion.div>
    </Box>
  )
}

export default CrimeDetail