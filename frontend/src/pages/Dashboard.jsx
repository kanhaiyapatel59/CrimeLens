import React, { useEffect, useState } from 'react'
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Divider,
} from '@mui/material'
import {
  TrendingUp,
  Warning,
  CheckCircle,
  AccessTime,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  CalendarToday as CalendarIcon,
  Visibility as ViewIcon,
  ArrowForward as ArrowForwardIcon,
  Tune as FilterIcon,
  MoreHoriz as MoreIcon,
  Schedule as ClockIcon,
  People as SuspectsIcon,
  Leaderboard as LeaderboardIcon,
  AutoAwesome as SparklesIcon,
  Send as SendIcon,
  Map as MapActionIcon,
  Gavel as CrimeActionIcon,
  Hub as NetworkActionIcon,
  Description as ReportActionIcon,
} from '@mui/icons-material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { dashboardAPI } from '../api/dashboard'
import { crimeAPI } from '../api/crimes'
import StatCard from '../components/common/StatCard'
import BarChart from '../components/charts/BarChart'
import LineChart from '../components/charts/LineChart'
import PieChart from '../components/charts/PieChart'
import CrimeMap from '../components/maps/CrimeMap'
import ScrbReportDialog from '../components/common/ScrbReportDialog'
import { motion } from 'framer-motion'

const Dashboard = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [filters] = useState({ days: 30 })
  const [refreshing, setRefreshing] = useState(false)
  const [openScrbReport, setOpenScrbReport] = useState(false)

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis', filters],
    queryFn: () => dashboardAPI.getKPIs(filters),
  })

  const { data: crimeTypeChart } = useQuery({
    queryKey: ['crime-type-chart', filters],
    queryFn: () => dashboardAPI.getCharts({ ...filters, groupBy: 'crimeType', limit: 8 }),
  })

  const { data: severityChart } = useQuery({
    queryKey: ['severity-chart', filters],
    queryFn: () => dashboardAPI.getCharts({ ...filters, groupBy: 'severity' }),
  })

  const { data: recentCrimes } = useQuery({
    queryKey: ['recent-crimes'],
    queryFn: () => crimeAPI.getAll({ limit: 10 }),
  })

  const { data: anomaliesData } = useQuery({
    queryKey: ['anomalies-list'],
    queryFn: () => dashboardAPI.getAnomalies(),
  })

  const { data: tacticalRes } = useQuery({
    queryKey: ['dashboard-tactical'],
    queryFn: () => dashboardAPI.getTactical(),
  })

  const anomaliesList = anomaliesData?.data?.data || anomaliesData?.data || []

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

  const extractData = (res) => {
    if (!res) return {}
    if (res.data?.data) return res.data.data
    if (res.data) return res.data
    return res
  }

  const kpiData = extractData(kpis)
  const chartData = extractData(crimeTypeChart)
  const severityData = extractData(severityChart)
  const recentCrimesList = recentCrimes?.data?.data?.crimes || recentCrimes?.data?.crimes || []

  const tacticalData = extractData(tacticalRes)
  const diurnal = tacticalData?.diurnal || { hourly: Array(24).fill(0), morningShift: { count: 0, percent: 0 }, eveningShift: { count: 0, percent: 0 }, nightPatrol: { count: 0, percent: 0 }, peakHour: { hour: 0, count: 0, label: '00:00' } }
  const districtLeaderboard = tacticalData?.districtLeaderboard || []
  const repeatSuspects = tacticalData?.repeatSuspects || []
  const liveBulletins = tacticalData?.liveBulletins || []
  const aiAdvisory = tacticalData?.aiAdvisory || {}

  const stats = [
    {
      title: 'Total Crime FIRs',
      value: (kpiData?.totalCrimes || 0).toLocaleString(),
      icon: Warning,
      color: '#356AE6',
      change: '+10.74%',
    },
    {
      title: 'Active Investigations',
      value: ((kpiData?.status?.investigating || 0) + (kpiData?.status?.in_progress || 0)).toLocaleString(),
      icon: AccessTime,
      color: '#D99118',
      change: '+12.4%',
    },
    {
      title: 'Cases Resolved',
      value: (kpiData?.status?.resolved || 0).toLocaleString(),
      icon: CheckCircle,
      color: '#239B62',
      change: '+14.65%',
    },
    {
      title: 'High-Risk Alerts',
      value: (kpiData?.highRiskCount || 0).toLocaleString(),
      icon: TrendingUp,
      color: '#D94F55',
      change: '-5.2%',
    },
  ]

  if (kpisLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#356AE6' }} />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', pb: 4 }}>
      {/* Top Operational Bar: Title, Date Pill, Action Pills */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: 'var(--neu-text-primary, #202A3A)',
              fontSize: { xs: '1.4rem', sm: '1.75rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Crime Intelligence
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--neu-text-secondary, #5C6779)', fontWeight: 500 }}>
            Unified SCRB Analytics, Geospatial Hotspots & Predictive Threat Matrix
          </Typography>
        </Box>

        {/* Action Controls matching reference style */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Date Selector Pill */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 1,
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              borderRadius: '12px',
              px: 1.8,
              py: 0.8,
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            <CalendarIcon sx={{ fontSize: 16, color: '#356AE6' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#202A3A' }}>
              Past 30 Days
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<SecurityIcon />}
            onClick={() => setOpenScrbReport(true)}
            sx={{
              bgcolor: '#356AE6',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.82rem',
              px: 2,
              py: 0.8,
              boxShadow: 'var(--neu-shadow-primary-btn, 5px 5px 14px rgba(53, 106, 230, 0.35))',
              '&:hover': { bgcolor: '#2955C4' },
            }}
          >
            SCRB Executive Briefing
          </Button>

          <IconButton
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
              borderRadius: '12px',
              width: 40,
              height: 40,
              color: '#5C6779',
              '&:hover': { color: '#356AE6' },
            }}
          >
            <RefreshIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* 1. Live Tactical Alert Bulletin Strip */}
      <Box
        sx={{
          mb: 3,
          p: 1.2,
          px: 2,
          borderRadius: '16px',
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          overflowX: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: '#D94F55',
              boxShadow: '0 0 0 3px rgba(217, 79, 85, 0.25)',
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#D94F55', letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
            Live Bulletins
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ borderColor: 'var(--neu-divider, #D7DDE7)', height: 18, my: 'auto' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, overflowX: 'auto', py: 0.2 }}>
          {liveBulletins.length === 0 ? (
            <Typography variant="caption" sx={{ color: '#5C6779' }}>No critical alerts in active queue.</Typography>
          ) : (
            liveBulletins.slice(0, 5).map((bulletin, idx) => (
              <Box
                key={idx}
                onClick={() => navigate('/crimes')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'var(--neu-surface, #E8ECF3)',
                  boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 6px #C7CDD7, -3px -3px 6px #FFFFFF)',
                  borderRadius: '10px',
                  px: 1.4,
                  py: 0.5,
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)', color: '#356AE6' },
                }}
              >
                <Chip
                  label={bulletin.firNumber}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    bgcolor: bulletin.severity === 'critical' ? 'rgba(217, 79, 85, 0.12)' : 'rgba(217, 145, 24, 0.12)',
                    color: bulletin.severity === 'critical' ? '#D94F55' : '#D99118',
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#202A3A', fontSize: '0.75rem' }}>
                  {bulletin.city}:
                </Typography>
                <Typography variant="caption" noWrap sx={{ color: '#5C6779', fontSize: '0.72rem', maxWidth: 220 }}>
                  {bulletin.description}
                </Typography>
              </Box>
            ))
          )}
        </Box>

        <Button
          size="small"
          onClick={() => navigate('/forensics?tab=bolo')}
          sx={{
            flexShrink: 0,
            bgcolor: 'rgba(217, 79, 85, 0.12)',
            color: '#D94F55',
            fontWeight: 800,
            fontSize: '0.68rem',
            borderRadius: '8px',
            py: 0.4,
            px: 1.2,
            textTransform: 'none',
            '&:hover': { bgcolor: 'rgba(217, 79, 85, 0.22)' },
          }}
        >
          🚨 Active BOLO Desk →
        </Button>
      </Box>

      {/* 2. Fast-Action Tactical Command Hub */}
      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        {[
          { label: 'Register Crime FIR', desc: 'File incident record', icon: CrimeActionIcon, color: '#356AE6', action: () => navigate('/crimes') },
          { label: 'Tactical Forensics', desc: 'M.O., Biometrics & BOLO', icon: SecurityIcon, color: '#D94F55', action: () => navigate('/forensics') },
          { label: 'Syndicate Network', desc: 'Cross-jurisdiction links', icon: NetworkActionIcon, color: '#6A45E5', action: () => navigate('/network') },
          { label: 'Geospatial Hotspots', desc: 'Live spatial threat density', icon: MapActionIcon, color: '#D99118', action: () => navigate('/map') },
          { label: 'SCRB Briefing PDF', desc: 'State archival briefing', icon: ReportActionIcon, color: '#239B62', action: () => setOpenScrbReport(true) },
        ].map((act, i) => (
          <Grid item xs={12} sm={6} md={2.4} key={i}>
            <Paper
              elevation={0}
              onClick={act.action}
              sx={{
                p: 2,
                borderRadius: '18px',
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-raised-sm, 4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  bgcolor: 'var(--neu-surface, #E8ECF3)',
                  boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 7px #C7CDD7, -3px -3px 7px #FFFFFF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: act.color,
                  flexShrink: 0,
                }}
              >
                <act.icon sx={{ fontSize: 20 }} />
              </Box>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '0.85rem', lineHeight: 1.2 }}>
                  {act.label}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5C6779', fontSize: '0.7rem' }}>
                  {act.desc}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Row 1: 4 Neumorphic Floating Metric Cards (inspired by Spending/Revenue in reference image) */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              change={stat.change}
            />
          </Grid>
        ))}
      </Grid>

      {/* 3. AI 7-Day Predictive Threat Advisory & District Threat/Clearance Leaderboard */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Left: AI 7-Day Predictive Advisory */}
        <Grid item xs={12} lg={7}>
          <Box
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
              borderRadius: '22px',
              p: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '10px',
                      bgcolor: '#356AE6',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '3px 3px 8px rgba(53, 106, 230, 0.4)',
                    }}
                  >
                    <SparklesIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '0.98rem' }}>
                      AI 7-Day Predictive Threat Advisory
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5C6779', fontSize: '0.68rem', fontWeight: 600 }}>
                      CrimeLens Llama 3.3 70B • Predictive Intelligence Engine
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`Confidence: ${aiAdvisory?.forecastConfidence || 94}%`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(35, 155, 98, 0.1)',
                      color: '#239B62',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      height: 22,
                    }}
                  />
                  <Chip
                    label={aiAdvisory?.threatLevel || 'Elevated'}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(217, 79, 85, 0.1)',
                      color: '#D94F55',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      height: 22,
                    }}
                  />
                </Box>
              </Box>

              {/* Metric Callouts Grid */}
              <Grid container spacing={1.5} sx={{ my: 1 }}>
                <Grid item xs={6} sm={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      bgcolor: 'var(--neu-surface, #E8ECF3)',
                      boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#8893A4', fontSize: '0.68rem', fontWeight: 600 }}>Primary Focus District</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#356AE6', mt: 0.2 }}>{aiAdvisory?.topRiskDistrict || 'Bengaluru Urban'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      bgcolor: 'var(--neu-surface, #E8ECF3)',
                      boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#8893A4', fontSize: '0.68rem', fontWeight: 600 }}>Forecast Delta</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#D94F55', mt: 0.2 }}>{aiAdvisory?.predictedShift || '+14% Spike'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      bgcolor: 'var(--neu-surface, #E8ECF3)',
                      boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#8893A4', fontSize: '0.68rem', fontWeight: 600 }}>Model Status</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#239B62', mt: 0.2 }}>Active Synced</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Directive Advice Text Box */}
              <Box
                sx={{
                  p: 1.8,
                  mt: 1.5,
                  borderRadius: '14px',
                  bgcolor: 'rgba(53, 106, 230, 0.04)',
                  border: '1px solid rgba(53, 106, 230, 0.15)',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#356AE6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Operational Directive for Field Commanders:
                </Typography>
                <Typography variant="body2" sx={{ color: '#202A3A', mt: 0.5, lineHeight: 1.5, fontSize: '0.84rem' }}>
                  {aiAdvisory?.directiveText || 'Surge mobile patrols at key transit hubs and interstate tollways between 22:00 and 04:00 hours. Deploy undercover units in commercial jewelry and financial clusters.'}
                </Typography>
              </Box>
            </Box>

            {/* Bottom Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/ai-chat')}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  borderColor: 'var(--neu-divider, #D7DDE7)',
                  color: '#5C6779',
                }}
              >
                Consult AI Copilot
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<SendIcon sx={{ fontSize: 14 }} />}
                onClick={() => toast.success('Tactical advisory dispatched to district control rooms!')}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  bgcolor: '#356AE6',
                  boxShadow: 'var(--neu-shadow-primary-btn, 3px 3px 10px rgba(53, 106, 230, 0.35))',
                  '&:hover': { bgcolor: '#2955C4' },
                }}
              >
                Broadcast Patrol Directive
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Right: District Threat & Clearance Leaderboard */}
        <Grid item xs={12} lg={5}>
          <Box
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
              borderRadius: '22px',
              p: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LeaderboardIcon sx={{ fontSize: 20, color: '#356AE6' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '0.98rem' }}>
                  District Threat & Clearance Index
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#8893A4', fontWeight: 700 }}>
                Solve Rate
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, justifyContent: 'space-around' }}>
              {districtLeaderboard.slice(0, 5).map((dist, idx) => (
                <Box key={dist.id || idx}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#8893A4', minWidth: 16 }}>
                        #{idx + 1}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#202A3A', fontSize: '0.84rem' }}>
                        {dist.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: '#5C6779', fontSize: '0.72rem' }}>
                        {dist.total} FIRs ({dist.resolved} Solved)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: dist.solveRate >= 35 ? '#239B62' : '#D99118', minWidth: 32, textAlign: 'right' }}>
                        {dist.solveRate}%
                      </Typography>
                    </Box>
                  </Box>

                  {/* Neumorphic Inset Progress Bar */}
                  <Box
                    sx={{
                      height: 7,
                      borderRadius: 4,
                      bgcolor: 'var(--neu-surface, #E8ECF3)',
                      boxShadow: 'var(--neu-shadow-inset-sm, inset 1px 1px 3px #CBD1DB, inset -1px -1px 3px #FFFFFF)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${Math.min(dist.solveRate, 100)}%`,
                        borderRadius: 4,
                        bgcolor: dist.solveRate >= 35 ? '#239B62' : '#356AE6',
                        transition: 'width 0.8s ease',
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Row 2: Projects / Crime Trends Line Chart & Calender/Events (Matching reference image layout) */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Main Chart Panel (like 'Projects' in reference) */}
        <Grid item xs={12} lg={8}>
          <Box
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
              borderRadius: '22px',
              p: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header with Grip Dots, Title, Date Pill & Filter */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 3px)',
                    gap: '3px',
                    color: '#8893A4',
                  }}
                >
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1rem' }}>
                  Crime Trajectory & Diurnal Trend Analysis
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    bgcolor: 'var(--neu-surface, #E8ECF3)',
                    boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
                    borderRadius: '10px',
                    px: 1.2,
                    py: 0.4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#5C6779',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  State Trend Model
                </Box>
                <IconButton
                  size="small"
                  onClick={() => navigate('/reports')}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: 'var(--neu-surface, #E8ECF3)',
                    boxShadow: '2px 2px 5px #C7CDD7, -2px -2px 5px #FFFFFF',
                    color: '#5C6779',
                  }}
                >
                  <MoreIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Line Chart */}
            <Box sx={{ height: 280, flex: 1, width: '100%', minWidth: 0, minHeight: 280, position: 'relative' }}>
              <LineChart data={kpiData?.recentTrend || []} />
            </Box>

            {/* Bottom Legends Pill matching reference */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1.5, pt: 1, borderTop: '1px solid var(--neu-divider, #D7DDE7)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, fontSize: '0.75rem', fontWeight: 600, color: '#5C6779' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#356AE6' }} />
                <span>Actual Incidents</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, fontSize: '0.75rem', fontWeight: 600, color: '#5C6779' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#239B62' }} />
                <span>Predictive Baseline</span>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right Side: Severity Distribution / Calendar & Priority Events (Matching reference 'Calender and Events') */}
        <Grid item xs={12} lg={4}>
          <Box
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
              borderRadius: '22px',
              p: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 3px)',
                    gap: '3px',
                    color: '#8893A4',
                  }}
                >
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1rem' }}>
                  Incident Severity Matrix
                </Typography>
              </Box>
              <Chip
                label="Active Priority"
                size="small"
                sx={{
                  bgcolor: 'rgba(53, 106, 230, 0.1)',
                  color: '#356AE6',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  height: 22,
                }}
              />
            </Box>

            {/* Pie / Donut Chart */}
            <Box sx={{ height: 260, width: '100%', minWidth: 0, minHeight: 260, my: 'auto', position: 'relative' }}>
              <PieChart
                data={severityData?.datasets?.[0]?.data || []}
                labels={severityData?.labels || ['Low', 'Medium', 'High', 'Critical']}
                colors={['#239B62', '#D99118', '#D94F55', '#E91E63']}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Row 2.5: 24-Hour Diurnal Shift Patrol Heatstrip & High-Risk POI Watchlist */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Left: 24-Hour Diurnal Shift Patrol Heatstrip (7 Cols) */}
        <Grid item xs={12} lg={7}>
          <Box
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
              borderRadius: '22px',
              p: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 3px)',
                    gap: '3px',
                    color: '#8893A4',
                  }}
                >
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                </Box>
                <ClockIcon sx={{ fontSize: 18, color: '#356AE6' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1rem' }}>
                  24-Hour Diurnal Crime Clock & Shift Patrol Density
                </Typography>
              </Box>

              <Chip
                label={`Peak: ${tacticalData?.diurnal?.peakHour?.label || '07:00 AM'} (${tacticalData?.diurnal?.peakHour?.count || 27} FIRs)`}
                size="small"
                sx={{
                  bgcolor: 'rgba(217, 79, 85, 0.12)',
                  color: '#D94F55',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  height: 22,
                }}
              />
            </Box>

            {/* 3 Shift Density Metric Pills */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {/* Morning Shift */}
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    bgcolor: 'var(--neu-surface, #E8ECF3)',
                    boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
                    borderRadius: '14px',
                    p: 1.5,
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#356AE6' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#5C6779', fontSize: '0.72rem' }}>
                        Morning (06-14h)
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#356AE6' }}>
                      {tacticalData?.diurnal?.morningShift?.percent ?? 37}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '0.95rem' }}>
                    {tacticalData?.diurnal?.morningShift?.count ?? 168} <span style={{ fontSize: '0.72rem', color: '#7E8B9F', fontWeight: 500 }}>Incidents</span>
                  </Typography>
                </Box>
              </Grid>

              {/* Evening Shift */}
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    bgcolor: 'var(--neu-surface, #E8ECF3)',
                    boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
                    borderRadius: '14px',
                    p: 1.5,
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#D99118' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#5C6779', fontSize: '0.72rem' }}>
                        Evening (14-22h)
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#D99118' }}>
                      {tacticalData?.diurnal?.eveningShift?.percent ?? 35}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '0.95rem' }}>
                    {tacticalData?.diurnal?.eveningShift?.count ?? 161} <span style={{ fontSize: '0.72rem', color: '#7E8B9F', fontWeight: 500 }}>Incidents</span>
                  </Typography>
                </Box>
              </Grid>

              {/* Night Patrol */}
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    bgcolor: 'var(--neu-surface, #E8ECF3)',
                    boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
                    borderRadius: '14px',
                    p: 1.5,
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8B5CF6' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#5C6779', fontSize: '0.72rem' }}>
                        Night (22-06h)
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#8B5CF6' }}>
                      {tacticalData?.diurnal?.nightPatrol?.percent ?? 28}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '0.95rem' }}>
                    {tacticalData?.diurnal?.nightPatrol?.count ?? 128} <span style={{ fontSize: '0.72rem', color: '#7E8B9F', fontWeight: 500 }}>Incidents</span>
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* 24-Hour Diurnal Heatmap Bars */}
            <Box
              sx={{
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
                borderRadius: '16px',
                p: 2,
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  height: 120,
                  gap: { xs: '2px', sm: '4px' },
                }}
              >
                {(() => {
                  const hours = tacticalData?.diurnal?.hourly || Array.from({ length: 24 }, (_, i) => ({
                    hour: i,
                    label: `${String(i).padStart(2, '0')}:00`,
                    count: 12,
                    density: 50,
                  }))
                  const maxCount = Math.max(...hours.map((h) => h.count), 1)

                  return hours.map((h, idx) => {
                    const heightPercent = Math.max(12, Math.round((h.count / maxCount) * 100))
                    const isPeak = h.hour === (tacticalData?.diurnal?.peakHour?.hour ?? 7)
                    const isHigh = h.count / maxCount >= 0.75

                    return (
                      <Tooltip
                        key={`diurnal-bar-${idx}-${h?.hour ?? idx}`}
                        title={
                          <Box sx={{ p: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
                              {h.label}
                            </Typography>
                            <Typography variant="caption">
                              {h.count} incidents recorded {isPeak && '(Peak Hour)'}
                            </Typography>
                          </Box>
                        }
                        arrow
                      >
                        <Box
                          sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '100%',
                            justifyContent: 'flex-end',
                            cursor: 'pointer',
                          }}
                        >
                          <Box
                            sx={{
                              width: '100%',
                              maxWidth: 16,
                              height: `${heightPercent}%`,
                              borderRadius: '4px 4px 2px 2px',
                              background: isPeak
                                ? 'linear-gradient(180deg, #EF4444 0%, #D94F55 100%)'
                                : isHigh
                                ? 'linear-gradient(180deg, #F59E0B 0%, #D99118 100%)'
                                : 'linear-gradient(180deg, #60A5FA 0%, #356AE6 100%)',
                              boxShadow: isPeak
                                ? '0 2px 8px rgba(239, 68, 68, 0.4)'
                                : '0 1px 3px rgba(0,0,0,0.1)',
                              transition: 'transform 0.2s ease, filter 0.2s ease',
                              '&:hover': {
                                transform: 'scaleY(1.08)',
                                filter: 'brightness(1.15)',
                              },
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: { xs: '0.55rem', sm: '0.62rem' },
                              fontWeight: isPeak ? 800 : 600,
                              color: isPeak ? '#D94F55' : '#7E8B9F',
                              mt: 0.5,
                              lineHeight: 1,
                              display: h.hour % 3 === 0 || isPeak ? 'block' : { xs: 'none', md: 'block' },
                            }}
                          >
                            {String(h.hour).padStart(2, '0')}h
                          </Typography>
                        </Box>
                      </Tooltip>
                    )
                  })
                })()}
              </Box>
            </Box>

            {/* Tactical Heatstrip Directive Footer */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                bgcolor: 'rgba(53, 106, 230, 0.05)',
                p: 1.2,
                borderRadius: '12px',
                border: '1px solid rgba(53, 106, 230, 0.15)',
              }}
            >
              <SecurityIcon sx={{ fontSize: 16, color: '#356AE6' }} />
              <Typography variant="caption" sx={{ color: '#3A4759', fontWeight: 600, fontSize: '0.74rem' }}>
                Tactical Directive: Peak incident concentration between 07:00–14:00 hrs. Prioritize high-visibility vehicular presence along major economic arterial routes.
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Right: High-Risk Persons of Interest (POI) & Repeat Suspects Watchlist (5 Cols) */}
        <Grid item xs={12} lg={5}>
          <Box
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
              borderRadius: '22px',
              p: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 3px)',
                    gap: '3px',
                    color: '#8893A4',
                  }}
                >
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                </Box>
                <SuspectsIcon sx={{ fontSize: 18, color: '#D94F55' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1rem' }}>
                  High-Risk POI Watchlist
                </Typography>
              </Box>

              <Button
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
                onClick={() => navigate('/network')}
                sx={{
                  color: '#356AE6',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  textTransform: 'none',
                  p: 0,
                  minWidth: 0,
                }}
              >
                Network Graph
              </Button>
            </Box>

            {/* Suspect Cards List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.3, mb: 1.5, flex: 1 }}>
              {(() => {
                const suspects =
                  tacticalData?.repeatSuspects && tacticalData.repeatSuspects.length > 0
                    ? tacticalData.repeatSuspects.slice(0, 4)
                    : [
                        {
                          id: '1',
                          name: 'Manjunath Gowda',
                          alias: 'Bullet Manja',
                          status: 'Active Watch',
                          crimesCount: 4,
                          severityScore: 28,
                          districts: ['Bengaluru Urban'],
                          crossJurisdiction: true,
                        },
                        {
                          id: '2',
                          name: 'Syed Imran',
                          alias: 'Cable Imran',
                          status: 'Under Surveillance',
                          crimesCount: 3,
                          severityScore: 21,
                          districts: ['Mysuru'],
                          crossJurisdiction: true,
                        },
                        {
                          id: '3',
                          name: 'Ravi Kumar',
                          alias: 'Snake Ravi',
                          status: 'Warrant Issued',
                          crimesCount: 3,
                          severityScore: 19,
                          districts: ['Belagavi'],
                          crossJurisdiction: false,
                        },
                        {
                          id: '4',
                          name: 'Karthik Shetty',
                          alias: 'Goldy',
                          status: 'Parole Violation',
                          crimesCount: 2,
                          severityScore: 16,
                          districts: ['Mangaluru'],
                          crossJurisdiction: false,
                        },
                      ]

                return suspects.map((suspect, idx) => (
                  <Box
                    key={suspect.id || idx}
                    onClick={() => navigate(`/network?suspect=${suspect.id || ''}`)}
                    sx={{
                      bgcolor: 'var(--neu-surface, #E8ECF3)',
                      boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                      borderRadius: '14px',
                      p: 1.3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '4px 4px 10px #B8C0CC, -4px -4px 10px #FFFFFF',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.3, minWidth: 0 }}>
                      {/* Avatar Circle with initials */}
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: 'rgba(217, 79, 85, 0.12)',
                          color: '#D94F55',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          flexShrink: 0,
                          boxShadow: 'inset 1px 1px 2px rgba(217, 79, 85, 0.2)',
                        }}
                      >
                        {suspect.name?.charAt(0) || 'P'}
                      </Box>

                      {/* Name & Subtitle */}
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ fontWeight: 800, color: '#202A3A', fontSize: '0.86rem' }}
                          >
                            {suspect.name}
                          </Typography>
                          {suspect.alias && suspect.alias !== 'N/A' && (
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{
                                color: '#7E8B9F',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                display: { xs: 'none', sm: 'inline' },
                              }}
                            >
                              ({suspect.alias})
                            </Typography>
                          )}
                        </Box>

                        <Typography variant="caption" noWrap sx={{ color: '#5C6779', fontSize: '0.72rem', display: 'block' }}>
                          {suspect.districts?.[0] || 'Statewide Area'} • {suspect.crimesCount} Linked FIRs
                        </Typography>
                      </Box>
                    </Box>

                    {/* Threat Score & Badge */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                      {suspect.crossJurisdiction && (
                        <Chip
                          label="Multi-Station"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(139, 92, 246, 0.12)',
                            color: '#8B5CF6',
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: 20,
                            display: { xs: 'none', sm: 'inline-flex' },
                          }}
                        />
                      )}
                      <Chip
                        label={`${suspect.crimesCount} Crimes`}
                        size="small"
                        sx={{
                          bgcolor: suspect.crimesCount >= 3 ? 'rgba(217, 79, 85, 0.15)' : 'rgba(217, 145, 24, 0.15)',
                          color: suspect.crimesCount >= 3 ? '#D94F55' : '#D99118',
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          height: 22,
                        }}
                      />
                    </Box>
                  </Box>
                ))
              })()}
            </Box>

            {/* Bottom Syndicate Graph Action */}
            <Button
              fullWidth
              variant="text"
              startIcon={<NetworkActionIcon sx={{ fontSize: 16 }} />}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
              onClick={() => navigate('/network')}
              sx={{
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                borderRadius: '12px',
                py: 1,
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#356AE6',
                textTransform: 'none',
                '&:hover': {
                  boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
                },
              }}
            >
              Analyze Full Syndicate Linkage Graph (384 Suspects)
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Row 3: Geospatial Heatmap & Crime Type Distribution */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
              borderRadius: '22px',
              p: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              height: 430,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1rem' }}>
                Geospatial Incident Hotspots
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                onClick={() => navigate('/map')}
                sx={{
                  color: '#356AE6',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                }}
              >
                Expand Live Map
              </Button>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <CrimeMap height="100%" />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
              borderRadius: '22px',
              p: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              height: 430,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1rem' }}>
                Crime Type Distribution
              </Typography>
              <Chip
                label="Categorical"
                size="small"
                sx={{
                  bgcolor: 'rgba(35, 155, 98, 0.1)',
                  color: '#239B62',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  height: 22,
                }}
              />
            </Box>
            <Box sx={{ flex: 1, minHeight: 330, width: '100%', minWidth: 0, position: 'relative' }}>
              <BarChart
                data={chartData?.datasets?.[0]?.data || []}
                labels={chartData?.labels || []}
                colors={chartData?.datasets?.[0]?.backgroundColor}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Row 4: Emerging Anomaly Callouts & Recent FIR Incidents (Styled like Gantt / Activity Panel in reference) */}
      <Grid container spacing={2.5}>
        {/* Emerging Anomalies */}
        <Grid item xs={12} lg={4}>
          <Box
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
              borderRadius: '22px',
              p: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1rem' }}>
                Statistical Anomalies
              </Typography>
              <Chip
                label="Outlier Engine"
                size="small"
                sx={{
                  bgcolor: 'rgba(217, 79, 85, 0.1)',
                  color: '#D94F55',
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  height: 20,
                }}
              />
            </Box>

            {anomaliesList.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: '#8893A4' }}>No statistical anomalies detected.</Typography>
              </Box>
            ) : (
              anomaliesList.slice(0, 3).map((anom, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1.8,
                    mb: 1.5,
                    borderRadius: '16px',
                    bgcolor: 'var(--neu-surface, #E8ECF3)',
                    boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Chip
                      label={anom.severity?.toUpperCase()}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        bgcolor: anom.severity === 'critical' ? '#D94F55' : '#D99118',
                        color: '#fff',
                      }}
                    />
                    <Typography variant="caption" fontWeight={700} color="#D94F55">
                      {anom.confidenceScore}% Confidence
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#202A3A', fontSize: '0.85rem' }}>
                    {anom.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5C6779', display: 'block', mt: 0.4, lineHeight: 1.4 }}>
                    📍 <strong>{anom.district}:</strong> {anom.description}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Grid>

        {/* Recent Crime Incidents Table */}
        <Grid item xs={12} lg={8}>
          <Box
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
              borderRadius: '22px',
              p: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 3px)',
                    gap: '3px',
                    color: '#8893A4',
                  }}
                >
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#8893A4' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1rem' }}>
                  Recent Case Entries & Investigations
                </Typography>
              </Box>

              <Button
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                onClick={() => navigate('/crimes')}
                sx={{
                  color: '#356AE6',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                }}
              >
                View All ({recentCrimesList.length})
              </Button>
            </Box>

            <TableContainer
              sx={{
                borderRadius: '16px',
                boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
                overflow: 'hidden',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(215, 221, 231, 0.4)' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#5C6779', fontSize: '0.78rem' }}>FIR NUMBER</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#5C6779', fontSize: '0.78rem' }}>CRIME CATEGORY</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#5C6779', fontSize: '0.78rem' }}>DATE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#5C6779', fontSize: '0.78rem' }}>SEVERITY</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#5C6779', fontSize: '0.78rem' }}>STATUS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCrimesList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#8893A4' }}>
                        No recent crime records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentCrimesList.slice(0, 5).map((crime, index) => (
                      <TableRow
                        key={crime._id || index}
                        hover
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'rgba(53, 106, 230, 0.04)' },
                        }}
                        onClick={() => navigate('/crimes')}
                      >
                        <TableCell sx={{ fontWeight: 700, color: '#202A3A', fontSize: '0.82rem' }}>
                          {crime.firNumber || 'Unknown FIR'}
                        </TableCell>
                        <TableCell sx={{ color: '#5C6779', fontSize: '0.82rem' }}>
                          {crime.crimeType?.name || 'General Crime'}
                        </TableCell>
                        <TableCell sx={{ color: '#8893A4', fontSize: '0.78rem' }}>
                          {crime.date ? new Date(crime.date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={crime.severity || 'medium'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              bgcolor:
                                crime.severity === 'critical'
                                  ? 'rgba(233, 30, 99, 0.15)'
                                  : crime.severity === 'high'
                                  ? 'rgba(217, 79, 85, 0.15)'
                                  : crime.severity === 'medium'
                                  ? 'rgba(217, 145, 24, 0.15)'
                                  : 'rgba(35, 155, 98, 0.15)',
                              color:
                                crime.severity === 'critical'
                                  ? '#E91E63'
                                  : crime.severity === 'high'
                                  ? '#D94F55'
                                  : crime.severity === 'medium'
                                  ? '#D99118'
                                  : '#239B62',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={crime.status || 'reported'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              bgcolor: 'var(--neu-surface, #E8ECF3)',
                              boxShadow: '1px 1px 3px #C7CDD7, -1px -1px 3px #FFFFFF',
                              color: '#5C6779',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
      </Grid>

      {/* SCRB Report Modal */}
      <ScrbReportDialog open={openScrbReport} onClose={() => setOpenScrbReport(false)} />
    </Box>
  )
}

export default Dashboard