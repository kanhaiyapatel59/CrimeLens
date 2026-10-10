import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { crimeAPI } from '../../api/crimes'
import axiosInstance from '../../api/axios'
import toast from 'react-hot-toast'

const CrimeForm = ({ crime, onSuccess, onCancel }) => {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    firNumber: '',
    incidentId: '',
    crimeType: '',
    date: '',
    time: '',
    description: '',
    severity: 'medium',
    status: 'reported',
    location: {
      coordinates: [77.5946, 12.9716],
      address: { street: '', area: '', city: '', district: '', policeStation: '', pincode: '', landmark: '' },
    },
  })

  const { data: crimeTypesData } = useQuery({
    queryKey: ['crime-types'],
    queryFn: () => crimeAPI.getCrimeTypes(),
    retry: 1,
  })
  const crimeTypeOptions = React.useMemo(() => {
    const types = crimeTypesData?.data?.data || crimeTypesData?.data || []
    return Array.isArray(types) ? types : []
  }, [crimeTypesData])

  const { data: districtsData, isLoading: districtsLoading } = useQuery({
    queryKey: ['districts-list'],
    queryFn: () => axiosInstance.get('/api/districts'),
    retry: 1,
  })
  const districts = React.useMemo(() => {
    const d = districtsData?.data?.data || districtsData?.data || []
    return Array.isArray(d) ? d : []
  }, [districtsData])

  useEffect(() => {
    if (crime) {
      setFormData({
        ...crime,
        date: crime.date ? new Date(crime.date).toISOString().split('T')[0] : '',
        time: crime.time || '',
        crimeType: crime.crimeType?._id || crime.crimeType || '',
        location: {
          ...crime.location,
          address: {
            street: crime.location?.address?.street || '',
            area: crime.location?.address?.area || '',
            city: crime.location?.address?.city || '',
            district: crime.location?.address?.district?._id || crime.location?.address?.district || '',
            policeStation: crime.location?.address?.policeStation?._id || crime.location?.address?.policeStation || '',
            pincode: crime.location?.address?.pincode || '',
            landmark: crime.location?.address?.landmark || '',
          },
        },
      })
    }
  }, [crime])

  const handleChange = (e) => {
    const { name, value } = e.target
    const parts = name.split('.')
    if (parts.length === 1) {
      setFormData({ ...formData, [name]: value })
    } else if (parts.length === 2) {
      setFormData({ ...formData, [parts[0]]: { ...formData[parts[0]], [parts[1]]: value } })
    } else if (parts.length === 3) {
      setFormData({
        ...formData,
        [parts[0]]: { ...formData[parts[0]], [parts[1]]: { ...formData[parts[0]][parts[1]], [parts[2]]: value } },
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const payload = JSON.parse(JSON.stringify(formData))

      if (!payload.firNumber || payload.firNumber.trim() === '') {
        throw new Error('FIR Number is required')
      }
      if (!payload.incidentId || payload.incidentId.trim() === '') {
        throw new Error('Incident ID is required')
      }
      if (!payload.crimeType || payload.crimeType.trim() === '') {
        throw new Error('Crime Type is required')
      }
      if (!payload.date) {
        throw new Error('Date is required')
      }
      if (!payload.description || payload.description.trim() === '') {
        throw new Error('Description is required')
      }

      const dateObj = new Date(payload.date)
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date format')
      }
      payload.date = dateObj.toISOString().split('T')[0]

      if (!payload.time) payload.time = '00:00'
      else if (!payload.time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) payload.time = '00:00'

      if (payload.location?.address) {
        Object.keys(payload.location.address).forEach(key => {
          if (payload.location.address[key] === '') delete payload.location.address[key]
        })
      }
      if (payload.location?.coordinates) {
        payload.location.coordinates = payload.location.coordinates.map(Number)
      }

      if (payload.crimeType === '') delete payload.crimeType
      if (payload.location?.address?.district === '') delete payload.location.address.district
      if (payload.location?.address?.policeStation === '') delete payload.location.address.policeStation

      if (!payload.severity) payload.severity = 'medium'
      if (!payload.status) payload.status = 'reported'

      if (crime) {
        await crimeAPI.update(crime._id, payload)
        toast.success('Crime updated successfully')
      } else {
        await crimeAPI.create(payload)
        toast.success('Crime created successfully')
      }
      
      queryClient.invalidateQueries()
      onSuccess()
    } catch (err) {
      const msg = err.message || err.response?.data?.message || 'Failed to save crime'
      setError(msg)
      toast.error(msg)
      console.error('Submit error:', err.response?.data || err.message)
    } finally {
      setLoading(false)
    }
  }

  // Neumorphic Input sx helper
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
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        p: 0,
        mt: 0,
      }}
    >
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,
            borderRadius: '14px',
            boxShadow: 'inset 2px 2px 4px rgba(217, 79, 85, 0.15)',
          }}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {/* Field 1: FIR Number */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="FIR Number"
            name="firNumber"
            value={formData.firNumber}
            onChange={handleChange}
            required
            size="small"
            sx={neuInputSx}
          />
        </Grid>

        {/* Field 2: Incident ID */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Incident ID"
            name="incidentId"
            value={formData.incidentId}
            onChange={handleChange}
            required
            size="small"
            sx={neuInputSx}
          />
        </Grid>

        {/* Field 3: Crime Type */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required size="small" sx={neuInputSx}>
            <InputLabel>Crime Type</InputLabel>
            <Select
              name="crimeType"
              value={formData.crimeType}
              onChange={handleChange}
              label="Crime Type"
            >
              <MenuItem value="">Select Crime Type</MenuItem>
              {crimeTypeOptions.map((type) => (
                <MenuItem key={type._id} value={type._id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Field 4: Date */}
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            type="date"
            label="Date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={neuInputSx}
          />
        </Grid>

        {/* Field 5: Time */}
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            type="time"
            label="Time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={neuInputSx}
          />
        </Grid>

        {/* Field 6: Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            required
            size="small"
            sx={neuInputSx}
          />
        </Grid>

        {/* Field 7: Severity */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small" sx={neuInputSx}>
            <InputLabel>Severity</InputLabel>
            <Select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              label="Severity"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Field 8: Status */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small" sx={neuInputSx}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="reported">Reported</MenuItem>
              <MenuItem value="investigating">Investigating</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Section Header: Location Details */}
        <Grid item xs={12}>
          <Box
            sx={{
              pt: 1,
              pb: 0.5,
              borderBottom: '1px solid var(--neu-divider, #D7DDE7)',
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.88rem', color: '#202A3A' }}>
              📍 Location Details
            </Typography>
          </Box>
        </Grid>

        {/* Field 10: Street */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Street"
            name="location.address.street"
            value={formData.location.address.street}
            onChange={handleChange}
            size="small"
            sx={neuInputSx}
          />
        </Grid>

        {/* Field 11: Area */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Area"
            name="location.address.area"
            value={formData.location.address.area}
            onChange={handleChange}
            size="small"
            sx={neuInputSx}
          />
        </Grid>

        {/* Field 12: City */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            name="location.address.city"
            value={formData.location.address.city}
            onChange={handleChange}
            size="small"
            sx={neuInputSx}
          />
        </Grid>

        {/* Field 13: District */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small" sx={neuInputSx}>
            <InputLabel>District</InputLabel>
            <Select
              name="location.address.district"
              value={formData.location.address.district}
              onChange={handleChange}
              label="District"
              disabled={districtsLoading}
            >
              <MenuItem value="">Select District</MenuItem>
              {districts.map((d) => (
                <MenuItem key={d._id} value={d._id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Field 14: Pincode */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Pincode"
            name="location.address.pincode"
            value={formData.location.address.pincode}
            onChange={handleChange}
            size="small"
            sx={neuInputSx}
          />
        </Grid>

        {/* Field 15: Landmark */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Landmark"
            name="location.address.landmark"
            value={formData.location.address.landmark}
            onChange={handleChange}
            size="small"
            sx={neuInputSx}
          />
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3.5, justifyContent: 'flex-end' }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          sx={{
            color: '#5C6779',
            fontWeight: 600,
            borderRadius: '12px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
            px: 3,
            '&:hover': { color: '#202A3A' },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: '#356AE6',
            '&:hover': { bgcolor: '#2955C4' },
            minWidth: 120,
            borderRadius: '12px',
            fontWeight: 700,
            boxShadow: 'var(--neu-shadow-primary-btn, 5px 5px 14px rgba(53, 106, 230, 0.35))',
          }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : (crime ? 'Update FIR' : 'Create FIR')}
        </Button>
      </Box>
    </Box>
  )
}

export default CrimeForm