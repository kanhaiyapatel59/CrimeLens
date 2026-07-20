import React, { useEffect, useMemo, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Box, CircularProgress } from '@mui/material'
import { restoreSession } from '../../redux/slices/authSlice'


// ✅ Role-based route access mapping
const rolePermissions = {
  admin: {
    allowedPaths: ['/dashboard', '/crimes', '/map', '/network', '/ai-chat', '/reports', '/profile', '/settings', '/users', '/audit'],
    redirect: '/dashboard'
  },
  scrb_officer: {
    allowedPaths: ['/dashboard', '/crimes', '/map', '/network', '/ai-chat', '/reports', '/profile', '/settings'],
    redirect: '/dashboard'
  },
  district_officer: {
    allowedPaths: ['/dashboard', '/crimes', '/map', '/network', '/ai-chat', '/reports', '/profile', '/settings'],
    redirect: '/dashboard'
  },
  station_officer: {
    allowedPaths: ['/dashboard', '/crimes', '/map', '/ai-chat', '/profile', '/settings'],
    redirect: '/dashboard'
  },
  analyst: {
    allowedPaths: ['/dashboard', '/map', '/network', '/ai-chat', '/reports', '/profile'],
    redirect: '/dashboard'
  },
  viewer: {
    allowedPaths: ['/dashboard', '/ai-chat', '/profile'],
    redirect: '/dashboard'
  }
}

const PrivateRoute = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth)

  const [restoring, setRestoring] = useState(true)

  useEffect(() => {
    dispatch(restoreSession())
    // restoreSession is a sync reducer reading localStorage.
    // Let one render pass occur before we enforce redirects.
    setRestoring(false)
  }, [dispatch])


  // ✅ Check role-based access against the user profile structure
  const hasAccess = () => {
    // If user or role configuration isn't populated yet, let authentication handling run first
    if (!user?.role?.name) return true
    
    const roleName = user.role.name
    const permissions = rolePermissions[roleName]
    
    if (!permissions) return true
    
    const currentPath = location.pathname
    
    // Returns true if the current path matches or starts with any allowed path array entry
    return permissions.allowedPaths.some(path => 
      currentPath.startsWith(path)
    )
  }

  // Show generic loading spinner while restoring the backend authentication token/session
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  const hasToken = useMemo(() => {
    try {
      return !!localStorage.getItem('accessToken')
    } catch {
      return false
    }
  }, [])

  // Redirect to sign-in page if user session is completely unauthenticated.
  // If we are still restoring session, block redirects to prevent /dashboard refresh -> /login.
  if (!isAuthenticated && !hasToken && !restoring) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (restoring) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }


  // ✅ Redirect to their specific landing fallback path if route limits violate permissions
  if (!hasAccess()) {
    const roleName = user?.role?.name || 'viewer'
    const redirectPath = rolePermissions[roleName]?.redirect || '/dashboard'
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}

export default PrivateRoute