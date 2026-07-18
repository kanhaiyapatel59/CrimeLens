import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginUser, logoutUser, registerUser } from '../redux/slices/authSlice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth)

  const login = async (email, password) => {
    const result = await dispatch(loginUser({ email, password }))
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard')
    }
    return result
  }

  const register = async (data) => {
    const result = await dispatch(registerUser(data))
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/login')
    }
    return result
  }

  const logout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
  }
}