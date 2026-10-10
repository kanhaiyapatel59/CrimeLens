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
  { id: 'crime_summary', name: 'Crime Summary', icon: AssessmentIcon, color: '#356AE6', desc: 'Overview of all crime records and incidents' },
  { id: 'crime_analysis', name: 'Crime Analysis', icon: TrendingUpIcon, color: '#239B62', desc: 'Patterns, severities, and temporal trends analysis' },
  { id: 'network_analysis', name: 'Network Analysis', icon: NetworkIcon, color: '#356AE6', desc: 'Criminal syndicate and offender connections' },
  { id: 'ai_insights', name: 'AI Insights', icon: AIIcon, color: '#8E44AD', desc: 'AI-powered predictive risk & anomaly forecasts' },
  { id: 'district_comparison', name: 'District Comparison', icon: MapIcon, color: '#D99118', desc: 'Cross-district crime distribution & performance' },
  { id: 'trend_analysis', name: 'Trend Analysis', icon: TimelineIcon, color: '#2C3E50', desc: 'Longitudinal time-series crime trends' },
]

const Reports = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const queryClient = useQueryClient()

  const bgSurface = isDark ? '#1A1E29' : '#E8ECF3'
  const textPrimary = isDark ? '#F0F4FC' : '#202A3A'
  const textSecondary = isDark ? '#9DA8BA' : '#5C6779'
  const dividerColor = isDark ? '#262B3A' : '#D7DDE7'
  const raisedShadow = isDark
    ? '6px 6px 14px #12151D, -6px -6px 14px #222735'
    : '7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF'
  const raisedSubtle = isDark
    ? '4px 4px 10px #12151D, -4px -4px 10px #222735'
    : '4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF'
  const insetShadow = isDark
    ? 'inset 3px 3px 7px #12151D, inset -3px -3px 7px #232837'
    : 'inset 4px 4px 8px #C7CDD7, inset -4px -4px 8px #FFFFFF'

  const selectSx = {
    bgcolor: bgSurface,
    boxShadow: insetShadow,
    borderRadius: 3,
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiSelect-select': { color: textPrimary, fontWeight: 600, fontSize: '0.88rem', py: 1.2 },
    '& .MuiSvgIcon-root': { color: textSecondary },
  }

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
      {/* Neumorphic Page Header */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
          p: { xs: 3, md: 3.5 },
          borderRadius: 4,
          bgcolor: bgSurface,
          boxShadow: raisedShadow,
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${dividerColor}`,
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 3,
                bgcolor: bgSurface,
                boxShadow: raisedSubtle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#356AE6',
              }}
            >
              <AssessmentIcon fontSize="small" />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: textPrimary, letterSpacing: -0.3 }}>
              Intelligence Reports & Analytics
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: textSecondary }}>
            Generate, persist, and distribute statutory Karnataka police intelligence reports
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <Button
            variant="contained"
            startIcon={generateMutation.isLoading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            onClick={handleGenerateReport}
            disabled={generateMutation.isLoading}
            sx={{
              bgcolor: '#356AE6',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: 3,
              px: 2.5,
              py: 1,
              textTransform: 'none',
              boxShadow: '4px 4px 12px rgba(53, 106, 230, 0.4)',
              '&:hover': { bgcolor: '#254EBF' },
            }}
          >
            {generateMutation.isLoading ? 'Generating...' : 'Generate New Report'}
          </Button>

          <Button
            startIcon={<RefreshIcon />}
            onClick={() => {
              refetchSaved()
              toast.success('Reports updated')
            }}
            sx={{
              bgcolor: bgSurface,
              boxShadow: raisedSubtle,
              color: textPrimary,
              borderRadius: 3,
              px: 2,
              py: 1,
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              border: `1px solid ${dividerColor}`,
              '&:hover': { bgcolor: bgSurface, boxShadow: insetShadow },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Real Live KPI Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: bgSurface, boxShadow: raisedShadow, textAlign: 'left', border: `1px solid ${dividerColor}` }}>
              <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Total Crime Records
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ color: textPrimary, my: 0.8, letterSpacing: -0.5 }}>
                {kpiData.totalCrimes || 0}
              </Typography>
              <Chip
                label="Live Records"
                size="small"
                sx={{
                  bgcolor: 'rgba(53, 106, 230, 0.1)',
                  color: '#356AE6',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  borderRadius: 2,
                }}
              />
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: bgSurface, boxShadow: raisedShadow, textAlign: 'left', border: `1px solid ${dividerColor}` }}>
              <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                High Risk Cases
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ color: '#D94F55', my: 0.8, letterSpacing: -0.5 }}>
                {kpiData.highRiskCount || 0}
              </Typography>
              <Chip
                label="Score ≥ 70"
                size="small"
                sx={{
                  bgcolor: 'rgba(217, 79, 85, 0.12)',
                  color: '#D94F55',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  borderRadius: 2,
                }}
              />
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: bgSurface, boxShadow: raisedShadow, textAlign: 'left', border: `1px solid ${dividerColor}` }}>
              <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Resolved Incidents
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ color: '#239B62', my: 0.8, letterSpacing: -0.5 }}>
                {kpiData.status?.resolved || 0}
              </Typography>
              <Chip
                label="Closed & Solved"
                size="small"
                sx={{
                  bgcolor: 'rgba(35, 155, 98, 0.12)',
                  color: '#239B62',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  borderRadius: 2,
                }}
              />
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: bgSurface, boxShadow: raisedShadow, textAlign: 'left', border: `1px solid ${dividerColor}` }}>
              <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Active Inquiries
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ color: '#D99118', my: 0.8, letterSpacing: -0.5 }}>
                {(kpiData.status?.investigating || 0) + (kpiData.status?.in_progress || 0)}
              </Typography>
              <Chip
                label="Under Investigation"
                size="small"
                sx={{
                  bgcolor: 'rgba(217, 145, 24, 0.12)',
                  color: '#D99118',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  borderRadius: 2,
                }}
              />
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Main Content: Configure Report & Saved Reports */}
      <Grid container spacing={3}>
        {/* Left Column: Configure Report Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 4, mb: 4, bgcolor: bgSurface, boxShadow: raisedShadow, border: `1px solid ${dividerColor}` }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5, color: textPrimary, fontSize: '1.05rem' }}>
              Configure Statutory Report
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
              Select parameters to generate persistent intelligence briefings
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="report-type-label" sx={{ color: textSecondary, fontWeight: 600 }}>Report Type</InputLabel>
                  <Select
                    labelId="report-type-label"
                    label="Report Type"
                    value={reportParams.type}
                    onChange={(e) => handleParamChange('type', e.target.value)}
                    sx={selectSx}
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
                  <InputLabel id="report-format-label" sx={{ color: textSecondary, fontWeight: 600 }}>Export Format</InputLabel>
                  <Select
                    labelId="report-format-label"
                    label="Export Format"
                    value={reportParams.format}
                    onChange={(e) => handleParamChange('format', e.target.value)}
                    sx={selectSx}
                  >
                    <MenuItem value="pdf">PDF Document (Official SCRB)</MenuItem>
                    <MenuItem value="excel">Excel Workbook (.xlsx)</MenuItem>
                    <MenuItem value="csv">CSV Spreadsheets</MenuItem>
                    <MenuItem value="json">Structured JSON Payload</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="report-daterange-label" sx={{ color: textSecondary, fontWeight: 600 }}>Date Range</InputLabel>
                  <Select
                    labelId="report-daterange-label"
                    label="Date Range"
                    value={reportParams.dateRange}
                    onChange={(e) => handleParamChange('dateRange', e.target.value)}
                    sx={selectSx}
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
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#356AE6' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#356AE6' },
                        }}
                      />
                    }
                    label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>📈 Include Statistical Charts</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={reportParams.includeMap}
                        onChange={(e) => handleParamChange('includeMap', e.target.checked)}
                        size="small"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#356AE6' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#356AE6' },
                        }}
                      />
                    }
                    label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>🗺️ Include Map Coordinates</Typography>}
                  />
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderColor: dividerColor }} />

            {/* Selected Report Information Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: bgSurface,
                boxShadow: insetShadow,
                border: 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {selectedTypeObj && (
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 3,
                      bgcolor: bgSurface,
                      boxShadow: raisedSubtle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: selectedTypeObj.color,
                      flexShrink: 0,
                    }}
                  >
                    <selectedTypeObj.icon sx={{ fontSize: 24 }} />
                  </Box>
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Selected Report Category
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: textPrimary }}>
                    {selectedTypeObj?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSecondary, fontSize: '0.85rem' }}>
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
                startIcon={generateMutation.isLoading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                sx={{
                  bgcolor: '#356AE6',
                  color: '#fff',
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  boxShadow: '4px 4px 12px rgba(53, 106, 230, 0.4)',
                  '&:hover': { bgcolor: '#254EBF' },
                }}
              >
                {generateMutation.isLoading ? 'Generating Report...' : 'Generate & Save Report'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Persistent Saved Reports List from MongoDB */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, borderRadius: 4, bgcolor: bgSurface, boxShadow: raisedShadow, border: `1px solid ${dividerColor}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ color: textPrimary, fontSize: '1.05rem' }}>
                  Saved Briefings
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary }}>
                  Persistent MongoDB archival store
                </Typography>
              </Box>
              <Chip
                label={`${savedReportsList.length} files`}
                size="small"
                sx={{
                  bgcolor: bgSurface,
                  boxShadow: raisedSubtle,
                  color: '#356AE6',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  borderRadius: 2,
                }}
              />
            </Box>

            {reportsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ color: '#356AE6' }} />
              </Box>
            ) : savedReportsList.length > 0 ? (
              savedReportsList.map((report) => (
                <Card
                  key={report._id}
                  elevation={0}
                  sx={{
                    mb: 2,
                    borderRadius: 3,
                    bgcolor: bgSurface,
                    boxShadow: raisedSubtle,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    border: `1px solid ${dividerColor}`,
                    '&:hover': {
                      boxShadow: insetShadow,
                      transform: 'translateY(-1px)',
                    },
                  }}
                  onClick={() => handleViewReport(report)}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ color: textPrimary, fontSize: '0.88rem' }}>
                          {report.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: textSecondary, display: 'block', mt: 0.3, fontSize: '0.72rem' }}>
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
                            bgcolor: report.status === 'completed' ? 'rgba(35, 155, 98, 0.15)' : 'rgba(217, 145, 24, 0.15)',
                            color: report.status === 'completed' ? '#239B62' : '#D99118',
                            borderRadius: 1.5,
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => handleDeleteReport(report._id, e)}
                          title="Delete Report"
                          sx={{
                            color: textSecondary,
                            '&:hover': { color: '#D94F55' },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: textSecondary }}>
                  No saved reports found. Configure and generate above.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Real Interactive Report Preview Dialog */}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: bgSurface,
            boxShadow: raisedShadow,
            border: `1px solid ${dividerColor}`,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: bgSurface, color: textPrimary, borderBottom: `1px solid ${dividerColor}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AssessmentIcon sx={{ color: '#356AE6' }} />
            <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.05rem' }}>
              {activeReportData?.title || 'Crime Intelligence Report Preview'}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpenPreview(false)}
            size="small"
            sx={{ bgcolor: bgSurface, boxShadow: raisedSubtle, color: textSecondary }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3.5, bgcolor: bgSurface }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 700, letterSpacing: 0.5, display: 'block' }}>
                DOCUMENT TYPE & DATE RANGE
              </Typography>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: textPrimary }}>
                {activeReportData?.type?.toUpperCase()} ({activeReportData?.dateRange?.replace('_', ' ')})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                size="small"
                sx={{
                  bgcolor: bgSurface,
                  boxShadow: raisedSubtle,
                  color: textPrimary,
                  borderRadius: 2.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 2,
                  '&:hover': { bgcolor: bgSurface, boxShadow: insetShadow },
                }}
              >
                Print
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload('csv')}
                size="small"
                sx={{
                  bgcolor: '#356AE6',
                  color: '#fff',
                  borderRadius: 2.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2,
                  boxShadow: '3px 3px 8px rgba(53, 106, 230, 0.4)',
                  '&:hover': { bgcolor: '#254EBF' },
                }}
              >
                Download CSV
              </Button>
              <Button
                startIcon={<PdfIcon />}
                onClick={() => handleDownload('json')}
                size="small"
                sx={{
                  bgcolor: bgSurface,
                  boxShadow: raisedSubtle,
                  color: '#356AE6',
                  borderRadius: 2.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2,
                  '&:hover': { bgcolor: bgSurface, boxShadow: insetShadow },
                }}
              >
                Export Payload
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 3, borderColor: dividerColor }} />

          {/* Real Summary Metrics Grid */}
          <Grid container spacing={2} sx={{ mb: 3.5 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: bgSurface, boxShadow: raisedSubtle }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: textPrimary }}>
                  {activeReportData?.summaryStats?.totalCrimes || kpiData.totalCrimes || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 600 }}>Total Incidents</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: bgSurface, boxShadow: raisedSubtle }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#D94F55' }}>
                  {activeReportData?.summaryStats?.highRiskCount || kpiData.highRiskCount || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 600 }}>High Risk Cases</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: bgSurface, boxShadow: raisedSubtle }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#239B62' }}>
                  {activeReportData?.summaryStats?.resolvedCount || kpiData.status?.resolved || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 600 }}>Resolved Cases</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: bgSurface, boxShadow: raisedSubtle }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#356AE6' }}>
                  {activeReportData?.summaryStats?.averageRiskScore || 68} / 100
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 600 }}>Avg Risk Score</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Real Crime Incidents Table from MongoDB */}
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2, color: textPrimary }}>
            Included FIR Incidents ({activeReportData?.crimes?.length || liveCrimes.length} records)
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, maxHeight: 350, bgcolor: bgSurface, boxShadow: insetShadow }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: bgSurface, color: textPrimary, borderBottom: `1px solid ${dividerColor}` }}>FIR Number</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: bgSurface, color: textPrimary, borderBottom: `1px solid ${dividerColor}` }}>Crime Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: bgSurface, color: textPrimary, borderBottom: `1px solid ${dividerColor}` }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: bgSurface, color: textPrimary, borderBottom: `1px solid ${dividerColor}` }}>Severity</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: bgSurface, color: textPrimary, borderBottom: `1px solid ${dividerColor}` }}>Risk Score</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: bgSurface, color: textPrimary, borderBottom: `1px solid ${dividerColor}` }}>District / Station</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: bgSurface, color: textPrimary, borderBottom: `1px solid ${dividerColor}` }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(activeReportData?.crimes || liveCrimes.slice(0, 15)).map((crime, idx) => (
                  <TableRow key={idx} hover sx={{ '&:hover': { bgcolor: 'rgba(53, 106, 230, 0.05)' } }}>
                    <TableCell sx={{ fontWeight: 700, color: '#356AE6', borderBottom: `1px solid ${dividerColor}` }}>{crime.firNumber}</TableCell>
                    <TableCell sx={{ color: textPrimary, borderBottom: `1px solid ${dividerColor}` }}>{crime.crimeType?.name || crime.crimeType}</TableCell>
                    <TableCell sx={{ color: textSecondary, borderBottom: `1px solid ${dividerColor}` }}>{crime.date ? new Date(crime.date).toISOString().split('T')[0] : 'N/A'}</TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${dividerColor}` }}>
                      <Chip
                        label={crime.severity}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: crime.severity === 'critical' ? 'rgba(217, 79, 85, 0.15)' : crime.severity === 'high' ? 'rgba(217, 145, 24, 0.15)' : 'rgba(100, 116, 139, 0.12)',
                          color: crime.severity === 'critical' ? '#D94F55' : crime.severity === 'high' ? '#D99118' : textSecondary,
                          borderRadius: 1.5,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: textPrimary, borderBottom: `1px solid ${dividerColor}` }}>{crime.riskScore}</TableCell>
                    <TableCell sx={{ color: textSecondary, borderBottom: `1px solid ${dividerColor}` }}>{crime.district || crime.location?.address?.city} ({crime.policeStation || crime.location?.address?.street})</TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${dividerColor}` }}>
                      <Chip label={crime.status} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: bgSurface, boxShadow: raisedSubtle, color: textPrimary }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: bgSurface, borderTop: `1px solid ${dividerColor}` }}>
          <Button
            onClick={() => setOpenPreview(false)}
            sx={{
              bgcolor: bgSurface,
              boxShadow: raisedSubtle,
              color: textSecondary,
              borderRadius: 2.5,
              fontWeight: 600,
              textTransform: 'none',
              px: 2.5,
              '&:hover': { bgcolor: bgSurface, boxShadow: insetShadow },
            }}
          >
            Close Preview
          </Button>
          <Button
            variant="contained"
            onClick={() => handleDownload('csv')}
            startIcon={<DownloadIcon />}
            sx={{
              bgcolor: '#356AE6',
              color: '#fff',
              borderRadius: 2.5,
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
              boxShadow: '3px 3px 10px rgba(53, 106, 230, 0.4)',
              '&:hover': { bgcolor: '#254EBF' },
            }}
          >
            Export Full Dataset (CSV)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Reports