import React, { createContext, useState, useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, logoutUser, getProfile, restoreSession } from '../redux/slices/authSlice'

// Create context
const AuthContext = createContext(null)

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch()
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth)
  const [initialized, setInitialized] = useState(false)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      dispatch(restoreSession())
      dispatch(getProfile())
    }
    setInitialized(true)
  }, [dispatch])

  // Login function
  const login = async (email, password) => {
    try {
      const result = await dispatch(loginUser({ email, password }))
      if (result.meta.requestStatus === 'fulfilled') {
        return { success: true, data: result.payload }
      } else {
        return { success: false, error: result.payload }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await dispatch(logoutUser())
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      const result = await dispatch(registerUser(userData))
      if (result.meta.requestStatus === 'fulfilled') {
        return { success: true, data: result.payload }
      } else {
        return { success: false, error: result.payload }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Get current user
  const getCurrentUser = async () => {
    try {
      const result = await dispatch(getProfile())
      if (result.meta.requestStatus === 'fulfilled') {
        return { success: true, data: result.payload }
      } else {
        return { success: false, error: result.payload }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false
    return user.role?.name === role || user.role?.name === 'admin'
  }

  // Check if user has specific permission
  const hasPermission = (resource, action) => {
    if (!user) return false
    if (user.role?.name === 'admin') return true
    
    const permission = user.role?.permissions?.find(p => p.resource === resource)
    if (!permission) return false
    return permission.actions.includes(action)
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    initialized,
    login,
    logout,
    register,
    getCurrentUser,
    hasRole,
    hasPermission,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext