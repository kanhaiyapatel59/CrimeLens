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
  TextField,
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
} from '@mui/material'
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { dashboardAPI } from '../api/dashboard'
import { crimeAPI } from '../api/crimes'
import { motion } from 'framer-motion'

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null)
  const [openPreview, setOpenPreview] = useState(false)
  const [reportParams, setReportParams] = useState({
    type: 'crime_summary',
    format: 'pdf',
    dateRange: 'last_30_days',
    includeCharts: true,
    includeMap: false,
  })

  // Fetch report data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report-data', reportParams],
    queryFn: () => {
      // This would fetch data based on report type
      return dashboardAPI.getOverview()
    },
  })

  const reportTypes = [
    { id: 'crime_summary', name: 'Crime Summary Report' },
    { id: 'crime_analysis', name: 'Crime Analysis Report' },
    { id: 'network_analysis', name: 'Network Analysis Report' },
    { id: 'ai_insights', name: 'AI Insights Report' },
    { id: 'district_comparison', name: 'District Comparison Report' },
    { id: 'trend_analysis', name: 'Trend Analysis Report' },
  ]

  const savedReports = [
    {
      id: 1,
      name: 'Monthly Crime Summary - December 2024',
      type: 'crime_summary',
      date: '2024-12-31',
      size: '2.4 MB',
    },
    {
      id: 2,
      name: 'Network Analysis - Organized Crime',
      type: 'network_analysis',
      date: '2024-12-28',
      size: '1.8 MB',
    },
    {
      id: 3,
      name: 'AI Insights - Anomaly Detection',
      type: 'ai_insights',
      date: '2024-12-25',
      size: '3.1 MB',
    },
  ]

  const handleGenerateReport = () => {
    setOpenPreview(true)
  }

  const handleDownload = (format) => {
    // Download report in specified format
    toast.success(`Downloading ${format.toUpperCase()} report...`)
  }

  const handleScheduleReport = () => {
    toast.success('Report scheduled for weekly delivery')
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Reports
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Generate and manage crime intelligence reports
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
        >
          New Report
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Report Configuration */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Report Configuration
            </Typography>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportParams.type}
                onChange={(e) => setReportParams({ ...reportParams, type: e.target.value })}
                label="Report Type"
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Format</InputLabel>
              <Select
                value={reportParams.format}
                onChange={(e) => setReportParams({ ...reportParams, format: e.target.value })}
                label="Format"
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }}>
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

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                  type="checkbox"
                  checked={reportParams.includeCharts}
                  onChange={(e) => setReportParams({ ...reportParams, includeCharts: e.target.checked })}
                />
                <Typography variant="body2">Include Charts</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                  type="checkbox"
                  checked={reportParams.includeMap}
                  onChange={(e) => setReportParams({ ...reportParams, includeMap: e.target.checked })}
                />
                <Typography variant="body2">Include Map</Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleGenerateReport}
              sx={{
                mt: 3,
                bgcolor: '#1a237e',
                '&:hover': { bgcolor: '#283593' },
              }}
            >
              Generate Report
            </Button>
          </Paper>
        </Grid>

        {/* Saved Reports */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Saved Reports
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              <Chip label="All" color="primary" />
              <Chip label="Crime Summary" variant="outlined" />
              <Chip label="Network Analysis" variant="outlined" />
              <Chip label="AI Insights" variant="outlined" />
            </Box>

            {savedReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {report.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {reportTypes.find(t => t.id === report.type)?.name || report.type}
                          {' • '}
                          {new Date(report.date).toLocaleDateString()}
                          {' • '}
                          {report.size}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedReport(report)
                              setOpenPreview(true)
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton size="small" onClick={() => handleDownload('pdf')}>
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share">
                          <IconButton size="small">
                            <ShareIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Schedule">
                          <IconButton size="small" onClick={handleScheduleReport}>
                            <ScheduleIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Showing {savedReports.length} saved reports
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Report Preview Dialog */}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Report Preview
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setOpenPreview(false)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ minHeight: 400 }}>
            {isLoading ? (
              <Box sx={{ py: 4 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Generating report...
                </Typography>
                <LinearProgress />
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Crime Summary Report
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Generated on {new Date().toLocaleString()}
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={500}>
                        Total Crimes
                      </Typography>
                      <Typography variant="h4">{reportData?.data?.totalCrimes || 0}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={500}>
                        Detection Rate
                      </Typography>
                      <Typography variant="h4">78%</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Crime Breakdown
                  </Typography>
                  {/* Add chart preview here */}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
          <Button variant="contained" onClick={() => handleDownload('pdf')}>
            Download PDF
          </Button>
          <Button variant="outlined" onClick={() => handleDownload('excel')}>
            Download Excel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Reports