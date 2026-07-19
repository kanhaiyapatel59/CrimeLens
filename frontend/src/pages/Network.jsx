import React, { useState, useEffect, useCallback } from 'react'
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
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useQuery } from '@tanstack/react-query'
import { networkAPI } from '../api/network'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const Network = () => {
  const navigate = useNavigate()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ['network-graph'],
    queryFn: () => networkAPI.getGraph({ limit: 500, depth: 3 }),
    retry: 2,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  // Transform data for React Flow
  useEffect(() => {
    if (data?.data) {
      const graphData = data.data.data || data.data
      
      console.log('📊 Network Graph Data:', graphData)
      console.log('📊 Nodes:', graphData.nodes?.length || 0)
      console.log('📊 Edges:', graphData.edges?.length || 0)
      
      const flowNodes = (graphData.nodes || []).map((node, index) => ({
        id: node.id || `node-${index}`,
        position: {
          x: Math.random() * 1200 + 100,
          y: Math.random() * 700 + 50,
        },
        data: {
          label: node.label || 'Unknown',
          type: node.type || 'unknown',
          attributes: node.attributes || {},
        },
        style: {
          background: node.color || '#1a237e',
          color: '#fff',
          padding: 10,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 500,
          width: 120,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      }))

      const flowEdges = (graphData.edges || []).map((edge, index) => ({
        id: edge.id || `edge-${index}`,
        source: edge.source || '',
        target: edge.target || '',
        label: edge.label || '',
        style: {
          stroke: edge.color || '#95A5A6',
          strokeWidth: Math.max(1, (edge.strength || 1) / 2),
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edge.color || '#95A5A6',
        },
      }))

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
    refetch()
  }

  const handleAddData = () => {
    navigate('/crimes')
  }

  if (isLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Loading network data...
        </Typography>
      </Box>
    )
  }

  if (!nodes || nodes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500, borderRadius: 3 }}>
          <Box sx={{ mb: 3 }}>
            <NetworkCheckIcon sx={{ fontSize: 80, color: '#1a237e', opacity: 0.3 }} />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            No Network Data Available
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Add crime records with victims and suspects to build the network graph.
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
            <AlertTitle>💡 Tip</AlertTitle>
            Network connections are created when you add victims and suspects to crimes.
          </Alert>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Criminal Network Analysis
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Visualize connections between suspects, crimes, and locations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Chip
            label={`${nodes.length} nodes • ${edges.length} edges`}
            color="primary"
            variant="outlined"
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
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.style?.background) return n.style.background
              return '#1a237e'
            }}
            nodeColor={(n) => {
              if (n.style?.background) return n.style.background
              return '#1a237e'
            }}
          />
          <Controls />
          <Background color="#f5f7fa" gap={16} />
        </ReactFlow>
      </Paper>

      {/* Node Details Drawer - FIXED with View Connections working */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 400, p: 3 } }}
      >
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Node Details
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: selectedNode.style?.background || '#1a237e' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedNode.data?.label || 'Unknown'}
                </Typography>
                <Chip
                  label={selectedNode.data?.type || 'Unknown'}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Attributes
            </Typography>
            {selectedNode.data?.attributes && Object.keys(selectedNode.data.attributes).length > 0 ? (
              <Box sx={{ mt: 1 }}>
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
                    <Typography variant="body2" color="textSecondary">
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                No attributes available
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Connections
            </Typography>
            <Box sx={{ mt: 1, mb: 2 }}>
              {(() => {
                const connectedEdges = edges.filter(e => 
                  e.source === selectedNode.id || e.target === selectedNode.id
                )
                const connectedNodeIds = new Set()
                connectedEdges.forEach(e => {
                  if (e.source === selectedNode.id) connectedNodeIds.add(e.target)
                  if (e.target === selectedNode.id) connectedNodeIds.add(e.source)
                })
                const connectedNodes = nodes.filter(n => connectedNodeIds.has(n.id))
                
                return connectedNodes.length > 0 ? (
                  connectedNodes.slice(0, 10).map(n => (
                    <Box
                      key={n.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        py: 0.5,
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: n.style?.background || '#1a237e',
                        }}
                      />
                      <Typography variant="body2">
                        {n.data?.label || 'Unknown'}
                      </Typography>
                      <Chip
                        label={n.data?.type || 'unknown'}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 'auto', fontSize: '0.6rem' }}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No direct connections
                  </Typography>
                )
              })()}
              {(() => {
                const connectedEdges = edges.filter(e => 
                  e.source === selectedNode.id || e.target === selectedNode.id
                )
                const connectedNodeIds = new Set()
                connectedEdges.forEach(e => {
                  if (e.source === selectedNode.id) connectedNodeIds.add(e.target)
                  if (e.target === selectedNode.id) connectedNodeIds.add(e.source)
                })
                const connectedNodes = nodes.filter(n => connectedNodeIds.has(n.id))
                
                return connectedNodes.length > 10 && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    + {connectedNodes.length - 10} more connections
                  </Typography>
                )
              })()}
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
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
                  const connectedEdges = edges.filter(e => 
                    e.source === selectedNode.id || e.target === selectedNode.id
                  )
                  const connectedNodeIds = new Set()
                  connectedEdges.forEach(e => {
                    if (e.source === selectedNode.id) connectedNodeIds.add(e.target)
                    if (e.target === selectedNode.id) connectedNodeIds.add(e.source)
                  })
                  const connectedNodes = nodes.filter(n => connectedNodeIds.has(n.id))
                  
                  alert(`🔗 ${selectedNode.data?.label}\n\n📊 ${connectedNodes.length} connections\n\nConnected nodes:\n${connectedNodes.map(n => `• ${n.data?.label} (${n.data?.type})`).join('\n')}`)
                }}
                sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
              >
                View Connections ({edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length})
              </Button>
            </Box>
          </motion.div>
        )}
      </Drawer>
    </Box>
  )
}

import { NetworkCheck as NetworkCheckIcon } from '@mui/icons-material'

export default Network