import React, { useRef } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Divider, IconButton, CircularProgress, Alert,
} from '@mui/material'
import {
  Print as PrintIcon, Close as CloseIcon, Security as SecurityIcon,
  TrendingUp as TrendingUpIcon, Warning as WarningIcon, LocalPolice as PoliceIcon,
  Assessment as AssessmentIcon,
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
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1a237e', color: '#fff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SecurityIcon />
          <Typography variant="h6" component="span" fontWeight={700}>
            SCRB Executive Crime Intelligence Briefing
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ bgcolor: '#e91e63', '&:hover': { bgcolor: '#c2185b' }, fontWeight: 600 }}
          >
            Export PDF / Print Report
          </Button>
          <IconButton onClick={onClose} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }} id="printable-scrb-report" ref={printRef}>
        {/* Print Styles CSS */}
        <style>
          {`
            @media print {
              body * { visibility: hidden; }
              #printable-scrb-report, #printable-scrb-report * { visibility: visible; }
              #printable-scrb-report { position: absolute; left: 0; top: 0; width: 100%; }
              .no-print { display: none !important; }
            }
          `}
        </style>

        {/* Official Header */}
        <Box sx={{ textAlign: 'center', mb: 3, pb: 2, borderBottom: '3px double #1a237e' }}>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#1a237e', letterSpacing: 1, textTransform: 'uppercase' }}>
            Karnataka State Police — State Crime Records Bureau (SCRB)
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} color="error" sx={{ letterSpacing: 1.5, mt: 0.5 }}>
            CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE BRIEFING REPORT
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1.5 }}>
            <Chip label={`Report Ref: ${reportRefId}`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
            <Chip label={`Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`} size="small" variant="outlined" />
            <Chip label="Scope: Karnataka State Wide" size="small" color="primary" />
          </Box>
        </Box>

        {kpisLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <Box>
            {/* Section 1: Executive KPI Overview */}
            <Typography variant="h6" fontWeight={700} sx={{ color: '#1a237e', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon fontSize="small" /> 1. Executive State-Wide Crime Overview
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e8eaf6', borderRadius: 2, border: '1px solid #c5cae9', textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={800} color="#1a237e">{kpis.totalCrimes || 0}</Typography>
                  <Typography variant="caption" fontWeight={600} color="textSecondary">Total FIR Records</Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#fbe9e7', borderRadius: 2, border: '1px solid #ffccbc', textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={800} color="#d84315">{kpis.highRiskCount || 0}</Typography>
                  <Typography variant="caption" fontWeight={600} color="textSecondary">High-Risk Cases</Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#fce4ec', borderRadius: 2, border: '1px solid #f8bbd0', textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={800} color="#c2185b">{repeatOffenders.length}</Typography>
                  <Typography variant="caption" fontWeight={600} color="textSecondary">Active Repeat Suspects</Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #c8e6c9', textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={800} color="#2e7d32">{kpis.status?.resolved || 0}</Typography>
                  <Typography variant="caption" fontWeight={600} color="textSecondary">Resolved Cases</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Section 2: 7-Day AI Predictive Risk Forecast */}
            <Typography variant="h6" fontWeight={700} sx={{ color: '#1a237e', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon fontSize="small" /> 2. 7-Day AI Predictive Risk & Hotspot Forecast
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#1a237e' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>District Name</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Risk Score (0-100)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>7-Day Projected FIRs</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Forecast Trend</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Primary Socio-Economic Driver</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {predictions.slice(0, 6).map((pred, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 600 }}>{pred.districtName}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${pred.riskScore} / 100`}
                          size="small"
                          color={pred.riskScore >= 70 ? 'error' : pred.riskScore >= 40 ? 'warning' : 'success'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>~{pred.projectedIncidents7Days} Incidents</TableCell>
                      <TableCell>
                        <Chip label={pred.forecastTrend} size="small" variant="outlined" color={pred.forecastTrend?.startsWith('+') ? 'error' : 'success'} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{pred.primaryFactor}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Section 3: Repeat Offender & Cross-Jurisdiction Watchlist */}
            <Typography variant="h6" fontWeight={700} sx={{ color: '#1a237e', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PoliceIcon fontSize="small" /> 3. Cross-Jurisdiction Repeat Offender Watchlist
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#37474f' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Offender Name & Alias</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Jurisdiction Flag</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Crimes Linked</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Police Stations Covered</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Modus Operandi Tactics</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {repeatOffenders.slice(0, 5).map((offender, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 600 }}>{offender.name} <Typography variant="caption" color="textSecondary">({offender.alias})</Typography></TableCell>
                      <TableCell>
                        {offender.crossJurisdiction ? (
                          <Chip label="CROSS-JURISDICTION" color="error" size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                        ) : (
                          <Chip label="LOCAL" color="info" size="small" sx={{ fontSize: '0.65rem' }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{offender.crimesCount} FIRs</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{offender.policeStations?.join(', ') || 'District Central'}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>{offender.moTactics?.join('; ') || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Section 4: Actionable Tactical Patrolling Directives */}
            <Typography variant="h6" fontWeight={700} sx={{ color: '#1a237e', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon fontSize="small" /> 4. Actionable Patrolling & Dispatch Directives
            </Typography>

            <Alert severity="warning" sx={{ borderRadius: 2, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>SCRB Executive Directive:</Typography>
              District Superintendents of Police in high-risk zones (Risk Score &gt; 70) are instructed to deploy night patrolling units during peak diurnal hours (00:00 - 06:00) and establish cross-border checkpoints along identified repeat offender routes.
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f7fa', borderTop: '1px solid #e0e0e0' }}>
        <Button variant="outlined" onClick={onClose}>Close Briefing</Button>
        <Button variant="contained" color="secondary" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ bgcolor: '#e91e63' }}>
          Export PDF / Print Report
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ScrbReportDialog
