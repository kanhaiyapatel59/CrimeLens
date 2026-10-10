import React, { useState, useRef, useEffect } from 'react'
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
  CircularProgress,
  Button,
  Tooltip,
  Divider,
  ToggleButton,
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
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
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
  critical: { color: '#E91E63', label: 'Critical' },
  high: { color: '#D94F55', label: 'High' },
  medium: { color: '#D99118', label: 'Medium' },
  low: { color: '#239B62', label: 'Low' },
}

// Create marker with popup
const createCrimeMarker = (crime) => {
  if (!crime.location?.coordinates) return null
  
  const [lng, lat] = crime.location.coordinates
  const severity = crime.severity || 'medium'
  const color = severityColors[severity]?.color || '#356AE6'
  
  const marker = L.circleMarker([lat, lng], {
    radius: severity === 'critical' ? 13 : 
            severity === 'high' ? 10 :
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
        <h4 style="margin: 0; color: #202A3A; font-size: 15px; font-weight: 800;">${crime.firNumber || 'Unknown'}</h4>
        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color};"></span>
      </div>
      <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;">
        <span style="background: ${color}20; color: ${color}; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 700;">${severity.toUpperCase()}</span>
        <span style="background: #E8ECF3; color: #5C6779; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 600;">${crime.crimeType?.name || 'Crime'}</span>
      </div>
      <p style="margin: 4px 0; font-size: 12px; color: #5C6779;">
        <strong>📅 Date:</strong> ${crime.date ? new Date(crime.date).toLocaleDateString() : 'N/A'}
      </p>
      <p style="margin: 4px 0; font-size: 12px; color: #5C6779;">
        <strong>📍 Location:</strong> ${crime.location?.address?.area || crime.location?.address?.city || 'Karnataka'}
      </p>
      <p style="margin: 6px 0 0 0; font-size: 12px; color: #8893A4; border-top: 1px solid #D7DDE7; padding-top: 6px; line-height: 1.4;">
        ${crime.description?.substring(0, 100) || 'No narrative logged'}${crime.description?.length > 100 ? '...' : ''}
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
        top: 20,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Box
        sx={{
          borderRadius: '16px',
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Tooltip title="Zoom In" placement="left">
          <IconButton onClick={onZoomIn} size="small" sx={{ width: 38, height: 38, color: '#5C6779', '&:hover': { color: '#356AE6' } }}>
            <ZoomInIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out" placement="left">
          <IconButton onClick={onZoomOut} size="small" sx={{ width: 38, height: 38, color: '#5C6779', '&:hover': { color: '#356AE6' } }}>
            <ZoomOutIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Divider sx={{ borderColor: 'var(--neu-divider, #D7DDE7)' }} />
        <Tooltip title="Center Bounds" placement="left">
          <IconButton onClick={onCenter} size="small" sx={{ width: 38, height: 38, color: '#5C6779', '&:hover': { color: '#356AE6' } }}>
            <CenterIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="My Location" placement="left">
          <IconButton onClick={onLocate} size="small" sx={{ width: 38, height: 38, color: '#5C6779', '&:hover': { color: '#356AE6' } }}>
            <MyLocationIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
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
    <Box
      sx={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        p: 0.8,
        borderRadius: '16px',
        display: 'flex',
        gap: 0.8,
        flexWrap: 'wrap',
        justifyContent: 'center',
        bgcolor: 'var(--neu-surface, #E8ECF3)',
        boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
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
              borderRadius: '10px',
              px: 1.5,
              py: 0.6,
              border: 'none',
              color: '#5C6779',
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                bgcolor: '#356AE6 !important',
                color: '#fff !important',
                boxShadow: '2px 2px 8px rgba(53, 106, 230, 0.4)',
              },
            }}
          >
            {l.icon}
          </ToggleButton>
        </Tooltip>
      ))}
    </Box>
  )
}

// Legend Component
const Legend = () => {
  const map = useMap()

  useEffect(() => {
    const legend = L.control({ position: 'bottomright' })

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend')
      div.style.backgroundColor = 'var(--neu-surface, #E8ECF3)'
      div.style.padding = '12px 16px'
      div.style.borderRadius = '14px'
      div.style.boxShadow = '5px 5px 14px #C7CDD7, -5px -5px 14px #FFFFFF'
      div.style.border = '1px solid rgba(255, 255, 255, 0.7)'
      div.style.minWidth = '130px'
      div.style.fontFamily = 'Inter, sans-serif'
      
      div.innerHTML = `
        <div style="font-weight: 800; margin-bottom: 8px; font-size: 12px; color: #202A3A; letter-spacing: 0.02em;">SEVERITY CLASSIFICATION</div>
        ${Object.entries(severityColors).map(([key, value]) => `
          <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${value.color};"></span>
            <span style="font-size: 11px; font-weight: 600; color: #5C6779;">${value.label}</span>
          </div>
        `).join('')}
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
    if (!crimes || crimes.length === 0) return

    map.eachLayer((layer) => {
      if (layer._popup && layer._radius) {
        map.removeLayer(layer)
      }
    })

    const markers = []

    crimes.forEach((crime) => {
      if (!crime.location?.coordinates) return
      const marker = createCrimeMarker(crime)
      if (marker) {
        marker.addTo(map)
        markers.push(marker)
      }
    })

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => m.getLatLng()))
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }

    return () => {
      markers.forEach((marker) => {
        map.removeLayer(marker)
      })
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
  const [currentLayer, setCurrentLayer] = useState('street')
  const [diurnalHour, setDiurnalHour] = useState(14)
  const [isPlayingDiurnal, setIsPlayingDiurnal] = useState(false)
  const mapRef = useRef()

  useEffect(() => {
    let interval = null
    if (isPlayingDiurnal) {
      interval = setInterval(() => {
        setDiurnalHour((prev) => (prev + 1) % 24)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlayingDiurnal])

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

  const crimes = data?.data?.data?.crimes || data?.data?.crimes || data?.crimes || []

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() + 1)
  }

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() - 1)
  }

  const handleCenter = () => {
    if (mapRef.current && crimes.length > 0) {
      const valid = crimes.filter((c) => c.location?.coordinates)
      if (valid.length > 0) {
        const bounds = L.latLngBounds(valid.map((c) => [c.location.coordinates[1], c.location.coordinates[0]]))
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
        () => {
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
      mapRef.current.eachLayer((l) => {
        if (l._url) mapRef.current.removeLayer(l)
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
        <CircularProgress sx={{ color: '#356AE6' }} />
      </Box>
    )
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#202A3A', letterSpacing: '-0.02em', fontSize: { xs: '1.4rem', sm: '1.75rem' } }}>
            Live Geospatial Crime Map
          </Typography>
          <Typography variant="body2" sx={{ color: '#5C6779', fontWeight: 500 }}>
            Real-time GPS incident clustering, jurisdictional boundaries & diurnal patrol radar
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setDrawerOpen(true)}
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              color: '#202A3A',
              fontWeight: 700,
              borderRadius: '12px',
              px: 2,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              '&:hover': { color: '#356AE6' },
            }}
          >
            Filters
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              color: '#202A3A',
              fontWeight: 600,
              borderRadius: '12px',
              px: 2,
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            Refresh
          </Button>
          <Chip
            label={`${crimes.length} incidents logged`}
            sx={{ bgcolor: 'rgba(53, 106, 230, 0.12)', color: '#356AE6', fontWeight: 700, borderRadius: '12px' }}
          />
          <Chip
            label={`${crimes.filter((c) => c.severity === 'critical').length} critical`}
            sx={{ bgcolor: 'rgba(233, 30, 99, 0.12)', color: '#E91E63', fontWeight: 800, borderRadius: '12px' }}
          />
        </Box>
      </Box>

      {/* Map Card Container */}
      <Box
        sx={{
          flex: 1,
          borderRadius: '24px',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
        }}
      >
        {/* 24-Hour Diurnal Crime Radar Control Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 1000,
            p: 1.5,
            px: 2.5,
            borderRadius: '18px',
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            maxWidth: 520,
            width: 'calc(100% - 100px)',
          }}
        >
          <Button
            size="small"
            startIcon={isPlayingDiurnal ? <PauseIcon /> : <PlayIcon />}
            onClick={() => setIsPlayingDiurnal(!isPlayingDiurnal)}
            sx={{
              bgcolor: isPlayingDiurnal ? '#D94F55' : '#356AE6',
              color: '#fff !important',
              fontWeight: 800,
              fontSize: '0.72rem',
              borderRadius: '10px',
              minWidth: 86,
              boxShadow: '3px 3px 8px rgba(0,0,0,0.15)',
              '&:hover': { bgcolor: isPlayingDiurnal ? '#B5383D' : '#2955C4' },
            }}
          >
            {isPlayingDiurnal ? 'PAUSE' : 'RADAR'}
          </Button>

          <Box sx={{ flexGrow: 1, px: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#202A3A', fontWeight: 800, fontSize: '0.72rem' }}>
                DIURNAL HOUR: {String(diurnalHour).padStart(2, '0')}:00 HRS
              </Typography>
              <Chip
                label={diurnalHour >= 21 || diurnalHour <= 4 ? 'HIGH NIGHT SURGE' : 'DAY PATROL'}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  bgcolor: diurnalHour >= 21 || diurnalHour <= 4 ? '#D94F55' : '#239B62',
                  color: '#fff',
                }}
              />
            </Box>
            <Slider
              value={diurnalHour}
              onChange={(e, val) => setDiurnalHour(val)}
              min={0}
              max={23}
              step={1}
              size="small"
              sx={{
                color: '#356AE6',
                py: 0.5,
                '& .MuiSlider-thumb': {
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
                },
              }}
            />
          </Box>
        </Box>

        {/* Leaflet Map Container */}
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
      </Box>

      {/* Map Filter Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{
          disableAutoFocus: true,
          disableRestoreFocus: true,
        }}
        PaperProps={{
          sx: {
            width: 320,
            p: 3,
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised-lg, 10px 10px 24px #C3C9D3, -10px -10px 24px #FFFFFF)',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={800} color="#202A3A">
            Map Controls
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#5C6779' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3, borderColor: 'var(--neu-divider, #D7DDE7)' }} />

        <Typography variant="subtitle2" fontWeight={700} color="#202A3A" gutterBottom>
          Time Window ({filters.days} Days)
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
          sx={{ mb: 3, color: '#356AE6' }}
        />

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Severity Level</InputLabel>
          <Select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            label="Severity Level"
          >
            <MenuItem value="">All Severities</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
          <InputLabel>Case Status</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            label="Case Status"
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="reported">Reported</MenuItem>
            <MenuItem value="investigating">Investigating</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
          <Button
            fullWidth
            onClick={() => setFilters({ days: 30, severity: '', status: '' })}
            sx={{
              color: '#5C6779',
              fontWeight: 600,
              borderRadius: '12px',
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
            }}
          >
            Reset
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setDrawerOpen(false)}
            sx={{
              bgcolor: '#356AE6',
              fontWeight: 700,
              borderRadius: '12px',
              boxShadow: 'var(--neu-shadow-primary-btn, 4px 4px 12px rgba(53, 106, 230, 0.35))',
            }}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>
    </Box>
  )
}

export default Map