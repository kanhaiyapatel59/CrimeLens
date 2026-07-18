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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '../api/auth'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const Profile = () => {
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
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 2 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Profile Settings
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
        Manage your account settings and preferences
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column - Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  component="label"
                  sx={{
                    bgcolor: '#1a237e',
                    color: '#fff',
                    '&:hover': { bgcolor: '#283593' },
                    width: 36,
                    height: 36,
                  }}
                >
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  <PhotoCameraIcon sx={{ fontSize: 20 }} />
                </IconButton>
              }
            >
              <Avatar
                src={profileImage || user?.profileImage}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: '#1a237e',
                  fontSize: 48,
                  fontWeight: 700,
                  mb: 2,
                  mx: 'auto',
                }}
              >
                {getInitials()}
              </Avatar>
            </Badge>

            <Typography variant="h6" fontWeight={600}>
              {formData.firstName} {formData.lastName}
            </Typography>
            <Chip
              label={user?.role?.displayName || 'User'}
              size="small"
              color="primary"
              sx={{ mt: 1 }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {formData.email}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PersonIcon sx={{ fontSize: 18 }} />
                {formData.designation || 'No designation set'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationIcon sx={{ fontSize: 18 }} />
                {formData.location || 'No location set'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 18 }} />
                {formData.phone || 'No phone set'}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(!editMode)}
              fullWidth
              sx={{
                mt: 2,
                bgcolor: '#1a237e',
                '&:hover': { bgcolor: '#283593' },
              }}
            >
              {editMode ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </Paper>
        </Grid>

        {/* Right Column - Settings */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Account" icon={<PersonIcon />} iconPosition="start" />
              <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
              <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
              <Tab label="Appearance" icon={<PaletteIcon />} iconPosition="start" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* Account Tab */}
              {tabValue === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Account Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!editMode}
                        variant="outlined"
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
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        value={formData.email}
                        disabled
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon />
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
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon />
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
                        variant="outlined"
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
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  {editMode && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                      <Button variant="outlined" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={loading}
                        sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                      </Button>
                    </Box>
                  )}
                </motion.div>
              )}

              {/* Security Tab */}
              {tabValue === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Security Settings
                  </Typography>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>
                            Change Password
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Update your account password regularly
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          startIcon={<LockIcon />}
                          onClick={() => setOpenChangePassword(true)}
                          sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
                        >
                          Change
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>
                            Two-Factor Authentication
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Add an extra layer of security to your account
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={<Switch color="primary" />}
                          label="Enable"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {tabValue === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Notification Preferences
                  </Typography>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                        Email Notifications
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.preferences?.notifications?.email}
                            onChange={(e) =>
                              handlePreferenceChange('notifications', 'email', e.target.checked)
                            }
                            color="primary"
                          />
                        }
                        label="Receive email notifications"
                      />
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                        In-App Notifications
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.preferences?.notifications?.inApp}
                            onChange={(e) =>
                              handlePreferenceChange('notifications', 'inApp', e.target.checked)
                            }
                            color="primary"
                          />
                        }
                        label="Receive in-app notifications"
                      />
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                        SMS Notifications
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.preferences?.notifications?.sms}
                            onChange={(e) =>
                              handlePreferenceChange('notifications', 'sms', e.target.checked)
                            }
                            color="primary"
                          />
                        }
                        label="Receive SMS notifications"
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Appearance Tab */}
              {tabValue === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Appearance Settings
                  </Typography>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                        Theme
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                          variant={formData.preferences?.theme === 'light' ? 'contained' : 'outlined'}
                          onClick={() =>
                            handlePreferenceChange('theme', 'theme', 'light')
                          }
                          sx={{
                            bgcolor: formData.preferences?.theme === 'light' ? '#1a237e' : 'transparent',
                            '&:hover': { bgcolor: formData.preferences?.theme === 'light' ? '#283593' : '' },
                          }}
                        >
                          Light
                        </Button>
                        <Button
                          variant={formData.preferences?.theme === 'dark' ? 'contained' : 'outlined'}
                          onClick={() =>
                            handlePreferenceChange('theme', 'theme', 'dark')
                          }
                          sx={{
                            bgcolor: formData.preferences?.theme === 'dark' ? '#1a237e' : 'transparent',
                            '&:hover': { bgcolor: formData.preferences?.theme === 'dark' ? '#283593' : '' },
                          }}
                        >
                          Dark
                        </Button>
                        <Button
                          variant={formData.preferences?.theme === 'system' ? 'contained' : 'outlined'}
                          onClick={() =>
                            handlePreferenceChange('theme', 'theme', 'system')
                          }
                          sx={{
                            bgcolor: formData.preferences?.theme === 'system' ? '#1a237e' : 'transparent',
                            '&:hover': { bgcolor: formData.preferences?.theme === 'system' ? '#283593' : '' },
                          }}
                        >
                          System Default
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
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
      >
        <DialogTitle>
          Change Password
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setOpenChangePassword(false)}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleChangePassword}>
          <DialogContent>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              name="oldPassword"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              name="newPassword"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              name="confirmPassword"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenChangePassword(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={changePasswordMutation.isLoading}
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
            >
              {changePasswordMutation.isLoading ? <CircularProgress size={24} /> : 'Change Password'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default Profile