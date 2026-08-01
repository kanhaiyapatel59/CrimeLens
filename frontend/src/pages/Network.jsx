import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Box, Paper, Typography, Button, Chip, Drawer, CircularProgress,
  IconButton, Tooltip, Avatar, Divider, Alert, Grid, Card, CardContent,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Slider, Switch, FormControlLabel,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CenterFocusStrong as FocusIcon,
  Visibility as EyeIcon,
  GroupWork as SyndicateIcon,
} from '@mui/icons-material'
import ReactFlow, {
  MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useQuery } from '@tanstack/react-query'
import { networkAPI } from '../api/network'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

// Custom Criminological Node Component with Dynamic Highlight & Fading
const CustomCriminologicalNode = ({ data }) => {
  const isSuspect = data.type === 'suspect'
  const isCrime = data.type === 'crime'
  const isVictim = data.type === 'victim'
  const isLocation = data.type === 'location'
  const isMO = data.type === 'mo'

  const isFocused = data.isFocused
  const isDimmed = data.isDimmed

  const bgColor = isSuspect ? '#ffebee' : isCrime ? '#e3f2fd' : isVictim ? '#e8f5e9' : isLocation ? '#fff3e0' : '#f3e5f5'
  const borderColor = isSuspect ? '#e91e63' : isCrime ? '#1976d2' : isVictim ? '#4caf50' : isLocation ? '#ff9800' : '#9c27b0'

  return (
    <Paper
      elevation={isFocused ? 10 : 2}
      sx={{
        p: 1.5,
        borderRadius: 3,
        bgcolor: bgColor,
        border: isFocused ? `3px solid ${borderColor}` : `2px solid ${borderColor}`,
        opacity: isDimmed ? 0.2 : 1,
        transform: isFocused ? 'scale(1.08)' : 'scale(1)',
        transition: 'all 0.25s ease-in-out',
        minWidth: 160,
        maxWidth: 220,
        boxShadow: isFocused ? `0 0 20px ${borderColor}` : '0 4px 12px rgba(0,0,0,0.1)',
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Avatar
          sx={{
            width: 28,
            height: 28,
            bgcolor: borderColor,
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          {isSuspect ? 'S' : isCrime ? 'F' : isVictim ? 'V' : isLocation ? 'L' : 'M'}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="caption" fontWeight={700} sx={{ color: borderColor, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block' }}>
            {data.category || data.type}
          </Typography>
          <Typography variant="body2" fontWeight={700} noWrap sx={{ color: '#1a237e' }}>
            {data.label}
          </Typography>
        </Box>
      </Box>

      {isCrime && (
        <Box sx={{ mt: 0.5 }}>
          <Chip label={data.data?.crimeTypeName || 'Crime'} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#bbdefb' }} />
          <Chip label={data.data?.severity?.toUpperCase()} size="small" color={data.data?.severity === 'critical' ? 'error' : 'warning'} sx={{ height: 18, fontSize: '0.6rem', ml: 0.5 }} />
        </Box>
      )}

      {isSuspect && (
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
          Alias: {data.data?.alias || 'N/A'} • Status: {data.data?.status || 'Active'}
        </Typography>
      )}

      {isMO && (
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: '0.65rem', fontStyle: 'italic' }}>
          {data.data?.tactics}
        </Typography>
      )}
    </Paper>
  )
}

const nodeTypes = {
  custom: CustomCriminologicalNode,
}

const Network = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [repeatDrawerOpen, setRepeatDrawerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [maxNodesLimit, setMaxNodesLimit] = useState(40) // Default to clean 40 nodes to prevent clutter!
  const [coOffendersOnly, setCoOffendersOnly] = useState(false)

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['network-graph', maxNodesLimit],
    queryFn: () => networkAPI.getGraph({ limit: maxNodesLimit }),
    retry: 2,
    staleTime: 30000,
  })

  const { data: repeatOffendersData } = useQuery({
    queryKey: ['repeat-offenders'],
    queryFn: () => networkAPI.getRepeatOffenders(),
    staleTime: 30000,
  })

  const repeatOffendersList = repeatOffendersData?.data?.data || repeatOffendersData?.data || []

  // Structured Spaced Cluster Layout Engine
  useEffect(() => {
    if (data?.data) {
      const graphData = data.data.data || data.data
      const rawNodes = graphData.nodes || []
      const rawEdges = graphData.edges || []

      // Separate nodes into radial rings
      const crimeNodes = rawNodes.filter(n => n.type === 'crime')
      const suspectNodes = rawNodes.filter(n => n.type === 'suspect')
      const moNodes = rawNodes.filter(n => n.type === 'mo')
      const locNodes = rawNodes.filter(n => n.type === 'location')
      const victimNodes = rawNodes.filter(n => n.type === 'victim')

      const flowNodes = []

      // Center Ring (Crimes) - Spaced out
      crimeNodes.forEach((node, idx) => {
        const angle = (idx / Math.max(1, crimeNodes.length)) * 2 * Math.PI
        const radius = 220
        flowNodes.push({
          id: node.id,
          type: 'custom',
          position: { x: 600 + radius * Math.cos(angle), y: 400 + radius * Math.sin(angle) },
          data: { ...node, label: node.label },
        })
      })

      // Inner Ring (Suspects)
      suspectNodes.forEach((node, idx) => {
        const angle = (idx / Math.max(1, suspectNodes.length)) * 2 * Math.PI
        const radius = 450
        flowNodes.push({
          id: node.id,
          type: 'custom',
          position: { x: 600 + radius * Math.cos(angle), y: 400 + radius * Math.sin(angle) },
          data: { ...node, label: node.label },
        })
      })

      // Outer Ring (MO & Locations & Victims)
      const outerNodes = [...moNodes, ...locNodes, ...victimNodes]
      outerNodes.forEach((node, idx) => {
        const angle = (idx / Math.max(1, outerNodes.length)) * 2 * Math.PI
        const radius = 680
        flowNodes.push({
          id: node.id,
          type: 'custom',
          position: { x: 600 + radius * Math.cos(angle), y: 400 + radius * Math.sin(angle) },
          data: { ...node, label: node.label },
        })
      })

      // Create Flow Edges with clear labels
      const flowEdges = rawEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label || edge.type?.toUpperCase(),
        animated: edge.type === 'co_offender' || edge.type === 'suspect_in',
        style: { stroke: edge.color || '#1976d2', strokeWidth: edge.type === 'co_offender' ? 3 : 2 },
        labelStyle: { fill: edge.color || '#1976d2', fontWeight: 700, fontSize: 10 },
        markerEnd: { type: MarkerType.ArrowClosed, color: edge.color || '#1976d2' },
      }))

      setNodes(flowNodes)
      setEdges(flowEdges)
    }
  }, [data, setNodes, setEdges])

  // Active Focus/Highlighting Logic
  const activeFocusId = selectedNodeId || hoveredNodeId

  const connectedEdgeIds = useMemo(() => {
    if (!activeFocusId) return new Set()
    const set = new Set()
    edges.forEach(e => {
      if (e.source === activeFocusId || e.target === activeFocusId) {
        set.add(e.id)
      }
    })
    return set
  }, [activeFocusId, edges])

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId) return new Set()
    const set = new Set([activeFocusId])
    edges.forEach(e => {
      if (e.source === activeFocusId) set.add(e.target)
      if (e.target === activeFocusId) set.add(e.source)
    })
    return set
  }, [activeFocusId, edges])

  // Dynamically update nodes and edges based on active focus
  const styledNodes = useMemo(() => {
    return nodes.map(node => {
      const matchesSearch = node.data.label.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || node.data.type === filterType
      const isCoOffenderFilter = !coOffendersOnly || node.data.type === 'suspect'

      const isVisible = matchesSearch && matchesType && isCoOffenderFilter
      if (!isVisible) return null

      const isFocused = activeFocusId ? connectedNodeIds.has(node.id) : false
      const isDimmed = activeFocusId ? !connectedNodeIds.has(node.id) : false

      return {
        ...node,
        data: {
          ...node.data,
          isFocused,
          isDimmed,
        }
      }
    }).filter(Boolean)
  }, [nodes, searchTerm, filterType, coOffendersOnly, activeFocusId, connectedNodeIds])

  const styledEdges = useMemo(() => {
    return edges.map(edge => {
      const isConnected = activeFocusId ? connectedEdgeIds.has(edge.id) : true
      const isDimmed = activeFocusId ? !connectedEdgeIds.has(edge.id) : false

      return {
        ...edge,
        style: {
          ...edge.style,
          strokeWidth: isConnected && activeFocusId ? 4 : 2,
          opacity: isDimmed ? 0.1 : 1,
        },
        animated: isConnected && activeFocusId ? true : edge.animated,
      }
    })
  }, [edges, activeFocusId, connectedEdgeIds])

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id)
    setDrawerOpen(true)
  }, [])

  const onNodeMouseEnter = useCallback((event, node) => {
    setHoveredNodeId(node.id)
  }, [])

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null)
  }, [])

  const selectedNodeObject = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId)
  }, [nodes, selectedNodeId])

  // Compute Direct Connections for Selected Node Dossier
  const directConnections = useMemo(() => {
    if (!selectedNodeId) return []
    const connections = []
    edges.forEach(e => {
      let targetId = null
      let relationLabel = e.label || e.type

      if (e.source === selectedNodeId) targetId = e.target
      else if (e.target === selectedNodeId) targetId = e.source

      if (targetId) {
        const targetNode = nodes.find(n => n.id === targetId)
        if (targetNode) {
          connections.push({
            id: targetNode.id,
            label: targetNode.data.label,
            type: targetNode.data.type,
            relation: relationLabel,
            category: targetNode.data.category,
          })
        }
      }
    })
    return connections
  }, [selectedNodeId, edges, nodes])

  const stats = useMemo(() => ({
    totalNodes: nodes.length,
    totalEdges: edges.length,
    suspects: nodes.filter(n => n.data.type === 'suspect').length,
    crimes: nodes.filter(n => n.data.type === 'crime').length,
    mo: nodes.filter(n => n.data.type === 'mo').length,
    locations: nodes.filter(n => n.data.type === 'location').length,
  }), [nodes, edges])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 110px)', position: 'relative' }}>
      {/* Header Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Criminological Link Analysis</Typography>
          <Typography variant="body2" color="textSecondary">Interactive offender connections, FIR incidents, modus operandi, and crime hubs</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search node name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            }}
            sx={{ width: 180 }}
          />

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Category</InputLabel>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Category">
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="suspect">Suspects</MenuItem>
              <MenuItem value="crime">FIR Incidents</MenuItem>
              <MenuItem value="mo">Modus Operandi</MenuItem>
              <MenuItem value="location">Locations</MenuItem>
              <MenuItem value="victim">Victims</MenuItem>
            </Select>
          </FormControl>

          {/* Node Density Control Slider */}
          <Box sx={{ width: 140, px: 1 }}>
            <Typography variant="caption" color="textSecondary" fontWeight={600}>Limit: {maxNodesLimit} Nodes</Typography>
            <Slider
              value={maxNodesLimit}
              onChange={(e, val) => setMaxNodesLimit(val)}
              min={20}
              max={150}
              step={10}
              size="small"
            />
          </Box>

          <Button
            variant="contained"
            color="secondary"
            onClick={() => setRepeatDrawerOpen(true)}
            sx={{ bgcolor: '#e91e63', '&:hover': { bgcolor: '#c2185b' }, fontWeight: 600, fontSize: '0.8rem' }}
          >
            Repeat Offender Profiler ({repeatOffendersList.length})
          </Button>

          {activeFocusId && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => { setSelectedNodeId(null); setHoveredNodeId(null) }}
            >
              Clear Focus
            </Button>
          )}

          <Tooltip title="Refresh Graph">
            <IconButton onClick={() => refetch()} sx={{ bgcolor: '#f5f7fa' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Connection Mode Helper Alert */}
      <Alert severity="info" icon={<FocusIcon />} sx={{ mb: 1.5, py: 0.2, px: 2, borderRadius: 2 }}>
        <Typography variant="caption" fontWeight={600}>
          💡 <strong>Connection Highlight Mode:</strong> Hover or click any node card to instantly isolate and highlight its direct links & co-offenders!
        </Typography>
      </Alert>

      {/* KPI Stats Bar */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={2.4}>
          <Card sx={{ bgcolor: '#1a237e', color: '#fff', borderRadius: 2 }}>
            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 }, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700}>{stats.totalNodes}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Rendered Nodes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card sx={{ bgcolor: '#e91e63', color: '#fff', borderRadius: 2 }}>
            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 }, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700}>{stats.suspects}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Suspects / Offenders</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card sx={{ bgcolor: '#1976d2', color: '#fff', borderRadius: 2 }}>
            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 }, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700}>{stats.crimes}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>FIR Incidents</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card sx={{ bgcolor: '#9c27b0', color: '#fff', borderRadius: 2 }}>
            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 }, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700}>{stats.mo}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>MO Signatures</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card sx={{ bgcolor: '#ff9800', color: '#fff', borderRadius: 2 }}>
            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 }, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700}>{stats.locations}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Crime Hotspots</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ReactFlow Canvas */}
      <Paper sx={{ height: 'calc(100% - 170px)', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.05}
          maxZoom={10}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnScroll={false}
        >
          <Background color="#bbb" gap={20} />
          <Controls showZoom={true} showFitView={true} showInteractive={true} />
          <MiniMap nodeColor={(node) => node.data?.color || '#1a237e'} />
        </ReactFlow>
      </Paper>

      {/* Criminological Intelligence Dossier Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 440, p: 3 } }}>
        {selectedNodeObject && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="span" fontWeight={700} sx={{ color: '#1a237e' }}>
                Intelligence Dossier
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#f5f7fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1" fontWeight={700} color="primary">{selectedNodeObject.data.label}</Typography>
              <Chip label={selectedNodeObject.data.category || selectedNodeObject.data.type} size="small" color="secondary" sx={{ mt: 0.5 }} />
            </Paper>

            {/* Direct Connections Inspector List */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1a237e', mb: 1 }}>
              🔗 Direct Network Connections ({directConnections.length})
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, mb: 3, maxHeight: 220, overflowY: 'auto', bgcolor: '#fafafa', borderRadius: 2 }}>
              {directConnections.length === 0 ? (
                <Typography variant="caption" color="textSecondary">No direct connections found.</Typography>
              ) : (
                directConnections.map((conn, i) => (
                  <Box
                    key={i}
                    onClick={() => setSelectedNodeId(conn.id)}
                    sx={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      px: 1,
                      mb: 0.5,
                      borderRadius: 1,
                      bgcolor: '#fff',
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#e3f2fd' }
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{conn.label}</Typography>
                      <Typography variant="caption" color="textSecondary">{conn.category}</Typography>
                    </Box>
                    <Chip label={conn.relation} size="small" color="primary" sx={{ height: 18, fontSize: '0.6rem' }} />
                  </Box>
                ))
              )}
            </Paper>

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Node Attributes & Metadata</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              {Object.entries(selectedNodeObject.data.data || {}).map(([key, val]) => (
                typeof val !== 'object' && val !== null && (
                  <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #eee', py: 0.5 }}>
                    <Typography variant="caption" color="textSecondary" fontWeight={600}>{key.toUpperCase()}:</Typography>
                    <Typography variant="caption" fontWeight={500}>{String(val)}</Typography>
                  </Box>
                )
              ))}
            </Box>

            <Button fullWidth variant="contained" onClick={() => setDrawerOpen(false)} sx={{ bgcolor: '#1a237e' }}>
              Close Dossier
            </Button>
          </Box>
        )}
      </Drawer>

      {/* Repeat Offender Profiler Drawer */}
      <Drawer anchor="right" open={repeatDrawerOpen} onClose={() => setRepeatDrawerOpen(false)} PaperProps={{ sx: { width: 450, p: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="span" fontWeight={700} sx={{ color: '#1a237e' }}>
            Cross-Jurisdiction Offender Profiler
          </Typography>
          <IconButton onClick={() => setRepeatDrawerOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
          Tracks suspects linked across multiple police station jurisdictions and MO signatures.
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {repeatOffendersList.length === 0 ? (
          <Alert severity="info">No repeat offenders detected in active dataset.</Alert>
        ) : (
          repeatOffendersList.map((offender, idx) => (
            <Paper key={idx} elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2, borderLeft: offender.crossJurisdiction ? '4px solid #e91e63' : '4px solid #1976d2' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>{offender.name}</Typography>
                  <Typography variant="caption" color="textSecondary">Alias: {offender.alias} • Status: {offender.status}</Typography>
                </Box>
                {offender.crossJurisdiction && <Chip label="Cross-Jurisdiction" color="error" size="small" sx={{ fontSize: '0.65rem' }} />}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip label={`${offender.crimesCount} Crimes Linked`} color="primary" size="small" variant="outlined" />
                <Chip label={`${offender.policeStations.length} Police Stations`} color="info" size="small" variant="outlined" />
                <Chip label={`${offender.districts.length} Districts`} color="secondary" size="small" variant="outlined" />
              </Box>
              <Typography variant="caption" fontWeight={600} color="textSecondary" sx={{ display: 'block' }}>
                FIRs Linked: {offender.firs.join(', ') || 'N/A'}
              </Typography>
            </Paper>
          ))
        )}
      </Drawer>
    </Box>
  )
}

export default Network