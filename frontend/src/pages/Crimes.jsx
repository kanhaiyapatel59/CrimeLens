import React, { useState } from 'react'
import {
  Box, Paper, Typography, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Chip,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Tooltip, Fab, Checkbox, alpha, useTheme, Collapse,
} from '@mui/material'
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Refresh as RefreshIcon, Upload as UploadIcon, Download as DownloadIcon,
  Visibility as ViewIcon, Close as CloseIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crimeAPI } from '../api/crimes'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import CrimeForm from '../components/crimes/CrimeForm'
import CrimeDetail from '../components/crimes/CrimeDetail'
import BulkUpload from '../components/crimes/BulkUpload'

const Crimes = () => {
  const theme = useTheme()
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

  const cleanFilters = () => {
    const clean = {}
    Object.keys(filters).forEach(key => {
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

  // ✅ Bulk Delete Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const results = await Promise.allSettled(
        ids.map(id => crimeAPI.delete(id))
      )
      return results
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failCount = results.filter(r => r.status === 'rejected').length
      
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

  // ✅ Single Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => crimeAPI.delete(id),
    onSuccess: () => {
      toast.success('Crime deleted successfully')
      setSelectedIds(prev => prev.filter(id => id !== selectedCrime?._id))
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

  // ✅ Handle select all
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = crimes.map(crime => crime._id)
      setSelectedIds(allIds)
    } else {
      setSelectedIds([])
    }
  }

  // ✅ Handle single select
  const handleSelect = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // ✅ Handle bulk delete confirmation
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.error('No crimes selected')
      return
    }
    setOpenBulkDeleteDialog(true)
  }

  // ✅ Confirm bulk delete
  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedIds)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value || undefined })
    setPage(0)
    setSelectedIds([])
  }

  const getSeverityColor = (severity) => {
    const colors = { low: 'success', medium: 'info', high: 'warning', critical: 'error' }
    return colors[severity] || 'default'
  }

  const getStatusColor = (status) => {
    const colors = { reported: 'warning', investigating: 'info', in_progress: 'primary', resolved: 'success', closed: 'default', pending: 'warning' }
    return colors[status] || 'default'
  }

  const handleExport = async () => {
    try {
      const response = await crimeAPI.export(cleanFilters())
      
      const data = response.data?.data || response.data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const crimes = data?.data?.data?.crimes || []
  const total = data?.data?.data?.pagination?.total || 0
  const isAllSelected = crimes.length > 0 && selectedIds.length === crimes.length

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Crime Records</Typography>
          <Typography variant="body2" color="textSecondary">Manage and analyze crime incidents</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => setOpenBulk(true)}>Bulk Upload</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>Export</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedCrime(null); setOpenForm(true) }}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}>
            New Crime
          </Button>
        </Box>
      </Box>

      {/* ✅ Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: alpha('#1a237e', 0.04),
            border: `1px solid ${alpha('#1a237e', 0.15)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" fontWeight={600}>
              {selectedIds.length} crime{selectedIds.length > 1 ? 's' : ''} selected
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSelectedIds([])}
              sx={{ textTransform: 'none' }}
            >
              Clear Selection
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<DeleteSweepIcon />}
              onClick={handleBulkDelete}
              sx={{
                bgcolor: '#e91e63',
                '&:hover': { bgcolor: '#c2185b' },
                textTransform: 'none',
              }}
            >
              Delete Selected ({selectedIds.length})
            </Button>
          </Box>
        </Paper>
      )}

      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField fullWidth size="small" label="Search" name="search"
              placeholder="FIR Number, Description..." value={filters.search || ''} onChange={handleFilterChange} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Crime Type</InputLabel>
              <Select name="crimeType" value={filters.crimeType || ''} onChange={handleFilterChange} label="Crime Type">
                <MenuItem value="">All</MenuItem>
                {Array.isArray(crimeTypeOptions) && crimeTypeOptions.map((type) => (
                  <MenuItem key={type._id} value={type._id}>{type.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select name="severity" value={filters.severity || ''} onChange={handleFilterChange} label="Severity">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select name="status" value={filters.status || ''} onChange={handleFilterChange} label="Status">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="reported">Reported</MenuItem>
                <MenuItem value="investigating">Investigating</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField fullWidth size="small" type="date" label="From Date" name="startDate"
              value={filters.startDate || ''} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={1}>
            <Tooltip title="Clear Filters">
              <IconButton onClick={() => { setFilters({}); setPage(0); setSelectedIds([]) }}><CloseIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={() => refetch()}><RefreshIcon /></IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f7fa' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedIds.length > 0 && selectedIds.length < crimes.length}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    sx={{ color: '#1a237e' }}
                  />
                </TableCell>
                <TableCell>FIR Number</TableCell>
                <TableCell>Incident ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Crime Type</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {crimes.map((crime, index) => (
                  <motion.tr key={crime._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }} style={{ display: 'table-row' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(crime._id)}
                        onChange={() => handleSelect(crime._id)}
                        sx={{ color: '#1a237e' }}
                      />
                    </TableCell>
                    <TableCell><Typography variant="body2" fontWeight={500}>{crime.firNumber}</Typography></TableCell>
                    <TableCell>{crime.incidentId}</TableCell>
                    <TableCell>{new Date(crime.date).toLocaleDateString()}</TableCell>
                    <TableCell>{crime.crimeType?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Chip label={crime.severity} size="small" color={getSeverityColor(crime.severity)} />
                    </TableCell>
                    <TableCell>
                      <Chip label={crime.status} size="small" color={getStatusColor(crime.status)} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => { setSelectedCrime(crime); setOpenDetail(true) }}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => { setSelectedCrime(crime); setOpenForm(true) }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(crime._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {crimes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">No crimes found</Typography>
                    <Button variant="text" startIcon={<AddIcon />} onClick={() => setOpenForm(true)} sx={{ mt: 1 }}>
                      Create First Crime Record
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={total}
          rowsPerPage={rowsPerPage} page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); setSelectedIds([]) }}
        />
      </Paper>

      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24, bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
        onClick={() => { setSelectedCrime(null); setOpenForm(true) }}>
        <AddIcon />
      </Fab>

      {/* ✅ Crime Form Dialog - Centered */}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: 0,
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) !important',
            borderRadius: 3,
            maxHeight: '90vh',
            width: 'calc(100% - 32px)',
            maxWidth: 'md',
            boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#f8f9fa',
          borderBottom: '1px solid #e8ecf1',
          px: 3,
          py: 2,
        }}>
          <Typography variant="h6" fontWeight={600}>
            {selectedCrime ? 'Edit Crime' : 'New Crime'}
          </Typography>
          <IconButton onClick={() => setOpenForm(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          overflowX: 'hidden', 
          overflowY: 'auto',
          p: { xs: 2, md: 3 },
          bgcolor: '#ffffff',
        }}>
          <CrimeForm 
            crime={selectedCrime}
            onSuccess={() => { 
              setOpenForm(false); 
              setSelectedCrime(null);
              queryClient.invalidateQueries(['crimes']);
            }}
            onCancel={() => { 
              setOpenForm(false); 
              setSelectedCrime(null);
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* ✅ Crime Detail Dialog - Centered */}
      <Dialog 
        open={openDetail} 
        onClose={() => setOpenDetail(false)} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: 0,
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) !important',
            borderRadius: 3,
            maxHeight: '90vh',
            width: 'calc(100% - 32px)',
            maxWidth: 'md',
            boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#f8f9fa',
          borderBottom: '1px solid #e8ecf1',
          px: 3,
          py: 2,
        }}>
          <Typography variant="h6" fontWeight={600}>
            Crime Details
          </Typography>
          <IconButton onClick={() => setOpenDetail(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          overflowX: 'hidden', 
          overflowY: 'auto',
          p: { xs: 2, md: 3 },
          bgcolor: '#ffffff',
        }}>
          <CrimeDetail crime={selectedCrime} />
        </DialogContent>
      </Dialog>

      {/* ✅ Bulk Upload Dialog - Centered */}
      <Dialog 
        open={openBulk} 
        onClose={() => setOpenBulk(false)} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: 0,
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) !important',
            borderRadius: 3,
            maxHeight: '90vh',
            width: 'calc(100% - 32px)',
            maxWidth: 'md',
            boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#f8f9fa',
          borderBottom: '1px solid #e8ecf1',
          px: 3,
          py: 2,
        }}>
          <Typography variant="h6" fontWeight={600}>
            Bulk Upload
          </Typography>
          <IconButton onClick={() => setOpenBulk(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          overflowX: 'hidden', 
          overflowY: 'auto',
          p: { xs: 2, md: 3 },
          bgcolor: '#ffffff',
        }}>
          <BulkUpload
            onSuccess={() => {
              setOpenBulk(false);
              queryClient.invalidateQueries(['crimes']);
            }}
            onCancel={() => setOpenBulk(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* ✅ Bulk Delete Confirmation Dialog - Centered */}
      <Dialog
        open={openBulkDeleteDialog}
        onClose={() => setOpenBulkDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: 0,
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) !important',
            borderRadius: 3,
            maxWidth: 420,
            width: 'calc(100% - 32px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#f8f9fa', 
          borderBottom: '1px solid #e8ecf1',
          px: 3,
          py: 2,
        }}>
          <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <DeleteSweepIcon /> Delete Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: 3 }}>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{selectedIds.length}</strong> crime record{selectedIds.length > 1 ? 's' : ''}?
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          px: 3, 
          borderTop: '1px solid #e8ecf1',
          gap: 1,
        }}>
          <Button 
            onClick={() => setOpenBulkDeleteDialog(false)} 
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmBulkDelete}
            variant="contained"
            color="error"
            disabled={bulkDeleteMutation.isLoading}
            startIcon={bulkDeleteMutation.isLoading ? <CircularProgress size={20} /> : <DeleteSweepIcon />}
            sx={{ textTransform: 'none' }}
          >
            {bulkDeleteMutation.isLoading ? 'Deleting...' : `Delete ${selectedIds.length}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Crimes