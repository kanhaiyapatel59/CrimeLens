import React, { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { Box, Typography } from '@mui/material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useQuery } from '@tanstack/react-query'
import { crimeAPI } from '../../api/crimes'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const severityColors = {
  low: '#239B62',
  medium: '#D99118',
  high: '#D94F55',
  critical: '#E91E63',
}

const CrimeMarkers = ({ crimes }) => {
  const map = useMap()

  useEffect(() => {
    if (!crimes || crimes.length === 0) return
    const group = L.featureGroup()

    crimes.forEach((crime) => {
      if (!crime.location?.coordinates) return
      const [lng, lat] = crime.location.coordinates
      const color = severityColors[crime.severity] || '#356AE6'
      const radius = crime.severity === 'critical' ? 12 : crime.severity === 'high' ? 10 : crime.severity === 'medium' ? 8 : 6

      const marker = L.circleMarker([lat, lng], {
        radius,
        color: '#FFFFFF',
        weight: 2,
        opacity: 0.95,
        fillColor: color,
        fillOpacity: 0.85,
      })

      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; min-width: 210px; padding: 4px;">
          <h4 style="margin: 0 0 6px 0; color: #202A3A; font-weight: 700; font-size: 14px;">${crime.firNumber || 'Unknown FIR'}</h4>
          <div style="display: flex; gap: 4px; margin-bottom: 6px;">
            <span style="background: ${color}20; color: ${color}; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">${(crime.severity || 'unknown').toUpperCase()}</span>
            <span style="background: #E8ECF3; color: #5C6779; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 6px;">${crime.crimeType?.name || 'Crime'}</span>
          </div>
          <p style="margin: 3px 0; font-size: 12px; color: #5C6779;"><strong>Date:</strong> ${crime.date ? new Date(crime.date).toLocaleDateString() : 'N/A'}</p>
          <p style="margin: 3px 0; font-size: 12px; color: #5C6779;"><strong>Area:</strong> ${crime.location?.address?.area || crime.location?.address?.city || 'Karnataka'}</p>
        </div>
      `)
      group.addLayer(marker)
    })

    map.addLayer(group)
    const valid = crimes.filter((c) => c.location?.coordinates)
    if (valid.length > 0) {
      const bounds = L.latLngBounds(valid.map((c) => [c.location.coordinates[1], c.location.coordinates[0]]))
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] })
    }
    return () => {
      map.removeLayer(group)
    }
  }, [crimes, map])

  return null
}

const CrimeMap = ({ height = 320, showControls = true }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['map-crimes'],
    queryFn: () => crimeAPI.getAll({ limit: 200 }),
  })

  const crimes = data?.data?.data?.crimes || data?.data?.crimes || []
  const center =
    crimes.length > 0 && crimes[0]?.location?.coordinates
      ? [crimes[0].location.coordinates[1], crimes[0].location.coordinates[0]]
      : [12.9716, 77.5946]

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography variant="body2" sx={{ color: '#8893A4', fontWeight: 500 }}>
          Loading geospatial crime data...
        </Typography>
      </Box>
    )
  }

  if (crimes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography variant="body2" sx={{ color: '#8893A4', fontWeight: 500 }}>
          No geocoded crimes to display
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        height,
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.65)',
        boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
      }}
    >
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={showControls}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CrimeMarkers crimes={crimes} />
      </MapContainer>
    </Box>
  )
}

export default CrimeMap
