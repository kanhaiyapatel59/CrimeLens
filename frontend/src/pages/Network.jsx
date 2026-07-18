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
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Close as CloseIcon,
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

const Network = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch graph data
  const { data, refetch, isLoading } = useQuery({
    queryKey: ['network-graph'],
    queryFn: () => networkAPI.getGraph({ limit: 50 }),
  })

  // Transform data for React Flow
  useEffect(() => {
    if (data?.data) {
      const graphData = data.data
      
      // ✅ SAFE CHECK: Ensure nodes and edges exist
      const flowNodes = (graphData.nodes || []).map((node, index) => ({
        id: node.id || `node-${index}`,
        position: {
          x: Math.random() * 1000,
          y: Math.random() * 600,
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

  if (loading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // ✅ SAFE CHECK: If no nodes, show message
  if (!nodes || nodes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            No Network Data Available
          </Typography>
          <Typography variant="body2" color="textSecondary">
            There are no connections to display in the network graph.
          </Typography>
          <Button
            variant="contained"
            onClick={() => refetch()}
            sx={{ mt: 2 }}
          >
            Refresh
          </Button>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Criminal Network Analysis
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Visualize connections between suspects, crimes, and locations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
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

      {/* Network Graph */}
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

      {/* Node Details Drawer */}
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

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
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
                sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
              >
                View Connections
              </Button>
            </Box>
          </motion.div>
        )}
      </Drawer>
    </Box>
  )
}

export default Network