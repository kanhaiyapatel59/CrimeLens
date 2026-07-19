import React, { useState, useRef, useEffect } from 'react'
import {
  Box, Paper, Typography, IconButton, Slider, FormControl,
  InputLabel, Select, MenuItem, Chip, Drawer, CircularProgress, Button,
  Tooltip, Divider, ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import {
  FilterList as FilterIcon,
  CenterFocusStrong as CenterIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  MyLocation as MyLocationIcon,
  Satellite as SatelliteIcon,
  Map as MapIcon,
  Terrain as TerrainIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useQuery } from '@tanstack/react-query'
import { crimeAPI } from '../api/crimes'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import toast from 'react-hot-toast'

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Severity colors
const severityColors = {
  critical: { color: '#e91e63', label: 'Critical' },
  high: { color: '#f44336', label: 'High' },
  medium: { color: '#ff9800', label: 'Medium' },
  low: { color: '#4caf50', label: 'Low' },
}

// Create marker with popup
const createCrimeMarker = (crime) => {
  if (!crime.location?.coordinates) return null
  
  const [lng, lat] = crime.location.coordinates
  const severity = crime.severity || 'medium'
  const color = severityColors[severity]?.color || '#1a237e'
  
  const marker = L.circleMarker([lat, lng], {
    radius: severity === 'critical' ? 14 : 
            severity === 'high' ? 11 :
            severity === 'medium' ? 8 : 6,
    color: '#ffffff',
    weight: 2,
    opacity: 1,
    fillColor: color,
    fillOpacity: 0.85,
  })
  
  const popupContent = `
    <div style="font-family: 'Inter', sans-serif; min-width: 240px; max-width: 300px; padding: 4px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h4 style="margin: 0; color: #1a237e; font-size: 16px; font-weight: 700;">${crime.firNumber || 'Unknown'}</h4>
        <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${color};"></span>
      </div>
      <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;">
        <span style="background: ${color}20; color: ${color}; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">${severity.toUpperCase()}</span>
        <span style="background: #f0f0f0; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${crime.crimeType?.name || 'Unknown'}</span>
      </div>
      <p style="margin: 4px 0; font-size: 13px; color: #555;">
        <strong>📅</strong> ${crime.date ? new Date(crime.date).toLocaleDateString() : 'N/A'}
      </p>
      <p style="margin: 4px 0; font-size: 13px; color: #555;">
        <strong>📍</strong> ${crime.location?.address?.area || crime.location?.address?.city || 'Unknown'}
      </p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 8px;">
        ${crime.description?.substring(0, 100) || 'No description'}${crime.description?.length > 100 ? '...' : ''}
      </p>
    </div>
  `
  marker.bindPopup(popupContent, { maxWidth: 320 })
  
  return marker
}

// Map Controls Component
const MapControls = ({ onZoomIn, onZoomOut, onCenter, onLocate }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tooltip title="Zoom In" placement="left">
          <IconButton onClick={onZoomIn} size="small" sx={{ borderRadius: 0, width: 40, height: 40 }}>
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out" placement="left">
          <IconButton onClick={onZoomOut} size="small" sx={{ borderRadius: 0, width: 40, height: 40 }}>
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Divider />
        <Tooltip title="Center Map" placement="left">
          <IconButton onClick={onCenter} size="small" sx={{ borderRadius: 0, width: 40, height: 40 }}>
            <CenterIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="My Location" placement="left">
          <IconButton onClick={onLocate} size="small" sx={{ borderRadius: 0, width: 40, height: 40 }}>
            <MyLocationIcon />
          </IconButton>
        </Tooltip>
      </Paper>
    </Box>
  )
}

// Map Layers Component
const MapLayers = ({ onLayerChange }) => {
  const [layer, setLayer] = useState('street')

  const layers = [
    { id: 'street', label: 'Street', icon: <MapIcon fontSize="small" /> },
    { id: 'satellite', label: 'Satellite', icon: <SatelliteIcon fontSize="small" /> },
    { id: 'terrain', label: 'Terrain', icon: <TerrainIcon fontSize="small" /> },
    { id: 'dark', label: 'Dark', icon: <DarkModeIcon fontSize="small" /> },
    { id: 'light', label: 'Light', icon: <LightModeIcon fontSize="small" /> },
  ]

  const handleLayerChange = (newLayer) => {
    if (newLayer) {
      setLayer(newLayer)
      onLayerChange(newLayer)
    }
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        p: 0.5,
        borderRadius: 2,
        display: 'flex',
        gap: 0.5,
        flexWrap: 'wrap',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {layers.map((l) => (
        <Tooltip title={l.label} key={l.id}>
          <ToggleButton
            value={l.id}
            selected={layer === l.id}
            onChange={() => handleLayerChange(l.id)}
            size="small"
            sx={{
              borderRadius: 1,
              px: 1.5,
              py: 0.5,
              border: 'none',
              '&.Mui-selected': {
                backgroundColor: '#1a237e',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#283593',
                },
              },
            }}
          >
            {l.icon}
          </ToggleButton>
        </Tooltip>
      ))}
    </Paper>
  )
}

// Legend Component
const Legend = () => {
  const map = useMap()

  useEffect(() => {
    const legend = L.control({ position: 'bottomright' })

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend')
      div.style.backgroundColor = 'rgba(255,255,255,0.95)'
      div.style.padding = '12px 16px'
      div.style.borderRadius = '8px'
      div.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)'
      div.style.backdropFilter = 'blur(10px)'
      div.style.minWidth = '120px'
      
      div.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 8px; font-size: 13px; color: #1a237e;">Severity Levels</div>
        ${Object.entries(severityColors).map(([key, value]) => `
          <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${value.color}; border: 1px solid rgba(0,0,0,0.1);"></span>
            <span style="font-size: 12px; color: #333;">${value.label}</span>
          </div>
        `).join('')}
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 11px; color: #999;">
          Click markers for details
        </div>
      `
      return div
    }

    legend.addTo(map)

    return () => {
      map.removeControl(legend)
    }
  }, [map])

  return null
}

// Crime Markers Component
const CrimeMarkers = ({ crimes }) => {
  const map = useMap()

  useEffect(() => {
    if (!crimes || crimes.length === 0) {
      console.log('⚠️ No crimes to display on map')
      return
    }

    console.log(`📍 Rendering ${crimes.length} crimes on map`)
    
    // Remove existing markers
    map.eachLayer((layer) => {
      if (layer._popup && layer._radius) {
        map.removeLayer(layer)
      }
    })

    const markers = []
    let validCount = 0

    crimes.forEach((crime) => {
      if (!crime.location?.coordinates) return
      
      const marker = createCrimeMarker(crime)
      if (marker) {
        marker.addTo(map)
        markers.push(marker)
        validCount++
      }
    })

    console.log(`✅ Added ${validCount} markers to map`)

    // Fit bounds if markers exist
    if (markers.length > 0) {
      const bounds = L.latLngBounds(
        markers.map(m => m.getLatLng())
      )
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }

    return () => {
      markers.forEach(marker => {
        map.removeLayer(marker)
      })
    }
  }, [crimes, map])

  return null
}

// Main Map Component
const Map = () => {
  const [filters, setFilters] = useState({ 
    days: 30, 
    severity: '', 
    status: '',
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentLayer, setCurrentLayer] = useState('street')
  const mapRef = useRef()

  const tileLayers = {
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri',
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap',
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '© CartoDB',
    },
    light: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '© CartoDB',
    },
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['map-crimes', filters],
    queryFn: () => crimeAPI.getAll({
      page: 1,
      limit: 500,
      severity: filters.severity || undefined,
      status: filters.status || undefined,
    }),
    retry: 1,
    staleTime: 30000,
  })

  // ✅ FIX: Try all possible data paths
  const crimes = data?.data?.data?.crimes || data?.data?.crimes || data?.crimes || []
  
  console.log('📊 API Response:', data)
  console.log('📊 Crimes found:', crimes.length)

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
        const bounds = L.latLngBounds(
          valid.map(c => [c.location.coordinates[1], c.location.coordinates[0]])
        )
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15)
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          toast.error('Unable to get your location')
        }
      )
    } else {
      toast.error('Geolocation not supported')
    }
  }

  const handleLayerChange = (layer) => {
    setCurrentLayer(layer)
    if (mapRef.current) {
      mapRef.current.eachLayer((layer) => {
        if (layer._url) {
          mapRef.current.removeLayer(layer)
        }
      })
      const tileLayer = L.tileLayer(tileLayers[layer].url, {
        attribution: tileLayers[layer].attribution,
        maxZoom: 19,
      })
      tileLayer.addTo(mapRef.current)
    }
  }

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
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Crime Map
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Interactive crime visualization with multiple map layers
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setDrawerOpen(true)}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Chip
            label={`${crimes.length} crimes`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${crimes.filter(c => c.severity === 'critical').length} critical`}
            color="error"
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          height: 'calc(100% - 60px)',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
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
            onLocate={handleLocate}
          />
          
          <MapLayers onLayerChange={handleLayerChange} />
          
          <Legend />
        </MapContainer>
      </Paper>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 340, p: 3 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Map Filters
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle2" fontWeight={500} gutterBottom>
          Time Range
        </Typography>
        <Slider
          value={filters.days}
          onChange={(e, val) => setFilters({ ...filters, days: val })}
          min={1}
          max={90}
          marks={[
            { value: 1, label: '1d' },
            { value: 7, label: '7d' },
            { value: 30, label: '30d' },
            { value: 90, label: '90d' },
          ]}
          valueLabelDisplay="auto"
          sx={{ mb: 3 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Severity</InputLabel>
          <Select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            label="Severity"
          >
            <MenuItem value="">All Severities</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
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