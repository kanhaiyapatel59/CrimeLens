import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  Fab,
  Checkbox,
  Collapse,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  DeleteSweep as DeleteSweepIcon,
  FilterList as FilterListIcon,
  Security as SecurityIcon,
  Fingerprint as FingerprintIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crimeAPI } from '../api/crimes'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import CrimeForm from '../components/crimes/CrimeForm'
import CrimeDetail from '../components/crimes/CrimeDetail'
import BulkUpload from '../components/crimes/BulkUpload'

const Crimes = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({})
  const [selectedCrime, setSelectedCrime] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [openForm, setOpenForm] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [openBulk, setOpenBulk] = useState(false)
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [openMoMatcher, setOpenMoMatcher] = useState(false)
  const [moQuery, setMoQuery] = useState('')
  const [moResults, setMoResults] = useState(null)
  const [moLoading, setMoLoading] = useState(false)

  const handleMatchMo = async () => {
    if (!moQuery.trim()) return
    setMoLoading(true)
    try {
      const res = await crimeAPI.matchMO(moQuery)
      setMoResults(res?.data?.data || res?.data || null)
    } catch (err) {
      toast.error('Failed to match MO pattern')
    } finally {
      setMoLoading(false)
    }
  }

  const cleanFilters = () => {
    const clean = {}
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== '' && filters[key] !== 'all') {
        clean[key] = filters[key]
      }
    })
    return clean
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['crimes', page, rowsPerPage, filters],
    queryFn: () => crimeAPI.getAll({ page: page + 1, limit: rowsPerPage, ...cleanFilters() }),
    retry: 1,
  })

  const { data: crimeTypesData } = useQuery({
    queryKey: ['crime-types'],
    queryFn: () => crimeAPI.getCrimeTypes(),
    retry: 1,
  })
  const crimeTypeOptions = crimeTypesData?.data?.data || []

  // Bulk Delete Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const results = await Promise.allSettled(
        ids.map((id) => crimeAPI.delete(id))
      )
      return results
    },
    onSuccess: (results) => {
      const successCount = results.filter((r) => r.status === 'fulfilled').length
      const failCount = results.filter((r) => r.status === 'rejected').length
      
      if (failCount === 0) {
        toast.success(`✅ ${successCount} crimes deleted successfully`)
      } else {
        toast.warning(`⚠️ ${successCount} deleted, ${failCount} failed`)
      }
      
      setSelectedIds([])
      setOpenBulkDeleteDialog(false)
      queryClient.invalidateQueries(['crimes'])
    },
    onError: (error) => {
      toast.error('Failed to delete some crimes')
      console.error('Bulk delete error:', error)
    },
  })

  // Single Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => crimeAPI.delete(id),
    onSuccess: () => {
      toast.success('Crime deleted successfully')
      setSelectedIds((prev) => prev.filter((id) => id !== selectedCrime?._id))
      queryClient.invalidateQueries(['crimes'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete crime')
    },
  })

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this crime record?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = crimes.map((crime) => crime._id)
      setSelectedIds(allIds)
    } else {
      setSelectedIds([])
    }
  }

  const handleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.error('No crimes selected')
      return
    }
    setOpenBulkDeleteDialog(true)
  }

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedIds)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value || undefined })
    setPage(0)
    setSelectedIds([])
  }

  const clearFilters = () => {
    setFilters({})
    setPage(0)
    setSelectedIds([])
    toast.success('Filters cleared')
  }

  const getSeverityColor = (severity) => {
    const colors = { low: '#239B62', medium: '#D99118', high: '#D94F55', critical: '#E91E63' }
    return colors[severity] || '#356AE6'
  }

  const handleExport = async () => {
    try {
      const response = await crimeAPI.export(cleanFilters())
      const exportData = response.data?.data || response.data
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `crimes_export_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Export successful!')
    } catch (error) {
      toast.error('Failed to export crimes')
      console.error('Export error:', error)
    }
  }

  const hasActiveFilters = Object.values(filters).some((val) => val && val !== '' && val !== 'all')

  const crimes = data?.data?.data?.crimes || []
  const total = data?.data?.data?.pagination?.total || 0
  const isAllSelected = crimes.length > 0 && selectedIds.length === crimes.length

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#356AE6' }} />
      </Box>
    )
  }

  const neuInputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'var(--neu-surface, #E8ECF3)',
      boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      '& fieldset': { border: 'none' },
      '&:hover fieldset': { border: 'none' },
      '&.Mui-focused fieldset': { border: '1.5px solid #356AE6' },
    },
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', pb: 4 }}>
      {/* Top Header Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#202A3A', letterSpacing: '-0.02em', fontSize: { xs: '1.4rem', sm: '1.75rem' } }}>
            Crime Records & Case Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#5C6779', fontWeight: 500 }}>
            {total} registered FIR records in state database
          </Typography>
        </Box>

        {/* Toolbar Buttons in Neumorphic Style */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<FilterListIcon />}
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: showFilters
                ? 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)'
                : 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              color: showFilters ? '#356AE6' : '#202A3A',
              fontWeight: 700,
              borderRadius: '12px',
              px: 2,
              py: 0.8,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              '&:hover': { bgcolor: 'var(--neu-surface, #E8ECF3)', color: '#356AE6' },
            }}
          >
            Filters {hasActiveFilters && `(${Object.values(filters).filter((v) => v && v !== '' && v !== 'all').length})`}
          </Button>

          <Button
            onClick={() => setOpenMoMatcher(true)}
            startIcon={<FingerprintIcon />}
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              color: '#D94F55',
              fontWeight: 700,
              borderRadius: '12px',
              px: 2,
              py: 0.8,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              '&:hover': { bgcolor: 'rgba(217, 79, 85, 0.08)' },
            }}
          >
            MO Pattern Matcher
          </Button>

          <Button
            onClick={() => setOpenBulk(true)}
            startIcon={<UploadIcon />}
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              color: '#5C6779',
              fontWeight: 600,
              borderRadius: '12px',
              px: 2,
              py: 0.8,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              '&:hover': { color: '#202A3A' },
            }}
          >
            Bulk Upload
          </Button>

          <Button
            onClick={handleExport}
            startIcon={<DownloadIcon />}
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              color: '#5C6779',
              fontWeight: 600,
              borderRadius: '12px',
              px: 2,
              py: 0.8,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              '&:hover': { color: '#202A3A' },
            }}
          >
            Export
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { setSelectedCrime(null); setOpenForm(true) }}
            sx={{
              bgcolor: '#356AE6',
              '&:hover': { bgcolor: '#2955C4' },
              fontWeight: 700,
              borderRadius: '12px',
              px: 2.5,
              py: 0.8,
              boxShadow: 'var(--neu-shadow-primary-btn, 5px 5px 14px rgba(53, 106, 230, 0.35))',
            }}
          >
            New Crime FIR
          </Button>
        </Box>
      </Box>

      {/* Bulk Actions Ribbon */}
      {selectedIds.length > 0 && (
        <Box
          sx={{
            p: 1.8,
            mb: 2.5,
            borderRadius: '16px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" fontWeight={700} color="#202A3A">
            {selectedIds.length} incident record{selectedIds.length > 1 ? 's' : ''} selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              size="small"
              onClick={() => setSelectedIds([])}
              sx={{
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF',
                color: '#5C6779',
                fontWeight: 600,
                borderRadius: '10px',
                px: 2,
              }}
            >
              Clear Selection
            </Button>
            <Button
              size="small"
              startIcon={<DeleteSweepIcon />}
              onClick={handleBulkDelete}
              sx={{
                bgcolor: '#D94F55',
                color: '#fff !important',
                fontWeight: 700,
                borderRadius: '10px',
                px: 2,
                boxShadow: '4px 4px 12px rgba(217, 79, 85, 0.35)',
                '&:hover': { bgcolor: '#B5383D' },
              }}
            >
              Delete Selected ({selectedIds.length})
            </Button>
          </Box>
        </Box>
      )}

      {/* Collapsible Neumorphic Filter Panel */}
      <Collapse in={showFilters}>
        <Box
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '20px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} color="#202A3A">
              🔍 Filter Incident Records
            </Typography>
            <Button
              size="small"
              onClick={clearFilters}
              sx={{ color: '#D94F55', fontWeight: 700, textTransform: 'none' }}
            >
              Reset All Filters
            </Button>
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                name="search"
                placeholder="FIR Number, Description..."
                value={filters.search || ''}
                onChange={handleFilterChange}
                sx={neuInputSx}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small" sx={neuInputSx}>
                <InputLabel>Crime Type</InputLabel>
                <Select
                  name="crimeType"
                  value={filters.crimeType || ''}
                  onChange={handleFilterChange}
                  label="Crime Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  {Array.isArray(crimeTypeOptions) &&
                    crimeTypeOptions.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small" sx={neuInputSx}>
                <InputLabel>Severity</InputLabel>
                <Select
                  name="severity"
                  value={filters.severity || ''}
                  onChange={handleFilterChange}
                  label="Severity"
                >
                  <MenuItem value="">All Severities</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small" sx={neuInputSx}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status || ''}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="reported">Reported</MenuItem>
                  <MenuItem value="investigating">Investigating</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="From Date"
                name="startDate"
                value={filters.startDate || ''}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                sx={neuInputSx}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setShowFilters(false)
                  refetch()
                }}
                sx={{
                  bgcolor: '#356AE6',
                  '&:hover': { bgcolor: '#2955C4' },
                  fontWeight: 700,
                  width: '100%',
                  height: 40,
                  borderRadius: '12px',
                }}
              >
                Apply
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      {/* Main Neumorphic Data Table Container */}
      <Box
        sx={{
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
          borderRadius: '22px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.65)',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(215, 221, 231, 0.45)', borderBottom: '1px solid var(--neu-divider, #D7DDE7)' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedIds.length > 0 && selectedIds.length < crimes.length}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    sx={{
                      color: '#8893A4',
                      '&.Mui-checked': { color: '#356AE6' },
                      '&.MuiCheckbox-indeterminate': { color: '#356AE6' },
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#5C6779', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                  FIR NUMBER
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#5C6779', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                  INCIDENT ID
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#5C6779', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                  DATE
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#5C6779', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                  CRIME TYPE
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#5C6779', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                  SEVERITY
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#5C6779', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                  STATUS
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#5C6779', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              <AnimatePresence>
                {crimes.map((crime, index) => (
                  <TableRow
                    key={crime._id}
                    hover
                    sx={{
                      transition: 'background-color 0.15s ease',
                      borderBottom: '1px solid var(--neu-divider, #D7DDE7)',
                      '&:hover': {
                        bgcolor: 'rgba(53, 106, 230, 0.04)',
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(crime._id)}
                        onChange={() => handleSelect(crime._id)}
                        sx={{
                          color: '#8893A4',
                          '&.Mui-checked': { color: '#356AE6' },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800} sx={{ color: '#202A3A', fontSize: '0.86rem' }}>
                        {crime.firNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#5C6779', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                        {crime.incidentId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#5C6779', fontSize: '0.82rem' }}>
                        {new Date(crime.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={crime.crimeType?.name || 'Unknown'}
                        size="small"
                        sx={{
                          bgcolor: 'var(--neu-surface, #E8ECF3)',
                          boxShadow: '1px 1px 3px #C7CDD7, -1px -1px 3px #FFFFFF',
                          color: '#202A3A',
                          fontWeight: 600,
                          fontSize: '0.72rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={crime.severity}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          textTransform: 'capitalize',
                          bgcolor: `${getSeverityColor(crime.severity)}15`,
                          color: getSeverityColor(crime.severity),
                          border: `1px solid ${getSeverityColor(crime.severity)}30`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={crime.status?.replace('_', ' ')}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.68rem',
                          textTransform: 'capitalize',
                          bgcolor: 'var(--neu-surface, #E8ECF3)',
                          boxShadow: '1px 1px 3px #C7CDD7, -1px -1px 3px #FFFFFF',
                          color: '#5C6779',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="Digital Chain of Custody & Evidence Matrix">
                          <IconButton
                            size="small"
                            onClick={() => { setSelectedCrime(crime); setOpenDetail(true) }}
                            sx={{
                              color: '#356AE6',
                              bgcolor: 'var(--neu-surface, #E8ECF3)',
                              boxShadow: '2px 2px 5px #C7CDD7, -2px -2px 5px #FFFFFF',
                              borderRadius: '8px',
                              width: 32,
                              height: 32,
                              '&:hover': { bgcolor: 'rgba(53, 106, 230, 0.1)' },
                            }}
                          >
                            <SecurityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => { setSelectedCrime(crime); setOpenDetail(true) }}
                            sx={{
                              color: '#5C6779',
                              bgcolor: 'var(--neu-surface, #E8ECF3)',
                              boxShadow: '2px 2px 5px #C7CDD7, -2px -2px 5px #FFFFFF',
                              borderRadius: '8px',
                              width: 32,
                              height: 32,
                              '&:hover': { color: '#202A3A' },
                            }}
                          >
                            <ViewIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Record">
                          <IconButton
                            size="small"
                            onClick={() => { setSelectedCrime(crime); setOpenForm(true) }}
                            sx={{
                              color: '#2B78E4',
                              bgcolor: 'var(--neu-surface, #E8ECF3)',
                              boxShadow: '2px 2px 5px #C7CDD7, -2px -2px 5px #FFFFFF',
                              borderRadius: '8px',
                              width: 32,
                              height: 32,
                              '&:hover': { bgcolor: 'rgba(43, 120, 228, 0.1)' },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(crime._id)}
                            sx={{
                              color: '#D94F55',
                              bgcolor: 'var(--neu-surface, #E8ECF3)',
                              boxShadow: '2px 2px 5px #C7CDD7, -2px -2px 5px #FFFFFF',
                              borderRadius: '8px',
                              width: 32,
                              height: 32,
                              '&:hover': { bgcolor: 'rgba(217, 79, 85, 0.1)' },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>

              {crimes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="#202A3A" fontWeight={700} gutterBottom>
                      No crime records found
                    </Typography>
                    <Typography variant="body2" color="#5C6779" sx={{ mb: 2 }}>
                      Create a new incident report or adjust active search filters
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenForm(true)}
                      sx={{ bgcolor: '#356AE6', borderRadius: '12px', fontWeight: 700 }}
                    >
                      Create First FIR
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Neumorphic Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
            setSelectedIds([])
          }}
          sx={{
            borderTop: '1px solid var(--neu-divider, #D7DDE7)',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontWeight: 600,
              color: '#5C6779',
              fontSize: '0.82rem',
            },
          }}
        />
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          bgcolor: '#356AE6',
          boxShadow: 'var(--neu-shadow-primary-btn, 5px 5px 14px rgba(53, 106, 230, 0.4))',
          '&:hover': { bgcolor: '#2955C4' },
        }}
        onClick={() => { setSelectedCrime(null); setOpenForm(true) }}
      >
        <AddIcon />
      </Fab>

      {/* Create / Edit Crime Dialog */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised-lg, 10px 10px 24px #C3C9D3, -10px -10px 24px #FFFFFF)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
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
            px: 3,
            py: 2,
          }}
        >
          <Typography component="div" variant="h6" fontWeight={800} color="#202A3A">
            {selectedCrime ? 'Edit Crime FIR Record' : 'Register New Crime Record'}
          </Typography>
          <IconButton onClick={() => setOpenForm(false)} size="small" sx={{ color: '#5C6779' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3.5 }, bgcolor: 'var(--neu-surface, #E8ECF3)' }}>
          <CrimeForm
            crime={selectedCrime}
            onSuccess={() => {
              setOpenForm(false)
              setSelectedCrime(null)
              queryClient.invalidateQueries(['crimes'])
            }}
            onCancel={() => {
              setOpenForm(false)
              setSelectedCrime(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Crime Detail Modal */}
      <Dialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised-lg, 10px 10px 24px #C3C9D3, -10px -10px 24px #FFFFFF)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
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
            px: 3,
            py: 2,
          }}
        >
          <Typography component="div" variant="h6" fontWeight={800} color="#202A3A">
            FIR Case File Inspection
          </Typography>
          <IconButton onClick={() => setOpenDetail(false)} size="small" sx={{ color: '#5C6779' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3.5 }, bgcolor: 'var(--neu-surface, #E8ECF3)' }}>
          <CrimeDetail crime={selectedCrime} />
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Modal */}
      <Dialog
        open={openBulk}
        onClose={() => setOpenBulk(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised-lg, 10px 10px 24px #C3C9D3, -10px -10px 24px #FFFFFF)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
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
            px: 3,
            py: 2,
          }}
        >
          <Typography component="div" variant="h6" fontWeight={800} color="#202A3A">
            Bulk Batch Import
          </Typography>
          <IconButton onClick={() => setOpenBulk(false)} size="small" sx={{ color: '#5C6779' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3.5 }, bgcolor: 'var(--neu-surface, #E8ECF3)' }}>
          <BulkUpload
            onSuccess={() => {
              setOpenBulk(false)
              queryClient.invalidateQueries(['crimes'])
            }}
            onCancel={() => setOpenBulk(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={openBulkDeleteDialog}
        onClose={() => setOpenBulkDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised-lg, 10px 10px 24px #C3C9D3, -10px -10px 24px #FFFFFF)',
          },
        }}
      >
        <DialogTitle sx={{ px: 3, py: 2 }}>
          <Typography variant="h6" fontWeight={800} color="#D94F55" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteSweepIcon /> Confirm Batch Deletion
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Typography variant="body1" color="#202A3A">
            Are you sure you want to permanently delete <strong>{selectedIds.length}</strong> crime records?
          </Typography>
          <Typography variant="caption" sx={{ color: '#D94F55', display: 'block', mt: 1, fontWeight: 600 }}>
            This will purge their linked evidence logs and cannot be reversed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3, borderTop: '1px solid var(--neu-divider, #D7DDE7)', gap: 1 }}>
          <Button
            onClick={() => setOpenBulkDeleteDialog(false)}
            sx={{
              color: '#5C6779',
              fontWeight: 600,
              borderRadius: '10px',
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmBulkDelete}
            variant="contained"
            disabled={bulkDeleteMutation.isLoading}
            sx={{
              bgcolor: '#D94F55',
              '&:hover': { bgcolor: '#B5383D' },
              borderRadius: '10px',
              fontWeight: 700,
            }}
          >
            {bulkDeleteMutation.isLoading ? 'Deleting...' : `Confirm Delete (${selectedIds.length})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modus Operandi (MO) Pattern Matcher Dialog */}
      <Dialog
        open={openMoMatcher}
        onClose={() => setOpenMoMatcher(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised-lg, 10px 10px 24px #C3C9D3, -10px -10px 24px #FFFFFF)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2 }}>
          <Typography variant="h6" component="span" fontWeight={800} sx={{ color: '#202A3A' }}>
            Modus Operandi (MO) Pattern Matcher
          </Typography>
          <IconButton onClick={() => setOpenMoMatcher(false)} sx={{ color: '#5C6779' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: 'var(--neu-surface, #E8ECF3)' }}>
          <Typography variant="body2" sx={{ color: '#5C6779', mb: 2 }}>
            Enter crime tactics, entry methods, or weapon details (e.g. <em>"night lock break two-wheeler helmet"</em>) to search historical FIR records and suspect leads.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Modus Operandi tactics or description keywords..."
              value={moQuery}
              onChange={(e) => setMoQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMatchMo()}
              sx={neuInputSx}
            />
            <Button
              variant="contained"
              onClick={handleMatchMo}
              disabled={moLoading}
              sx={{
                bgcolor: '#356AE6',
                minWidth: 120,
                borderRadius: '12px',
                fontWeight: 700,
                boxShadow: 'var(--neu-shadow-primary-btn, 4px 4px 12px rgba(53, 106, 230, 0.35))',
              }}
            >
              {moLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Match MO'}
            </Button>
          </Box>

          {moResults && (
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="#202A3A" sx={{ mb: 1.5 }}>
                Matched FIR Incidents ({moResults.count || 0})
              </Typography>
              {moResults.matches && moResults.matches.length > 0 ? (
                moResults.matches.map((m, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      borderRadius: '16px',
                      bgcolor: 'var(--neu-surface, #E8ECF3)',
                      boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#356AE6">{m.firNumber}</Typography>
                      <Chip label={m.crimeType?.name || 'Incident'} size="small" />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#5C6779', display: 'block', mb: 0.5 }}>
                      {m.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8893A4' }}>
                      📍 Location: {m.location?.address?.district?.name || 'Karnataka District'} • Date: {new Date(m.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: '#8893A4' }}>No matching FIR records found.</Typography>
              )}

              {moResults.leads && moResults.leads.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#D94F55" sx={{ mb: 1.5 }}>
                    Suspect Leads Generated ({moResults.leads.length})
                  </Typography>
                  {moResults.leads.map((lead, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.8,
                        mb: 1,
                        borderRadius: '14px',
                        bgcolor: 'rgba(217, 79, 85, 0.06)',
                        border: '1px solid rgba(217, 79, 85, 0.25)',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={800} color="#202A3A">{lead.name}</Typography>
                        <Chip label={`${lead.similarityScore}% Match`} size="small" sx={{ bgcolor: '#D94F55', color: '#fff', fontWeight: 800 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#5C6779' }}>
                        Matched FIR: {lead.matchedFIR} • Offence: {lead.crimeType}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3, borderTop: '1px solid var(--neu-divider, #D7DDE7)' }}>
          <Button onClick={() => setOpenMoMatcher(false)} sx={{ color: '#5C6779', fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Crimes