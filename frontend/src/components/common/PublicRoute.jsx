import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { restoreSession } from '../../redux/slices/authSlice'

const PublicRoute = () => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(restoreSession())
  }, [dispatch])

  const hasToken = (() => {
    try {
      return !!localStorage.getItem('accessToken')
    } catch {
      return false
    }
  })()

  // If user is logged in (token or isAuthenticated), redirect to dashboard automatically!
  if (isAuthenticated || hasToken) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default PublicRoute
