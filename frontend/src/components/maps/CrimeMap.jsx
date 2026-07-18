import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { Box, CircularProgress, Typography } from '@mui/material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useQuery } from '@tanstack/react-query'
import { crimeAPI } from '../../api/crimes'

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const CrimeMarkers = ({ crimes }) => {
  const map = useMap()

  useEffect(() => {
    if (crimes && crimes.length > 0) {
      const group = L.featureGroup()
      
      crimes.forEach((crime) => {
        if (crime.location?.coordinates) {
          const [lng, lat] = crime.location.coordinates
          
          const severityColors = {
            low: '#4caf50',
            medium: '#ff9800',
            high: '#f44336',
            critical: '#e91e63',
          }
          const color = severityColors[crime.severity] || '#1a237e'

          const marker = L.circleMarker([lat, lng], {
            radius: crime.severity === 'critical' ? 12 : 
                    crime.severity === 'high' ? 10 :
                    crime.severity === 'medium' ? 8 : 6,
            color: color,
            weight: 2,
            opacity: 0.8,
            fillColor: color,
            fillOpacity: 0.6,
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
          group.addLayer(marker)
        }
      })

      map.addLayer(group)

      if (crimes.length > 0) {
        const bounds = L.latLngBounds(
          crimes
            .filter(c => c.location?.coordinates)
            .map(c => [c.location.coordinates[1], c.location.coordinates[0]])
        )
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] })
        }
      }

      return () => {
        map.removeLayer(group)
      }
    }
  }, [crimes, map])

  return null
}

const CrimeMap = ({ height = 300, showControls = true }) => {
  const [loading, setLoading] = useState(true)
  
  const { data } = useQuery({
    queryKey: ['map-crimes'],
    queryFn: () => crimeAPI.getAll({ limit: 100 }),
  })

  const crimes = data?.data?.crimes || []
  const center = crimes.length > 0 && crimes[0].location?.coordinates
    ? [crimes[0].location.coordinates[1], crimes[0].location.coordinates[0]]
    : [12.9716, 77.5946]

  useEffect(() => {
    if (data) {
      setLoading(false)
    }
  }, [data])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height }}>
        <CircularProgress />
      </Box>
    )
  }

  if (crimes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height }}>
        <Typography variant="body2" color="textSecondary">
          No crimes to display on map
        </Typography>
      </Box>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: height, width: '100%', borderRadius: '8px' }}
      zoomControl={showControls}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CrimeMarkers crimes={crimes} />
    </MapContainer>
  )
}

export default CrimeMap