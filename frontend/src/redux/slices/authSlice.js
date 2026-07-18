import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../api/auth'
import toast from 'react-hot-toast'

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('🔐 Login attempt for:', email)
      
      const response = await authAPI.login(email, password)
      console.log('📦 Login response:', response.data)
      
      const { user, accessToken, refreshToken } = response.data.data
      
      console.log('🎫 Access Token received:', accessToken ? 'YES' : 'NO')
      console.log('🎫 Token preview:', accessToken?.substring(0, 30) + '...')
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Verify storage
      console.log('💾 Token stored in localStorage:', !!localStorage.getItem('accessToken'))
      
      toast.success('Welcome back!')
      return user
    } catch (error) {
      console.error('❌ Login error:', error)
      toast.error(error.response?.data?.message || 'Login failed')
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(data)
      toast.success('Registration successful! Please verify your email.')
      return response.data.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout()
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      toast.success('Logged out successfully')
      return null
    } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const getProfile = createAsyncThunk(
  'auth/profile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    restoreSession: (state) => {
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('accessToken')
      
      console.log('[auth-debug] accessToken exists?', !!token)
      console.log('[auth-debug] user exists?', !!user)
      
      if (user && token) {
        state.user = JSON.parse(user)
        state.isAuthenticated = true
        console.log('[auth-debug] Session restored successfully')
      } else {
        console.log('[auth-debug] No session to restore')
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
        console.log('✅ Login fulfilled, user set:', !!state.user)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        console.log('❌ Login rejected:', action.payload)
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
      // Profile
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
  },
})

export const { clearError, restoreSession } = authSlice.actions
export default authSlice.reducer