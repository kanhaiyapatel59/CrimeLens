import React from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { Box, Typography } from '@mui/material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useQuery } from '@tanstack/react-query'
import { crimeAPI } from '../../api/crimes'
import { useEffect } from 'react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const severityColors = { low: '#4caf50', medium: '#ff9800', high: '#f44336', critical: '#e91e63' }

const CrimeMarkers = ({ crimes }) => {
  const map = useMap()

  useEffect(() => {
    if (!crimes || crimes.length === 0) return
    const group = L.featureGroup()

    crimes.forEach((crime) => {
      if (!crime.location?.coordinates) return
      const [lng, lat] = crime.location.coordinates
      const color = severityColors[crime.severity] || '#1a237e'
      const radius = crime.severity === 'critical' ? 12 : crime.severity === 'high' ? 10 : crime.severity === 'medium' ? 8 : 6

      const marker = L.circleMarker([lat, lng], {
        radius, color, weight: 2, opacity: 0.8, fillColor: color, fillOpacity: 0.6,
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
    const valid = crimes.filter(c => c.location?.coordinates)
    if (valid.length > 0) {
      const bounds = L.latLngBounds(valid.map(c => [c.location.coordinates[1], c.location.coordinates[0]]))
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50] })
    }
    return () => { map.removeLayer(group) }
  }, [crimes, map])

  return null
}

const CrimeMap = ({ height = 300, showControls = true }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['map-crimes'],
    queryFn: () => crimeAPI.getAll({ limit: 200 }),
  })

  const crimes = data?.data?.data?.crimes || []
  const center = crimes.length > 0 && crimes[0]?.location?.coordinates
    ? [crimes[0].location.coordinates[1], crimes[0].location.coordinates[0]]
    : [12.9716, 77.5946]

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography variant="body2" color="textSecondary">Loading map...</Typography>
      </Box>
    )
  }

  if (crimes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography variant="body2" color="textSecondary">No crimes to display on map</Typography>
      </Box>
    )
  }

  return (
    <MapContainer center={center} zoom={12}
      style={{ height, width: '100%', borderRadius: '8px' }}
      zoomControl={showControls}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CrimeMarkers crimes={crimes} />
    </MapContainer>
  )
}

export default CrimeMap
