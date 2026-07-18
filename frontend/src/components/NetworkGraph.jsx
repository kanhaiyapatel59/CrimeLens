import React, { useState, useEffect, useCallback } from 'react'
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
import { Box, Typography, CircularProgress } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { networkAPI } from '../api/network'

const NetworkGraph = ({ height = 400, suspectId = null, crimeId = null }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)

  const { data } = useQuery({
    queryKey: ['network-graph', suspectId, crimeId],
    queryFn: () => {
      if (suspectId) {
        return networkAPI.getSuspectNetwork(suspectId)
      } else if (crimeId) {
        return networkAPI.getCrimeNetwork(crimeId)
      }
      return networkAPI.getGraph({ limit: 30 })
    },
  })

  useEffect(() => {
    if (data?.data) {
      const graphData = data.data
      
      const flowNodes = graphData.nodes?.map((node, index) => ({
        id: node.id,
        position: {
          x: Math.random() * 600 + 100,
          y: Math.random() * 400 + 50,
        },
        data: {
          label: node.label || node.id,
          type: node.type,
        },
        style: {
          background: node.color || '#1a237e',
          color: '#fff',
          padding: 8,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          width: 100,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      })) || []

      const flowEdges = graphData.edges?.map((edge) => ({
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        label: edge.label || '',
        style: {
          stroke: edge.color || '#95A5A6',
          strokeWidth: Math.max(1, (edge.strength || 1) / 2),
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edge.color || '#95A5A6',
        },
      })) || []

      setNodes(flowNodes)
      setEdges(flowEdges)
      setLoading(false)
    }
  }, [data, setNodes, setEdges])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    )
  }

  if (nodes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography variant="body2" color="textSecondary">
          No network data available
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height, width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
    </Box>
  )
}

export default NetworkGraph