import React, { useEffect, useState } from 'react'
import {
  Grid, Paper, Typography, Box, CircularProgress, Chip, Avatar, useTheme, alpha, Alert,
} from '@mui/material'
import {
  TrendingUp, Warning, CheckCircle, AccessTime, Refresh as RefreshIcon,
  TrendingDown, ArrowUpward, ArrowDownward,
} from '@mui/icons-material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IconButton } from '@mui/material'
import { dashboardAPI } from '../api/dashboard'
import { crimeAPI } from '../api/crimes'
import { correlationAPI } from '../api/correlation'
import StatCard from '../components/common/StatCard'
import BarChart from '../components/charts/BarChart'
import LineChart from '../components/charts/LineChart'
import PieChart from '../components/charts/PieChart'
import CrimeMap from '../components/maps/CrimeMap'
import CorrelationChart from '../components/charts/CorrelationChart'
import { motion } from 'framer-motion'

const Dashboard = () => {
  const theme = useTheme()
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

  // Fetch correlation data
  const { data: correlationData, isLoading: correlationLoading } = useQuery({
    queryKey: ['correlation-matrix'],
    queryFn: () => correlationAPI.getMatrix(),
    refetchOnWindowFocus: false,
  })

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

  const kpiData = kpis?.data?.data || kpis?.data || {}
  const chartData = crimeTypeChart?.data?.data || crimeTypeChart?.data || {}
  const severityData = severityChart?.data?.data || severityChart?.data || {}
  const recentCrimesList = recentCrimes?.data?.data?.crimes || recentCrimes?.data?.crimes || []

  // Get correlation data for the first district (or aggregate)
  const correlationInsights = correlationData?.data?.data?.[0]?.insights || []
  const correlationFactors = correlationData?.data?.data?.[0]?.correlations || []

  // Convert correlation object to array for chart
  const correlationChartData = Object.entries(correlationFactors).map(([key, value]) => ({
    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    value: value || 0,
  }))

  const stats = [
    { title: 'Total Crimes', value: kpiData?.totalCrimes || 0, icon: Warning, color: '#1a237e', change: '+12%' },
    { title: 'High Risk Cases', value: kpiData?.highRiskCount || 0, icon: TrendingUp, color: '#e91e63', change: '+5%' },
    { title: 'Resolved Cases', value: kpiData?.status?.resolved || 0, icon: CheckCircle, color: '#4caf50', change: '+8%' },
    { title: 'Active Investigations', value: (kpiData?.status?.investigating || 0) + (kpiData?.status?.in_progress || 0), icon: AccessTime, color: '#ff9800', change: '-3%' },
  ]

  if (kpisLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', pb: 4 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4, 
        flexWrap: 'wrap', 
        gap: 2,
        background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
        p: 4,
        borderRadius: 3,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Real-time crime intelligence overview
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Chip 
            label={`Last updated: ${new Date().toLocaleTimeString()}`} 
            size="small" 
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
          />
          <IconButton 
            onClick={handleRefresh} 
            disabled={refreshing}
            sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
        {/* Decorative */}
        <Box sx={{ position: 'absolute', right: -30, top: -30, opacity: 0.1 }}>
          <TrendingUp sx={{ fontSize: 200 }} />
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Paper sx={{ p: 3, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" fontWeight={500}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Chip 
                      label={stat.change} 
                      size="small" 
                      color={stat.change.startsWith('+') ? 'success' : 'error'}
                      sx={{ mt: 0.5, height: 20, fontSize: '0.6rem' }}
                    />
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(stat.color, 0.1), color: stat.color, width: 48, height: 48 }}>
                    <stat.icon />
                  </Avatar>
                </Box>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    right: -20, 
                    bottom: -20, 
                    opacity: 0.05,
                    fontSize: 80,
                  }}
                >
                  {stat.change.startsWith('+') ? <ArrowUpward /> : <ArrowDownward />}
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Crime Trends</Typography>
            <Box sx={{ height: 300 }}>
              <LineChart data={kpiData?.recentTrend || []} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
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
          <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Crime Heatmap</Typography>
            <Box sx={{ height: 320 }}>
              <CrimeMap />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
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

      {/* ✅ Socio-Economic Correlation Analysis */}
      <Paper sx={{ mt: 4, p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Socio-Economic Correlation Analysis
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
          Relationship between crime rates and socio-economic factors
        </Typography>

        {correlationLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : correlationChartData.length > 0 ? (
          <Grid container spacing={3}>
            {/* Chart */}
            <Grid item xs={12} md={8}>
              <Box sx={{ height: 280 }}>
                <CorrelationChart 
                  data={correlationChartData}
                  title="Correlation with Crime Rate"
                  height={280}
                />
              </Box>
            </Grid>

            {/* Insights */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Key Insights
              </Typography>
              {correlationInsights.length > 0 ? (
                correlationInsights.slice(0, 3).map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Paper
                      sx={{
                        p: 1.5,
                        mb: 1.5,
                        borderRadius: 2,
                        bgcolor: insight.severity === 'high' ? 'rgba(244,67,54,0.05)' :
                                insight.severity === 'medium' ? 'rgba(255,152,0,0.05)' :
                                'rgba(76,175,80,0.05)',
                        border: `1px solid ${
                          insight.severity === 'high' ? 'rgba(244,67,54,0.15)' :
                          insight.severity === 'medium' ? 'rgba(255,152,0,0.15)' :
                          'rgba(76,175,80,0.15)'
                        }`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={insight.severity?.toUpperCase() || 'INFO'}
                          size="small"
                          color={
                            insight.severity === 'high' ? 'error' :
                            insight.severity === 'medium' ? 'warning' : 'success'
                          }
                          sx={{ height: 20, fontSize: '0.6rem' }}
                        />
                        <Typography variant="caption" fontWeight={500}>
                          {insight.title}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                        {insight.description}
                      </Typography>
                    </Paper>
                  </motion.div>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No insights available. Add economic data for districts.
                </Typography>
              )}
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No correlation data available. Please seed economic data for districts.
          </Alert>
        )}
      </Paper>

      {/* Recent Crimes */}
      <Paper sx={{ mt: 4, p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>Recent Crime Incidents</Typography>
          <Chip label={`${recentCrimesList.length} records`} size="small" color="primary" variant="outlined" />
        </Box>
        {recentCrimesList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="textSecondary">No crime records found.</Typography>
          </Box>
        ) : (
          recentCrimesList.slice(0, 5).map((crime, index) => (
            <motion.div key={crime._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: index < 4 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>{crime.firNumber || 'Unknown FIR'}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {crime.date ? new Date(crime.date).toLocaleDateString() : 'N/A'} • {crime.crimeType?.name || 'Unknown'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={crime.severity || 'unknown'} size="small" color={crime.severity === 'critical' ? 'error' : crime.severity === 'high' ? 'warning' : crime.severity === 'medium' ? 'info' : 'success'} />
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