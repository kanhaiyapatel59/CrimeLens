import React, { useState, useEffect } from 'react'
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
  Alert,
  Tabs,
  Tab,
  Tooltip,
  Fab,
  Drawer,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crimeAPI } from '../api/crimes'
import { dashboardAPI } from '../api/dashboard'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// Import components
import CrimeForm from '../components/crimes/CrimeForm'
import CrimeDetail from '../components/crimes/CrimeDetail'
import BulkUpload from '../components/crimes/BulkUpload'

const Crimes = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({})
  const [selectedCrime, setSelectedCrime] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [openBulk, setOpenBulk] = useState(false)
  const [tabValue, setTabValue] = useState(0)

  // ✅ FIX: Clean filters before sending to API
  const cleanFilters = () => {
    const clean = {}
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '' && filters[key] !== 'all') {
        clean[key] = filters[key]
      }
    })
    return clean
  }

  // Fetch crimes - FIXED
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['crimes', page, rowsPerPage, filters],
    queryFn: () => crimeAPI.getAll({
      page: page + 1,
      limit: rowsPerPage,
      ...cleanFilters(),
    }),
    retry: 1,
  })

  // Fetch crime types for filters
  const { data: crimeTypes } = useQuery({
    queryKey: ['crime-types'],
    queryFn: () => dashboardAPI.getCharts({ groupBy: 'crimeType', limit: 50 }),
    retry: 1,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => crimeAPI.delete(id),
    onSuccess: () => {
      toast.success('Crime deleted successfully')
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value || undefined })
    setPage(0)
  }

  const handleClearFilters = () => {
    setFilters({})
    setPage(0)
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'success',
      medium: 'info',
      high: 'warning',
      critical: 'error',
    }
    return colors[severity] || 'default'
  }

  const getStatusColor = (status) => {
    const colors = {
      reported: 'warning',
      investigating: 'info',
      in_progress: 'primary',
      resolved: 'success',
      closed: 'default',
      pending: 'warning',
    }
    return colors[status] || 'default'
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const crimes = data?.data?.crimes || []
  const total = data?.data?.pagination?.total || 0

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Crime Records
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage and analyze crime incidents
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setOpenBulk(true)}
          >
            Bulk Upload
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => crimeAPI.export(cleanFilters())}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
          >
            New Crime
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
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
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Crime Type</InputLabel>
              <Select
                name="crimeType"
                value={filters.crimeType || ''}
                onChange={handleFilterChange}
                label="Crime Type"
              >
                <MenuItem value="">All</MenuItem>
                {crimeTypes?.data?.labels?.map((label, index) => (
                  <MenuItem key={index} value={index + 1}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                name="severity"
                value={filters.severity || ''}
                onChange={handleFilterChange}
                label="Severity"
              >
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
              <Select
                name="status"
                value={filters.status || ''}
                onChange={handleFilterChange}
                label="Status"
              >
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
            <TextField
              fullWidth
              size="small"
              type="date"
              label="From Date"
              name="startDate"
              value={filters.startDate || ''}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <Tooltip title="Clear Filters">
              <IconButton onClick={handleClearFilters}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={() => refetch()}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f7fa' }}>
              <TableRow>
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
                  <motion.tr
                    key={crime._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ display: 'table-row' }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {crime.firNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{crime.incidentId}</TableCell>
                    <TableCell>
                      {new Date(crime.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{crime.crimeType?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Chip
                        label={crime.severity}
                        size="small"
                        color={getSeverityColor(crime.severity)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={crime.status}
                        size="small"
                        color={getStatusColor(crime.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedCrime(crime)
                            setOpenDetail(true)
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedCrime(crime)
                            setOpenForm(true)
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(crime._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {crimes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No crimes found
                    </Typography>
                    <Button
                      variant="text"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenForm(true)}
                      sx={{ mt: 1 }}
                    >
                      Create First Crime Record
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>

      {/* FAB for quick add */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#1a237e',
          '&:hover': { bgcolor: '#283593' },
        }}
        onClick={() => setOpenForm(true)}
      >
        <AddIcon />
      </Fab>

      {/* Dialogs */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCrime ? 'Edit Crime' : 'New Crime'}
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setOpenForm(false)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
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

      <Dialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Crime Details
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setOpenDetail(false)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <CrimeDetail crime={selectedCrime} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openBulk}
        onClose={() => setOpenBulk(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Bulk Upload
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setOpenBulk(false)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <BulkUpload
            onSuccess={() => {
              setOpenBulk(false)
              queryClient.invalidateQueries(['crimes'])
            }}
            onCancel={() => setOpenBulk(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default Crimes