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
  Select,
  MenuItem,
  FormControl,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  FileUpload as FileIcon,
  CheckCircle as SuccessIcon,
  Download as DownloadIcon,
  Sync as UpdateIcon,
  Check as CheckIcon,
} from '@mui/icons-material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crimeAPI } from '../../api/crimes'
import { toast } from 'react-hot-toast'

const BulkUpload = ({ onSuccess, onCancel }) => {
  const queryClient = useQueryClient()
  const [file, setFile] = useState(null)
  const [recordCount, setRecordCount] = useState(null)
  const [duplicateMode, setDuplicateMode] = useState('update')
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState(null)

  const uploadMutation = useMutation({
    mutationFn: (data) => crimeAPI.bulkUpload(data),
    onSuccess: (data) => {
      const resultData = data.data?.data || data.data
      setResults(resultData)
      setUploading(false)
      queryClient.invalidateQueries()

      const createdCount = resultData.created?.length || 0
      const updatedCount = resultData.updated?.length || 0
      const skippedCount = resultData.skipped?.length || 0
      const failedCount = resultData.failed?.length || 0
      const successCount = resultData.success?.length || (createdCount + updatedCount)

      if (failedCount === 0) {
        toast.success(
          `Successfully processed ${successCount} crimes (${createdCount} created, ${updatedCount} updated)`
        )
        setTimeout(() => onSuccess(), 1600)
      } else if (successCount > 0) {
        toast(`Processed ${successCount} crimes (${failedCount} failed)`, { icon: '⚠️' })
      } else {
        toast.error(`All ${failedCount} records failed — see details below`)
      }
    },
    onError: (error) => {
      setUploading(false)
      toast.error(error.response?.data?.message || 'Upload failed')
    },
  })

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResults(null)
      try {
        const text = await selectedFile.text()
        if (selectedFile.name.endsWith('.csv')) {
          const lines = text.replace(/^\uFEFF/, '').replace(/\r/g, '').split('\n').filter((l) => l.trim())
          setRecordCount(Math.max(0, lines.length - 1))
        } else if (selectedFile.name.endsWith('.json')) {
          const parsed = JSON.parse(text)
          setRecordCount(Array.isArray(parsed) ? parsed.length : 1)
        }
      } catch (e) {
        setRecordCount(null)
      }
    }
  }

  const handleDownloadTemplate = () => {
    const currentYear = new Date().getFullYear()
    const csvContent =
      'firNumber,incidentId,crimeType,date,time,description,severity,riskScore,status,latitude,longitude,district,policeStation,victimName,suspectName\n' +
      `FIR${currentYear}901,INC${currentYear}901,Robbery,2026-05-10,14:30,"Armed snatching of gold chain near commercial market.",high,75,investigating,12.9716,77.5946,Bengaluru Urban,Cubbon Park PS,Ramesh Kumar,Unknown Offender\n` +
      `FIR${currentYear}902,INC${currentYear}902,Cybercrime,2026-05-11,10:15,"Unauthorized bank account deduction via phishing link.",medium,55,reported,12.9352,77.6245,Bengaluru Urban,Koramangala PS,Priya Sharma,Vikram Singh\n` +
      `FIR${currentYear}903,INC${currentYear}903,Vehicle Theft,2026-05-12,22:45,"Two-wheeler stolen from mall parking basement.",low,40,reported,13.0033,77.5641,Bengaluru Urban,Malleshwaram PS,Anand Rao,Unknown Offender\n`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `crimelens_bulk_template_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Sample CSV template downloaded')
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }
    setUploading(true)
    try {
      const rawText = await file.text()
      const text = rawText.replace(/^\uFEFF/, '').replace(/\r/g, '')
      let crimes

      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(text)
        crimes = Array.isArray(parsed) ? parsed : [parsed]
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n').filter((line) => line.trim())
        if (lines.length < 2) throw new Error('CSV must have headers and at least one data row')

        const parseCSVLine = (str) => {
          const arr = []
          let quote = false
          let col = ''
          for (let i = 0; i < str.length; i++) {
            const c = str[i]
            if (c === '"') {
              quote = !quote
            } else if (c === ',' && !quote) {
              arr.push(col.trim().replace(/^"+|"+$/g, ''))
              col = ''
            } else {
              col += c
            }
          }
          arr.push(col.trim().replace(/^"+|"+$/g, ''))
          return arr
        }

        const headers = parseCSVLine(lines[0])
        crimes = lines.slice(1).map((line) => {
          const values = parseCSVLine(line)
          const obj = {}
          headers.forEach((header, i) => {
            const val = values[i] !== undefined ? values[i] : ''
            if (header.includes('.')) {
              const parts = header.split('.')
              if (parts.length === 2) {
                if (!obj[parts[0]]) obj[parts[0]] = {}
                obj[parts[0]][parts[1]] = val
              } else if (parts.length === 3) {
                if (!obj[parts[0]]) obj[parts[0]] = {}
                if (!obj[parts[0]][parts[1]]) obj[parts[0]][parts[1]] = {}
                obj[parts[0]][parts[1]][parts[2]] = val
              }
            } else {
              obj[header] = val
            }
          })

          if (obj.latitude && obj.longitude) {
            if (!obj.location) obj.location = {}
            obj.location.coordinates = [parseFloat(obj.longitude), parseFloat(obj.latitude)]
            delete obj.latitude
            delete obj.longitude
          }
          return obj
        })
      } else {
        throw new Error('Unsupported format — please select CSV or JSON')
      }

      uploadMutation.mutate({ crimes, duplicateMode })
    } catch (err) {
      setUploading(false)
      toast.error(err.message || 'Failed to parse file')
    }
  }

  return (
    <Box sx={{ p: 1 }}>
      {/* Neumorphic Drag & Drop Area */}
      <Box
        component="label"
        sx={{
          border: '2px dashed var(--neu-divider, #D7DDE7)',
          borderRadius: '20px',
          p: 3.5,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
          display: 'block',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: '#356AE6',
          },
        }}
      >
        <input
          type="file"
          accept=".csv,.json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '16px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            color: '#356AE6',
          }}
        >
          <UploadIcon sx={{ fontSize: 26 }} />
        </Box>
        <Typography variant="subtitle1" fontWeight={800} color="#202A3A">
          {file ? file.name : 'Click or Drag to Upload FIR Dataset'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#5C6779', display: 'block', mt: 0.5 }}>
          {file && recordCount !== null
            ? `Ready to import: ${recordCount} incident records detected`
            : 'Supports state standard CSV / JSON files with batch FIR records'}
        </Typography>
      </Box>

      {/* Settings Bar: Duplicate Policy & Sample Template Download */}
      <Box
        sx={{
          mt: 2,
          p: 1.8,
          borderRadius: '16px',
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UpdateIcon sx={{ fontSize: 18, color: '#356AE6' }} />
          <Box>
            <Typography variant="caption" fontWeight={700} color="#202A3A" display="block">
              Duplicate FIR Policy
            </Typography>
            <Typography variant="caption" color="#5C6779" sx={{ fontSize: '0.7rem' }}>
              Handling existing FIR entries
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          <Select
            size="small"
            value={duplicateMode}
            onChange={(e) => setDuplicateMode(e.target.value)}
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              borderRadius: '10px',
              minWidth: 175,
              height: 32,
              boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            }}
          >
            <MenuItem value="update" sx={{ fontSize: '0.8rem' }}>Update Existing (Upsert)</MenuItem>
            <MenuItem value="auto_rename" sx={{ fontSize: '0.8rem' }}>Auto-rename Duplicates</MenuItem>
            <MenuItem value="skip" sx={{ fontSize: '0.8rem' }}>Skip Duplicates</MenuItem>
            <MenuItem value="reject" sx={{ fontSize: '0.8rem' }}>Strict (Reject Duplicates)</MenuItem>
          </Select>

          <Button
            size="small"
            onClick={handleDownloadTemplate}
            startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontSize: '0.72rem',
              color: '#356AE6',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
              px: 1.2,
              py: 0.5,
            }}
          >
            Sample CSV
          </Button>
        </Box>
      </Box>

      {uploading && (
        <Box sx={{ mt: 2.5 }}>
          <LinearProgress
            sx={{ borderRadius: 4, height: 6, bgcolor: '#D7DDE7', '& .MuiLinearProgress-bar': { bgcolor: '#356AE6' } }}
          />
          <Typography variant="caption" sx={{ color: '#5C6779', mt: 0.8, display: 'block', textAlign: 'center' }}>
            Uploading and verifying FIR cryptographic signatures...
          </Typography>
        </Box>
      )}

      {/* Results View */}
      {results && (
        <Box
          sx={{
            mt: 2.5,
            p: 2,
            borderRadius: '16px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
          }}
        >
          {/* Summary Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
            {(results.created?.length > 0 || (results.success?.length > 0 && !results.created && !results.updated)) && (
              <Chip
                icon={<SuccessIcon sx={{ fontSize: 14 }} />}
                label={`${results.created?.length || results.success?.length} Created`}
                size="small"
                sx={{ bgcolor: 'rgba(35, 155, 98, 0.15)', color: '#239B62', fontWeight: 700, fontSize: '0.75rem' }}
              />
            )}
            {results.updated?.length > 0 && (
              <Chip
                icon={<UpdateIcon sx={{ fontSize: 14 }} />}
                label={`${results.updated.length} Updated`}
                size="small"
                sx={{ bgcolor: 'rgba(53, 106, 230, 0.15)', color: '#356AE6', fontWeight: 700, fontSize: '0.75rem' }}
              />
            )}
            {results.skipped?.length > 0 && (
              <Chip
                label={`${results.skipped.length} Skipped`}
                size="small"
                sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#D97706', fontWeight: 700, fontSize: '0.75rem' }}
              />
            )}
            {results.failed?.length > 0 && (
              <Chip
                icon={<ErrorIcon sx={{ fontSize: 14 }} />}
                label={`${results.failed.length} Failed`}
                size="small"
                sx={{ bgcolor: 'rgba(217, 79, 85, 0.15)', color: '#D94F55', fontWeight: 700, fontSize: '0.75rem' }}
              />
            )}
          </Box>

          {/* Detailed Failures List */}
          {results.failed?.length > 0 && (
            <List dense sx={{ maxHeight: 160, overflowY: 'auto' }}>
              {results.failed.map((fail, i) => (
                <ListItem
                  key={i}
                  sx={{
                    py: 0.4,
                    px: 1,
                    mb: 0.4,
                    borderRadius: '8px',
                    bgcolor: 'rgba(217, 79, 85, 0.05)',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 22, color: '#D94F55' }}>
                    <ErrorIcon sx={{ fontSize: 15 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {fail.firNumber && (
                          <Chip
                            label={fail.firNumber}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor: 'rgba(217, 79, 85, 0.15)',
                              color: '#D94F55',
                            }}
                          />
                        )}
                        <Typography
                          variant="caption"
                          sx={{ color: '#D94F55', fontWeight: 500, fontSize: '0.74rem' }}
                        >
                          {fail.error || fail.reason || fail.message || 'Row rejected'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
        <Button
          onClick={onCancel}
          sx={{
            color: '#5C6779',
            fontWeight: 600,
            borderRadius: '12px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
            px: 2.5,
          }}
        >
          Close
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!file || uploading}
          sx={{
            bgcolor: '#356AE6',
            '&:hover': { bgcolor: '#2955C4' },
            fontWeight: 700,
            borderRadius: '12px',
            px: 3,
            boxShadow: 'var(--neu-shadow-primary-btn, 4px 4px 12px rgba(53, 106, 230, 0.35))',
          }}
        >
          {uploading ? 'Processing Batch...' : 'Process Dataset'}
        </Button>
      </Box>
    </Box>
  )
}

export default BulkUpload
