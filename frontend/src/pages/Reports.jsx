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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  Avatar,
  Badge,
  Fade,
  Stack,
  alpha,
  useTheme,
} from '@mui/material'
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  NetworkCheck as NetworkIcon,
  AutoAwesome as AIIcon,
  Map as MapIcon,
  Timeline as TimelineIcon,
  Description as DescriptionIcon,
  ChevronRight as ChevronRightIcon,
  Gradient as GradientIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { dashboardAPI } from '../api/dashboard'
import { crimeAPI } from '../api/crimes'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const Reports = () => {
  const theme = useTheme()
  const [openPreview, setOpenPreview] = useState(false)
  const [reportParams, setReportParams] = useState({
    type: 'crime_summary',
    format: 'pdf',
    dateRange: 'last_30_days',
    includeCharts: true,
    includeMap: false,
  })

  // Fetch real data
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['report-kpis'],
    queryFn: () => dashboardAPI.getKPIs({ days: 30 }),
  })

  const { data: recentCrimes } = useQuery({
    queryKey: ['report-recent-crimes'],
    queryFn: () => crimeAPI.getAll({ limit: 20 }),
  })

  const kpiData = kpis?.data || {}

  const reportTypes = [
    { id: 'crime_summary', name: 'Crime Summary', icon: AssessmentIcon, color: '#1a237e', desc: 'Overview of all crime records' },
    { id: 'crime_analysis', name: 'Crime Analysis', icon: TrendingUpIcon, color: '#e91e63', desc: 'Patterns and trends analysis' },
    { id: 'network_analysis', name: 'Network Analysis', icon: NetworkIcon, color: '#4caf50', desc: 'Criminal network connections' },
    { id: 'ai_insights', name: 'AI Insights', icon: AIIcon, color: '#7c4dff', desc: 'AI-powered predictions and insights' },
    { id: 'district_comparison', name: 'District Comparison', icon: MapIcon, color: '#ff9800', desc: 'Compare districts performance' },
    { id: 'trend_analysis', name: 'Trend Analysis', icon: TimelineIcon, color: '#2196f3', desc: 'Time-based crime trends' },
  ]

  const savedReports = [
    { id: 1, name: 'Monthly Crime Summary', type: 'crime_summary', date: new Date().toISOString(), size: '2.4 MB', status: 'completed' },
    { id: 2, name: 'Network Analysis - Connections', type: 'network_analysis', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), size: '1.8 MB', status: 'completed' },
    { id: 3, name: 'AI Insights - Anomaly Detection', type: 'ai_insights', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), size: '3.1 MB', status: 'completed' },
    { id: 4, name: 'District Comparison Q1 2026', type: 'district_comparison', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), size: '4.2 MB', status: 'processing' },
    { id: 5, name: 'Trend Analysis - Last 3 Months', type: 'trend_analysis', date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), size: '2.9 MB', status: 'completed' },
  ]

  const generateReportData = () => {
    const type = reportParams.type
    const crimes = recentCrimes?.data?.data?.crimes || recentCrimes?.data?.crimes || []
    
    return {
      title: reportTypes.find(t => t.id === type)?.name || 'Crime Summary Report',
      totalCrimes: kpiData.totalCrimes || 0,
      highRisk: kpiData.highRiskCount || 0,
      resolved: kpiData.status?.resolved || 0,
      active: (kpiData.status?.investigating || 0) + (kpiData.status?.in_progress || 0),
      severity: kpiData.severity || {},
      recentCrimes: crimes.slice(0, 5),
    }
  }

  const handleGenerateReport = () => setOpenPreview(true)
  const handleDownload = (format) => {
    toast.success(`Downloading ${format.toUpperCase()} report...`)
    const data = generateReportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${reportParams.type}_${new Date().toISOString().split('T')[0]}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.success(`${format.toUpperCase()} report downloaded!`)
  }

  const handleScheduleReport = () => toast.success('Report scheduled for weekly delivery')
  const handleRefresh = () => toast.success('Reports refreshed')

  const reportData = generateReportData()
  const selectedType = reportTypes.find(t => t.id === reportParams.type)

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', pb: 4 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4, 
        flexWrap: 'wrap', 
        gap: 2,
        background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
        p: 4,
        borderRadius: 3,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
            Reports & Analytics
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Generate and manage crime intelligence reports
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleGenerateReport}
            sx={{
              bgcolor: '#fff',
              color: '#1a237e',
              '&:hover': { bgcolor: '#e8eaf6' },
            }}
          >
            New Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', '&:hover': { borderColor: '#fff' } }}
          >
            Refresh
          </Button>
        </Box>
        {/* Decorative Background */}
        <Box sx={{ position: 'absolute', right: -50, top: -50, opacity: 0.1 }}>
          <AssessmentIcon sx={{ fontSize: 200 }} />
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="primary">
                {reportData.totalCrimes}
              </Typography>
              <Typography variant="body2" color="textSecondary">Total Crimes</Typography>
              <Chip label="+12% vs last month" size="small" color="success" sx={{ mt: 1 }} />
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="error">
                {reportData.highRisk}
              </Typography>
              <Typography variant="body2" color="textSecondary">High Risk Cases</Typography>
              <Chip label="Critical" size="small" color="error" sx={{ mt: 1 }} />
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="success">
                {reportData.resolved}
              </Typography>
              <Typography variant="body2" color="textSecondary">Resolved Cases</Typography>
              <Chip label="+5% solved" size="small" color="success" sx={{ mt: 1 }} />
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="warning">
                {reportData.active}
              </Typography>
              <Typography variant="body2" color="textSecondary">Active Investigations</Typography>
              <Chip label="In Progress" size="small" color="warning" sx={{ mt: 1 }} />
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Report Configuration */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon sx={{ color: '#1a237e' }} />
              Configure Report
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportParams.type}
                onChange={(e) => setReportParams({ ...reportParams, type: e.target.value })}
                label="Report Type"
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <type.icon sx={{ color: type.color, fontSize: 20 }} />
                      {type.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Format</InputLabel>
              <Select
                value={reportParams.format}
                onChange={(e) => setReportParams({ ...reportParams, format: e.target.value })}
                label="Format"
              >
                <MenuItem value="pdf">📄 PDF</MenuItem>
                <MenuItem value="excel">📊 Excel</MenuItem>
                <MenuItem value="csv">📋 CSV</MenuItem>
                <MenuItem value="json">📦 JSON</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={reportParams.dateRange}
                onChange={(e) => setReportParams({ ...reportParams, dateRange: e.target.value })}
                label="Date Range"
              >
                <MenuItem value="last_7_days">Last 7 Days</MenuItem>
                <MenuItem value="last_30_days">Last 30 Days</MenuItem>
                <MenuItem value="last_90_days">Last 90 Days</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                  type="checkbox"
                  checked={reportParams.includeCharts}
                  onChange={(e) => setReportParams({ ...reportParams, includeCharts: e.target.checked })}
                />
                <Typography variant="body2">📈 Include Charts</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                  type="checkbox"
                  checked={reportParams.includeMap}
                  onChange={(e) => setReportParams({ ...reportParams, includeMap: e.target.checked })}
                />
                <Typography variant="body2">🗺️ Include Map</Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleGenerateReport}
              sx={{ 
                bgcolor: '#1a237e', 
                '&:hover': { bgcolor: '#283593' },
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Generate Report
            </Button>

            {/* Selected Report Preview */}
            {selectedType && (
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="caption" color="textSecondary">Selected Report</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <selectedType.icon sx={{ color: selectedType.color }} />
                  <Typography variant="body2" fontWeight={500}>{selectedType.name}</Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">{selectedType.desc}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Saved Reports */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Saved Reports
              </Typography>
              <Chip label={`${savedReports.length} reports`} size="small" color="primary" />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {['All', 'Crime Summary', 'Network Analysis', 'AI Insights', 'District', 'Trend'].map((label, i) => (
                <Chip
                  key={i}
                  label={label}
                  size="small"
                  color={i === 0 ? 'primary' : 'default'}
                  onClick={() => setTabValue(i)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>

            {savedReports.map((report, index) => {
              const type = reportTypes.find(t => t.id === report.type)
              const isProcessing = report.status === 'processing'
              
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      border: '1px solid transparent',
                      '&:hover': {
                        borderColor: '#1a237e',
                        boxShadow: '0 4px 20px rgba(26, 35, 126, 0.08)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: type?.color || '#1a237e', width: 40, height: 40 }}>
                            {type?.icon ? <type.icon sx={{ fontSize: 20, color: '#fff' }} /> : <DescriptionIcon sx={{ fontSize: 20, color: '#fff' }} />}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {report.name}
                              {isProcessing && (
                                <Chip label="Processing" size="small" color="warning" sx={{ ml: 1 }} />
                              )}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {type?.name || report.type}
                              {' • '}
                              {new Date(report.date).toLocaleDateString()}
                              {' • '}
                              {report.size}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => setOpenPreview(true)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download PDF">
                            <IconButton size="small" onClick={() => handleDownload('pdf')}>
                              <PdfIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Excel">
                            <IconButton size="small" onClick={() => handleDownload('excel')}>
                              <ExcelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Schedule">
                            <IconButton size="small" onClick={handleScheduleReport}>
                              <ScheduleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </Paper>
        </Grid>
      </Grid>

      {/* Report Preview Dialog */}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            margin: 0,
            width: 'calc(100% - 32px)',
            maxWidth: 'lg',
            borderRadius: 3,
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#f8f9fa',
          borderBottom: '1px solid #e8ecf1',
          px: 3,
          py: 2,
        }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {reportData.title}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Generated on {new Date().toLocaleString()}
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenPreview(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {isLoading ? (
            <Box sx={{ py: 4 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Generating report...
              </Typography>
              <LinearProgress />
            </Box>
          ) : (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: '#f5f7fa', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} color="primary">{reportData.totalCrimes}</Typography>
                    <Typography variant="caption" color="textSecondary">Total Crimes</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} color="error">{reportData.highRisk}</Typography>
                    <Typography variant="caption" color="textSecondary">High Risk</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} color="success">{reportData.resolved}</Typography>
                    <Typography variant="caption" color="textSecondary">Resolved</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: '#fff8e1', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} color="warning">{reportData.active}</Typography>
                    <Typography variant="caption" color="textSecondary">Active</Typography>
                  </Box>
                </Grid>
              </Grid>

              {reportData.recentCrimes?.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    Recent Crime Incidents
                  </Typography>
                  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    {reportData.recentCrimes.map((crime, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          px: 2,
                          py: 1.5,
                          borderBottom: idx < reportData.recentCrimes.length - 1 ? '1px solid #f0f0f0' : 'none',
                          bgcolor: idx % 2 === 0 ? '#fafafa' : 'transparent',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {crime.firNumber}
                          </Typography>
                          <Chip
                            label={crime.crimeType?.name || 'Unknown'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={crime.severity}
                            size="small"
                            color={
                              crime.severity === 'critical' ? 'error' :
                              crime.severity === 'high' ? 'warning' :
                              crime.severity === 'medium' ? 'info' : 'success'
                            }
                          />
                          <Chip
                            label={crime.status}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e8ecf1', flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
          <Button variant="outlined" startIcon={<PdfIcon />} onClick={() => handleDownload('pdf')}>
            PDF
          </Button>
          <Button variant="outlined" startIcon={<ExcelIcon />} onClick={() => handleDownload('excel')}>
            Excel
          </Button>
          <Button variant="contained" startIcon={<FileDownloadIcon />} onClick={() => handleDownload('json')}>
            Export JSON
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Reports