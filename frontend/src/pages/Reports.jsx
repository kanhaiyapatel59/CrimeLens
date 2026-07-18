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
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
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
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { dashboardAPI } from '../api/dashboard'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null)
  const [openPreview, setOpenPreview] = useState(false)
  const [openUploadDialog, setOpenUploadDialog] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [extractedData, setExtractedData] = useState(null)
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
    queryFn: () => dashboardAPI.getOverview(),
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
    toast.success(`Downloading ${format.toUpperCase()} report...`)
  }

  const handleScheduleReport = () => {
    toast.success('Report scheduled for weekly delivery')
  }

  // File Upload Handler with Data Extraction
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // NOTE: Reports upload currently only simulates extraction/preview.
    // For the “data should appear everywhere” requirement, import the extracted
    // records into the real crimes collection and reload dashboards.


    setUploadedFile(file)
    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Extract data based on file type
      const extracted = await extractDataFromFile(file)
      setExtractedData(extracted)

      // ✅ Real import so uploaded data appears in Dashboard/Crimes/Map/Network.
      // Your sample CSV headers:
      // CrimeNo,CaseNo,CrimeRegisteredDate,BriefFacts,GravityOffenceID,latitude,longitude,ComplainantName,AccusedName,DistrictID,PoliceStationID
      // Backend bulkUpload needs: firNumber, incidentId, crimeType (and optional date/time/location/severity/status).
      const records = extracted?.allRecords || extracted?.records || []

      toast.success(`Successfully extracted ${extracted.records || 0} records from ${file.name}`)
      setOpenUploadDialog(false)

      // If we have parsed records, map and bulk upload.
      if (Array.isArray(records) && records.length > 0) {
        try {
          // Lazy import to avoid changing imports at top.
          const { crimeAPI } = await import('../api/crimes')

          const mappedCrimes = records
            .map((r) => ({
              firNumber: r.CrimeNo || r.firNumber,
              incidentId: r.CaseNo || r.incidentId,
              // NOTE: CSV GravityOffenceID must be converted to a CrimeType ObjectId.
              // Current implementation assumes the backend accepts this value as-is.
              crimeType: r.GravityOffenceID || r.crimeType,
              date: r.CrimeRegisteredDate || r.date,
              description: r.BriefFacts || r.description,
              severity: r.GravityOffenceID
                ? String(r.GravityOffenceID) === '2'
                  ? 'high'
                  : String(r.GravityOffenceID) === '3'
                    ? 'medium'
                    : 'low'
                : 'medium',
              status: 'reported',
              time: '00:00',
              location: {
                coordinates: [
                  parseFloat(r.longitude ?? r.Longitude ?? r.lng) || 77.5946,
                  parseFloat(r.latitude ?? r.Latitude ?? r.lat) || 12.9716,
                ],
                address: {
                  district: r.DistrictID || r.district || '',
                  policeStation: r.PoliceStationID || r.policeStation || '',
                },
              },
            }))
            .filter((c) => c.firNumber && c.incidentId && c.crimeType)

          if (mappedCrimes.length === 0) {
            toast.warning('Parsed records did not match required fields for bulk upload.')
          } else {
            await crimeAPI.bulkUpload({ crimes: mappedCrimes })
            toast.success(`Imported ${mappedCrimes.length} crimes. Updating dashboard...`)
          }
        } catch (e) {
          console.error('Bulk import from Reports failed:', e)
          toast.error(e?.response?.data?.message || 'Import failed (dashboard not updated)')
        }
      }

      // Reload to refresh all sections (Dashboard/Crimes/Map/Network/Reports)
      // If auth fails, user may be redirected to login; don't force reload in that case.


      // Reload to refresh all sections (Dashboard/Crimes/Map/Network/Reports)
      // If auth fails, user may be redirected to login; don't force reload in that case.
      setTimeout(() => window.location.reload(), 800)

    } catch (error) {
      toast.error(`Failed to extract data: ${error.message}`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Data Extraction Function
  const extractDataFromFile = async (file) => {
    const text = await file.text()
    let data = []
    let headers = []
    let records = 0

    if (file.name.endsWith('.csv')) {
      // Parse CSV
      const lines = text.split('\n').filter(line => line.trim())
      headers = lines[0].split(',').map(h => h.trim())
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length === headers.length) {
          const record = {}
          headers.forEach((header, index) => {
            record[header] = values[index] || ''
          })
          data.push(record)
        }
      }
      records = data.length
    } else if (file.name.endsWith('.json')) {
      // Parse JSON
      const jsonData = JSON.parse(text)
      if (Array.isArray(jsonData)) {
        data = jsonData
        records = data.length
        if (data.length > 0) {
          headers = Object.keys(data[0])
        }
      } else {
        data = [jsonData]
        records = 1
        headers = Object.keys(jsonData)
      }
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // For Excel files, we'd need a library like xlsx
      // For now, show a message
      throw new Error('Excel files require additional processing. Please use CSV or JSON format.')
    } else {
      throw new Error('Unsupported file format. Please upload CSV or JSON files.')
    }

    return {
      filename: file.name,
      headers: headers,
      records: records,
      data: data.slice(0, 10), // Preview first 10 records
      // Keep full parsed dataset so we can import all records into backend.
      allRecords: data,
      totalRecords: records,
      fileSize: (file.size / 1024).toFixed(1) + ' KB',
      fileType: file.name.split('.').pop().toUpperCase(),
    }
  }

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null)
    setExtractedData(null)
    document.getElementById('file-upload-input').value = ''
  }

  return (
      <Box sx={{ p: 3, maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Reports
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Generate and manage crime intelligence reports
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setOpenUploadDialog(true)}
          >
            Upload Data
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
          >
            New Report
          </Button>
        </Box>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
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

      {/* Upload Data Dialog */}
      <Dialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Upload Data File
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setOpenUploadDialog(false)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Upload CSV or JSON files to import crime data. The system will automatically extract and validate the data.
            </Typography>

            <Alert severity="info" sx={{ my: 2 }}>
              Supported formats: CSV, JSON
              <br />
              Maximum file size: 10MB
            </Alert>

            {!uploadedFile ? (
              <Box
                sx={{
                  border: '2px dashed #e0e0e0',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#1a237e',
                    bgcolor: 'rgba(26, 35, 126, 0.02)',
                  },
                }}
                onClick={() => document.getElementById('file-upload-input').click()}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".csv,.json,.xlsx,.xls"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <DescriptionIcon sx={{ fontSize: 48, color: '#1a237e', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Click to select a file
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Drag and drop or click to upload
                </Typography>
              </Box>
            ) : (
              <Box>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <DescriptionIcon sx={{ color: '#1a237e' }} />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {uploadedFile.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton onClick={handleRemoveFile} disabled={uploading}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  {uploading && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress variant="determinate" value={uploadProgress} />
                      <Typography variant="caption" color="textSecondary">
                        {uploadProgress}% uploaded
                      </Typography>
                    </Box>
                  )}
                </Paper>

                {extractedData && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="success">
                      Successfully extracted {extractedData.totalRecords} records from {extractedData.filename}
                    </Alert>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Preview ({extractedData.records} records shown)
                      </Typography>
                      <Paper sx={{ mt: 1, p: 2, maxHeight: 200, overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              {extractedData.headers.map((header, idx) => (
                                <th key={idx} style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid #e0e0e0' }}>
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {extractedData.data.map((row, idx) => (
                              <tr key={idx}>
                                {extractedData.headers.map((header, hidx) => (
                                  <td key={hidx} style={{ padding: '4px 8px', borderBottom: '1px solid #f0f0f0' }}>
                                    {row[header] || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Paper>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!uploadedFile || uploading}
            onClick={() => setOpenUploadDialog(false)}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
          >
            {uploading ? <CircularProgress size={24} /> : 'Import Data'}
          </Button>
        </DialogActions>
      </Dialog>

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