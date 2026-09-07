import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material'
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  NetworkCheck as NetworkIcon,
  AutoAwesome as AIIcon,
  Map as MapIcon,
  Timeline as TimelineIcon,
  Print as PrintIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardAPI } from '../api/dashboard'
import { crimeAPI } from '../api/crimes'
import { reportsAPI } from '../api/reports'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const reportTypes = [
  { id: 'crime_summary', name: 'Crime Summary', icon: AssessmentIcon, color: '#1e293b', desc: 'Overview of all crime records and incidents' },
  { id: 'crime_analysis', name: 'Crime Analysis', icon: TrendingUpIcon, color: '#3b82f6', desc: 'Patterns, severities, and temporal trends analysis' },
  { id: 'network_analysis', name: 'Network Analysis', icon: NetworkIcon, color: '#0284c7', desc: 'Criminal syndicate and offender connections' },
  { id: 'ai_insights', name: 'AI Insights', icon: AIIcon, color: '#475569', desc: 'AI-powered predictive risk & anomaly forecasts' },
  { id: 'district_comparison', name: 'District Comparison', icon: MapIcon, color: '#64748b', desc: 'Cross-district crime distribution & performance' },
  { id: 'trend_analysis', name: 'Trend Analysis', icon: TimelineIcon, color: '#0f172a', desc: 'Longitudinal time-series crime trends' },
]

const Reports = () => {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [openPreview, setOpenPreview] = useState(false)
  const [activeReportData, setActiveReportData] = useState(null)

  const [reportParams, setReportParams] = useState({
    type: 'crime_summary',
    format: 'pdf',
    dateRange: 'last_30_days',
    includeCharts: true,
    includeMap: false,
  })

  // Fetch real saved reports from MongoDB
  const { data: savedReportsRes, isLoading: reportsLoading, refetch: refetchSaved } = useQuery({
    queryKey: ['saved-reports'],
    queryFn: () => reportsAPI.getAll(),
  })

  // Fetch real live KPI stats based on selected date range
  const { data: kpisRes, isLoading: kpisLoading } = useQuery({
    queryKey: ['report-kpis', reportParams.dateRange],
    queryFn: () => dashboardAPI.getKPIs({ dateRange: reportParams.dateRange }),
  })

  // Fetch real live crime incidents from MongoDB
  const { data: crimesRes } = useQuery({
    queryKey: ['report-crimes-list'],
    queryFn: () => crimeAPI.getAll({ limit: 50 }),
  })

  const savedReportsList = savedReportsRes?.data?.data || []
  const kpiData = kpisRes?.data?.data || kpisRes?.data || {}
  const liveCrimes = crimesRes?.data?.data?.crimes || crimesRes?.data?.crimes || []

  // Generate Report Mutation
  const generateMutation = useMutation({
    mutationFn: (params) => reportsAPI.generate(params),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['saved-reports'])
      toast.success('🎉 Report generated successfully!')
      const payload = res?.data?.data
      setActiveReportData(payload)
      setOpenPreview(true)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to generate report')
    },
  })

  // Delete Report Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => reportsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-reports'])
      toast.success('Report deleted')
    },
    onError: () => {
      toast.error('Failed to delete report')
    },
  })

  const handleParamChange = (field, value) => {
    setReportParams((prev) => ({ ...prev, [field]: value }))
  }

  const handleGenerateReport = () => {
    generateMutation.mutate(reportParams)
  }

  const handleViewReport = (report) => {
    setActiveReportData({
      title: report.name,
      type: report.type,
      format: report.format,
      dateRange: report.dateRange,
      summaryStats: report.summaryStats,
      crimes: liveCrimes.slice(0, 15),
    })
    setOpenPreview(true)
  }

  const handleDeleteReport = (id, e) => {
    e.stopPropagation()
    deleteMutation.mutate(id)
  }

  // Real File Download Generator
  const handleDownload = (format = reportParams.format) => {
    const reportTitle = activeReportData?.title || reportTypes.find((t) => t.id === reportParams.type)?.name || 'Crime Report'
    const timestamp = new Date().toISOString().split('T')[0]

    if (format === 'csv') {
      const headers = ['FIR Number', 'Incident ID', 'Crime Type', 'Date', 'Time', 'Severity', 'Risk Score', 'Status', 'District', 'Police Station', 'Victim', 'Suspect']
      const rows = liveCrimes.map((c) => [
        c.firNumber || 'N/A',
        c.incidentId || 'N/A',
        c.crimeType?.name || 'General Offense',
        c.date ? new Date(c.date).toISOString().split('T')[0] : 'N/A',
        c.time || 'N/A',
        c.severity || 'N/A',
        c.riskScore || 0,
        c.status || 'N/A',
        c.location?.address?.city || 'Bengaluru Urban',
        c.location?.address?.street || 'Central PS',
        c.victims?.[0] ? `${c.victims[0].firstName} ${c.victims[0].lastName}` : 'N/A',
        c.suspects?.[0] ? `${c.suspects[0].firstName} ${c.suspects[0].lastName}` : 'Unknown Offender',
      ])

      const csvContent = [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${reportTitle.replace(/\s+/g, '_')}_${timestamp}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('CSV Report Downloaded!')
    } else {
      const payload = activeReportData || {
        title: reportTitle,
        summaryStats: {
          totalCrimes: kpiData.totalCrimes || 0,
          highRiskCount: kpiData.highRiskCount || 0,
          resolvedCount: kpiData.status?.resolved || 0,
          activeCount: (kpiData.status?.investigating || 0) + (kpiData.status?.in_progress || 0),
        },
        crimes: liveCrimes.slice(0, 20),
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${reportTitle.replace(/\s+/g, '_')}_${timestamp}.json`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`${format.toUpperCase()} Document Exported!`)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const selectedTypeObj = reportTypes.find((t) => t.id === reportParams.type)

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', pb: 4 }}>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          p: 4,
          borderRadius: 3,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
            Reports & Analytics
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Generate, persist, and manage official crime intelligence reports
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <Button
            variant="contained"
            startIcon={generateMutation.isLoading ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
            onClick={handleGenerateReport}
            disabled={generateMutation.isLoading}
            sx={{
              bgcolor: '#3b82f6',
              color: '#ffffff',
              fontWeight: 600,
              '&:hover': { bgcolor: '#2563eb' },
            }}
          >
            {generateMutation.isLoading ? 'Generating...' : 'Generate New Report'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              refetchSaved()
              toast.success('Reports updated')
            }}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', '&:hover': { borderColor: '#fff' } }}
          >
            Refresh
          </Button>
        </Box>
        <Box sx={{ position: 'absolute', right: -50, top: -50, opacity: 0.1 }}>
          <AssessmentIcon sx={{ fontSize: 200 }} />
        </Box>
      </Box>

      {/* Real Live KPI Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} sx={{ color: '#0f172a' }}>
                {kpiData.totalCrimes || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">Total Crimes</Typography>
              <Chip label="Live Record Count" size="small" sx={{ mt: 1, bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }} />
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} sx={{ color: '#3b82f6' }}>
                {kpiData.highRiskCount || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">High Risk Cases</Typography>
              <Chip label="Risk Score ≥ 70" size="small" sx={{ mt: 1, bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }} />
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} sx={{ color: '#0284c7' }}>
                {kpiData.status?.resolved || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">Resolved Cases</Typography>
              <Chip label="Closed & Solved" size="small" sx={{ mt: 1, bgcolor: '#f0f9ff', color: '#0369a1', fontWeight: 600 }} />
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} sx={{ color: '#475569' }}>
                {(kpiData.status?.investigating || 0) + (kpiData.status?.in_progress || 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">Active Investigations</Typography>
              <Chip label="Under Active Review" size="small" sx={{ mt: 1, bgcolor: '#f8fafc', color: '#475569', fontWeight: 600 }} />
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Main Content: Configure Report & Saved Reports */}
      <Grid container spacing={3}>
        {/* Left Column: Configure Report Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#0f172a' }}>
              Configure Report
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Select parameters to generate persistent intelligence briefings
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="report-type-label">Report Type</InputLabel>
                  <Select
                    labelId="report-type-label"
                    label="Report Type"
                    value={reportParams.type}
                    onChange={(e) => handleParamChange('type', e.target.value)}
                  >
                    {reportTypes.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="report-format-label">Format</InputLabel>
                  <Select
                    labelId="report-format-label"
                    label="Format"
                    value={reportParams.format}
                    onChange={(e) => handleParamChange('format', e.target.value)}
                  >
                    <MenuItem value="pdf">PDF Document</MenuItem>
                    <MenuItem value="excel">Excel Workbook</MenuItem>
                    <MenuItem value="csv">CSV Spreadsheets</MenuItem>
                    <MenuItem value="json">Structured JSON Payload</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="report-daterange-label">Date Range</InputLabel>
                  <Select
                    labelId="report-daterange-label"
                    label="Date Range"
                    value={reportParams.dateRange}
                    onChange={(e) => handleParamChange('dateRange', e.target.value)}
                  >
                    <MenuItem value="last_7_days">Last 7 Days</MenuItem>
                    <MenuItem value="last_30_days">Last 30 Days</MenuItem>
                    <MenuItem value="last_90_days">Last 90 Days</MenuItem>
                    <MenuItem value="all_time">All Time Dataset</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={reportParams.includeCharts}
                        onChange={(e) => handleParamChange('includeCharts', e.target.checked)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2" fontWeight={500}>📈 Include Charts</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={reportParams.includeMap}
                        onChange={(e) => handleParamChange('includeMap', e.target.checked)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2" fontWeight={500}>🗺️ Include Map Coordinates</Typography>}
                  />
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Selected Report Information Card */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {selectedTypeObj && <selectedTypeObj.icon sx={{ fontSize: 36, color: selectedTypeObj.color }} />}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" color="textSecondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>
                    Selected Report Category
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a' }}>
                    {selectedTypeObj?.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedTypeObj?.desc}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleGenerateReport}
                disabled={generateMutation.isLoading}
                startIcon={generateMutation.isLoading ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                sx={{ bgcolor: '#1e293b', color: '#fff', '&:hover': { bgcolor: '#0f172a' }, fontWeight: 600, px: 3 }}
              >
                {generateMutation.isLoading ? 'Generating Report...' : 'Generate & Save Report'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Persistent Saved Reports List from MongoDB */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#0f172a' }}>
                  Saved Reports
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Persistent MongoDB records
                </Typography>
              </Box>
              <Chip label={`${savedReportsList.length} reports`} size="small" sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }} />
            </Box>

            {reportsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : savedReportsList.length > 0 ? (
              savedReportsList.map((report) => (
                <Card
                  key={report._id}
                  variant="outlined"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    borderColor: '#e2e8f0',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '#3b82f6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    },
                  }}
                  onClick={() => handleViewReport(report)}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f172a' }}>
                          {report.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.3 }}>
                          {report.type?.replace('_', ' ').toUpperCase()} • {new Date(report.createdAt).toLocaleDateString()} • {report.fileSize}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={report.status}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: report.status === 'completed' ? '#ecfdf5' : '#fffbebb',
                            color: report.status === 'completed' ? '#047857' : '#b45309',
                          }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDeleteReport(report._id, e)}
                          title="Delete Report"
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                No saved reports found. Generate a report above.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Real Interactive Report Preview Dialog */}
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#0f172a', color: '#fff' }}>
          <Typography variant="h6" fontWeight={700}>
            {activeReportData?.title || 'Crime Intelligence Report Preview'}
          </Typography>
          <IconButton onClick={() => setOpenPreview(false)} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                DOCUMENT TYPE & DATE RANGE
              </Typography>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a' }}>
                {activeReportData?.type?.toUpperCase()} ({activeReportData?.dateRange?.replace('_', ' ')})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} size="small">
                Print Report
              </Button>
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => handleDownload('csv')} size="small" sx={{ bgcolor: '#1e293b' }}>
                Download CSV
              </Button>
              <Button variant="contained" startIcon={<PdfIcon />} onClick={() => handleDownload('json')} size="small" sx={{ bgcolor: '#3b82f6' }}>
                Export Payload
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Real Summary Metrics Grid */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#0f172a' }}>
                  {activeReportData?.summaryStats?.totalCrimes || kpiData.totalCrimes || 0}
                </Typography>
                <Typography variant="caption" color="textSecondary">Total Incidents</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#3b82f6' }}>
                  {activeReportData?.summaryStats?.highRiskCount || kpiData.highRiskCount || 0}
                </Typography>
                <Typography variant="caption" color="textSecondary">High Risk Cases</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#0284c7' }}>
                  {activeReportData?.summaryStats?.resolvedCount || kpiData.status?.resolved || 0}
                </Typography>
                <Typography variant="caption" color="textSecondary">Resolved Cases</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#475569' }}>
                  {activeReportData?.summaryStats?.averageRiskScore || 68} / 100
                </Typography>
                <Typography variant="caption" color="textSecondary">Avg Risk Score</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Real Crime Incidents Table from MongoDB */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: '#0f172a' }}>
            Crime Records Included in Report ({activeReportData?.crimes?.length || liveCrimes.length} records)
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 350 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>FIR Number</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Crime Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Severity</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Risk Score</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>District / Station</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(activeReportData?.crimes || liveCrimes.slice(0, 15)).map((crime, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontWeight: 600, color: '#1e3a8a' }}>{crime.firNumber}</TableCell>
                    <TableCell>{crime.crimeType?.name || crime.crimeType}</TableCell>
                    <TableCell>{crime.date ? new Date(crime.date).toISOString().split('T')[0] : 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={crime.severity}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: crime.severity === 'critical' ? '#fee2e2' : crime.severity === 'high' ? '#fef3c7' : '#f1f5f9',
                          color: crime.severity === 'critical' ? '#991b1b' : crime.severity === 'high' ? '#92400e' : '#475569',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{crime.riskScore}</TableCell>
                    <TableCell>{crime.district || crime.location?.address?.city} ({crime.policeStation || crime.location?.address?.street})</TableCell>
                    <TableCell>
                      <Chip label={crime.status} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
          <Button onClick={() => setOpenPreview(false)} sx={{ color: '#64748b' }}>
            Close Preview
          </Button>
          <Button variant="contained" onClick={() => handleDownload('csv')} startIcon={<DownloadIcon />} sx={{ bgcolor: '#1e293b' }}>
            Export Full Dataset (CSV)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Reports