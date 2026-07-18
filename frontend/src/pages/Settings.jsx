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

const Settings = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [settings, setSettings] = useState({
    // General Settings
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    requireStrongPassword: true,

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    crimeAlerts: true,
    systemUpdates: true,
    reportNotifications: true,

    // Display Settings
    theme: 'light',
    compactMode: false,
    showAnimations: true,
    defaultView: 'dashboard',
    itemsPerPage: 10,

    // Data Settings
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 90,
    autoExport: false,
    exportFormat: 'json',

    // Integration Settings
    apiAccess: true,
    apiKey: '',
    webhookUrl: '',
    integrationEnabled: false,

    // Privacy Settings
    showOnlineStatus: true,
    shareAnalytics: false,
    allowCookies: true,
  })

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (data) => {
      // In production, save to backend
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true })
        }, 1000)
      })
    },
    onSuccess: () => {
      toast.success('Settings saved successfully')
    },
    onError: () => {
      toast.error('Failed to save settings')
    },
  })

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value })
  }

  const handleSave = () => {
    setLoading(true)
    saveSettingsMutation.mutate(settings)
    setLoading(false)
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
      label: 'General',
      icon: <LanguageIcon />,
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                label="Language"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">Hindi</MenuItem>
                <MenuItem value="kn">Kannada</MenuItem>
                <MenuItem value="ta">Tamil</MenuItem>
                <MenuItem value="te">Telugu</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Timezone</InputLabel>
              <Select
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                label="Timezone"
              >
                <MenuItem value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</MenuItem>
                <MenuItem value="Asia/Dubai">Asia/Dubai (UTC+4)</MenuItem>
                <MenuItem value="America/New_York">America/New_York (UTC-5)</MenuItem>
                <MenuItem value="Europe/London">Europe/London (UTC+0)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Date Format</InputLabel>
              <Select
                value={settings.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                label="Date Format"
              >
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Time Format</InputLabel>
              <Select
                value={settings.timeFormat}
                onChange={(e) => handleChange('timeFormat', e.target.value)}
                label="Time Format"
              >
                <MenuItem value="12h">12 Hour (AM/PM)</MenuItem>
                <MenuItem value="24h">24 Hour</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'security',
      label: 'Security',
      icon: <SecurityIcon />,
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                  color="primary"
                />
              }
              label="Two-Factor Authentication"
            />
            <Typography variant="caption" color="textSecondary" display="block">
              Add an extra layer of security to your account
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Session Timeout (minutes)</InputLabel>
              <Select
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                label="Session Timeout"
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
            <FormControl fullWidth>
              <InputLabel>Max Login Attempts</InputLabel>
              <Select
                value={settings.maxLoginAttempts}
                onChange={(e) => handleChange('maxLoginAttempts', e.target.value)}
                label="Max Login Attempts"
              >
                <MenuItem value={3}>3 attempts</MenuItem>
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
                  color="primary"
                />
              }
              label="Require Strong Password"
            />
            <Typography variant="caption" color="textSecondary" display="block">
              Enforce strong password requirements (8+ chars, uppercase, lowercase, number, special)
            </Typography>
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <NotificationsIcon />,
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  color="primary"
                />
              }
              label="Email Notifications"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.pushNotifications}
                  onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                  color="primary"
                />
              }
              label="Push Notifications"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.smsNotifications}
                  onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                  color="primary"
                />
              }
              label="SMS Notifications"
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.crimeAlerts}
                  onChange={(e) => handleChange('crimeAlerts', e.target.checked)}
                  color="primary"
                />
              }
              label="Crime Alerts"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.systemUpdates}
                  onChange={(e) => handleChange('systemUpdates', e.target.checked)}
                  color="primary"
                />
              }
              label="System Updates"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.reportNotifications}
                  onChange={(e) => handleChange('reportNotifications', e.target.checked)}
                  color="primary"
                />
              }
              label="Report Notifications"
            />
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'display',
      label: 'Display',
      icon: <PaletteIcon />,
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                label="Theme"
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="system">System Default</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.compactMode}
                  onChange={(e) => handleChange('compactMode', e.target.checked)}
                  color="primary"
                />
              }
              label="Compact Mode"
            />
            <Typography variant="caption" color="textSecondary" display="block">
              Reduce spacing and font sizes for more content density
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showAnimations}
                  onChange={(e) => handleChange('showAnimations', e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Animations"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Default View</InputLabel>
              <Select
                value={settings.defaultView}
                onChange={(e) => handleChange('defaultView', e.target.value)}
                label="Default View"
              >
                <MenuItem value="dashboard">Dashboard</MenuItem>
                <MenuItem value="crimes">Crimes</MenuItem>
                <MenuItem value="map">Map</MenuItem>
                <MenuItem value="network">Network</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Items Per Page</InputLabel>
              <Select
                value={settings.itemsPerPage}
                onChange={(e) => handleChange('itemsPerPage', e.target.value)}
                label="Items Per Page"
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'data',
      label: 'Data & Backup',
      icon: <DataIcon />,
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoBackup}
                  onChange={(e) => handleChange('autoBackup', e.target.checked)}
                  color="primary"
                />
              }
              label="Auto Backup"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Backup Frequency</InputLabel>
              <Select
                value={settings.backupFrequency}
                onChange={(e) => handleChange('backupFrequency', e.target.value)}
                label="Backup Frequency"
              >
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Data Retention (days)</InputLabel>
              <Select
                value={settings.dataRetention}
                onChange={(e) => handleChange('dataRetention', e.target.value)}
                label="Data Retention"
              >
                <MenuItem value={30}>30 days</MenuItem>
                <MenuItem value={90}>90 days</MenuItem>
                <MenuItem value={180}>180 days</MenuItem>
                <MenuItem value={365}>1 year</MenuItem>
                <MenuItem value={730}>2 years</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoExport}
                  onChange={(e) => handleChange('autoExport', e.target.checked)}
                  color="primary"
                />
              }
              label="Auto Export Reports"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={settings.exportFormat}
                onChange={(e) => handleChange('exportFormat', e.target.value)}
                label="Export Format"
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="outlined" startIcon={<BackupIcon />}>
                Create Backup Now
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => setShowExportDialog(true)}>
                Export All Data
              </Button>
            </Box>
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <IntegrationIcon />,
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.integrationEnabled}
                  onChange={(e) => handleChange('integrationEnabled', e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Integrations"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>API Access</InputLabel>
              <Select
                value={settings.apiAccess}
                onChange={(e) => handleChange('apiAccess', e.target.value)}
                label="API Access"
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
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Button onClick={handleGenerateApiKey} size="small">
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
              placeholder="https://your-service.com/webhook"
              value={settings.webhookUrl}
              onChange={(e) => handleChange('webhookUrl', e.target.value)}
            />
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: <ShieldIcon />,
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showOnlineStatus}
                  onChange={(e) => handleChange('showOnlineStatus', e.target.checked)}
                  color="primary"
                />
              }
              label="Show Online Status"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.shareAnalytics}
                  onChange={(e) => handleChange('shareAnalytics', e.target.checked)}
                  color="primary"
                />
              }
              label="Share Anonymous Analytics"
            />
            <Typography variant="caption" color="textSecondary" display="block">
              Help us improve by sharing usage data (completely anonymous)
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowCookies}
                  onChange={(e) => handleChange('allowCookies', e.target.checked)}
                  color="primary"
                />
              }
              label="Allow Cookies"
            />
          </Grid>
        </Grid>
      ),
    },
  ]

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Settings
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Configure your application preferences
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setShowResetDialog(true)}
          >
            Reset Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Settings'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Settings Sections */}
        {sections.map((section, index) => (
          <Grid item xs={12} key={section.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: 'rgba(26, 35, 126, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1a237e',
                    }}
                  >
                    {section.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    {section.label}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                {section.content}
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Reset Dialog */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
            <WarningIcon />
            Reset All Settings?
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            This will reset all settings to their default values. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
          <Button onClick={handleReset} variant="contained" color="error">
            Reset All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
        <DialogTitle>Export All Data</DialogTitle>
        <DialogContent>
          <Typography>
            This will export all your data including crimes, suspects, victims, and cases.
            The export will be sent to your email as a zip file.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={settings.exportFormat}
                onChange={(e) => handleChange('exportFormat', e.target.value)}
                label="Export Format"
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
          <Button onClick={handleExportData} variant="contained" sx={{ bgcolor: '#1a237e' }}>
            Export Data
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={saveSettingsMutation.isSuccess}
        autoHideDuration={3000}
        onClose={() => saveSettingsMutation.reset()}
      >
        <Alert severity="success">Settings saved successfully!</Alert>
      </Snackbar>
    </Box>
  )
}

export default Settings