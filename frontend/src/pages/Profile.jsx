import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  useTheme,
} from '@mui/material'
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { updateUser } from '../redux/slices/authSlice'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '../api/auth'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const Profile = () => {
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

  const neuInputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: bgSurface,
      boxShadow: insetShadow,
      borderRadius: 3,
      '& fieldset': { border: 'none' },
      '&:hover fieldset': { border: 'none' },
      '&.Mui-focused fieldset': { border: '1px solid #356AE6' },
      '& input': { color: textPrimary, fontSize: '0.9rem', py: 1.2 },
      '& textarea': { color: textPrimary, fontSize: '0.9rem' },
    },
    '& .MuiInputLabel-root': { color: textSecondary, fontWeight: 600, fontSize: '0.88rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#356AE6' },
    '& .MuiInputAdornment-root': { color: textSecondary },
  }

  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const { user } = useSelector((state) => state.auth)
  const [editMode, setEditMode] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [openChangePassword, setOpenChangePassword] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    bio: '',
    location: '',
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        inApp: true,
        sms: false,
      },
    },
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        designation: user.designation || '',
        bio: user.bio || '',
        location: user.location || '',
        preferences: user.preferences || {
          theme: 'light',
          notifications: {
            email: true,
            inApp: true,
            sms: false,
          },
        },
      })
    }
  }, [user])

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (response) => {
      const updatedUser = response.data?.data || response.data
      if (updatedUser) {
        dispatch(updateUser(updatedUser))
      }
      toast.success('Profile updated successfully')
      setEditMode(false)
      queryClient.invalidateQueries(['profile'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data) => authAPI.changePassword(data.oldPassword, data.newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully')
      setOpenChangePassword(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password')
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handlePreferenceChange = (category, field, value) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [category]: {
          ...formData.preferences[category],
          [field]: value,
        },
      },
    })
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    setLoading(true)
    updateProfileMutation.mutate(formData)
    setLoading(false)
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    const form = e.target
    const oldPassword = form.oldPassword.value
    const newPassword = form.newPassword.value
    const confirmPassword = form.confirmPassword.value

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    changePasswordMutation.mutate({ oldPassword, newPassword })
  }

  const getInitials = () => {
    return `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase()
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 1, sm: 2 }, pb: 5 }}>
      {/* Page Title */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h5" fontWeight={800} sx={{ color: textPrimary, letterSpacing: -0.3 }}>
          Officer Profile & Credentials
        </Typography>
        <Typography variant="body2" sx={{ color: textSecondary }}>
          Manage your verified police credentials, jurisdiction security settings, and notifications
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Neumorphic Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 4,
              textAlign: 'center',
              bgcolor: bgSurface,
              boxShadow: raisedShadow,
              border: `1px solid ${dividerColor}`,
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  component="label"
                  size="small"
                  sx={{
                    bgcolor: bgSurface,
                    boxShadow: raisedSubtle,
                    color: '#356AE6',
                    width: 36,
                    height: 36,
                    border: `1px solid ${dividerColor}`,
                    '&:hover': { bgcolor: bgSurface, boxShadow: insetShadow },
                  }}
                >
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  <PhotoCameraIcon sx={{ fontSize: 18 }} />
                </IconButton>
              }
            >
              <Avatar
                src={profileImage || user?.profileImage}
                sx={{
                  width: 110,
                  height: 110,
                  bgcolor: bgSurface,
                  boxShadow: raisedShadow,
                  color: '#356AE6',
                  fontSize: 42,
                  fontWeight: 800,
                  mb: 2,
                  mx: 'auto',
                  border: `3px solid ${bgSurface}`,
                }}
              >
                {getInitials()}
              </Avatar>
            </Badge>

            <Typography variant="h6" fontWeight={800} sx={{ color: textPrimary, mt: 1 }}>
              {formData.firstName} {formData.lastName}
            </Typography>

            <Chip
              label={user?.role?.displayName || user?.role || 'Investigation Officer'}
              size="small"
              sx={{
                mt: 1,
                bgcolor: 'rgba(53, 106, 230, 0.12)',
                color: '#356AE6',
                fontWeight: 700,
                fontSize: '0.72rem',
                borderRadius: 2,
              }}
            />

            <Typography variant="body2" sx={{ color: textSecondary, mt: 1, fontSize: '0.85rem' }}>
              {formData.email}
            </Typography>

            <Divider sx={{ my: 2.5, borderColor: dividerColor }} />

            <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: bgSurface, boxShadow: insetShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#356AE6' }}>
                  <PersonIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography variant="body2" sx={{ color: textPrimary, fontSize: '0.85rem', fontWeight: 600 }}>
                  {formData.designation || 'Special Cyber Investigator'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: bgSurface, boxShadow: insetShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#356AE6' }}>
                  <LocationIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography variant="body2" sx={{ color: textPrimary, fontSize: '0.85rem', fontWeight: 600 }}>
                  {formData.location || 'Bengaluru City HQ'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: bgSurface, boxShadow: insetShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#356AE6' }}>
                  <PhoneIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography variant="body2" sx={{ color: textPrimary, fontSize: '0.85rem', fontWeight: 600 }}>
                  {formData.phone || '+91 98450 12345'}
                </Typography>
              </Box>
            </Box>

            <Button
              variant={editMode ? 'outlined' : 'contained'}
              startIcon={<EditIcon />}
              onClick={() => setEditMode(!editMode)}
              fullWidth
              sx={{
                mt: 3,
                bgcolor: editMode ? bgSurface : '#356AE6',
                color: editMode ? textPrimary : '#fff',
                boxShadow: editMode ? insetShadow : '3px 3px 10px rgba(53, 106, 230, 0.4)',
                borderRadius: 3,
                py: 1,
                fontWeight: 700,
                textTransform: 'none',
                border: editMode ? `1px solid ${dividerColor}` : 'none',
                '&:hover': {
                  bgcolor: editMode ? bgSurface : '#254EBF',
                },
              }}
            >
              {editMode ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </Paper>
        </Grid>

        {/* Right Column - Neumorphic Tabs & Settings */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              bgcolor: bgSurface,
              boxShadow: raisedShadow,
              border: `1px solid ${dividerColor}`,
            }}
          >
            {/* Neumorphic Tab Bar */}
            <Box sx={{ p: 1.5, borderBottom: `1px solid ${dividerColor}` }}>
              <Tabs
                value={tabValue}
                onChange={(e, v) => setTabValue(v)}
                sx={{
                  '& .MuiTabs-indicator': { display: 'none' },
                  '& .MuiTab-root': {
                    minHeight: 40,
                    borderRadius: 3,
                    mr: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: textSecondary,
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      bgcolor: bgSurface,
                      boxShadow: insetShadow,
                      color: '#356AE6',
                      fontWeight: 800,
                    },
                  },
                }}
              >
                <Tab label="Account" icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                <Tab label="Security" icon={<SecurityIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                <Tab label="Notifications" icon={<NotificationsIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                <Tab label="Appearance" icon={<PaletteIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
              </Tabs>
            </Box>

            <Box sx={{ p: 3.5 }}>
              {/* Account Tab */}
              {tabValue === 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ color: textPrimary, mb: 0.5, fontSize: '1.05rem' }}>
                    Account Information
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
                    Primary police officer identification and contact information
                  </Typography>

                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!editMode}
                        sx={neuInputSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!editMode}
                        sx={neuInputSx}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        value={formData.email}
                        disabled
                        sx={neuInputSx}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!editMode}
                        sx={neuInputSx}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        disabled={!editMode}
                        multiline
                        rows={3}
                        sx={neuInputSx}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={!editMode}
                        sx={neuInputSx}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  {editMode && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 3.5, justifyContent: 'flex-end' }}>
                      <Button
                        onClick={() => setEditMode(false)}
                        sx={{
                          bgcolor: bgSurface,
                          boxShadow: raisedSubtle,
                          color: textSecondary,
                          borderRadius: 2.5,
                          px: 2.5,
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': { bgcolor: bgSurface, boxShadow: insetShadow },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={loading}
                        sx={{
                          bgcolor: '#356AE6',
                          color: '#fff',
                          borderRadius: 2.5,
                          px: 3,
                          fontWeight: 700,
                          textTransform: 'none',
                          boxShadow: '3px 3px 10px rgba(53, 106, 230, 0.4)',
                          '&:hover': { bgcolor: '#254EBF' },
                        }}
                      >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                      </Button>
                    </Box>
                  )}
                </motion.div>
              )}

              {/* Security Tab */}
              {tabValue === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ color: textPrimary, mb: 0.5, fontSize: '1.05rem' }}>
                    Security Settings
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
                    Password encryption and authentication access policies
                  </Typography>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3.5,
                      bgcolor: bgSurface,
                      boxShadow: raisedSubtle,
                      mb: 2.5,
                      border: `1px solid ${dividerColor}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ color: textPrimary }}>
                          Change Password
                        </Typography>
                        <Typography variant="caption" sx={{ color: textSecondary }}>
                          Update your encrypted account access key regularly
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<LockIcon />}
                        onClick={() => setOpenChangePassword(true)}
                        size="small"
                        sx={{
                          bgcolor: '#356AE6',
                          color: '#fff',
                          borderRadius: 2.5,
                          px: 2.5,
                          fontWeight: 700,
                          textTransform: 'none',
                          boxShadow: '3px 3px 8px rgba(53, 106, 230, 0.4)',
                          '&:hover': { bgcolor: '#254EBF' },
                        }}
                      >
                        Change
                      </Button>
                    </Box>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3.5,
                      bgcolor: bgSurface,
                      boxShadow: raisedSubtle,
                      border: `1px solid ${dividerColor}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ color: textPrimary }}>
                          Two-Factor Authentication (2FA)
                        </Typography>
                        <Typography variant="caption" sx={{ color: textSecondary }}>
                          Add biometric or SMS OTP layer to your station logins
                        </Typography>
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            color="primary"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#356AE6' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#356AE6' },
                            }}
                          />
                        }
                        label={<Typography variant="caption" fontWeight={700} sx={{ color: textPrimary }}>Enable</Typography>}
                      />
                    </Box>
                  </Paper>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {tabValue === 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ color: textPrimary, mb: 0.5, fontSize: '1.05rem' }}>
                    Notification Preferences
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
                    Configure dispatch triggers and real-time FIR alert channels
                  </Typography>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3.5,
                      bgcolor: bgSurface,
                      boxShadow: raisedSubtle,
                      border: `1px solid ${dividerColor}`,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: textPrimary, mb: 0.5 }}>
                      Email Notifications
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.preferences?.notifications?.email}
                          onChange={(e) =>
                            handlePreferenceChange('notifications', 'email', e.target.checked)
                          }
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#356AE6' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#356AE6' },
                          }}
                        />
                      }
                      label={<Typography variant="body2" sx={{ color: textPrimary, fontWeight: 500 }}>Receive statutory email briefings</Typography>}
                    />

                    <Divider sx={{ my: 2.5, borderColor: dividerColor }} />

                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: textPrimary, mb: 0.5 }}>
                      In-App Notifications
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.preferences?.notifications?.inApp}
                          onChange={(e) =>
                            handlePreferenceChange('notifications', 'inApp', e.target.checked)
                          }
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#356AE6' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#356AE6' },
                          }}
                        />
                      }
                      label={<Typography variant="body2" sx={{ color: textPrimary, fontWeight: 500 }}>Receive live high-risk radar notifications</Typography>}
                    />

                    <Divider sx={{ my: 2.5, borderColor: dividerColor }} />

                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: textPrimary, mb: 0.5 }}>
                      SMS Notifications
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.preferences?.notifications?.sms}
                          onChange={(e) =>
                            handlePreferenceChange('notifications', 'sms', e.target.checked)
                          }
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#356AE6' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#356AE6' },
                          }}
                        />
                      }
                      label={<Typography variant="body2" sx={{ color: textPrimary, fontWeight: 500 }}>Receive urgent field dispatch SMS alerts</Typography>}
                    />
                  </Paper>
                </motion.div>
              )}

              {/* Appearance Tab */}
              {tabValue === 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ color: textPrimary, mb: 0.5, fontSize: '1.05rem' }}>
                    Appearance Settings
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
                    Switch visual themes and tactile soft interface settings
                  </Typography>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3.5,
                      bgcolor: bgSurface,
                      boxShadow: raisedSubtle,
                      border: `1px solid ${dividerColor}`,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: textPrimary, mb: 2 }}>
                      System Display Theme
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {['light', 'dark', 'system'].map((th) => {
                        const isSelected = formData.preferences?.theme === th
                        return (
                          <Button
                            key={th}
                            onClick={() => handlePreferenceChange('theme', 'theme', th)}
                            sx={{
                              bgcolor: bgSurface,
                              boxShadow: isSelected ? insetShadow : raisedSubtle,
                              color: isSelected ? '#356AE6' : textPrimary,
                              borderRadius: 3,
                              px: 3,
                              py: 1,
                              textTransform: 'capitalize',
                              fontWeight: isSelected ? 800 : 600,
                              fontSize: '0.88rem',
                              border: `1px solid ${dividerColor}`,
                              '&:hover': { bgcolor: bgSurface },
                            }}
                          >
                            {th === 'system' ? 'System Default' : th}
                          </Button>
                        )
                      })}
                    </Box>
                  </Paper>
                </motion.div>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog
        open={openChangePassword}
        onClose={() => setOpenChangePassword(false)}
        maxWidth="sm"
        fullWidth
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: bgSurface, color: textPrimary }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LockIcon sx={{ color: '#356AE6' }} />
            <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.05rem' }}>Update Officer Password</Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setOpenChangePassword(false)}
            sx={{ bgcolor: bgSurface, boxShadow: raisedSubtle, color: textSecondary }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleChangePassword}>
          <DialogContent sx={{ bgcolor: bgSurface }}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              name="oldPassword"
              required
              sx={{ ...neuInputSx, mb: 2.5 }}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              name="newPassword"
              required
              sx={{ ...neuInputSx, mb: 2.5 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              name="confirmPassword"
              required
              sx={neuInputSx}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, bgcolor: bgSurface }}>
            <Button
              onClick={() => setOpenChangePassword(false)}
              sx={{
                bgcolor: bgSurface,
                boxShadow: raisedSubtle,
                color: textSecondary,
                borderRadius: 2.5,
                fontWeight: 600,
                textTransform: 'none',
                px: 2.5,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={changePasswordMutation.isLoading}
              sx={{
                bgcolor: '#356AE6',
                color: '#fff',
                borderRadius: 2.5,
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                boxShadow: '3px 3px 10px rgba(53, 106, 230, 0.4)',
                '&:hover': { bgcolor: '#254EBF' },
              }}
            >
              {changePasswordMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : 'Change Password'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default Profile