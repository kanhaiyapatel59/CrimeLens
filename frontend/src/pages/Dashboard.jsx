import React, { useEffect, useState } from 'react'
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  AccessTime,
  LocationOn,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { dashboardAPI } from '../api/dashboard'
import { crimeAPI } from '../api/crimes'
import StatCard from '../components/common/StatCard'
import BarChart from '../components/charts/BarChart'
import LineChart from '../components/charts/LineChart'
import PieChart from '../components/charts/PieChart'
import CrimeMap from '../components/maps/CrimeMap'
import { motion } from 'framer-motion'

const Dashboard = () => {
  const [filters, setFilters] = useState({ days: 30 })

  // Fetch KPIs
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis', filters],
    queryFn: () => dashboardAPI.getKPIs(filters),
  })

  // Fetch Charts
  const { data: crimeTypeChart } = useQuery({
    queryKey: ['crime-type-chart', filters],
    queryFn: () => dashboardAPI.getCharts({ ...filters, groupBy: 'crimeType', limit: 8 }),
  })

  const { data: severityChart } = useQuery({
    queryKey: ['severity-chart', filters],
    queryFn: () => dashboardAPI.getCharts({ ...filters, groupBy: 'severity' }),
  })

  // Fetch Recent Crimes
  const { data: recentCrimes } = useQuery({
    queryKey: ['recent-crimes'],
    queryFn: () => crimeAPI.getAll({ limit: 5 }),
  })

  // Fetch Overview
  const { data: overview } = useQuery({
    queryKey: ['overview', filters],
    queryFn: () => dashboardAPI.getOverview(filters),
  })

  const kpiData = kpis?.data
  const chartData = crimeTypeChart?.data
  const severityData = severityChart?.data

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Real-time crime intelligence overview
        </Typography>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Crimes"
            value={kpiData?.totalCrimes || 0}
            change={kpiData?.percentChange || 0}
            icon={<Warning />}
            color="#1a237e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="High Risk Cases"
            value={kpiData?.highRiskCount || 0}
            icon={<TrendingUp />}
            color="#e91e63"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Detection Rate"
            value="78%"
            icon={<CheckCircle />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Investigations"
            value="156"
            icon={<AccessTime />}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Crime Trends
            </Typography>
            <Box sx={{ height: 300 }}>
              <LineChart data={kpiData?.recentTrend || []} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Crime Severity
            </Typography>
            <Box sx={{ height: 250 }}>
              <PieChart
                data={severityData?.datasets?.[0]?.data || []}
                labels={severityData?.labels || []}
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
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Crime Heatmap
            </Typography>
            <Box sx={{ height: 330 }}>
              <CrimeMap />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Crime Type Distribution
            </Typography>
            <Box sx={{ height: 320 }}>
              <BarChart
                data={chartData?.datasets?.[0]?.data || []}
                labels={chartData?.labels || []}
                colors={chartData?.datasets?.[0]?.backgroundColor || []}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Crimes */}
      <Paper sx={{ mt: 4, p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Recent Crime Incidents
        </Typography>
        <Box>
          {recentCrimes?.data?.crimes?.slice(0, 5).map((crime, index) => (
            <motion.div
              key={crime._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 2,
                  borderBottom: index < 4 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {crime.firNumber}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(crime.date).toLocaleDateString()} • {crime.crimeType?.name || 'Unknown'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={crime.severity}
                    size="small"
                    color={
                      crime.severity === 'critical' ? 'error' :
                      crime.severity === 'high' ? 'warning' :
                      crime.severity === 'medium' ? 'info' : 'success'
                    }
                  />
                  <Chip
                    label={crime.status}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Paper>
    </Box>
  )
}

export default Dashboard