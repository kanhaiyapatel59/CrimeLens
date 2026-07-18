import React from 'react'
import { Box, Paper, IconButton, Tooltip } from '@mui/material'
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Layers as LayersIcon,
} from '@mui/icons-material'

const MapControls = ({ onZoomIn, onZoomOut, onCenter, onLayerToggle }) => {
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
        <Tooltip title="Zoom In">
          <IconButton onClick={onZoomIn} size="small" sx={{ borderRadius: 0 }}>
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton onClick={onZoomOut} size="small" sx={{ borderRadius: 0 }}>
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Center Map">
          <IconButton onClick={onCenter} size="small" sx={{ borderRadius: 0 }}>
            <CenterIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Toggle Layers">
          <IconButton onClick={onLayerToggle} size="small" sx={{ borderRadius: 0 }}>
            <LayersIcon />
          </IconButton>
        </Tooltip>
      </Paper>
    </Box>
  )
}

export default MapControls