import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Drawer,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  GroupWork as SyndicateIcon,
} from '@mui/icons-material'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useQuery } from '@tanstack/react-query'
import { networkAPI } from '../api/network'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

// Custom Neumorphic Criminological Node Component
const CustomCriminologicalNode = ({ data }) => {
  const isSuspect = data.type === 'suspect'
  const isCrime = data.type === 'crime'
  const isVictim = data.type === 'victim'
  const isLocation = data.type === 'location'
  const isMO = data.type === 'mo'

  const isFocused = data.isFocused
  const isDimmed = data.isDimmed

  const borderColor = isSuspect
    ? '#D94F55'
    : isCrime
    ? '#356AE6'
    : isVictim
    ? '#239B62'
    : isLocation
    ? '#D99118'
    : '#8B5CF6'

  return (
    <Box
      sx={{
        p: 1.6,
        borderRadius: '16px',
        bgcolor: 'var(--neu-surface, #E8ECF3)',
        border: isFocused ? `2.5px solid ${borderColor}` : `1px solid ${borderColor}60`,
        boxShadow: isFocused
          ? `0 0 16px ${borderColor}60, 6px 6px 14px #C7CDD7, -6px -6px 14px #FFFFFF`
          : 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
        opacity: isDimmed ? 0.25 : 1,
        transform: isFocused ? 'scale(1.06)' : 'scale(1)',
        transition: 'all 0.25s ease-in-out',
        minWidth: 160,
        maxWidth: 220,
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.6 }}>
        <Avatar
          sx={{
            width: 26,
            height: 26,
            bgcolor: borderColor,
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 800,
          }}
        >
          {isSuspect ? 'S' : isCrime ? 'F' : isVictim ? 'V' : isLocation ? 'L' : 'M'}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="caption" fontWeight={800} sx={{ color: borderColor, textTransform: 'uppercase', fontSize: '0.62rem', display: 'block' }}>
            {data.category || data.type}
          </Typography>
          <Typography variant="body2" fontWeight={800} noWrap sx={{ color: '#202A3A', fontSize: '0.82rem' }}>
            {data.label}
          </Typography>
        </Box>
      </Box>

      {isCrime && (
        <Box sx={{ mt: 0.5 }}>
          <Chip label={data.data?.crimeTypeName || 'Crime'} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(53, 106, 230, 0.1)', color: '#356AE6', fontWeight: 700 }} />
          <Chip label={data.data?.severity?.toUpperCase()} size="small" sx={{ height: 18, fontSize: '0.6rem', ml: 0.5, bgcolor: data.data?.severity === 'critical' ? 'rgba(217, 79, 85, 0.15)' : 'rgba(217, 145, 24, 0.15)', color: data.data?.severity === 'critical' ? '#D94F55' : '#D99118', fontWeight: 800 }} />
        </Box>
      )}

      {isSuspect && (
        <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', color: '#5C6779', fontWeight: 500 }}>
          Alias: {data.data?.alias || 'N/A'} • Status: {data.data?.status || 'Active'}
        </Typography>
      )}

      {isMO && (
        <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', color: '#5C6779', fontStyle: 'italic' }}>
          {data.data?.tactics}
        </Typography>
      )}
    </Box>
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
  const [maxNodesLimit, setMaxNodesLimit] = useState(40)
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

      const crimeNodes = rawNodes.filter((n) => n.type === 'crime')
      const suspectNodes = rawNodes.filter((n) => n.type === 'suspect')
      const moNodes = rawNodes.filter((n) => n.type === 'mo')
      const locNodes = rawNodes.filter((n) => n.type === 'location')
      const victimNodes = rawNodes.filter((n) => n.type === 'victim')

      const flowNodes = []

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

      const flowEdges = rawEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label || edge.type?.toUpperCase(),
        animated: edge.type === 'co_offender' || edge.type === 'suspect_in',
        style: { stroke: edge.color || '#356AE6', strokeWidth: edge.type === 'co_offender' ? 3 : 2 },
        labelStyle: { fill: edge.color || '#356AE6', fontWeight: 700, fontSize: 10 },
        markerEnd: { type: MarkerType.ArrowClosed, color: edge.color || '#356AE6' },
      }))

      setNodes(flowNodes)
      setEdges(flowEdges)
    }
  }, [data, setNodes, setEdges])

  const activeFocusId = selectedNodeId || hoveredNodeId

  const connectedEdgeIds = useMemo(() => {
    if (!activeFocusId) return new Set()
    const set = new Set()
    edges.forEach((e) => {
      if (e.source === activeFocusId || e.target === activeFocusId) {
        set.add(e.id)
      }
    })
    return set
  }, [activeFocusId, edges])

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId) return new Set()
    const set = new Set([activeFocusId])
    edges.forEach((e) => {
      if (e.source === activeFocusId) set.add(e.target)
      if (e.target === activeFocusId) set.add(e.source)
    })
    return set
  }, [activeFocusId, edges])

  const styledNodes = useMemo(() => {
    return nodes.map((node) => {
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
        },
      }
    }).filter(Boolean)
  }, [nodes, searchTerm, filterType, coOffendersOnly, activeFocusId, connectedNodeIds])

  const styledEdges = useMemo(() => {
    return edges.map((edge) => {
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
    return nodes.find((n) => n.id === selectedNodeId)
  }, [nodes, selectedNodeId])

  const directConnections = useMemo(() => {
    if (!selectedNodeId) return []
    const connections = []
    edges.forEach((e) => {
      let targetId = null
      let relationLabel = e.label || e.type

      if (e.source === selectedNodeId) targetId = e.target
      else if (e.target === selectedNodeId) targetId = e.source

      if (targetId) {
        const targetNode = nodes.find((n) => n.id === targetId)
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
    suspects: nodes.filter((n) => n.data.type === 'suspect').length,
    crimes: nodes.filter((n) => n.data.type === 'crime').length,
    mo: nodes.filter((n) => n.data.type === 'mo').length,
    locations: nodes.filter((n) => n.data.type === 'location').length,
  }), [nodes, edges])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress sx={{ color: '#356AE6' }} />
      </Box>
    )
  }

  const neuInputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'var(--neu-surface, #E8ECF3)',
      boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      '& fieldset': { border: 'none' },
      '&:hover fieldset': { border: 'none' },
      '&.Mui-focused fieldset': { border: '1.5px solid #356AE6' },
    },
  }

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 110px)', minHeight: { xs: 700, md: 750 }, position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Header Controls Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#202A3A', letterSpacing: '-0.02em', fontSize: { xs: '1.4rem', sm: '1.75rem' } }}>
            Criminal Syndicate & Network Linkage
          </Typography>
          <Typography variant="body2" sx={{ color: '#5C6779', fontWeight: 500 }}>
            {stats.totalNodes} Graph entities ({stats.suspects} suspects, {stats.crimes} FIR cases, {stats.totalEdges} active associations)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search node..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#8893A4', fontSize: 18 }} /></InputAdornment>,
            }}
            sx={{ width: 170, ...neuInputSx }}
          />

          <FormControl size="small" sx={{ minWidth: 130, ...neuInputSx }}>
            <InputLabel>Category</InputLabel>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Category">
              <MenuItem value="all">All Entities</MenuItem>
              <MenuItem value="suspect">Suspects</MenuItem>
              <MenuItem value="crime">FIR Incidents</MenuItem>
              <MenuItem value="mo">Modus Operandi</MenuItem>
              <MenuItem value="location">Locations</MenuItem>
              <MenuItem value="victim">Victims</MenuItem>
            </Select>
          </FormControl>

          {/* Node Density Slider */}
          <Box sx={{ width: 130, px: 1 }}>
            <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 700, fontSize: '0.68rem' }}>
              Limit: {maxNodesLimit} Entities
            </Typography>
            <Slider
              value={maxNodesLimit}
              onChange={(e, val) => setMaxNodesLimit(val)}
              min={20}
              max={150}
              step={10}
              size="small"
              sx={{ color: '#356AE6', py: 0.5 }}
            />
          </Box>

          <Button
            variant="contained"
            onClick={() => setRepeatDrawerOpen(true)}
            sx={{
              bgcolor: '#D94F55',
              '&:hover': { bgcolor: '#B5383D' },
              fontWeight: 700,
              fontSize: '0.78rem',
              borderRadius: '12px',
              boxShadow: 'var(--neu-shadow-danger-btn, 4px 4px 12px rgba(217, 79, 85, 0.35))',
            }}
          >
            Repeat Offender Leads ({repeatOffendersList.length})
          </Button>

          {activeFocusId && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => { setSelectedNodeId(null); setHoveredNodeId(null) }}
              sx={{
                color: '#D94F55',
                borderColor: '#D94F55',
                borderRadius: '12px',
                fontWeight: 600,
              }}
            >
              Clear Focus
            </Button>
          )}

          <IconButton
            onClick={() => refetch()}
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
              borderRadius: '12px',
            }}
          >
            <RefreshIcon sx={{ fontSize: 20, color: '#5C6779' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Main Flow Canvas in Neumorphic Panel */}
      <Box
        style={{ width: '100%', height: '100%' }}
        sx={{
          flex: 1,
          width: '100%',
          height: '100%',
          minHeight: { xs: 520, sm: 580, md: 620 },
          borderRadius: '24px',
          overflow: 'hidden',
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          position: 'relative',
        }}
      >
        <ReactFlow
          style={{ width: '100%', height: '100%' }}
          nodes={styledNodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#CBD1DB" gap={20} size={1.2} />
          <Controls
            style={{
              backgroundColor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: '4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          />
          <MiniMap
            nodeColor={(node) =>
              node.data?.type === 'suspect' ? '#D94F55' : node.data?.type === 'crime' ? '#356AE6' : '#239B62'
            }
            style={{
              backgroundColor: 'var(--neu-surface, #E8ECF3)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF',
            }}
          />
        </ReactFlow>
      </Box>

      {/* Selected Node Dossier Drawer */}
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
            width: 340,
            p: 3,
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised-lg, 10px 10px 24px #C3C9D3, -10px -10px 24px #FFFFFF)',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={800} color="#202A3A">
            Entity Intelligence Dossier
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#5C6779' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2.5, borderColor: 'var(--neu-divider, #D7DDE7)' }} />

        {selectedNodeObject && (
          <Box>
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
                mb: 2.5,
              }}
            >
              <Chip
                label={selectedNodeObject.data.type?.toUpperCase()}
                size="small"
                sx={{ bgcolor: '#356AE6', color: '#fff', fontWeight: 800, fontSize: '0.65rem', mb: 1 }}
              />
              <Typography variant="h6" fontWeight={800} color="#202A3A">
                {selectedNodeObject.data.label}
              </Typography>
            </Box>

            <Typography variant="subtitle2" fontWeight={800} color="#202A3A" sx={{ mb: 1 }}>
              Direct Criminological Links ({directConnections.length})
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {directConnections.map((conn, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: 'var(--neu-surface, #E8ECF3)',
                    boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <Typography variant="body2" fontWeight={700} color="#202A3A">
                    {conn.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#356AE6', fontWeight: 700, textTransform: 'uppercase' }}>
                    Relation: {conn.relation}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Repeat Offender Profiler Drawer */}
      <Drawer
        anchor="right"
        open={repeatDrawerOpen}
        onClose={() => setRepeatDrawerOpen(false)}
        ModalProps={{
          disableAutoFocus: true,
          disableRestoreFocus: true,
        }}
        PaperProps={{
          sx: {
            width: 360,
            p: 3,
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised-lg, 10px 10px 24px #C3C9D3, -10px -10px 24px #FFFFFF)',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={800} color="#D94F55">
            Repeat Offender Watchlist
          </Typography>
          <IconButton onClick={() => setRepeatDrawerOpen(false)} sx={{ color: '#5C6779' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2.5, borderColor: 'var(--neu-divider, #D7DDE7)' }} />

        {repeatOffendersList.map((off, idx) => (
          <Box
            key={idx}
            sx={{
              p: 2,
              mb: 1.5,
              borderRadius: '16px',
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
              border: '1px solid rgba(217, 79, 85, 0.25)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" fontWeight={800} color="#202A3A">
                {off.name || off.alias || 'Offender'}
              </Typography>
              <Chip label={`${off.linkCount || 3} Cases`} size="small" sx={{ bgcolor: '#D94F55', color: '#fff', fontWeight: 800 }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#5C6779', display: 'block', mt: 0.5 }}>
              MO: {off.tactics || off.crimeType || 'Burglary'}
            </Typography>
          </Box>
        ))}
      </Drawer>
    </Box>
  )
}

export default Network