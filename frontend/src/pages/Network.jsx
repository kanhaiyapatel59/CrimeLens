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
  Alert,
  AlertTitle,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Badge,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon,
  Gavel as CrimeIcon,
  People as PeopleIcon,
  RemoveRedEye as EyeIcon,
} from '@mui/icons-material'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useQuery } from '@tanstack/react-query'
import { networkAPI } from '../api/network'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Network = () => {
  const navigate = useNavigate()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [stats, setStats] = useState({
    totalNodes: 0,
    totalEdges: 0,
    suspects: 0,
    victims: 0,
    crimes: 0,
    locations: 0,
    repeatOffenders: 0,
  })

  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ['network-graph'],
    queryFn: () => networkAPI.getGraph({ limit: 500, depth: 3 }),
    retry: 2,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  })

  // ✅ Process and transform data for React Flow
  useEffect(() => {
    if (data?.data) {
      const graphData = data.data.data || data.data
      
      // ✅ Calculate stats
      const nodesList = graphData.nodes || []
      const edgesList = graphData.edges || []
      
      const suspectCount = nodesList.filter(n => n.type === 'suspect' || n.type === 'offender').length
      const victimCount = nodesList.filter(n => n.type === 'victim').length
      const crimeCount = nodesList.filter(n => n.type === 'crime').length
      const locationCount = nodesList.filter(n => n.type === 'location').length
      
      // ✅ Find repeat offenders (people connected to multiple crimes)
      const crimeConnections = {}
      edgesList.forEach(edge => {
        if (edge.relationship === 'committed' || edge.relationship === 'suspect_of') {
          crimeConnections[edge.source] = (crimeConnections[edge.source] || 0) + 1
        }
      })
      const repeatOffenders = Object.values(crimeConnections).filter(count => count > 1).length

      setStats({
        totalNodes: nodesList.length,
        totalEdges: edgesList.length,
        suspects: suspectCount,
        victims: victimCount,
        crimes: crimeCount,
        locations: locationCount,
        repeatOffenders: repeatOffenders,
      })

      // ✅ Create React Flow nodes with proper positioning
      const flowNodes = nodesList.map((node, index) => {
        // ✅ Different colors based on node type
        const nodeColors = {
          suspect: '#e91e63',
          offender: '#d32f2f',
          victim: '#4caf50',
          crime: '#1976d2',
          location: '#ff9800',
          vehicle: '#9c27b0',
          witness: '#00bcd4',
          default: '#1a237e',
        }

        const color = node.color || nodeColors[node.type] || nodeColors.default

        // ✅ Different sizes based on node type
        const sizes = {
          suspect: 120,
          offender: 140,
          victim: 100,
          crime: 130,
          location: 110,
          default: 110,
        }

        const width = sizes[node.type] || sizes.default

        return {
          id: node.id || `node-${index}`,
          position: {
            x: 100 + (index % 8) * 160 + Math.random() * 30,
            y: 80 + Math.floor(index / 8) * 120 + Math.random() * 30,
          },
          data: {
            label: node.label || 'Unknown',
            type: node.type || 'unknown',
            attributes: node.attributes || {},
            crimes: node.crimes || [],
            connections: node.connections || 0,
          },
          style: {
            background: color,
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            width: width,
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '2px solid rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          },
          type: 'default',
          draggable: true,
        }
      })

      // ✅ Create React Flow edges with relationship labels
      const flowEdges = edgesList.map((edge, index) => {
        // ✅ Relationship colors
        const relationshipColors = {
          'committed': '#e91e63',
          'co-conspirator': '#ff6b6b',
          'victim_of': '#4caf50',
          'witness_of': '#00bcd4',
          'location_of': '#ff9800',
          'family': '#9c27b0',
          'known_associate': '#ffa726',
          'drug_supplier': '#f44336',
          'business_partner': '#26c6da',
          'default': '#95A5A6',
        }

        const color = relationshipColors[edge.relationship] || relationshipColors.default

        return {
          id: edge.id || `edge-${index}`,
          source: edge.source || '',
          target: edge.target || '',
          label: edge.relationship?.replace(/_/g, ' ') || 'connected',
          style: {
            stroke: color,
            strokeWidth: Math.min(4, Math.max(1.5, (edge.strength || 2) / 2)),
          },
          labelStyle: {
            fill: '#1a237e',
            fontWeight: 600,
            fontSize: '9px',
            background: '#fff',
            padding: '2px 6px',
            borderRadius: '4px',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: color,
            width: 20,
            height: 20,
          },
          animated: (edge.strength || 0) > 5,
          type: 'default',
        }
      })

      setNodes(flowNodes)
      setEdges(flowEdges)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [data, setNodes, setEdges])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = (event, node) => {
    setSelectedNode(node)
    setDrawerOpen(true)
  }

  const handleRefresh = () => {
    setLoading(true)
    toast.loading('Refreshing network data...')
    refetch()
    setTimeout(() => toast.dismiss(), 1000)
  }

  const handleAddData = () => {
    navigate('/crimes')
  }

  const handleExport = () => {
    const exportData = {
      nodes: nodes.map(n => ({
        id: n.id,
        label: n.data.label,
        type: n.data.type,
        attributes: n.data.attributes,
      })),
      edges: edges.map(e => ({
        source: e.source,
        target: e.target,
        relationship: e.label,
      })),
      stats: stats,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `network_export_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.success('Network exported successfully!')
  }

  // ✅ Filter nodes based on search and type
  const filteredNodes = useMemo(() => {
    if (!searchTerm && filterType === 'all') return nodes
    
    return nodes.filter(node => {
      const matchesSearch = node.data.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           node.data.type.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || node.data.type === filterType
      return matchesSearch && matchesType
    })
  }, [nodes, searchTerm, filterType])

  // ✅ Get connected nodes for selected node
  const getConnectedNodes = (nodeId) => {
    const connectedEdgeIds = edges
      .filter(e => e.source === nodeId || e.target === nodeId)
      .map(e => e.source === nodeId ? e.target : e.source)
    return nodes.filter(n => connectedEdgeIds.includes(n.id))
  }

  // ✅ Get node type icon
  const getNodeIcon = (type) => {
    const icons = {
      suspect: <PersonIcon sx={{ fontSize: 16 }} />,
      offender: <WarningIcon sx={{ fontSize: 16 }} />,
      victim: <PeopleIcon sx={{ fontSize: 16 }} />,
      crime: <CrimeIcon sx={{ fontSize: 16 }} />,
      location: <LocationIcon sx={{ fontSize: 16 }} />,
      witness: <EyeIcon sx={{ fontSize: 16 }} />,
      default: <PersonIcon sx={{ fontSize: 16 }} />,
    }
    return icons[type] || icons.default
  }

  if (isLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
        <CircularProgress size={60} sx={{ color: '#1a237e' }} />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Building network graph...
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Connecting {stats.totalNodes} nodes and {stats.totalEdges} edges
        </Typography>
      </Box>
    )
  }

  if (!nodes || nodes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500, borderRadius: 3 }}>
          <Box sx={{ mb: 3 }}>
            <PeopleIcon sx={{ fontSize: 80, color: '#1a237e', opacity: 0.3 }} />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            No Network Data Available
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Add crime records with victims and suspects to build the criminal network.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddData}
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
            >
              Add Crime Records
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Box>
          <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
            <AlertTitle>💡 How it works</AlertTitle>
            Network connections are automatically created when you add victims and suspects to crimes.
            Each connection represents a relationship between people, crimes, and locations.
          </Alert>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon sx={{ fontSize: 32, color: '#1a237e' }} />
            Criminal Network Analysis
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Visualize connections between suspects, crimes, victims, and locations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: '#888' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="suspect">Suspects</MenuItem>
              <MenuItem value="offender">Offenders</MenuItem>
              <MenuItem value="victim">Victims</MenuItem>
              <MenuItem value="crime">Crimes</MenuItem>
              <MenuItem value="location">Locations</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} sx={{ bgcolor: '#f5f7fa' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export">
            <IconButton onClick={handleExport} sx={{ bgcolor: '#f5f7fa' }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Chip
            label={`${nodes.length} nodes • ${edges.length} connections`}
            color="primary"
            sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 500 }}
          />
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: '#1a237e', color: '#fff' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={700}>{stats.totalNodes}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Total Nodes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: '#e91e63', color: '#fff' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={700}>{stats.suspects}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Suspects</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: '#4caf50', color: '#fff' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={700}>{stats.victims}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Victims</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: '#1976d2', color: '#fff' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={700}>{stats.crimes}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Crimes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: '#ff9800', color: '#fff' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={700}>{stats.repeatOffenders}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Repeat Offenders</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Network Graph */}
      <Paper
        elevation={0}
        sx={{
          height: 'calc(100% - 180px)',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid #e8ecf1',
        }}
      >
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.5}
          maxZoom={2}
        >
          <MiniMap
            nodeStrokeColor={(n) => n.style?.background || '#1a237e'}
            nodeColor={(n) => n.style?.background || '#1a237e'}
            style={{ background: '#f5f7fa' }}
          />
          <Controls />
          <Background color="#f5f7fa" gap={16} />
        </ReactFlow>

        {/* Legend */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            bgcolor: 'rgba(255,255,255,0.95)',
            p: 1.5,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            border: '1px solid #e8ecf1',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#e91e63' }} />
            <Typography variant="caption">Suspect</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50' }} />
            <Typography variant="caption">Victim</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#1976d2' }} />
            <Typography variant="caption">Crime</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800' }} />
            <Typography variant="caption">Location</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#d32f2f' }} />
            <Typography variant="caption">Offender</Typography>
          </Box>
        </Box>

        {/* Instructions */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            bgcolor: 'rgba(255,255,255,0.95)',
            p: 1.5,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e8ecf1',
            maxWidth: 200,
          }}
        >
          <Typography variant="caption" color="textSecondary" display="block">
            🖱️ Click node for details
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            🔍 Scroll to zoom
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            ✋ Drag to explore
          </Typography>
        </Box>
      </Paper>

      {/* ✅ Node Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 3 } }}
      >
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>
                Node Details
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Node Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: selectedNode.style?.background || '#1a237e',
                  width: 56,
                  height: 56,
                }}
              >
                {getNodeIcon(selectedNode.data?.type)}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {selectedNode.data?.label || 'Unknown'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip
                    label={selectedNode.data?.type || 'Unknown'}
                    size="small"
                    sx={{
                      bgcolor: selectedNode.style?.background || '#1a237e',
                      color: '#fff',
                    }}
                  />
                  <Chip
                    label={`${getConnectedNodes(selectedNode.id).length} connections`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Attributes */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Attributes
            </Typography>
            {selectedNode.data?.attributes && Object.keys(selectedNode.data.attributes).length > 0 ? (
              <Box sx={{ mt: 1, mb: 2 }}>
                {Object.entries(selectedNode.data.attributes).map(([key, value]) => (
                  <Box
                    key={key}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
                No attributes available
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            {/* ✅ Connected Nodes - THIS IS THE IMPORTANT PART */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Connected Nodes ({getConnectedNodes(selectedNode.id).length})
            </Typography>
            <Box sx={{ mt: 1, mb: 2, maxHeight: 300, overflowY: 'auto' }}>
              {getConnectedNodes(selectedNode.id).length > 0 ? (
                getConnectedNodes(selectedNode.id).map((node) => {
                  // ✅ Find the relationship between selected node and this node
                  const relationship = edges.find(e =>
                    (e.source === selectedNode.id && e.target === node.id) ||
                    (e.source === node.id && e.target === selectedNode.id)
                  )
                  
                  return (
                    <Box
                      key={node.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 1,
                        px: 1.5,
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                        '&:hover': {
                          bgcolor: 'rgba(26, 35, 126, 0.04)',
                          borderRadius: 1,
                        },
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setSelectedNode(node)
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: node.style?.background || '#1a237e',
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
                        {node.data?.label || 'Unknown'}
                      </Typography>
                      <Chip
                        label={node.data?.type || 'unknown'}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 20 }}
                      />
                      {relationship && (
                        <Chip
                          label={relationship.label?.replace(/_/g, ' ') || 'connected'}
                          size="small"
                          sx={{
                            fontSize: '0.6rem',
                            height: 20,
                            bgcolor: relationship.style?.stroke || '#888',
                            color: '#fff',
                          }}
                        />
                      )}
                    </Box>
                  )
                })
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No direct connections found
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setDrawerOpen(false)}
              >
                Close
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  const connected = getConnectedNodes(selectedNode.id)
                  const message = `🔗 ${selectedNode.data?.label}\n\n` +
                    `📊 ${connected.length} connections\n\n` +
                    `Connected nodes:\n${connected.map(n => `• ${n.data?.label} (${n.data?.type})`).join('\n')}`
                  alert(message)
                }}
                sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
              >
                View All Connections ({getConnectedNodes(selectedNode.id).length})
              </Button>
            </Box>
          </motion.div>
        )}
      </Drawer>
    </Box>
  )
}

export default Network