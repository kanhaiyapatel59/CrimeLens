import React, { useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material'
import {
  Print as PrintIcon,
  Close as CloseIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  LocalPolice as PoliceIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { dashboardAPI } from '../../api/dashboard'
import { networkAPI } from '../../api/network'

const ScrbReportDialog = ({ open, onClose }) => {
  const printRef = useRef()

  const { data: kpisData, isLoading: kpisLoading } = useQuery({
    queryKey: ['report-kpis'],
    queryFn: () => dashboardAPI.getKPIs(),
    enabled: open,
  })

  const { data: predictionsData } = useQuery({
    queryKey: ['report-predictions'],
    queryFn: () => dashboardAPI.getPredictions(),
    enabled: open,
  })

  const { data: anomaliesData } = useQuery({
    queryKey: ['report-anomalies'],
    queryFn: () => dashboardAPI.getAnomalies(),
    enabled: open,
  })

  const { data: repeatOffendersData } = useQuery({
    queryKey: ['report-repeat-offenders'],
    queryFn: () => networkAPI.getRepeatOffenders(),
    enabled: open,
  })

  const kpis = kpisData?.data?.data || kpisData?.data || {}
  const predictions = predictionsData?.data?.data || predictionsData?.data || []
  const anomalies = anomaliesData?.data?.data || anomaliesData?.data || []
  const repeatOffenders = repeatOffendersData?.data?.data || repeatOffendersData?.data || []

  const handlePrint = () => {
    window.print()
  }

  const reportRefId = `SCRB-KSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          boxShadow: 'var(--neu-shadow-raised-lg, 10px 10px 24px #C3C9D3, -10px -10px 24px #FFFFFF)',
          border: '1px solid rgba(255, 255, 255, 0.65)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          borderBottom: '1px solid var(--neu-divider, #D7DDE7)',
          py: 2,
          px: 3,
        }}
      >
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
            <SecurityIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" component="span" fontWeight={800} color="#202A3A" sx={{ fontSize: '1.1rem' }}>
              SCRB Executive Crime Intelligence Briefing
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: '#8893A4', fontWeight: 600 }}>
              Ref: {reportRefId} • Karnataka State Police HQ
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              bgcolor: '#356AE6',
              borderRadius: '10px',
              fontWeight: 700,
              boxShadow: 'var(--neu-shadow-primary-btn, 4px 4px 12px rgba(53, 106, 230, 0.35))',
            }}
          >
            Print
          </Button>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
              borderRadius: '10px',
              color: '#5C6779',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3.5 }, bgcolor: 'var(--neu-surface, #E8ECF3)' }} ref={printRef}>
        {kpisLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#356AE6' }} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* KPI Summary Cards */}
            <Grid container spacing={2}>
              {[
                { label: 'Total FIR Cases Logged', val: kpis?.totalCrimes || 0, color: '#356AE6' },
                { label: 'High/Critical Severity', val: kpis?.highRiskCount || 0, color: '#D94F55' },
                { label: 'Resolved / Closed Cases', val: kpis?.status?.resolved || 0, color: '#239B62' },
                { label: 'Active SCRB Inquiries', val: (kpis?.status?.investigating || 0) + (kpis?.status?.in_progress || 0), color: '#D99118' },
              ].map((kpi, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '16px',
                      bgcolor: 'var(--neu-surface, #E8ECF3)',
                      boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                      {kpi.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: kpi.color, mt: 0.5 }}>
                      {kpi.val}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Emerging Anomalies Section */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '18px',
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              <Typography variant="subtitle1" fontWeight={800} color="#202A3A" sx={{ mb: 1.5 }}>
                ⚠️ Emerging Statistical Anomalies
              </Typography>
              {anomalies.length === 0 ? (
                <Typography variant="body2" color="#8893A4">No critical anomalies detected.</Typography>
              ) : (
                <Grid container spacing={1.5}>
                  {anomalies.slice(0, 4).map((anom, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          bgcolor: 'rgba(217, 79, 85, 0.05)',
                          border: '1px solid rgba(217, 79, 85, 0.2)',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip label={anom.severity?.toUpperCase()} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#D94F55', color: '#fff' }} />
                          <Typography variant="caption" fontWeight={700} color="#D94F55">
                            {anom.confidenceScore}% Confidence
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={700} color="#202A3A" sx={{ mt: 0.8 }}>
                          {anom.title}
                        </Typography>
                        <Typography variant="caption" color="#5C6779" sx={{ display: 'block', mt: 0.3 }}>
                          {anom.description}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* Repeat Offenders & Suspects Section */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '18px',
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              <Typography variant="subtitle1" fontWeight={800} color="#202A3A" sx={{ mb: 1.5 }}>
                🔍 Monitored Repeat Offenders & Syndicate Members
              </Typography>
              <TableContainer
                sx={{
                  borderRadius: '14px',
                  boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(215, 221, 231, 0.4)' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#5C6779' }}>Offender / Alias</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#5C6779' }}>Primary MO</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#5C6779' }}>Known Links</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#5C6779' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {repeatOffenders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ color: '#8893A4' }}>No offender records</TableCell>
                      </TableRow>
                    ) : (
                      repeatOffenders.slice(0, 5).map((off, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 600, color: '#202A3A' }}>{off.name || off.alias || 'Suspect'}</TableCell>
                          <TableCell sx={{ color: '#5C6779' }}>{off.tactics || off.crimeType || 'Burglary'}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#356AE6' }}>{off.linkCount || 3} cases</TableCell>
                          <TableCell>
                            <Chip label="Active Watch" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#D99118', color: '#fff' }} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3, borderTop: '1px solid var(--neu-divider, #D7DDE7)' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#5C6779',
            fontWeight: 600,
            borderRadius: '10px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
            px: 2.5,
          }}
        >
          Close Briefing
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ScrbReportDialog
