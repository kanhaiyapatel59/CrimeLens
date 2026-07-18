import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material'
import {
  Layers as LayersIcon,
  FilterList as FilterIcon,
  CenterFocusStrong as CenterIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { useQuery } from '@tanstack/react-query'
import { crimeAPI } from '../api/crimes'
import { dashboardAPI } from '../api/dashboard'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapControls = ({ onZoomIn, onZoomOut, onCenter }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <IconButton onClick={onZoomIn} size="small">
          <ZoomInIcon />
        </IconButton>
        <IconButton onClick={onZoomOut} size="small">
          <ZoomOutIcon />
        </IconButton>
        <IconButton onClick={onCenter} size="small">
          <CenterIcon />
        </IconButton>
      </Paper>
    </Box>
  )
}

const CrimeMarkers = ({ crimes }) => {
  const map = useMap()

  useEffect(() => {
    if (crimes && crimes.length > 0) {
      const group = L.featureGroup()
      crimes.forEach((crime) => {
        if (crime.location?.coordinates) {
          const [lng, lat] = crime.location.coordinates
          const marker = L.marker([lat, lng])
          const severityColors = {
            low: '#4caf50',
            medium: '#ff9800',
            high: '#f44336',
            critical: '#e91e63',
          }
          const color = severityColors[crime.severity] || '#1a237e'

          const circle = L.circle([lat, lng], {
            radius: crime.severity === 'critical' ? 200 : 
                    crime.severity === 'high' ? 150 :
                    crime.severity === 'medium' ? 100 : 50,
            color: color,
            fillColor: color,
            fillOpacity: 0.3,
          })

          const popupContent = `
            <div style="font-family: sans-serif; min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #1a237e;">${crime.firNumber}</h4>
              <p style="margin: 4px 0;"><strong>Type:</strong> ${crime.crimeType?.name || 'Unknown'}</p>
              <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(crime.date).toLocaleDateString()}</p>
              <p style="margin: 4px 0;"><strong>Severity:</strong> <span style="color: ${color}; font-weight: 600;">${crime.severity.toUpperCase()}</span></p>
              <p style="margin: 4px 0;"><strong>Status:</strong> ${crime.status}</p>
            </div>
          `

          marker.bindPopup(popupContent)
          circle.bindPopup(popupContent)

          group.addLayer(marker)
          group.addLayer(circle)
        }
      })

      map.addLayer(group)
      map.fitBounds(group.getBounds(), { padding: [50, 50] })

      return () => {
        map.removeLayer(group)
      }
    }
  }, [crimes, map])

  return null
}

const Map = () => {
  const [filters, setFilters] = useState({
    days: 30,
    severity: '',
    status: '',
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const mapRef = React.useRef()

  // Fetch crimes for map
  const { data, isLoading } = useQuery({
    queryKey: ['map-crimes', filters],
    queryFn: () => crimeAPI.getAll({
      limit: 200,
      startDate: new Date(Date.now() - filters.days * 24 * 60 * 60 * 1000).toISOString(),
      severity: filters.severity || undefined,
      status: filters.status || undefined,
    }),
  })

  // Fetch hotspots
  const { data: hotspots } = useQuery({
    queryKey: ['map-hotspots', filters],
    queryFn: () => crimeAPI.getHotspots({
      days: filters.days,
    }),
  })

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value })
  }

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1)
    }
  }

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1)
    }
  }

  const handleCenter = () => {
    if (mapRef.current && data?.data?.crimes?.length > 0) {
      const crimes = data.data.crimes
      const bounds = L.latLngBounds(
        crimes.map(c => [c.location.coordinates[1], c.location.coordinates[0]])
      )
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  const crimes = data?.data?.crimes || []
  const center = crimes.length > 0
    ? [crimes[0].location.coordinates[1], crimes[0].location.coordinates[0]]
    : [12.9716, 77.5946]

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', position: 'relative' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Crime Map
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setDrawerOpen(true)}
          >
            Filters
          </Button>
          <Chip
            label={`${crimes.length} crimes`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Map */}
      <Paper
        elevation={0}
        sx={{
          height: 'calc(100% - 60px)',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CrimeMarkers crimes={crimes} />
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onCenter={handleCenter}
          />
        </MapContainer>
      </Paper>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 320, p: 3 } }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Map Filters
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Time Range (Days)
          </Typography>
          <Slider
            value={filters.days}
            onChange={(e, val) => handleFilterChange('days', val)}
            min={1}
            max={90}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <FormControl fullWidth sx={{ mt: 3 }}>
          <InputLabel>Severity</InputLabel>
          <Select
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            label="Severity"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
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

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setFilters({ days: 30, severity: '', status: '' })
            }}
          >
            Reset
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setDrawerOpen(false)}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
          >
            Apply
          </Button>
        </Box>
      </Drawer>
    </Box>
  )
}

export default Map