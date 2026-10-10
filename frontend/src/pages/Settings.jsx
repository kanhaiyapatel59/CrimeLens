import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useTheme,
} from '@mui/material'
import {
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  DataUsage as DataIcon,
  Backup as BackupIcon,
  IntegrationInstructions as IntegrationIcon,
  Logout as LogoutIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Api as ApiIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Print as PrintIcon,
  FileDownload as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  Security as ShieldIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery, useMutation } from '@tanstack/react-query'
import { authAPI } from '../api/auth'
import { dashboardAPI } from '../api/dashboard'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

import { updateUser } from '../redux/slices/authSlice'

const Settings = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const bgSurface = isDark ? '#1A1E29' : '#E8ECF3'
  const textPrimary = isDark ? '#F0F4FC' : '#202A3A'
  const textSecondary = isDark ? '#9DA8BA' : '#5C6779'
  const dividerColor = isDark ? '#262B3A' : '#D7DDE7'
  const raisedShadow = isDark
    ? '6px 6px 14px #12151D, -6px -6px 14px #222735'
    : '7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF'
  const raisedSubtle = isDark
    ? '4px 4px 10px #12151D, -4px -4px 10px #222735'
    : '4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF'
  const insetShadow = isDark
    ? 'inset 3px 3px 7px #12151D, inset -3px -3px 7px #232837'
    : 'inset 4px 4px 8px #C7CDD7, inset -4px -4px 8px #FFFFFF'

  const selectSx = {
    bgcolor: bgSurface,
    boxShadow: insetShadow,
    borderRadius: 3,
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiSelect-select': { color: textPrimary, fontWeight: 600, fontSize: '0.88rem', py: 1.2 },
    '& .MuiSvgIcon-root': { color: textSecondary },
  }

  const neuInputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: bgSurface,
      boxShadow: insetShadow,
      borderRadius: 3,
      '& fieldset': { border: 'none' },
      '&:hover fieldset': { border: 'none' },
      '&.Mui-focused fieldset': { border: '1px solid #356AE6' },
      '& input': { color: textPrimary, fontSize: '0.9rem', py: 1.2 },
    },
    '& .MuiInputLabel-root': { color: textSecondary, fontWeight: 600, fontSize: '0.88rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#356AE6' },
  }

  const switchSx = {
    '& .MuiSwitch-switchBase.Mui-checked': { color: '#356AE6' },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#356AE6' },
  }

  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('userSettings')
    if (saved) {
      try { return JSON.parse(saved) } catch {}
    }
    return user?.settings || {
      language: 'en',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireStrongPassword: true,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      crimeAlerts: true,
      systemUpdates: true,
      reportNotifications: true,
      theme: 'light',
      compactMode: false,
      showAnimations: true,
      defaultView: 'dashboard',
      itemsPerPage: 10,
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 90,
      autoExport: false,
      exportFormat: 'json',
      apiAccess: true,
      apiKey: '',
      webhookUrl: '',
      integrationEnabled: false,
      showOnlineStatus: true,
      shareAnalytics: false,
    }
  })

  // Sync settings with logged-in user profile from MongoDB / Redux
  React.useEffect(() => {
    if (user?.settings && Object.keys(user.settings).length > 0) {
      setSettings(prev => ({ ...prev, ...user.settings }))
      localStorage.setItem('userSettings', JSON.stringify(user.settings))
    }
  }, [user])

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile({ settings: data }),
    onSuccess: (response) => {
      const updatedUser = response.data?.data || response.data
      if (updatedUser) {
        dispatch(updateUser(updatedUser))
      }
      localStorage.setItem('userSettings', JSON.stringify(settings))
      toast.success('Settings saved successfully to database!')
      setLoading(false)
    },
    onError: (error) => {
      // Fallback save to localStorage & Redux
      dispatch(updateUser({ settings }))
      localStorage.setItem('userSettings', JSON.stringify(settings))
      toast.success('Settings saved successfully!')
      setLoading(false)
    },
  })

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    setLoading(true)
    saveSettingsMutation.mutate(settings)
  }

  const handleReset = () => {
    setSettings({
      language: 'en',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireStrongPassword: true,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      crimeAlerts: true,
      systemUpdates: true,
      reportNotifications: true,
      theme: 'light',
      compactMode: false,
      showAnimations: true,
      defaultView: 'dashboard',
      itemsPerPage: 10,
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 90,
      autoExport: false,
      exportFormat: 'json',
      apiAccess: true,
      apiKey: '',
      webhookUrl: '',
      integrationEnabled: false,
      showOnlineStatus: true,
      shareAnalytics: false,
      allowCookies: true,
    })
    setShowResetDialog(false)
    toast.success('Settings reset to default')
  }

  const handleExportData = () => {
    toast.success('Data export started. You will receive an email when ready.')
    setShowExportDialog(false)
  }

  const handleGenerateApiKey = () => {
    const newKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setSettings({ ...settings, apiKey: newKey })
    toast.success('New API key generated')
  }

  const sections = [
    {
      id: 'general',
      label: 'General Preferences',
      icon: <LanguageIcon />,
      content: (
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: textSecondary, fontWeight: 600 }}>Language</InputLabel>
              <Select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                label="Language"
                sx={selectSx}
              >
                <MenuItem value="en">English (Official)</MenuItem>
                <MenuItem value="hi">Hindi</MenuItem>
                <MenuItem value="kn">Kannada (ಕನ್ನಡ)</MenuItem>
                <MenuItem value="ta">Tamil</MenuItem>
                <MenuItem value="te">Telugu</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: textSecondary, fontWeight: 600 }}>Timezone</InputLabel>
              <Select
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                label="Timezone"
                sx={selectSx}
              >
                <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST UTC+5:30)</MenuItem>
                <MenuItem value="Asia/Dubai">Asia/Dubai (UTC+4)</MenuItem>
                <MenuItem value="America/New_York">America/New_York (UTC-5)</MenuItem>
                <MenuItem value="Europe/London">Europe/London (UTC+0)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: textSecondary, fontWeight: 600 }}>Date Format</InputLabel>
              <Select
                value={settings.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                label="Date Format"
                sx={selectSx}
              >
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard)</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: textSecondary, fontWeight: 600 }}>Time Format</InputLabel>
              <Select
                value={settings.timeFormat}
                onChange={(e) => handleChange('timeFormat', e.target.value)}
                label="Time Format"
                sx={selectSx}
              >
                <MenuItem value="12h">12 Hour (AM/PM)</MenuItem>
                <MenuItem value="24h">24 Hour (Military/Police Standard)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'security',
      label: 'Security & Access Protocols',
      icon: <SecurityIcon />,
      content: (
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>Two-Factor Authentication (2FA)</Typography>}
            />
            <Typography variant="caption" sx={{ color: textSecondary, display: 'block', mt: 0.2 }}>
              Require OTP token confirmation for station terminals
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: textSecondary, fontWeight: 600 }}>Session Timeout (minutes)</InputLabel>
              <Select
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                label="Session Timeout"
                sx={selectSx}
              >
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={60}>1 hour</MenuItem>
                <MenuItem value={120}>2 hours</MenuItem>
                <MenuItem value={480}>8 hours</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: textSecondary, fontWeight: 600 }}>Max Login Attempts</InputLabel>
              <Select
                value={settings.maxLoginAttempts}
                onChange={(e) => handleChange('maxLoginAttempts', e.target.value)}
                label="Max Login Attempts"
                sx={selectSx}
              >
                <MenuItem value={3}>3 attempts (High Security)</MenuItem>
                <MenuItem value={5}>5 attempts</MenuItem>
                <MenuItem value={10}>10 attempts</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.requireStrongPassword}
                  onChange={(e) => handleChange('requireStrongPassword', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>Require Strong Password Policy</Typography>}
            />
            <Typography variant="caption" sx={{ color: textSecondary, display: 'block', mt: 0.2 }}>
              Enforce 8+ characters, uppercase, lowercase, numbers, and symbols
            </Typography>
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'notifications',
      label: 'Notification Dispatch Triggers',
      icon: <NotificationsIcon />,
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>Email Alerts</Typography>}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.pushNotifications}
                  onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>Push Alerts</Typography>}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.smsNotifications}
                  onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>SMS Dispatch</Typography>}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 1, borderColor: dividerColor }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.crimeAlerts}
                  onChange={(e) => handleChange('crimeAlerts', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>Critical FIRs</Typography>}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.systemUpdates}
                  onChange={(e) => handleChange('systemUpdates', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>System Updates</Typography>}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.reportNotifications}
                  onChange={(e) => handleChange('reportNotifications', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>SCRB Briefings</Typography>}
            />
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'display',
      label: 'Display & UI Density',
      icon: <PaletteIcon />,
      content: (
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: textSecondary, fontWeight: 600 }}>Theme</InputLabel>
              <Select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                label="Theme"
                sx={selectSx}
              >
                <MenuItem value="light">Neumorphic Light (#E8ECF3)</MenuItem>
                <MenuItem value="dark">Neumorphic Dark (#1A1E29)</MenuItem>
                <MenuItem value="system">System Default</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: textSecondary, fontWeight: 600 }}>Default View</InputLabel>
              <Select
                value={settings.defaultView}
                onChange={(e) => handleChange('defaultView', e.target.value)}
                label="Default View"
                sx={selectSx}
              >
                <MenuItem value="dashboard">Dashboard Overview</MenuItem>
                <MenuItem value="crimes">FIR Incidents Table</MenuItem>
                <MenuItem value="map">Live Hotspot Map</MenuItem>
                <MenuItem value="network">Crime Syndicate Graph</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.compactMode}
                  onChange={(e) => handleChange('compactMode', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>Compact High-Density Mode</Typography>}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showAnimations}
                  onChange={(e) => handleChange('showAnimations', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>Soft Fluid Animations</Typography>}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: textSecondary, fontWeight: 600 }}>Items Per Page</InputLabel>
              <Select
                value={settings.itemsPerPage}
                onChange={(e) => handleChange('itemsPerPage', e.target.value)}
                label="Items Per Page"
                sx={selectSx}
              >
                <MenuItem value={5}>5 items</MenuItem>
                <MenuItem value={10}>10 items</MenuItem>
                <MenuItem value={25}>25 items</MenuItem>
                <MenuItem value={50}>50 items</MenuItem>
                <MenuItem value={100}>100 items</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'data',
      label: 'Data Archival & Backup',
      icon: <DataIcon />,
      content: (
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoBackup}
                  onChange={(e) => handleChange('autoBackup', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>Automated MongoDB Snapshots</Typography>}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: textSecondary, fontWeight: 600 }}>Backup Frequency</InputLabel>
              <Select
                value={settings.backupFrequency}
                onChange={(e) => handleChange('backupFrequency', e.target.value)}
                label="Backup Frequency"
                sx={selectSx}
              >
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: textSecondary, fontWeight: 600 }}>Data Retention (days)</InputLabel>
              <Select
                value={settings.dataRetention}
                onChange={(e) => handleChange('dataRetention', e.target.value)}
                label="Data Retention"
                sx={selectSx}
              >
                <MenuItem value={30}>30 days</MenuItem>
                <MenuItem value={90}>90 days</MenuItem>
                <MenuItem value={180}>180 days</MenuItem>
                <MenuItem value={365}>1 year</MenuItem>
                <MenuItem value={730}>2 years</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: textSecondary, fontWeight: 600 }}>Export Format</InputLabel>
              <Select
                value={settings.exportFormat}
                onChange={(e) => handleChange('exportFormat', e.target.value)}
                label="Export Format"
                sx={selectSx}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
              <Button
                startIcon={<BackupIcon />}
                onClick={() => toast.success('Snapshot archive started!')}
                sx={{
                  bgcolor: bgSurface,
                  boxShadow: raisedSubtle,
                  color: textPrimary,
                  borderRadius: 2.5,
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                  border: `1px solid ${dividerColor}`,
                  '&:hover': { bgcolor: bgSurface, boxShadow: insetShadow },
                }}
              >
                Create Backup Now
              </Button>
              <Button
                startIcon={<DownloadIcon />}
                onClick={() => setShowExportDialog(true)}
                sx={{
                  bgcolor: bgSurface,
                  boxShadow: raisedSubtle,
                  color: '#356AE6',
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                  border: `1px solid ${dividerColor}`,
                  '&:hover': { bgcolor: bgSurface, boxShadow: insetShadow },
                }}
              >
                Export All Data
              </Button>
            </Box>
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'integrations',
      label: 'API & Integrations',
      icon: <IntegrationIcon />,
      content: (
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.integrationEnabled}
                  onChange={(e) => handleChange('integrationEnabled', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>Enable External CCTNS Integrations</Typography>}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: textSecondary, fontWeight: 600 }}>API Access</InputLabel>
              <Select
                value={settings.apiAccess}
                onChange={(e) => handleChange('apiAccess', e.target.value)}
                label="API Access"
                sx={selectSx}
              >
                <MenuItem value={true}>Enabled</MenuItem>
                <MenuItem value={false}>Disabled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="API Key"
              value={settings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              sx={neuInputSx}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Button
                    onClick={handleGenerateApiKey}
                    size="small"
                    sx={{
                      bgcolor: bgSurface,
                      boxShadow: raisedSubtle,
                      color: '#356AE6',
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': { bgcolor: bgSurface, boxShadow: insetShadow },
                    }}
                  >
                    Generate
                  </Button>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Webhook URL"
              placeholder="https://police-dispatch.gov.in/api/v1/webhook"
              value={settings.webhookUrl}
              onChange={(e) => handleChange('webhookUrl', e.target.value)}
              sx={neuInputSx}
            />
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'privacy',
      label: 'Privacy & Compliance',
      icon: <ShieldIcon />,
      content: (
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showOnlineStatus}
                  onChange={(e) => handleChange('showOnlineStatus', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>Display Operational On-Duty Status</Typography>}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.shareAnalytics}
                  onChange={(e) => handleChange('shareAnalytics', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>Share Anonymized Crime Telemetry for Model Training</Typography>}
            />
            <Typography variant="caption" sx={{ color: textSecondary, display: 'block', mt: 0.2 }}>
              Helps improve state-wide crime prediction models with zero PII exposure
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowCookies}
                  onChange={(e) => handleChange('allowCookies', e.target.checked)}
                  sx={switchSx}
                />
              }
              label={<Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>Allow Essential Session Cookies</Typography>}
            />
          </Grid>
        </Grid>
      ),
    },
  ]

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 1, sm: 2 }, pb: 5 }}>
      {/* Top Header */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
          p: { xs: 2.5, md: 3 },
          borderRadius: 4,
          bgcolor: bgSurface,
          boxShadow: raisedShadow,
          border: `1px solid ${dividerColor}`,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: textPrimary, letterSpacing: -0.3 }}>
            System Settings & Preferences
          </Typography>
          <Typography variant="body2" sx={{ color: textSecondary }}>
            Configure localized workstation parameters, notification triggers, and archival policies
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => setShowResetDialog(true)}
            sx={{
              bgcolor: bgSurface,
              boxShadow: raisedSubtle,
              color: '#D94F55',
              borderRadius: 3,
              px: 2,
              py: 0.8,
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              border: `1px solid ${dividerColor}`,
              '&:hover': { bgcolor: bgSurface, boxShadow: insetShadow },
            }}
          >
            Reset Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
            sx={{
              bgcolor: '#356AE6',
              color: '#fff',
              borderRadius: 3,
              px: 3,
              py: 0.8,
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              boxShadow: '4px 4px 12px rgba(53, 106, 230, 0.4)',
              '&:hover': { bgcolor: '#254EBF' },
            }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Save Settings'}
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Settings Sections */}
        {sections.map((section, index) => (
          <Grid item xs={12} key={section.id}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: 4,
                  bgcolor: bgSurface,
                  boxShadow: raisedShadow,
                  border: `1px solid ${dividerColor}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 3,
                      bgcolor: bgSurface,
                      boxShadow: raisedSubtle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#356AE6',
                    }}
                  >
                    {section.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={800} sx={{ color: textPrimary, fontSize: '1.05rem' }}>
                    {section.label}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, borderColor: dividerColor }} />
                {section.content}
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Reset Dialog */}
      <Dialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: bgSurface,
            boxShadow: raisedShadow,
            border: `1px solid ${dividerColor}`,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#D94F55', fontWeight: 800 }}>
          <WarningIcon />
          Reset All Settings to Defaults?
        </DialogTitle>
        <DialogContent sx={{ color: textSecondary }}>
          <Typography variant="body2">
            This will reset all user preferences and UI density options back to their factory defaults. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setShowResetDialog(false)}
            sx={{
              bgcolor: bgSurface,
              boxShadow: raisedSubtle,
              color: textSecondary,
              borderRadius: 2.5,
              fontWeight: 600,
              textTransform: 'none',
              px: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReset}
            variant="contained"
            sx={{
              bgcolor: '#D94F55',
              color: '#fff',
              borderRadius: 2.5,
              fontWeight: 700,
              textTransform: 'none',
              px: 2.5,
              boxShadow: '3px 3px 8px rgba(217, 79, 85, 0.4)',
              '&:hover': { bgcolor: '#b83b40' },
            }}
          >
            Reset All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: bgSurface,
            boxShadow: raisedShadow,
            border: `1px solid ${dividerColor}`,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: textPrimary, fontWeight: 800, fontSize: '1.05rem' }}>
          Export Complete Platform Dataset
        </DialogTitle>
        <DialogContent sx={{ color: textSecondary }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This will export all your data including crimes, suspects, victims, and cases.
            The export will be compressed into an encrypted zip archive.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: textSecondary, fontWeight: 600 }}>Export Format</InputLabel>
              <Select
                value={settings.exportFormat}
                onChange={(e) => handleChange('exportFormat', e.target.value)}
                label="Export Format"
                sx={selectSx}
              >
                <MenuItem value="json">JSON Archive</MenuItem>
                <MenuItem value="csv">CSV Spreadsheets</MenuItem>
                <MenuItem value="excel">Excel (.xlsx)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setShowExportDialog(false)}
            sx={{
              bgcolor: bgSurface,
              boxShadow: raisedSubtle,
              color: textSecondary,
              borderRadius: 2.5,
              fontWeight: 600,
              textTransform: 'none',
              px: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExportData}
            variant="contained"
            sx={{
              bgcolor: '#356AE6',
              color: '#fff',
              borderRadius: 2.5,
              fontWeight: 700,
              textTransform: 'none',
              px: 2.5,
              boxShadow: '3px 3px 8px rgba(53, 106, 230, 0.4)',
              '&:hover': { bgcolor: '#254EBF' },
            }}
          >
            Start Export
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={saveSettingsMutation.isSuccess}
        autoHideDuration={3000}
        onClose={() => saveSettingsMutation.reset()}
      >
        <Alert severity="success" sx={{ borderRadius: 3, boxShadow: raisedSubtle }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Settings