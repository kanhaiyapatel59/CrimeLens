import React, { useEffect, useState } from 'react'
import {
  Grid, Paper, Typography, Box, CircularProgress, Chip,
} from '@mui/material'
import {
  TrendingUp, Warning, CheckCircle, AccessTime, Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IconButton } from '@mui/material'
import { dashboardAPI } from '../api/dashboard'
import { crimeAPI } from '../api/crimes'
import StatCard from '../components/common/StatCard'
import BarChart from '../components/charts/BarChart'
import LineChart from '../components/charts/LineChart'
import PieChart from '../components/charts/PieChart'
import CrimeMap from '../components/maps/CrimeMap'
import { motion } from 'framer-motion'

const Dashboard = () => {
  const queryClient = useQueryClient()
  const [filters] = useState({ days: 30 })
  const [refreshing, setRefreshing] = useState(false)

  const { data: kpis, isLoading: kpisLoading, refetch: refetchKpis } = useQuery({
    queryKey: ['dashboard-kpis', filters],
    queryFn: () => dashboardAPI.getKPIs(filters),
  })

  const { data: crimeTypeChart, refetch: refetchChart } = useQuery({
    queryKey: ['crime-type-chart', filters],
    queryFn: () => dashboardAPI.getCharts({ ...filters, groupBy: 'crimeType', limit: 8 }),
  })

  const { data: severityChart } = useQuery({
    queryKey: ['severity-chart', filters],
    queryFn: () => dashboardAPI.getCharts({ ...filters, groupBy: 'severity' }),
  })

  const { data: recentCrimes, refetch: refetchRecent } = useQuery({
    queryKey: ['recent-crimes'],
    queryFn: () => crimeAPI.getAll({ limit: 10 }),
  })

  const { data: overview } = useQuery({
    queryKey: ['overview', filters],
    queryFn: () => dashboardAPI.getOverview(filters),
  })

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries()
    }, 60000)
    return () => clearInterval(interval)
  }, [queryClient])

  const handleRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries()
    setRefreshing(false)
  }

  const kpiData = kpis?.data?.data
  const chartData = crimeTypeChart?.data?.data
  const severityData = severityChart?.data?.data
  const recentCrimesList = recentCrimes?.data?.data?.crimes || []
  const overviewData = overview?.data?.data

  if (kpisLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>Dashboard</Typography>
          <Typography variant="body2" color="textSecondary">Real-time crime intelligence overview</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip label={`Last updated: ${new Date().toLocaleTimeString()}`} size="small" variant="outlined" />
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Crimes" value={kpiData?.totalCrimes || 0}
            change={kpiData?.percentChange || 0} icon={<Warning />} color="#1a237e" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="High Risk Cases" value={kpiData?.highRiskCount || 0}
            icon={<TrendingUp />} color="#e91e63" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Resolved Cases"
            value={kpiData?.status?.resolved || 0}
            icon={<CheckCircle />} color="#4caf50" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Investigations"
            value={(kpiData?.status?.investigating || 0) + (kpiData?.status?.in_progress || 0)}
            icon={<AccessTime />} color="#ff9800" />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Crime Trends</Typography>
            <Box sx={{ height: 300 }}>
              <LineChart data={kpiData?.recentTrend || []} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Crime Severity</Typography>
            <Box sx={{ height: 250 }}>
              <PieChart
                data={severityData?.datasets?.[0]?.data || []}
                labels={severityData?.labels || ['Low', 'Medium', 'High', 'Critical']}
                colors={['#4caf50', '#ff9800', '#f44336', '#e91e63']}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Map & Crime Types */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Crime Heatmap</Typography>
            <Box sx={{ height: 330 }}>
              <CrimeMap />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Crime Type Distribution</Typography>
            <Box sx={{ height: 320 }}>
              <BarChart
                data={chartData?.datasets?.[0]?.data || []}
                labels={chartData?.labels || []}
                colors={chartData?.datasets?.[0]?.backgroundColor || ['#1a237e', '#3949ab', '#5c6bc0', '#7986cb']}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Crimes */}
      <Paper sx={{ mt: 4, p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>Recent Crime Incidents</Typography>
          <Chip label={`${recentCrimesList.length} records`} size="small" color="primary" variant="outlined" />
        </Box>
        {recentCrimesList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="textSecondary">
              No crime records found. Add or upload data to see recent crimes.
            </Typography>
          </Box>
        ) : (
          recentCrimesList.slice(0, 5).map((crime, index) => (
            <motion.div key={crime._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2,
                borderBottom: index < 4 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>{crime.firNumber || 'Unknown FIR'}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {crime.date ? new Date(crime.date).toLocaleDateString() : 'N/A'} • {crime.crimeType?.name || 'Unknown'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip label={crime.severity || 'unknown'} size="small"
                    color={crime.severity === 'critical' ? 'error' : crime.severity === 'high' ? 'warning' : crime.severity === 'medium' ? 'info' : 'success'} />
                  <Chip label={crime.status || 'reported'} size="small" variant="outlined" />
                </Box>
              </Box>
            </motion.div>
          ))
        )}
      </Paper>
    </Box>
  )
}

export default Dashboard
