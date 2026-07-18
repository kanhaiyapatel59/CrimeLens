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

  // Fetch graph data
  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ['network-graph'],
    queryFn: () => networkAPI.getGraph({ limit: 100 }),
    retry: 2,
    staleTime: 60000,
  })

  // Transform data for React Flow
  useEffect(() => {
    if (data?.data) {
      const graphData = data.data
      
      // ✅ SAFE CHECK: Ensure nodes and edges exist
      const flowNodes = (graphData.nodes || []).map((node, index) => ({
        id: node.id || `node-${index}`,
        position: {
          x: Math.random() * 1000 + 100,
          y: Math.random() * 600 + 50,
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

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true)
    refetch()
  }

  // Handle add data
  const handleAddData = () => {
    navigate('/crimes')
  }

  // Show loading state
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

  // ✅ Show error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500, borderRadius: 3 }}>
          <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Unable to Load Network
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {error.message || 'There was an error loading the network data. Please try again.'}
          </Typography>
          <Button
            variant="contained"
            onClick={handleRefresh}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    )
  }

  // ✅ Show empty state with helpful message
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
            The network graph is empty because there are no connections to display.
            <br />
            <br />
            <strong>How to add data:</strong>
            <br />
            • Add crime records with victims and suspects
            <br />
            • Create relationships between entities
            <br />
            • Link suspects to multiple crimes
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
            Network connections are automatically created when you:
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Add victims and suspects to crimes</li>
              <li>Link multiple suspects to the same crime</li>
              <li>Track repeat offenders across cases</li>
            </ul>
          </Alert>
        </Paper>
      </Box>
    )
  }

  // ✅ Main network graph view
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

            {selectedNode.centrality && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Centrality Metrics
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Degree
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedNode.centrality.degree || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Weighted Degree
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedNode.centrality.weightedDegree || 0}
                    </Typography>
                  </Box>
                </Box>
              </>
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

// Import missing icon
import { NetworkCheck as NetworkCheckIcon } from '@mui/icons-material'

export default Network