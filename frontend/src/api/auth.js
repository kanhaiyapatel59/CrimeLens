import axios from './axios'

export const authAPI = {
  login: (email, password) => {
    console.log('📤 Sending login request for:', email)
    return axios.post('/api/auth/login', { email, password })
  },
  
  register: (data) => {
    console.log('📤 Sending register request for:', data.email)
    return axios.post('/api/auth/register', data)
  },
  
  logout: () => {
    console.log('📤 Sending logout request')
    return axios.post('/api/auth/logout')
  },
  
  refreshToken: (refreshToken) => {
    console.log('📤 Refreshing token')
    return axios.post('/api/auth/refresh-token', { refreshToken })
  },
  
  verifyEmail: (token) =>
    axios.post('/api/auth/verify-email', { token }),
  
  requestPasswordReset: (email) =>
    axios.post('/api/auth/request-password-reset', { email }),
  
  resetPassword: (token, newPassword) =>
    axios.post('/api/auth/reset-password', { token, newPassword }),
  
  changePassword: (oldPassword, newPassword) =>
    axios.post('/api/auth/change-password', { oldPassword, newPassword }),
  
  getProfile: () => {
    console.log('📤 Fetching profile')
    return axios.get('/api/auth/profile')
  },
  
  updateProfile: (data) =>
    axios.put('/api/auth/profile', data),
  
  getLogs: (page = 1, limit = 20) =>
    axios.get(`/api/auth/logs?page=${page}&limit=${limit}`),
}