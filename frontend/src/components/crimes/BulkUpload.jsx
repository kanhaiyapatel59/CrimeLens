import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  FileUpload as FileIcon,
} from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import { crimeAPI } from '../../api/crimes'
import { toast } from 'react-hot-toast'


const BulkUpload = ({ onSuccess, onCancel }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState(null)

const uploadMutation = useMutation({
    mutationFn: (data) => crimeAPI.bulkUpload(data),
    onSuccess: async (data) => {
      const resultData = data.data?.data || data.data
      setResults(resultData)
      setUploading(false)

      // Make sure UI refreshes everywhere after upload.
      // onSuccess() in parent usually invalidates crimes query;
      // additionally force a hard refresh to reload dashboard/map/network/report.
      if (resultData.failed?.length === 0) {
        toast.success(`Successfully uploaded ${resultData.success?.length || 0} crimes`)
        setTimeout(() => {
          try {
            onSuccess()
          } finally {
            // Load latest KPIs/graphs.
            window.location.reload()
          }
        }, 1500)
      } else {
        toast.warning(`Uploaded ${resultData.success?.length || 0} crimes, ${resultData.failed?.length || 0} failed`)
      }
    },
    onError: (error) => {
      setUploading(false)
      toast.error(error.response?.data?.message || 'Upload failed')
      console.error('Upload error:', error)
    },
  })

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResults(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)

    try {
      const text = await file.text()
      let crimes

      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(text)
        crimes = Array.isArray(parsed) ? parsed : [parsed]
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n').filter(line => line.trim())
        if (lines.length < 2) {
          throw new Error('CSV file must have headers and at least one data row')
        }
        const headers = lines[0].split(',').map(h => h.trim())
        crimes = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim())
          const obj = {}
          headers.forEach((header, index) => {
            obj[header] = values[index] || ''
          })
          return obj
        })
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV.')
      }

      if (crimes.length === 0) {
        throw new Error('No data found in file')
      }

      // ✅ Send crimes as an object with crimes array
      await uploadMutation.mutateAsync({ crimes })
    } catch (error) {
      setUploading(false)
      toast.error(error.message || 'Failed to parse file')
      console.error('Parse error:', error)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setResults(null)
  }

  const downloadTemplate = () => {
    const template = [
      {
        firNumber: 'FIR2024001',
        incidentId: 'INC2024001',
        crimeType: 'crime_type_id',
        date: '2024-01-15',
        time: '14:30',
        description: 'Sample crime description',
        severity: 'medium',
        status: 'reported',
        location: {
          coordinates: [77.5946, 12.9716],
          address: {
            street: 'MG Road',
            area: 'Central',
            city: 'Bengaluru',
            district: 'district_id',
            policeStation: 'station_id',
            pincode: '560001',
          },
        },
      },
    ]

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'crime_upload_template.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Upload multiple crime records at once using JSON or CSV format.
      </Typography>

      <Button
        variant="outlined"
        size="small"
        onClick={downloadTemplate}
        sx={{ mb: 3 }}
      >
        Download Template
      </Button>

      {!file ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed #e0e0e0',
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': {
              borderColor: '#1a237e',
              bgcolor: 'rgba(26, 35, 126, 0.02)',
            },
          }}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".json,.csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <FileIcon sx={{ fontSize: 48, color: '#1a237e', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Click to select a file
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Supported formats: JSON, CSV
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FileIcon sx={{ color: '#1a237e' }} />
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {(file.size / 1024).toFixed(1)} KB
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleRemoveFile} disabled={uploading}>
              <CloseIcon />
            </IconButton>
          </Box>

          {uploading && <LinearProgress sx={{ mt: 2 }} />}

          {results && (
            <Box sx={{ mt: 2 }}>
              <Alert 
                severity={results.failed?.length === 0 ? 'success' : 'warning'}
                sx={{ mb: 2 }}
              >
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`✅ ${results.success?.length || 0} Uploaded`} 
                    color="success" 
                    size="small"
                  />
                  <Chip 
                    label={`❌ ${results.failed?.length || 0} Failed`} 
                    color="error" 
                    size="small"
                  />
                  <Chip 
                    label={`📊 ${results.total || 0} Total`} 
                    color="primary" 
                    size="small"
                  />
                </Box>
              </Alert>

              {results.failed?.length > 0 && (
                <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {results.failed.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <ErrorIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.firNumber || 'Unknown'}
                        secondary={item.error}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={handleUpload}
          disabled={!file || uploading}
          sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Box>
    </Box>
  )
}

export default BulkUpload