import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material'
import {
  Fingerprint as FingerprintIcon,
  DirectionsCar as PatrolIcon,
  DeviceHub as MoIcon,
  Sensors as CdrIcon,
  WarningAmber as BoloIcon,
  VerifiedUser as EvidenceIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as AlertIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  PhoneIphone as PhoneIcon,
  Shield as ShieldIcon,
  Security as SecurityIcon,
  QrCode2 as QrIcon,
  Lock as LockIcon,
} from '@mui/icons-material'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import tacticalAPI from '../api/tactical'

const TABS = [
  { id: 'mo', label: 'M.O. Pattern Linkage', icon: MoIcon, badge: 'AI Semantic' },
  { id: 'patrol', label: 'Predictive Patrol Routes', icon: PatrolIcon, badge: 'GPS Routing' },
  { id: 'biometrics', label: 'Biometrics & Facial Match', icon: FingerprintIcon, badge: 'CNN 128D' },
  { id: 'cdr', label: 'CDR & Tower Co-Location', icon: CdrIcon, badge: 'Telephony' },
  { id: 'bolo', label: 'Tactical BOLO Desk', icon: BoloIcon, badge: 'Interstate' },
  { id: 'evidence', label: 'Digital Evidence Locker', icon: EvidenceIcon, badge: 'SHA-256' },
]

export default function Forensics() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const activeTab = searchParams.get('tab') || 'mo'

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId })
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1600, mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 3.5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                bgcolor: 'rgba(53, 106, 230, 0.12)',
                color: '#356AE6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 1px 1px 2px rgba(53, 106, 230, 0.2)',
              }}
            >
              <SecurityIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#202A3A', letterSpacing: '-0.02em' }}>
              Tactical Forensics & Special Operations
            </Typography>
            <Chip
              label="Karnataka SCRB Clearance Level 4"
              size="small"
              sx={{
                bgcolor: 'rgba(35, 155, 98, 0.12)',
                color: '#239B62',
                fontWeight: 800,
                fontSize: '0.68rem',
                height: 22,
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#5C6779', fontWeight: 500 }}>
            Advanced analytical suite: M.O. cross-jurisdiction linkage, biometric facial identification, predictive patrol routing, CDR cell-tower matrices, interstate BOLO, and cryptographic evidence lockers.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="text"
            onClick={() => navigate('/dashboard')}
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
              borderRadius: '12px',
              px: 2,
              py: 0.9,
              fontWeight: 700,
              fontSize: '0.82rem',
              color: '#5C6779',
              textTransform: 'none',
              '&:hover': {
                boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
              },
            }}
          >
            ← Back to Dashboard
          </Button>
        </Box>
      </Box>

      {/* Neumorphic Navigation Pill Strip */}
      <Box
        sx={{
          bgcolor: 'var(--neu-surface, #E8ECF3)',
          boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
          borderRadius: '20px',
          p: 1,
          mb: 3.5,
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          '&::-webkit-scrollbar': { height: 4 },
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <Button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              startIcon={<Icon sx={{ fontSize: 18, color: isActive ? '#FFFFFF' : '#356AE6' }} />}
              sx={{
                flexShrink: 0,
                borderRadius: '14px',
                px: 2,
                py: 1.1,
                fontSize: '0.82rem',
                fontWeight: 800,
                textTransform: 'none',
                transition: 'all 0.2s ease',
                bgcolor: isActive ? '#356AE6' : 'transparent',
                color: isActive ? '#FFFFFF' : '#5C6779',
                boxShadow: isActive
                  ? '0 4px 12px rgba(53, 106, 230, 0.35)'
                  : 'none',
                '&:hover': {
                  bgcolor: isActive ? '#2855C4' : 'rgba(53, 106, 230, 0.06)',
                },
              }}
            >
              {tab.label}
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 0.8,
                  py: 0.2,
                  borderRadius: '6px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  bgcolor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(53, 106, 230, 0.1)',
                  color: isActive ? '#FFFFFF' : '#356AE6',
                }}
              >
                {tab.badge}
              </Box>
            </Button>
          )
        })}
      </Box>

      {/* Tab Panels */}
      {activeTab === 'mo' && <MoLinkagePanel />}
      {activeTab === 'patrol' && <PatrolRoutingPanel />}
      {activeTab === 'biometrics' && <BiometricsPanel />}
      {activeTab === 'cdr' && <CdrAnalysisPanel />}
      {activeTab === 'bolo' && <BoloDeskPanel />}
      {activeTab === 'evidence' && <EvidenceLockerPanel />}
    </Box>
  )
}

/* =========================================================================
   1. M.O. PATTERN CLUSTERS & SEMANTIC SERIAL CRIME LINKER
   ========================================================================= */
function MoLinkagePanel() {
  const [queryKeywords, setQueryKeywords] = useState('shutter cutter midnight cash')
  const [selectedPattern, setSelectedPattern] = useState(null)

  const { data: patternsData, isLoading: patternsLoading } = useQuery({
    queryKey: ['tactical-mo-patterns'],
    queryFn: tacticalAPI.getMoPatterns,
  })

  const { data: linkageData, refetch: runLinkage, isFetching: linkageFetching } = useQuery({
    queryKey: ['tactical-mo-linkage', queryKeywords],
    queryFn: () => tacticalAPI.matchMoLinkage({ keywords: queryKeywords }),
  })

  const patterns = patternsData?.data?.data?.patterns || []
  const linkedCases = linkageData?.data?.data?.linkedCases || []

  return (
    <Grid container spacing={3}>
      {/* Left Col: M.O. Search & Serial Linkage Results */}
      <Grid item xs={12} lg={7}>
        <Box
          sx={{
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
            borderRadius: '22px',
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.6)',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1.05rem' }}>
                AI Modus Operandi Semantic Linkage Engine
              </Typography>
              <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                Correlates entry tactics, tool marks, and time vectors across 457 Karnataka crime records
              </Typography>
            </Box>
            <Chip
              label="NLP Vector Cosine"
              size="small"
              sx={{ bgcolor: 'rgba(53, 106, 230, 0.1)', color: '#356AE6', fontWeight: 700, fontSize: '0.7rem' }}
            />
          </Box>

          {/* Search Box */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter M.O. keywords (e.g. hydraulic jack, shutter bend, helmet rider, ATM torch)..."
              value={queryKeywords}
              onChange={(e) => setQueryKeywords(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#7E8B9F', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: 'var(--neu-surface, #E8ECF3)',
                  boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
                  borderRadius: '12px',
                  '& fieldset': { border: 'none' },
                  fontSize: '0.85rem',
                },
              }}
            />
            <Button
              variant="contained"
              onClick={() => runLinkage()}
              disabled={linkageFetching}
              sx={{
                bgcolor: '#356AE6',
                borderRadius: '12px',
                px: 2.5,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(53, 106, 230, 0.3)',
              }}
            >
              Analyze Links
            </Button>
          </Box>

          {/* Linked Cases List */}
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#202A3A', mb: 1.5 }}>
            Matched Serial Cases Across Police Stations ({linkedCases.length} Detected)
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {linkedCases.map((c) => (
              <Box
                key={c.id}
                sx={{
                  bgcolor: 'var(--neu-surface, #E8ECF3)',
                  boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                  borderRadius: '16px',
                  p: 2,
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#356AE6' }}>
                        {c.firNumber}
                      </Typography>
                      <Chip
                        label={`${c.similarityScore}% M.O. Match`}
                        size="small"
                        sx={{
                          bgcolor: c.similarityScore >= 85 ? 'rgba(217, 79, 85, 0.15)' : 'rgba(217, 145, 24, 0.15)',
                          color: c.similarityScore >= 85 ? '#D94F55' : '#D99118',
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          height: 22,
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                      {c.policeStation} • {c.district}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#7E8B9F', fontWeight: 600 }}>
                    {c.date ? new Date(c.date).toLocaleDateString() : 'Active FIR'}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: '#3A4759', fontSize: '0.82rem', mb: 1.5, lineHeight: 1.4 }}>
                  {c.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                    {c.sharedTactics?.map((token, i) => (
                      <Chip
                        key={i}
                        label={`#${token}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(53, 106, 230, 0.08)',
                          color: '#356AE6',
                          fontSize: '0.65rem',
                          height: 20,
                          fontWeight: 700,
                        }}
                      />
                    ))}
                  </Box>
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
                    onClick={() => toast.success(`Viewing forensic correlation for ${c.firNumber}`)}
                    sx={{ color: '#356AE6', fontWeight: 700, fontSize: '0.74rem', textTransform: 'none' }}
                  >
                    Open FIR
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>

      {/* Right Col: Active Modus Operandi Archetypes */}
      <Grid item xs={12} lg={5}>
        <Box
          sx={{
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
            borderRadius: '22px',
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1.05rem' }}>
                SCRB State M.O. Archetypes
              </Typography>
              <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                High-frequency syndicate operational signatures
              </Typography>
            </Box>
            <Chip
              label="5 Active Clusters"
              size="small"
              sx={{ bgcolor: 'rgba(217, 79, 85, 0.12)', color: '#D94F55', fontWeight: 800, fontSize: '0.7rem' }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {patterns.map((p) => (
              <Box
                key={p.id}
                sx={{
                  bgcolor: 'var(--neu-surface, #E8ECF3)',
                  boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                  borderRadius: '16px',
                  p: 2,
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '4px 4px 12px #BAC2CF, -4px -4px 12px #FFFFFF',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '0.9rem' }}>
                    {p.title}
                  </Typography>
                  <Chip
                    label={`${p.confidenceScore}% Signature`}
                    size="small"
                    sx={{ bgcolor: 'rgba(53, 106, 230, 0.12)', color: '#356AE6', fontWeight: 800, fontSize: '0.68rem', height: 20 }}
                  />
                </Box>

                <Typography variant="caption" sx={{ color: '#D94F55', fontWeight: 700, display: 'block', mb: 0.8 }}>
                  Operating Window: {p.typicalWindow} • {p.frequency} Incidents
                </Typography>

                <Box sx={{ bgcolor: 'rgba(53, 106, 230, 0.04)', p: 1.2, borderRadius: '10px', mb: 1.2 }}>
                  <Typography variant="caption" sx={{ color: '#4B5565', fontWeight: 600, display: 'block' }}>
                    <strong>Syndicate:</strong> {p.suspectedGang}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4B5565', fontWeight: 600, display: 'block' }}>
                    <strong>Target:</strong> {p.targetProfile}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                  {p.hallmarks?.map((h, i) => (
                    <Chip
                      key={i}
                      label={`• ${h}`}
                      size="small"
                      sx={{ bgcolor: 'var(--neu-surface, #E8ECF3)', color: '#5C6779', fontSize: '0.66rem', height: 22, fontWeight: 600 }}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}

/* =========================================================================
   2. PREDICTIVE PATROL ROUTING (SMART PCR VAN DISPATCH)
   ========================================================================= */
function PatrolRoutingPanel() {
  const [shift, setShift] = useState('night')
  const [district, setDistrict] = useState('Bengaluru Urban')

  const { data: routeData, refetch, isFetching } = useQuery({
    queryKey: ['tactical-patrol', shift, district],
    queryFn: () => tacticalAPI.getPatrolRoutes({ shift, district }),
  })

  const patrol = routeData?.data?.data || {}
  const waypoints = patrol.waypoints || []

  return (
    <Grid container spacing={3}>
      {/* Route Control & Overview */}
      <Grid item xs={12} lg={4}>
        <Box
          sx={{
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
            borderRadius: '22px',
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.6)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#202A3A', mb: 0.5 }}>
              Smart Patrol Route Dispatch
            </Typography>
            <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600, display: 'block', mb: 2.5 }}>
              Calculates GPS waypoints to suppress predicted diurnal hotspots
            </Typography>

            {/* Shift Picker */}
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#5C6779', textTransform: 'uppercase', display: 'block', mb: 1 }}>
              Select Patrol Shift
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2.5 }}>
              {[
                { id: 'morning', label: 'Morning', hours: '06-14h' },
                { id: 'evening', label: 'Evening', hours: '14-22h' },
                { id: 'night', label: 'Night', hours: '22-06h' },
              ].map((s) => (
                <Button
                  key={s.id}
                  onClick={() => setShift(s.id)}
                  sx={{
                    bgcolor: shift === s.id ? '#356AE6' : 'var(--neu-surface, #E8ECF3)',
                    color: shift === s.id ? '#FFFFFF' : '#5C6779',
                    boxShadow: shift === s.id
                      ? '0 4px 10px rgba(53, 106, 230, 0.3)'
                      : 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
                    borderRadius: '12px',
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                  }}
                >
                  {s.label}
                  <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>{s.hours}</span>
                </Button>
              ))}
            </Box>

            {/* Mission Stats */}
            <Box
              sx={{
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF)',
                borderRadius: '16px',
                p: 2,
                mb: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                  Assigned Unit
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#202A3A' }}>
                  {patrol.unitName || 'PCR Interceptor-04'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                  Route Distance
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#356AE6' }}>
                  {patrol.totalDistanceKm || 28.4} km ({patrol.estimatedDurationMins || 180} mins)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                  Predicted Threat Suppression
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#239B62' }}>
                  {patrol.riskSuppressionRate || 88}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={patrol.riskSuppressionRate || 88}
                sx={{ height: 6, borderRadius: 3, bgcolor: '#CBD1DB', '& .MuiLinearProgress-bar': { bgcolor: '#239B62' } }}
              />
            </Box>

            {/* Suppressed Threat List */}
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#5C6779', textTransform: 'uppercase', display: 'block', mb: 1 }}>
              Suppression Directives
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              {patrol.suppressedThreatCategories?.map((t, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ fontSize: 14, color: '#239B62' }} />
                  <Typography variant="caption" sx={{ color: '#3A4759', fontWeight: 600, fontSize: '0.74rem' }}>
                    {t}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={() => toast.success(`Dispatched patrol route ${patrol.missionId} to Sector Command!`)}
            sx={{
              mt: 3,
              bgcolor: '#356AE6',
              borderRadius: '12px',
              py: 1.2,
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(53, 106, 230, 0.35)',
            }}
          >
            Dispatch Tactical Route to PCR Units
          </Button>
        </Box>
      </Grid>

      {/* Waypoints Sequence List */}
      <Grid item xs={12} lg={8}>
        <Box
          sx={{
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
            borderRadius: '22px',
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1.05rem' }}>
                Turn-by-Turn Tactical Waypoints ({waypoints.length} Target Sectors)
              </Typography>
              <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                Mission: {patrol.missionId || 'PTR-882910'} • Shift: {patrol.shift?.name}
              </Typography>
            </Box>
            <Chip
              label={patrol.assignedVehicle || 'Interceptor Scorpio-N'}
              size="small"
              sx={{ bgcolor: 'rgba(53, 106, 230, 0.1)', color: '#356AE6', fontWeight: 700 }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {waypoints.map((wp) => (
              <Box
                key={wp.order}
                sx={{
                  bgcolor: 'var(--neu-surface, #E8ECF3)',
                  boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                  borderRadius: '16px',
                  p: 2,
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                {/* Waypoint Number Pill */}
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    bgcolor: wp.priority === 'Critical' ? 'rgba(217, 79, 85, 0.15)' : 'rgba(53, 106, 230, 0.12)',
                    color: wp.priority === 'Critical' ? '#D94F55' : '#356AE6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    flexShrink: 0,
                    boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  {wp.order}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#202A3A' }}>
                      {wp.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={wp.priority}
                        size="small"
                        sx={{
                          bgcolor: wp.priority === 'Critical' ? '#D94F55' : wp.priority === 'High' ? '#D99118' : '#239B62',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.65rem',
                          height: 20,
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#7E8B9F' }}>
                        ETA {wp.time}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#4B5565', fontSize: '0.8rem', lineHeight: 1.4, mb: 1 }}>
                    {wp.tacticalDirective}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" sx={{ color: '#7E8B9F', fontWeight: 600 }}>
                      GPS: {wp.lat}, {wp.lng}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<LocationIcon sx={{ fontSize: 13 }} />}
                      onClick={() => navigate(`/map?lat=${wp.lat}&lng=${wp.lng}`)}
                      sx={{ color: '#356AE6', fontWeight: 700, fontSize: '0.72rem', textTransform: 'none', p: 0 }}
                    >
                      View on Hotspot Map
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}

/* =========================================================================
   3. BIOMETRICS & FACIAL / SKETCH SEARCH DESK
   ========================================================================= */
function BiometricsPanel() {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0)

  const { data: bioData, isLoading } = useQuery({
    queryKey: ['tactical-biometrics'],
    queryFn: tacticalAPI.getBiometrics,
  })

  const cases = bioData?.data?.data?.availableCases || []
  const currentCase = cases[selectedCaseIdx] || cases[0] || {}

  return (
    <Grid container spacing={3}>
      {/* Case Studies Selector */}
      <Grid item xs={12} lg={4}>
        <Box
          sx={{
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
            borderRadius: '22px',
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1.05rem' }}>
                Biometric Investigation Cases
              </Typography>
              <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                Indexed against 384 suspect mugshots
              </Typography>
            </Box>
            <Chip
              label="CNN ResNet-50"
              size="small"
              sx={{ bgcolor: 'rgba(53, 106, 230, 0.1)', color: '#356AE6', fontWeight: 700 }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            {cases.map((c, idx) => (
              <Box
                key={c.id}
                onClick={() => setSelectedCaseIdx(idx)}
                sx={{
                  bgcolor: 'var(--neu-surface, #E8ECF3)',
                  boxShadow: selectedCaseIdx === idx
                    ? 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)'
                    : 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                  border: selectedCaseIdx === idx ? '2px solid #356AE6' : '1px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '16px',
                  p: 1.8,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#356AE6' }}>
                    {c.id}
                  </Typography>
                  <Chip
                    label={`${c.matchedSuspect?.confidence}% Match`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(35, 155, 98, 0.15)',
                      color: '#239B62',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      height: 20,
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '0.85rem', mb: 0.5 }}>
                  {c.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5C6779', display: 'block' }}>
                  Source: {c.source}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Upload New Composite Simulation */}
          <Button
            fullWidth
            variant="outlined"
            onClick={() => toast.success('Upload composite dialog: Select witness sketch or CCTV frame')}
            sx={{
              borderColor: '#356AE6',
              color: '#356AE6',
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              py: 1,
            }}
          >
            + Upload New Witness Sketch / Frame
          </Button>
        </Box>
      </Grid>

      {/* Case Details & Facial Landmark Analysis */}
      <Grid item xs={12} lg={8}>
        {currentCase && (
          <Box
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
              borderRadius: '22px',
              p: 3,
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1.1rem' }}>
                  {currentCase.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                  Captured: {currentCase.dateCaptured} • Clarity: {currentCase.qualityScore}% Quality Index
                </Typography>
              </Box>
            </Box>

            {/* Matched Suspect Candidate Card */}
            <Box
              sx={{
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                borderRadius: '18px',
                p: 2.5,
                mb: 3,
                border: '1px solid rgba(255, 255, 255, 0.5)',
              }}
            >
              <Grid container spacing={2.5} alignItems="center">
                {/* Suspect Mugshot Avatar */}
                <Grid item xs={12} sm={3} sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: 'rgba(217, 79, 85, 0.12)',
                      color: '#D94F55',
                      mx: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '2rem',
                      boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
                    }}
                  >
                    {currentCase.matchedSuspect?.avatarInitial || 'SU'}
                  </Box>
                  <Chip
                    label={currentCase.matchedSuspect?.status || 'Active Warrant'}
                    size="small"
                    sx={{ bgcolor: 'rgba(217, 79, 85, 0.15)', color: '#D94F55', fontWeight: 800, mt: 1.5, fontSize: '0.68rem' }}
                  />
                </Grid>

                {/* Candidate Information */}
                <Grid item xs={12} sm={9}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#202A3A' }}>
                        {currentCase.matchedSuspect?.name}{' '}
                        <span style={{ fontSize: '0.85rem', color: '#7E8B9F', fontWeight: 600 }}>
                          (aka {currentCase.matchedSuspect?.alias})
                        </span>
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                        Age: {currentCase.matchedSuspect?.age} • Criminal Record Category: Habitual Property Offender
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#239B62' }}>
                        {currentCase.matchedSuspect?.confidence}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 700 }}>
                        Biometric Match
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#5C6779', textTransform: 'uppercase', display: 'block', mb: 0.6 }}>
                    Prior Offenses & Active Bookings
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2 }}>
                    {currentCase.matchedSuspect?.knownOffenses?.map((off, i) => (
                      <Chip
                        key={i}
                        label={off}
                        size="small"
                        sx={{ bgcolor: 'rgba(53, 106, 230, 0.08)', color: '#356AE6', fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>

                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                    onClick={() => toast.success(`Opening criminal syndicate link graph for ${currentCase.matchedSuspect?.name}`)}
                    sx={{
                      bgcolor: '#356AE6',
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      boxShadow: '0 4px 10px rgba(53, 106, 230, 0.3)',
                    }}
                  >
                    Investigate in Syndicate Network Graph
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Neural Facial Landmarks Ratios */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#202A3A', mb: 1.5 }}>
              Extracted Neural Facial Landmark Metrics
            </Typography>
            <Grid container spacing={2}>
              {currentCase.extractedFeatures &&
                Object.entries(currentCase.extractedFeatures).map(([k, v]) => (
                  <Grid item xs={6} sm={3} key={k}>
                    <Box
                      sx={{
                        bgcolor: 'var(--neu-surface, #E8ECF3)',
                        boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
                        borderRadius: '12px',
                        p: 1.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#7E8B9F', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.62rem', display: 'block', mb: 0.3 }}>
                        {k.replace(/([A-Z])/g, ' $1')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#202A3A' }}>
                        {v}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}
      </Grid>
    </Grid>
  )
}

/* =========================================================================
   4. CDR & CELL TOWER DUMP CO-LOCATION MATRIX
   ========================================================================= */
function CdrAnalysisPanel() {
  const { data: cdrResp } = useQuery({
    queryKey: ['tactical-cdr'],
    queryFn: tacticalAPI.getCdrAnalysis,
  })

  const cdr = cdrResp?.data?.data || {}
  const coLocated = cdr.coLocatedIdentities || []
  const timeline = cdr.callSequenceTimeline || []

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={7}>
        <Box
          sx={{
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
            borderRadius: '22px',
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.6)',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1.05rem' }}>
                Cellular Tower Co-Location Cross-Analysis
              </Typography>
              <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                Case: {cdr.caseTitle || 'Serial Burglary Nexus'} ({cdr.investigationId})
              </Typography>
            </Box>
            <Chip
              label="2 Interceptor Matches"
              size="small"
              sx={{ bgcolor: 'rgba(217, 79, 85, 0.15)', color: '#D94F55', fontWeight: 800 }}
            />
          </Box>

          {/* Tower Dumps Compared */}
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  bgcolor: 'var(--neu-surface, #E8ECF3)',
                  boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
                  borderRadius: '14px',
                  p: 1.8,
                }}
              >
                <Typography variant="caption" sx={{ color: '#356AE6', fontWeight: 800, display: 'block' }}>
                  {cdr.crimeSceneA?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600, display: 'block' }}>
                  Tower: {cdr.crimeSceneA?.towerId} • {cdr.crimeSceneA?.totalTowerDumps} Dumps
                </Typography>
                <Typography variant="caption" sx={{ color: '#7E8B9F', display: 'block' }}>
                  {cdr.crimeSceneA?.window}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  bgcolor: 'var(--neu-surface, #E8ECF3)',
                  boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
                  borderRadius: '14px',
                  p: 1.8,
                }}
              >
                <Typography variant="caption" sx={{ color: '#356AE6', fontWeight: 800, display: 'block' }}>
                  {cdr.crimeSceneB?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600, display: 'block' }}>
                  Tower: {cdr.crimeSceneB?.towerId} • {cdr.crimeSceneB?.totalTowerDumps} Dumps
                </Typography>
                <Typography variant="caption" sx={{ color: '#7E8B9F', display: 'block' }}>
                  {cdr.crimeSceneB?.window}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Co-Located Phone Identities */}
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#202A3A', mb: 1.5 }}>
            Flagged Co-Located Identities (Active at Both Crime Scenes)
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {coLocated.map((item) => (
              <Box
                key={item.id}
                sx={{
                  bgcolor: 'var(--neu-surface, #E8ECF3)',
                  boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                  borderRadius: '16px',
                  p: 2,
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ color: '#D94F55', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#202A3A' }}>
                      {item.msisdn}
                    </Typography>
                  </Box>
                  <Chip
                    label={item.interceptorFlag}
                    size="small"
                    sx={{ bgcolor: 'rgba(217, 79, 85, 0.15)', color: '#D94F55', fontWeight: 800, fontSize: '0.65rem' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 1.2, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                    IMEI: <code>{item.imei}</code>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                    Handset: {item.handset}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#239B62', fontWeight: 800 }}>
                    Scene A Hits: {item.hitsSceneA} • Scene B Hits: {item.hitsSceneB}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: '#4B5565', fontSize: '0.8rem', lineHeight: 1.4, mb: 1.5 }}>
                  {item.notes}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => toast.success(`Submitting lawful interception request for ${item.imei}`)}
                    sx={{ color: '#D94F55', fontWeight: 700, fontSize: '0.74rem', textTransform: 'none' }}
                  >
                    Issue Subpoena / Section 91 CrPC Notice
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>

      {/* Call Sequence Timeline */}
      <Grid item xs={12} lg={5}>
        <Box
          sx={{
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
            borderRadius: '22px',
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1.05rem' }}>
                Operational CDR Sequence Timeline
              </Typography>
              <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                Chronological handoffs during incident breach
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
            {timeline.map((event, idx) => (
              <Box
                key={idx}
                sx={{
                  bgcolor: 'var(--neu-surface, #E8ECF3)',
                  boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                  borderRadius: '14px',
                  p: 1.6,
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#356AE6' }}>
                    {event.time}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#7E8B9F', fontWeight: 600 }}>
                    Duration: {event.durationSec}s
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '0.82rem', mb: 0.3 }}>
                  {event.source} → {event.destination}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5C6779', display: 'block' }}>
                  {event.event}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}

/* =========================================================================
   5. TACTICAL BOLO DESK & INTERSTATE CHECKPOINTS
   ========================================================================= */
function BoloDeskPanel() {
  const { data: boloResp } = useQuery({
    queryKey: ['tactical-bolo'],
    queryFn: tacticalAPI.getBoloAlerts,
  })

  const bolo = boloResp?.data?.data?.activeBolo || {}
  const checkpoints = bolo.interstateCheckpoints || []

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={7}>
        <Box
          sx={{
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
            borderRadius: '22px',
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.6)',
            mb: 3,
          }}
        >
          {/* Code Red Banner */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'rgba(217, 79, 85, 0.12)',
              p: 2,
              borderRadius: '16px',
              border: '1px solid rgba(217, 79, 85, 0.3)',
              mb: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: '#D94F55',
                  boxShadow: '0 0 10px #D94F55',
                }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#D94F55' }}>
                  CODE RED: STATEWIDE EMERGENCY MANHUNT
                </Typography>
                <Typography variant="caption" sx={{ color: '#7E8B9F', fontWeight: 700 }}>
                  Broadcast ID: {bolo.id} • Urgency: {bolo.urgency}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`${bolo.fugitiveDetails?.timeElapsedMinutes} Mins Elapsed`}
              size="small"
              sx={{ bgcolor: '#D94F55', color: '#FFFFFF', fontWeight: 800 }}
            />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 800, color: '#202A3A', mb: 1 }}>
            {bolo.title}
          </Typography>

          {/* Fleeing Target Details */}
          <Box
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
              borderRadius: '16px',
              p: 2,
              mb: 3,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#7E8B9F', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                  Suspect Leader
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#202A3A' }}>
                  {bolo.fugitiveDetails?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#7E8B9F', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                  Fleeing Vehicle
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#D94F55' }}>
                  {bolo.fugitiveDetails?.vehicle} ({bolo.fugitiveDetails?.registration})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#7E8B9F', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                  Reported Weapons
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#202A3A' }}>
                  {bolo.fugitiveDetails?.weapons}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#7E8B9F', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                  Last Seen Direction
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#202A3A' }}>
                  {bolo.fugitiveDetails?.lastSeenLocation}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Escape Perimeter Simulation */}
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#202A3A', mb: 1 }}>
            Dynamic Escape Perimeter Calculator
          </Typography>
          <Box
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
              borderRadius: '16px',
              p: 2,
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 700 }}>
                30-Min Ring
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#356AE6' }}>
                {bolo.escapePerimeter?.ring30mKm} km
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 700 }}>
                Current Estimated Radius
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#D94F55' }}>
                {bolo.escapePerimeter?.currentEstimatedRadiusKm} km
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 700 }}>
                90-Min Interstate Ring
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#8B5CF6' }}>
                {bolo.escapePerimeter?.ring90mKm} km
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>

      {/* Interstate Highway Checkpoints */}
      <Grid item xs={12} lg={5}>
        <Box
          sx={{
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
            borderRadius: '22px',
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1.05rem' }}>
                Active Highway Toll Chokepoints
              </Typography>
              <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                Automatic Number Plate Recognition (ANPR) active
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
            {checkpoints.map((cp) => (
              <Box
                key={cp.id}
                sx={{
                  bgcolor: 'var(--neu-surface, #E8ECF3)',
                  boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                  borderRadius: '16px',
                  p: 2,
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#202A3A' }}>
                    {cp.name}
                  </Typography>
                  <Chip
                    label={cp.status}
                    size="small"
                    sx={{
                      bgcolor: cp.interceptionStatus === 'flagged' ? 'rgba(217, 79, 85, 0.15)' : 'rgba(35, 155, 98, 0.15)',
                      color: cp.interceptionStatus === 'flagged' ? '#D94F55' : '#239B62',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      height: 22,
                    }}
                  />
                </Box>

                <Typography variant="caption" sx={{ color: '#5C6779', display: 'block', mb: 0.5 }}>
                  {cp.highway} • Distance: {cp.distanceFromCrimeKm} km (Vehicle ETA: {cp.etaVehicleMinutes} mins)
                </Typography>
                <Typography variant="caption" sx={{ color: '#7E8B9F', display: 'block', mb: 1.2 }}>
                  Officer in Charge: {cp.officerInCharge}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => toast.success(`Alerted interceptor unit at ${cp.name}`)}
                    sx={{ color: '#356AE6', fontWeight: 700, fontSize: '0.74rem', textTransform: 'none' }}
                  >
                    Confirm Interception Deployment
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}

/* =========================================================================
   6. TAMPER-EVIDENT DIGITAL EVIDENCE LOCKER (CHAIN OF CUSTODY)
   ========================================================================= */
function EvidenceLockerPanel() {
  const [selectedEvidence, setSelectedEvidence] = useState(null)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [inputHash, setInputHash] = useState('')
  const [verificationResult, setVerificationResult] = useState(null)

  const { data: evidenceResp } = useQuery({
    queryKey: ['tactical-evidence'],
    queryFn: tacticalAPI.getEvidenceLocker,
  })

  const evidence = evidenceResp?.data?.data || {}
  const items = evidence.evidenceItems || []

  const handleVerify = async () => {
    if (!selectedEvidence) return
    try {
      const resp = await tacticalAPI.verifyHash({
        evidenceId: selectedEvidence.id,
        hash: inputHash,
      })
      setVerificationResult(resp.data?.data)
      if (resp.data?.data?.verified) {
        toast.success('SHA-256 Hash matched! Evidence integrity cryptographically verified.')
      } else {
        toast.error('Hash mismatch! Integrity alert flagged.')
      }
    } catch (e) {
      toast.error('Verification failed')
    }
  }

  return (
    <Grid container spacing={3}>
      {/* Evidence Items Vault List */}
      <Grid item xs={12} lg={8}>
        <Box
          sx={{
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
            borderRadius: '22px',
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#202A3A', fontSize: '1.05rem' }}>
                Cryptographic Digital Evidence Vault
              </Typography>
              <Typography variant="caption" sx={{ color: '#5C6779', fontWeight: 600 }}>
                {evidence.courtStandard || 'Indian Evidence Act Section 65B & BSA 2023 Compliant'}
              </Typography>
            </Box>
            <Chip
              label={evidence.vaultIntegrity || '100% Cryptographically Verified'}
              size="small"
              sx={{ bgcolor: 'rgba(35, 155, 98, 0.15)', color: '#239B62', fontWeight: 800 }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map((item) => (
              <Box
                key={item.id}
                sx={{
                  bgcolor: 'var(--neu-surface, #E8ECF3)',
                  boxShadow: 'var(--neu-shadow-raised-sm, 3px 3px 8px #C7CDD7, -3px -3px 8px #FFFFFF)',
                  borderRadius: '16px',
                  p: 2.2,
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#356AE6' }}>
                        {item.id}
                      </Typography>
                      <Chip
                        label={item.firNumber}
                        size="small"
                        sx={{ bgcolor: 'rgba(53, 106, 230, 0.1)', color: '#356AE6', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                      />
                      <Chip
                        label={item.integrityStatus}
                        size="small"
                        sx={{ bgcolor: 'rgba(35, 155, 98, 0.15)', color: '#239B62', fontWeight: 800, fontSize: '0.65rem', height: 20 }}
                      />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#202A3A', mt: 0.5 }}>
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#7E8B9F', fontWeight: 600 }}>
                    {item.fileSizeMb} MB • {item.type}
                  </Typography>
                </Box>

                {/* Hash Box */}
                <Box
                  sx={{
                    bgcolor: 'var(--neu-surface, #E8ECF3)',
                    boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
                    borderRadius: '10px',
                    p: 1.2,
                    mb: 1.5,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#7E8B9F', fontWeight: 700, display: 'block', mb: 0.3 }}>
                    SHA-256 Cryptographic Checksum
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#202A3A', wordBreak: 'break-all', fontWeight: 600 }}>
                    {item.sha256Hash}
                  </Typography>
                </Box>

                {/* Chain of Custody Preview */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#5C6779', textTransform: 'uppercase', display: 'block', mb: 0.6 }}>
                    Chronological Chain of Custody Handlers
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                    {item.chainOfCustody?.map((c, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#239B62' }} />
                        <Typography variant="caption" sx={{ color: '#4B5565', fontWeight: 600 }}>
                          {c.date} — {c.action} by <strong>{c.handler}</strong> ({c.location})
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
                    onClick={() => {
                      setSelectedEvidence(item)
                      setInputHash(item.sha256Hash)
                      setVerifyDialogOpen(true)
                    }}
                    sx={{ color: '#239B62', fontWeight: 700, fontSize: '0.76rem', textTransform: 'none' }}
                  >
                    Verify Cryptographic Hash
                  </Button>

                  <Button
                    size="small"
                    variant="text"
                    startIcon={<QrIcon sx={{ fontSize: 14 }} />}
                    onClick={() => toast.success(`Generated Court Evidence Certificate for ${item.id}`)}
                    sx={{ color: '#356AE6', fontWeight: 700, fontSize: '0.76rem', textTransform: 'none' }}
                  >
                    Court-Admissible 65B Certificate
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>

      {/* Compliance & Chain of Custody Info */}
      <Grid item xs={12} lg={4}>
        <Box
          sx={{
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
            borderRadius: '22px',
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#202A3A', mb: 1 }}>
            Forensic Custody Integrity
          </Typography>
          <Typography variant="body2" sx={{ color: '#5C6779', fontSize: '0.82rem', mb: 2.5, lineHeight: 1.5 }}>
            All forensic artifacts registered in CrimeLens are sealed with non-repudiation SHA-256 digital digests. Any modification of a single byte invalidates court admissibility certificates.
          </Typography>

          <Box
            sx={{
              bgcolor: 'var(--neu-surface, #E8ECF3)',
              boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
              borderRadius: '16px',
              p: 2,
              mb: 2.5,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#356AE6', display: 'block', mb: 0.5 }}>
              LEGAL STANDARDS COMPLIANCE
            </Typography>
            <Typography variant="caption" sx={{ color: '#4B5565', display: 'block', mb: 0.5 }}>
              • Indian Evidence Act Section 65B(4)
            </Typography>
            <Typography variant="caption" sx={{ color: '#4B5565', display: 'block', mb: 0.5 }}>
              • Bharatiya Sakshya Adhiniyam (BSA) 2023
            </Typography>
            <Typography variant="caption" sx={{ color: '#4B5565', display: 'block' }}>
              • ISO/IEC 27037 Digital Evidence Forensics
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={() => toast.success('Exporting full custody ledger for legal counsel')}
            sx={{
              bgcolor: '#356AE6',
              borderRadius: '12px',
              py: 1.2,
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(53, 106, 230, 0.3)',
            }}
          >
            Export Complete Master Custody Ledger
          </Button>
        </Box>
      </Grid>

      {/* Verify Hash Modal */}
      <Dialog
        open={verifyDialogOpen}
        onClose={() => {
          setVerifyDialogOpen(false)
          setVerificationResult(null)
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'var(--neu-surface, #E8ECF3)',
            borderRadius: '20px',
            p: 1.5,
            boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#202A3A' }}>
          Cryptographic Hash Integrity Audit: {selectedEvidence?.id}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#5C6779', mb: 2 }}>
            Input the SHA-256 hash calculated by your forensic workstation to verify against the immutable server vault digest:
          </Typography>

          <TextField
            fullWidth
            size="small"
            label="SHA-256 Hash"
            value={inputHash}
            onChange={(e) => setInputHash(e.target.value)}
            InputProps={{
              sx: {
                bgcolor: 'var(--neu-surface, #E8ECF3)',
                boxShadow: 'var(--neu-shadow-inset-sm, inset 2px 2px 4px #CBD1DB, inset -2px -2px 4px #FFFFFF)',
                borderRadius: '12px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
              },
            }}
          />

          {verificationResult && (
            <Box
              sx={{
                mt: 2.5,
                p: 2,
                borderRadius: '14px',
                bgcolor: verificationResult.verified ? 'rgba(35, 155, 98, 0.12)' : 'rgba(217, 79, 85, 0.12)',
                border: `1px solid ${verificationResult.verified ? '#239B62' : '#D94F55'}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: verificationResult.verified ? '#239B62' : '#D94F55' }}>
                {verificationResult.integrityAudit}
              </Typography>
              <Typography variant="caption" sx={{ color: '#5C6779', display: 'block', mt: 0.5 }}>
                Timestamp: {verificationResult.timestamp}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setVerifyDialogOpen(false)
              setVerificationResult(null)
            }}
            sx={{ color: '#5C6779', fontWeight: 700 }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleVerify}
            sx={{ bgcolor: '#356AE6', fontWeight: 700, borderRadius: '10px' }}
          >
            Audit Hash Match
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
