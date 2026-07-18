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
} from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { crimeAPI } from '../../api/crimes'
import { dashboardAPI } from '../../api/dashboard'
import toast from 'react-hot-toast'

const CrimeForm = ({ crime, onSuccess, onCancel }) => {
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
      address: {
        street: '',
        area: '',
        city: '',
        district: '',
        policeStation: '',
        pincode: '',
        landmark: '',
      },
    },
  })

  // Fetch districts and police stations
  const { data: districts } = useQuery({
    queryKey: ['districts'],
    queryFn: () => dashboardAPI.getDistricts(),
  })

  const { data: crimeTypes } = useQuery({
    queryKey: ['crime-types'],
    queryFn: () => dashboardAPI.getCharts({ groupBy: 'crimeType', limit: 50 }),
  })

  useEffect(() => {
    if (crime) {
      setFormData({
        ...crime,
        date: crime.date ? new Date(crime.date).toISOString().split('T')[0] : '',
        time: crime.time || '',
      })
    }
  }, [crime])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (crime) {
        await crimeAPI.update(crime._id, formData)
        toast.success('Crime updated successfully')
      } else {
        await crimeAPI.create(formData)
        toast.success('Crime created successfully')
      }
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save crime')
      toast.error(err.response?.data?.message || 'Failed to save crime')
    } finally {
      setLoading(false)
    }
  }

  const crimeTypeOptions = crimeTypes?.data?.labels?.map((label, index) => ({
    label,
    value: index + 1,
  })) || []

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="FIR Number"
            name="firNumber"
            value={formData.firNumber}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Incident ID"
            name="incidentId"
            value={formData.incidentId}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Crime Type</InputLabel>
            <Select
              name="crimeType"
              value={formData.crimeType}
              onChange={handleChange}
              label="Crime Type"
            >
              <MenuItem value="">Select Crime Type</MenuItem>
              {crimeTypeOptions.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

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
          />
        </Grid>

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
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
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

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
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

        <Grid item xs={12}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Location Details
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Street"
            name="location.address.street"
            value={formData.location.address.street}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Area"
            name="location.address.area"
            value={formData.location.address.area}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            name="location.address.city"
            value={formData.location.address.city}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>District</InputLabel>
            <Select
              name="location.address.district"
              value={formData.location.address.district}
              onChange={handleChange}
              label="District"
            >
              <MenuItem value="">Select District</MenuItem>
              {districts?.data?.map((d) => (
                <MenuItem key={d._id} value={d._id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Pincode"
            name="location.address.pincode"
            value={formData.location.address.pincode}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Landmark"
            name="location.address.landmark"
            value={formData.location.address.landmark}
            onChange={handleChange}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
        >
          {loading ? <CircularProgress size={24} /> : (crime ? 'Update' : 'Create')}
        </Button>
      </Box>
    </Box>
  )
}

export default CrimeForm