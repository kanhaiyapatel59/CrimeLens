import React from 'react'
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
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const CrimeDetail = ({ crime }) => {
  if (!crime) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No crime data available
        </Typography>
      </Box>
    )
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
                Reported by: {crime.reportedBy?.firstName} {crime.reportedBy?.lastName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Reported on: {new Date(crime.reportingDate).toLocaleDateString()}
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
                      <Box key={victim._id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
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
                      <Box key={suspect._id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
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

        {/* Evidence & Investigation */}
        {(crime.evidence?.length > 0 || crime.investigation) && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Investigation Details
            </Typography>
            <Grid container spacing={2}>
              {crime.evidence?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Evidence ({crime.evidence.length})
                    </Typography>
                    {crime.evidence.map((item) => (
                      <Box key={item._id} sx={{ py: 0.5 }}>
                        <Typography variant="body2">
                          • {item.name || 'Unnamed evidence'}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              )}

              {crime.investigation && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Investigation Status
                    </Typography>
                    <Typography variant="body2">
                      Case: {crime.investigation.caseNumber || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Officer: {crime.investigation.investigatingOfficer?.firstName} {crime.investigation.investigatingOfficer?.lastName}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </motion.div>
    </Box>
  )
}

export default CrimeDetail