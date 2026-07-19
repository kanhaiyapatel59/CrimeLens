import React, { useState, useRef } from 'react'
import {
  Box, Paper, Typography, IconButton, Slider, FormControl,
  InputLabel, Select, MenuItem, Chip, Drawer, CircularProgress, Button,
} from '@mui/material'
import {
  FilterList as FilterIcon, CenterFocusStrong as CenterIcon,
  ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon, Close as CloseIcon,
} from '@mui/icons-material'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useQuery } from '@tanstack/react-query'
import { crimeAPI } from '../api/crimes'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const severityColors = { 
  low: '#4caf50', 
  medium: '#ff9800', 
  high: '#f44336', 
  critical: '#e91e63' 
}

const MapControls = ({ onZoomIn, onZoomOut, onCenter }) => (
  <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 1 }}>
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <IconButton onClick={onZoomIn} size="small"><ZoomInIcon /></IconButton>
      <IconButton onClick={onZoomOut} size="small"><ZoomOutIcon /></IconButton>
      <IconButton onClick={onCenter} size="small"><CenterIcon /></IconButton>
    </Paper>
  </Box>
)

const CrimeMarkers = ({ crimes }) => {
  const map = useMap()

  React.useEffect(() => {
    console.log('🔍 CrimeMarkers received:', crimes?.length || 0, 'crimes')

    if (!crimes || crimes.length === 0) {
      console.log('⚠️ No crimes to display')
      return
    }

    const validCrimes = crimes.filter(c => {
      return c.location?.coordinates && c.location.coordinates.length === 2
    })

    console.log('✅ Valid crimes with coordinates:', validCrimes.length)

    if (validCrimes.length === 0) {
      console.log('⚠️ No crimes with valid coordinates')
      return
    }

    const group = L.featureGroup()

    validCrimes.forEach((crime) => {
      const [lng, lat] = crime.location.coordinates
      const color = severityColors[crime.severity] || '#1a237e'
      const radius = crime.severity === 'critical' ? 12 : 
                     crime.severity === 'high' ? 10 : 
                     crime.severity === 'medium' ? 8 : 6

      const marker = L.circleMarker([lat, lng], {
        radius,
        color,
        weight: 2,
        opacity: 0.8,
        fillColor: color,
        fillOpacity: 0.6,
      })
      
      marker.bindPopup(`
        <div style="font-family:sans-serif;min-width:200px;">
          <h4 style="margin:0 0 8px 0;color:#1a237e;">${crime.firNumber || 'Unknown'}</h4>
          <p style="margin:4px 0;"><strong>Type:</strong> ${crime.crimeType?.name || 'Unknown'}</p>
          <p style="margin:4px 0;"><strong>Date:</strong> ${crime.date ? new Date(crime.date).toLocaleDateString() : 'N/A'}</p>
          <p style="margin:4px 0;"><strong>Severity:</strong> <span style="color:${color};font-weight:600;">${(crime.severity || 'unknown').toUpperCase()}</span></p>
          <p style="margin:4px 0;"><strong>Status:</strong> ${crime.status || 'unknown'}</p>
        </div>
      `)
      
      group.addLayer(marker)
    })

    map.addLayer(group)

    if (validCrimes.length > 0) {
      const bounds = L.latLngBounds(validCrimes.map(c => [c.location.coordinates[1], c.location.coordinates[0]]))
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }

    return () => {
      map.removeLayer(group)
    }
  }, [crimes, map])

  return null
}

const Map = () => {
  const [filters, setFilters] = useState({ days: 30, severity: '', status: '' })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const mapRef = useRef()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['map-crimes', filters],
    queryFn: () => crimeAPI.getAll({
      page: 1,
      limit: 500,
      severity: filters.severity || undefined,
      status: filters.status || undefined,
    }),
    retry: 1,
  })

  // ✅ Define zoom handlers
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
    if (mapRef.current && crimes.length > 0) {
      const valid = crimes.filter(c => c.location?.coordinates)
      if (valid.length > 0) {
        const bounds = L.latLngBounds(valid.map(c => [c.location.coordinates[1], c.location.coordinates[0]]))
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }

  // 🔍 DEBUG - Log the actual structure
  console.log('📦 Full response:', data)
  console.log('📦 data?.data:', data?.data)
  
  // ✅ Try ALL possible data paths
  const crimes = data?.data?.data?.crimes ||  // Nested data (most likely)
                 data?.data?.crimes ||        // Standard
                 data?.crimes ||              // Direct
                 []                           // Fallback

  console.log('📍 Total crimes fetched:', crimes.length)
  console.log('📍 First crime sample:', crimes[0])

  const center = crimes.length > 0 && crimes[0]?.location?.coordinates
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Crime Map</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<FilterIcon />} onClick={() => setDrawerOpen(true)}>Filters</Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>Refresh</Button>
          <Chip label={`${crimes.length} crimes`} color="primary" variant="outlined" />
        </Box>
      </Box>

      <Paper elevation={0} sx={{ height: 'calc(100% - 60px)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} ref={mapRef}>
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

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 320, p: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>Map Filters</Typography>
          <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Time Range (Days)</Typography>
          <Slider value={filters.days} onChange={(e, val) => setFilters({ ...filters, days: val })}
            min={1} max={90} marks valueLabelDisplay="auto" />
        </Box>
        <FormControl fullWidth sx={{ mt: 3 }}>
          <InputLabel>Severity</InputLabel>
          <Select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })} label="Severity">
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} label="Status">
            <MenuItem value="">All</MenuItem>
            <MenuItem value="reported">Reported</MenuItem>
            <MenuItem value="investigating">Investigating</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button fullWidth variant="outlined" onClick={() => setFilters({ days: 30, severity: '', status: '' })}>Reset</Button>
          <Button fullWidth variant="contained" onClick={() => setDrawerOpen(false)}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}>Apply</Button>
        </Box>
      </Drawer>
    </Box>
  )
}

export default Map