import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - ADD TOKEN
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    
    console.log(`[axios] ${config.method?.toUpperCase()} ${config.url}`)
    console.log('[axios] token exists?', !!token)
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('[axios] ✅ Token added to headers')
    } else {
      console.log('[axios] ⚠️ No token found')
    }
    
    return config
  },
  (error) => {
    console.error('[axios] Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[axios] ✅ ${response.status} ${response.config.url}`)
    return response
  },
  async (error) => {
    console.error('[axios] Response error:', error.response?.status, error.config?.url)
    
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      console.log('[axios] 🔄 Attempting token refresh...')

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          console.log('[axios] ❌ No refresh token')
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
          refreshToken,
        })

        const { accessToken } = response.data.data
        localStorage.setItem('accessToken', accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        
        console.log('[axios] ✅ Token refreshed successfully')
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        console.log('[axios] ❌ Refresh failed, redirecting to login')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        
        toast.error('Session expired. Please login again.')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    const message = error.response?.data?.message || error.message || 'Something went wrong'
    if (error.response?.status !== 401) {
      toast.error(message)
    }

    // IMPORTANT: do not force reload/redirect here for bulk import errors.
    // axios interceptor already handles 401 (session expired) explicitly.
    return Promise.reject(error)
  }
)

export default axiosInstance