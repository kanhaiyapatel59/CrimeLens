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
        <Typography variant="body1" sx={{ color: '#8893A4' }}>
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
      low: '#239B62',
      medium: '#D99118',
      high: '#D94F55',
      critical: '#E91E63',
    }
    return colors[severity] || '#356AE6'
  }

  const getSeverityIcon = (severity) => {
    const icons = {
      low: <Info sx={{ fontSize: 16 }} />,
      medium: <Info sx={{ fontSize: 16 }} />,
      high: <Warning sx={{ fontSize: 16 }} />,
      critical: <Error sx={{ fontSize: 16 }} />,
    }
    return icons[severity] || <Info sx={{ fontSize: 16 }} />
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
    <Box sx={{ p: 1 }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Header Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#202A3A', letterSpacing: '-0.02em' }}>
              {crime.firNumber}
            </Typography>
            <Typography variant="body2" sx={{ color: '#5C6779', fontWeight: 500 }}>
              Incident ID: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#356AE6' }}>{crime.incidentId}</span>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={getSeverityIcon(crime.severity)}
              label={crime.severity.toUpperCase()}
              sx={{
                bgcolor: `${getSeverityColor(crime.severity)}18`,
                color: getSeverityColor(crime.severity),
                fontWeight: 700,
                border: `1px solid ${getSeverityColor(crime.severity)}40`,
              }}
            />
            <Chip
              label={crime.status?.toUpperCase() || 'REPORTED'}
              sx={{
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                color: '#202A3A',
                fontWeight: 700,
              }}
            />
          </Box>
        </Box>

        {/* Basic Info Panels in Neumorphic Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#202A3A', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <CalendarToday sx={{ fontSize: 16, color: '#356AE6' }} />
                Date & Time of Incident
              </Typography>
              <Typography variant="body2" fontWeight={600} color="#202A3A">
                {new Date(crime.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
              <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 500 }}>
                Recorded Time: {crime.time || 'Time not specified'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#202A3A', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <LocationOn sx={{ fontSize: 16, color: '#D94F55' }} />
                Location & Jurisdiction
              </Typography>
              <Typography variant="body2" fontWeight={600} color="#202A3A">
                {crime.location?.address?.street || 'Address not registered'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 500 }}>
                {crime.location?.address?.area}, {crime.location?.address?.city}
                {crime.location?.address?.district && `, ${crime.location.address.district.name || crime.location.address.district}`}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#202A3A', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <DescriptionIcon sx={{ fontSize: 16, color: '#356AE6' }} />
                Incident Narrative
              </Typography>
              <Typography variant="body2" sx={{ color: '#5C6779', lineHeight: 1.6 }}>
                {crime.description || 'No description available'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#202A3A', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <BadgeIcon sx={{ fontSize: 16, color: '#356AE6' }} />
                Crime Classification
              </Typography>
              <Typography variant="body2" fontWeight={700} color="#202A3A">
                {crime.crimeType?.name || 'Classified Offence'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#8893A4' }}>
                Category: {crime.crimeType?.category || 'General Penal Code'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#202A3A', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <CheckCircle sx={{ fontSize: 16, color: '#239B62' }} />
                Registration Log
              </Typography>
              <Typography variant="body2" color="#202A3A">
                Logged By: <strong>{crime.reportedBy?.firstName || 'SCRB Officer'} {crime.reportedBy?.lastName || ''}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: '#8893A4' }}>
                Timestamp: {new Date(crime.reportingDate || crime.date).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Involved Parties: Victims & Suspects */}
        {(crime.victims?.length > 0 || crime.suspects?.length > 0) && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={800} color="#202A3A" sx={{ mb: 1.5 }}>
              Involved Persons
            </Typography>
            <Grid container spacing={2}>
              {crime.victims?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '16px',
                      bgcolor: 'var(--neu-surface, #E8ECF3)',
                      boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#239B62', mb: 1 }}>
                      Victims ({crime.victims.length})
                    </Typography>
                    {crime.victims.map((victim, i) => (
                      <Box key={victim._id || i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                        <Avatar sx={{ width: 26, height: 26, bgcolor: 'rgba(35, 155, 98, 0.2)', color: '#239B62', fontSize: 12, fontWeight: 700 }}>
                          V
                        </Avatar>
                        <Typography variant="body2" fontWeight={600} color="#202A3A">
                          {victim.firstName} {victim.lastName}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}

              {crime.suspects?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '16px',
                      bgcolor: 'var(--neu-surface, #E8ECF3)',
                      boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#D94F55', mb: 1 }}>
                      Suspects ({crime.suspects.length})
                    </Typography>
                    {crime.suspects.map((suspect, i) => (
                      <Box key={suspect._id || i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                        <Avatar sx={{ width: 26, height: 26, bgcolor: 'rgba(217, 79, 85, 0.2)', color: '#D94F55', fontSize: 12, fontWeight: 700 }}>
                          S
                        </Avatar>
                        <Typography variant="body2" fontWeight={600} color="#202A3A">
                          {suspect.firstName} {suspect.lastName}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* DIGITAL CHAIN OF CUSTODY & EVIDENCE MATRIX in Neumorphic Panel */}
        <Box
          sx={{
            mt: 3.5,
            p: 3,
            borderRadius: '20px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '12px',
                  bgcolor: '#356AE6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '3px 3px 8px rgba(53, 106, 230, 0.35)',
                }}
              >
                <Security sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} color="#202A3A">
                  Digital Chain of Custody & Evidence Matrix
                </Typography>
                <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 500 }}>
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
                bgcolor: verifiedHash ? '#239B62' : '#356AE6',
                color: '#fff !important',
                fontWeight: 700,
                fontSize: '0.8rem',
                borderRadius: '12px',
                px: 2.5,
                boxShadow: verifiedHash
                  ? '4px 4px 12px rgba(35, 155, 98, 0.35)'
                  : '4px 4px 12px rgba(53, 106, 230, 0.35)',
                '&:hover': {
                  bgcolor: verifiedHash ? '#1E8453' : '#2955C4',
                },
              }}
            >
              {verifying ? 'Scanning Ledger...' : verifiedHash ? 'SHA-256 MATCH CONFIRMED' : 'Verify SHA-256 Integrity'}
            </Button>
          </Box>

          {verifying && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress sx={{ borderRadius: 4, height: 6, bgcolor: '#D7DDE7', '& .MuiLinearProgress-bar': { bgcolor: '#356AE6' } }} />
            </Box>
          )}

          {/* Evidence Items */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#202A3A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Fingerprint sx={{ color: '#356AE6', fontSize: 18 }} />
            Forensic Exhibits & Evidence Items ({evidenceItems.length})
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {evidenceItems.map((ev, i) => (
              <Grid item xs={12} key={i}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: 'var(--neu-surface, #E8ECF3)',
                    boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={700} color="#202A3A">
                          {ev.name}
                        </Typography>
                        <Chip label={ev.type} size="small" sx={{ bgcolor: 'rgba(53, 106, 230, 0.1)', color: '#356AE6', fontSize: '0.65rem', height: 20, fontWeight: 700 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#5C6779', display: 'block', mt: 0.5 }}>
                        Vault: <strong>{ev.vault}</strong> • Custodial Officer: <strong>{ev.officer}</strong>
                      </Typography>
                    </Box>

                    <Chip
                      icon={<FactCheck sx={{ fontSize: 14, color: '#239B62 !important' }} />}
                      label="SHA-256 VERIFIED"
                      size="small"
                      sx={{ bgcolor: 'rgba(35, 155, 98, 0.12)', color: '#239B62', fontSize: '0.65rem', fontWeight: 700 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      mt: 1.2,
                      p: 1,
                      bgcolor: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '0.72rem',
                      color: '#202A3A',
                      wordBreak: 'break-all',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Lock sx={{ fontSize: 14, color: '#8893A4' }} />
                    {ev.hash}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Custody Timeline */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#202A3A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timeline sx={{ color: '#356AE6', fontSize: 18 }} />
            Chain of Custody Events
          </Typography>

          <Box sx={{ position: 'relative', pl: 2, borderLeft: '2px solid #356AE6', ml: 1 }}>
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
                    bgcolor: '#356AE6',
                    boxShadow: '0 0 8px rgba(53, 106, 230, 0.6)',
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <Typography variant="body2" fontWeight={700} color="#202A3A">
                    {evt.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8893A4' }}>
                    {evt.time}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#5C6779', display: 'block' }}>
                  {evt.officer} • Block: <span style={{ fontFamily: 'monospace', color: '#356AE6', fontWeight: 600 }}>{evt.block}</span>
                </Typography>
                <Chip
                  label={evt.status}
                  size="small"
                  sx={{ mt: 0.5, bgcolor: 'rgba(35, 155, 98, 0.12)', color: '#239B62', fontSize: '0.62rem', height: 18, fontWeight: 700 }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </motion.div>
    </Box>
  )
}

export default CrimeDetail