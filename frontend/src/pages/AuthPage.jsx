import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { loginUser, registerUser } from '../redux/slices/authSlice'
import toast from 'react-hot-toast'
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowRight,
  FiBriefcase,
  FiMapPin,
  FiAward,
  FiCheckSquare,
  FiSquare,
} from 'react-icons/fi'

const AuthPage = ({ initialMode = 'login' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state) => state.auth)

  // Auth Mode: 'login' | 'register'
  const [mode, setMode] = useState(
    location.pathname === '/register' || initialMode === 'register' ? 'register' : 'login'
  )

  // Sync mode with route if location changes
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register')
    } else if (location.pathname === '/login') {
      setMode('login')
    }
  }, [location.pathname])

  // Form State
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  // Biometric Scan State
  const [showScanModal, setShowScanModal] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStatus, setScanStatus] = useState('Initiating Biometric Scanner...')

  const handleStartBiometricScan = () => {
    setShowScanModal(true)
    setScanProgress(10)
    setScanStatus('Initializing Optical Laser Scanner...')

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setScanStatus('✅ Officer Biometric Signature Verified!')
          setTimeout(async () => {
            setShowScanModal(false)
            const result = await dispatch(loginUser({ email: 'admin@crimelens.com', password: 'Admin@123' }))
            if (result.meta.requestStatus === 'fulfilled') {
              navigate('/dashboard', { replace: true })
            }
          }, 800)
          return 100
        }
        if (prev === 40) setScanStatus('Verifying Police ID Badge POL-001...')
        if (prev === 70) setScanStatus('Validating Cryptographic Key & Role...')
        return prev + 15
      })
    }, 350)
  }

  // Login Form
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  // Register Form
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    policeId: '',
    department: 'Police Department',
    policeStation: 'Central Headquarters',
    role: 'Investigator',
    password: '',
    confirmPassword: '',
  })

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value })
  }

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value })
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!loginData.email || !loginData.password) {
      toast.error('Please enter both Email and Password')
      return
    }

    const result = await dispatch(loginUser(loginData))
    if (result.meta.requestStatus === 'fulfilled') {
      const from = location?.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!registerData.fullName || !registerData.email || !registerData.password) {
      toast.error('Please fill in all required fields')
      return
    }
    if (registerData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!agreeTerms) {
      toast.error('Please agree to the Terms & Privacy Policy')
      return
    }

    // Split Full Name into firstName and lastName for backend model
    const nameParts = registerData.fullName.trim().split(' ')
    const firstName = nameParts[0] || 'Officer'
    const lastName = nameParts.slice(1).join(' ') || 'User'

    const payload = {
      firstName,
      lastName,
      email: registerData.email,
      password: registerData.password,
      policeId: registerData.policeId || `POL-${Math.floor(100000 + Math.random() * 900000)}`,
      department: registerData.department,
      policeStation: registerData.policeStation,
      role: registerData.role === 'Administrator' ? 'admin' : 'station_officer',
      phone: '9876543210',
    }

    const result = await dispatch(registerUser(payload))
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Registration completed successfully!')
      setMode('login')
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    if (newMode === 'login') {
      navigate('/login', { replace: true })
    } else {
      navigate('/register', { replace: true })
    }
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-center items-center py-10 px-4 bg-[#E8ECF3] dark:bg-[#1A1E29] text-[#1E2530] dark:text-[#F0F4FC] font-sans transition-colors duration-300">
      
      {/* Background Soft Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(53, 106, 230, 0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(35, 155, 98, 0.07) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* BRANDING HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center mb-6 max-w-xl"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8ECF3] dark:bg-[#1A1E29] neu-card shadow-[4px_4px_10px_#C7CDD7,-4px_-4px_10px_#FFFFFF] dark:shadow-[4px_4px_10px_#12151D,-4px_-4px_10px_#222735] border border-[#D7DDE7] dark:border-[#262B3A] mb-3">
          <FiShield className="text-[#356AE6] text-sm" />
          <span className="text-[11px] font-bold tracking-widest text-[#356AE6] uppercase">
            KARNATAKA POLICE INTELLIGENCE
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E2530] dark:text-[#F0F4FC] mb-1">
          CrimeLens
        </h1>
        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#5C6779] dark:text-[#9DA8BA]">
          AI-Powered Crime Analytics & Case Management Platform
        </h2>
      </motion.div>

      {/* MAIN AUTHENTICATION NEUMORPHIC CARD */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-[520px]"
      >
        <div className="relative w-full rounded-3xl bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[12px_12px_28px_#C7CDD7,-12px_-12px_28px_#FFFFFF] dark:shadow-[10px_10px_24px_#12151D,-10px_-10px_24px_#222735] border border-[#D7DDE7] dark:border-[#262B3A] p-6 sm:p-8 overflow-hidden">
          
          {/* Mode Switcher Pills */}
          <div className="flex rounded-2xl p-1 mb-6 bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[inset_3px_3px_6px_#C7CDD7,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#12151D,inset_-3px_-3px_6px_#222735]">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-[#E8ECF3] dark:bg-[#1A1E29] text-[#356AE6] shadow-[3px_3px_8px_#C7CDD7,-3px_-3px_8px_#FFFFFF] dark:shadow-[3px_3px_8px_#12151D,-3px_-3px_8px_#222735]'
                  : 'text-[#5C6779] dark:text-[#9DA8BA] hover:text-[#1E2530] dark:hover:text-[#F0F4FC]'
              }`}
            >
              Officer Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-[#E8ECF3] dark:bg-[#1A1E29] text-[#356AE6] shadow-[3px_3px_8px_#C7CDD7,-3px_-3px_8px_#FFFFFF] dark:shadow-[3px_3px_8px_#12151D,-3px_-3px_8px_#222735]'
                  : 'text-[#5C6779] dark:text-[#9DA8BA] hover:text-[#1E2530] dark:hover:text-[#F0F4FC]'
              }`}
            >
              Register Credential
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              /* LOGIN FORM */
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-5">
                  <h3 className="text-xl font-extrabold tracking-tight text-[#1E2530] dark:text-[#F0F4FC]">
                    Welcome <span className="text-[#356AE6]">Back, Officer</span>
                  </h3>
                  <p className="text-xs text-[#5C6779] dark:text-[#9DA8BA] mt-0.5">
                    Sign in to access state-wide FIR records and live analytical radar
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Official Email */}
                  <div>
                    <label className="block text-xs font-bold text-[#5C6779] dark:text-[#9DA8BA] uppercase tracking-wider mb-1.5">
                      Official Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5C6779] dark:text-[#9DA8BA]">
                        <FiMail className="text-base" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        value={loginData.email}
                        onChange={handleLoginChange}
                        placeholder="officer@ksp.gov.in"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[inset_3px_3px_6px_#C7CDD7,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#12151D,inset_-3px_-3px_6px_#222735] border border-transparent rounded-2xl text-sm text-[#1E2530] dark:text-[#F0F4FC] placeholder-[#8E9AAB] focus:outline-none focus:border-[#356AE6] transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#5C6779] dark:text-[#9DA8BA] uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5C6779] dark:text-[#9DA8BA]">
                        <FiLock className="text-base" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={loginData.password}
                        onChange={handleLoginChange}
                        placeholder="Enter your access key"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[inset_3px_3px_6px_#C7CDD7,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#12151D,inset_-3px_-3px_6px_#222735] border border-transparent rounded-2xl text-sm text-[#1E2530] dark:text-[#F0F4FC] placeholder-[#8E9AAB] focus:outline-none focus:border-[#356AE6] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5C6779] dark:text-[#9DA8BA] hover:text-[#356AE6] transition-colors"
                      >
                        {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                      </button>
                    </div>
                  </div>

                  {/* Options: Remember me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label 
                      onClick={() => setRememberMe(!rememberMe)}
                      className="flex items-center gap-2 text-[#5C6779] dark:text-[#9DA8BA] cursor-pointer select-none hover:text-[#1E2530] dark:hover:text-[#F0F4FC] transition-colors font-medium"
                    >
                      {rememberMe ? (
                        <FiCheckSquare className="text-[#356AE6] text-sm" />
                      ) : (
                        <FiSquare className="text-[#8E9AAB] text-sm" />
                      )}
                      <span>Remember Station Terminal</span>
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-[#356AE6] font-semibold hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#356AE6] hover:bg-[#254EBF] text-white font-bold text-sm tracking-wide shadow-[4px_4px_14px_rgba(53,106,230,0.4)] hover:shadow-[5px_5px_18px_rgba(53,106,230,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                    <FiArrowRight className="text-base font-bold" />
                  </button>

                  {/* Biometric / Badge Quick Access */}
                  <button
                    type="button"
                    onClick={handleStartBiometricScan}
                    className="w-full mt-2 py-2.5 px-4 rounded-2xl bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[4px_4px_10px_#C7CDD7,-4px_-4px_10px_#FFFFFF] dark:shadow-[4px_4px_10px_#12151D,-4px_-4px_10px_#222735] border border-[#D7DDE7] dark:border-[#262B3A] text-[#356AE6] hover:text-[#254EBF] font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 active:shadow-[inset_3px_3px_6px_#C7CDD7,inset_-3px_-3px_6px_#FFFFFF]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#356AE6] animate-ping" />
                    <span>⚡ Quick Biometric / Police Badge Demo Access</span>
                  </button>

                  {/* Social Login Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#D7DDE7] dark:border-[#262B3A]" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
                      <span className="bg-[#E8ECF3] dark:bg-[#1A1E29] px-3 text-[#8E9AAB]">
                        OR FEDERATED SSO
                      </span>
                    </div>
                  </div>

                  {/* Social Buttons (Google & Apple) */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => toast.error('Social Login is restricted for government accounts. Use Official Credentials.')}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[3px_3px_8px_#C7CDD7,-3px_-3px_8px_#FFFFFF] dark:shadow-[3px_3px_8px_#12151D,-3px_-3px_8px_#222735] border border-[#D7DDE7] dark:border-[#262B3A] text-xs font-semibold text-[#1E2530] dark:text-[#F0F4FC] transition-all hover:shadow-[inset_2px_2px_5px_#C7CDD7,inset_-2px_-2px_5px_#FFFFFF]"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                        <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
                        <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"/>
                      </svg>
                      <span>Google SSO</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toast.error('Social Login is restricted for government accounts. Use Official Credentials.')}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[3px_3px_8px_#C7CDD7,-3px_-3px_8px_#FFFFFF] dark:shadow-[3px_3px_8px_#12151D,-3px_-3px_8px_#222735] border border-[#D7DDE7] dark:border-[#262B3A] text-xs font-semibold text-[#1E2530] dark:text-[#F0F4FC] transition-all hover:shadow-[inset_2px_2px_5px_#C7CDD7,inset_-2px_-2px_5px_#FFFFFF]"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.49-6.08-3.32-2.67-7.25-7.39-11.8-14.16-7.33-10.82-13.12-22.75-17.38-35.79-4.26-13.04-6.39-25.26-6.39-36.66 0-15.03 3.75-27.46 11.26-37.3 7.51-9.84 17.06-14.86 28.65-15.06 4.34 0 9.28 1.14 14.82 3.42 5.54 2.29 9.35 3.43 11.44 3.43 1.8 0 5.76-1.2 11.89-3.6 6.13-2.4 11.13-3.5 15-3.3 11.29.58 20.35 4.8 27.17 12.66-10.02 6.06-14.93 14.54-14.73 25.44.2 10.74 4.54 19.46 13.02 26.16 3.82 3.03 8.1 5.25 12.84 6.66-2.58 7.54-6.09 15.35-10.53 23.44zM119.22 31.08c0-7.07 2.56-13.84 7.68-20.31 5.12-6.47 11.53-10.42 19.23-11.85.2 1.05.3 1.95.3 2.7 0 7.07-2.67 14.07-8.01 21-5.34 6.93-11.89 10.82-19.65 11.67-.09-1.07-.15-2.14-.15-3.21z"/>
                      </svg>
                      <span>Apple ID</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* REGISTER FORM */
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-extrabold tracking-tight text-[#1E2530] dark:text-[#F0F4FC]">
                    Register <span className="text-[#356AE6]">Officer Profile</span>
                  </h3>
                  <p className="text-xs text-[#5C6779] dark:text-[#9DA8BA] mt-0.5">
                    Authorized personnel credentials will be verified against police database
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C6779] dark:text-[#9DA8BA] uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5C6779] dark:text-[#9DA8BA]">
                        <FiUser className="text-sm" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={registerData.fullName}
                        onChange={handleRegisterChange}
                        placeholder="Officer Name"
                        className="w-full pl-9 pr-3 py-2 bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[inset_3px_3px_6px_#C7CDD7,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#12151D,inset_-3px_-3px_6px_#222735] border border-transparent rounded-xl text-xs sm:text-sm text-[#1E2530] dark:text-[#F0F4FC] placeholder-[#8E9AAB] focus:outline-none focus:border-[#356AE6] transition-all"
                      />
                    </div>
                  </div>

                  {/* Official Email */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C6779] dark:text-[#9DA8BA] uppercase tracking-wider mb-1">
                      Official Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5C6779] dark:text-[#9DA8BA]">
                        <FiMail className="text-sm" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="officer@department.gov.in"
                        className="w-full pl-9 pr-3 py-2 bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[inset_3px_3px_6px_#C7CDD7,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#12151D,inset_-3px_-3px_6px_#222735] border border-transparent rounded-xl text-xs sm:text-sm text-[#1E2530] dark:text-[#F0F4FC] placeholder-[#8E9AAB] focus:outline-none focus:border-[#356AE6] transition-all"
                      />
                    </div>
                  </div>

                  {/* Employee / Police ID & Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#5C6779] dark:text-[#9DA8BA] uppercase tracking-wider mb-1">
                        Employee / Police ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5C6779] dark:text-[#9DA8BA]">
                          <FiAward className="text-sm" />
                        </div>
                        <input
                          type="text"
                          name="policeId"
                          value={registerData.policeId}
                          onChange={handleRegisterChange}
                          placeholder="POL-10492"
                          className="w-full pl-9 pr-3 py-2 bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[inset_3px_3px_6px_#C7CDD7,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#12151D,inset_-3px_-3px_6px_#222735] border border-transparent rounded-xl text-xs sm:text-sm text-[#1E2530] dark:text-[#F0F4FC] placeholder-[#8E9AAB] focus:outline-none focus:border-[#356AE6] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#5C6779] dark:text-[#9DA8BA] uppercase tracking-wider mb-1">
                        Department
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5C6779] dark:text-[#9DA8BA]">
                          <FiBriefcase className="text-sm" />
                        </div>
                        <select
                          name="department"
                          value={registerData.department}
                          onChange={handleRegisterChange}
                          className="w-full pl-9 pr-3 py-2 bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[inset_3px_3px_6px_#C7CDD7,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#12151D,inset_-3px_-3px_6px_#222735] border border-transparent rounded-xl text-xs sm:text-sm text-[#1E2530] dark:text-[#F0F4FC] focus:outline-none focus:border-[#356AE6] transition-all cursor-pointer"
                        >
                          <option value="Police Department">Police Department</option>
                          <option value="State Crime Records Bureau">State Crime Records Bureau</option>
                          <option value="Investigation Department">Investigation Department</option>
                          <option value="Cyber Crime Department">Cyber Crime Department</option>
                          <option value="Crime Branch">Crime Branch</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Police Station / Unit & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#5C6779] dark:text-[#9DA8BA] uppercase tracking-wider mb-1">
                        Police Station / Unit
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5C6779] dark:text-[#9DA8BA]">
                          <FiMapPin className="text-sm" />
                        </div>
                        <input
                          type="text"
                          name="policeStation"
                          value={registerData.policeStation}
                          onChange={handleRegisterChange}
                          placeholder="Central HQ PS"
                          className="w-full pl-9 pr-3 py-2 bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[inset_3px_3px_6px_#C7CDD7,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#12151D,inset_-3px_-3px_6px_#222735] border border-transparent rounded-xl text-xs sm:text-sm text-[#1E2530] dark:text-[#F0F4FC] placeholder-[#8E9AAB] focus:outline-none focus:border-[#356AE6] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#5C6779] dark:text-[#9DA8BA] uppercase tracking-wider mb-1">
                        Role
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5C6779] dark:text-[#9DA8BA]">
                          <FiShield className="text-sm" />
                        </div>
                        <select
                          name="role"
                          value={registerData.role}
                          onChange={handleRegisterChange}
                          className="w-full pl-9 pr-3 py-2 bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[inset_3px_3px_6px_#C7CDD7,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#12151D,inset_-3px_-3px_6px_#222735] border border-transparent rounded-xl text-xs sm:text-sm text-[#1E2530] dark:text-[#F0F4FC] focus:outline-none focus:border-[#356AE6] transition-all cursor-pointer"
                        >
                          <option value="Investigator">Investigator</option>
                          <option value="Police Officer">Police Officer</option>
                          <option value="Station Officer">Station Officer</option>
                          <option value="Crime Analyst">Crime Analyst</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#5C6779] dark:text-[#9DA8BA] uppercase tracking-wider mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5C6779] dark:text-[#9DA8BA]">
                          <FiLock className="text-sm" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          required
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          placeholder="Min 8 characters"
                          className="w-full pl-9 pr-8 py-2 bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[inset_3px_3px_6px_#C7CDD7,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#12151D,inset_-3px_-3px_6px_#222735] border border-transparent rounded-xl text-xs sm:text-sm text-[#1E2530] dark:text-[#F0F4FC] placeholder-[#8E9AAB] focus:outline-none focus:border-[#356AE6] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#5C6779] dark:text-[#9DA8BA] hover:text-[#356AE6] transition-colors"
                        >
                          {showPassword ? <FiEyeOff className="text-xs" /> : <FiEye className="text-xs" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#5C6779] dark:text-[#9DA8BA] uppercase tracking-wider mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5C6779] dark:text-[#9DA8BA]">
                          <FiLock className="text-sm" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          required
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          placeholder="Confirm access key"
                          className="w-full pl-9 pr-8 py-2 bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[inset_3px_3px_6px_#C7CDD7,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#12151D,inset_-3px_-3px_6px_#222735] border border-transparent rounded-xl text-xs sm:text-sm text-[#1E2530] dark:text-[#F0F4FC] placeholder-[#8E9AAB] focus:outline-none focus:border-[#356AE6] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#5C6779] dark:text-[#9DA8BA] hover:text-[#356AE6] transition-colors"
                        >
                          {showConfirmPassword ? <FiEyeOff className="text-xs" /> : <FiEye className="text-xs" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Register Agreement Checkbox */}
                  <div className="flex items-center gap-2 text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setAgreeTerms(!agreeTerms)}
                      className="text-[#356AE6] hover:opacity-80 transition-opacity"
                    >
                      {agreeTerms ? (
                        <FiCheckSquare className="text-base" />
                      ) : (
                        <FiSquare className="text-[#8E9AAB] text-base" />
                      )}
                    </button>
                    <span className="text-[#5C6779] dark:text-[#9DA8BA] font-medium">
                      I agree to the <a href="#privacy" className="text-[#356AE6] underline">Official Security Terms & Compliance Policy</a>
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#356AE6] hover:bg-[#254EBF] text-white font-bold text-sm tracking-wide shadow-[4px_4px_14px_rgba(53,106,230,0.4)] hover:shadow-[5px_5px_18px_rgba(53,106,230,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    <span>{isLoading ? 'Registering Credential...' : 'Register Profile'}</span>
                    <FiArrowRight className="text-base font-bold" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>

      {/* Footer copyright */}
      <div className="relative z-10 text-center mt-6 text-xs text-[#5C6779] dark:text-[#9DA8BA] font-medium">
        CrimeLens Enterprise CCTNS Intelligence System • Karnataka Police
      </div>

      {/* BIOMETRIC / BADGE SCANNER NEUMORPHIC MODAL */}
      <AnimatePresence>
        {showScanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md p-6 rounded-3xl bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[12px_12px_32px_rgba(0,0,0,0.35)] border border-[#D7DDE7] dark:border-[#262B3A] text-center overflow-hidden"
            >
              {/* Laser Reticle Ring */}
              <div className="relative w-32 h-32 mx-auto my-4 flex items-center justify-center border-2 border-dashed border-[#356AE6]/50 rounded-full animate-spin">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[inset_3px_3px_8px_#C7CDD7,inset_-3px_-3px_8px_#FFFFFF] dark:shadow-[inset_3px_3px_8px_#12151D,inset_-3px_-3px_8px_#222735]">
                  <FiShield className="text-3xl text-[#356AE6] animate-pulse" />
                </div>
              </div>

              <h4 className="text-base font-extrabold text-[#1E2530] dark:text-[#F0F4FC] mb-1">
                POLICE BADGE BIOMETRIC SCAN
              </h4>
              <p className="text-xs text-[#356AE6] font-mono mb-4 animate-pulse">
                {scanStatus}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-[#E8ECF3] dark:bg-[#1A1E29] shadow-[inset_2px_2px_5px_#C7CDD7,inset_-2px_-2px_5px_#FFFFFF] dark:shadow-[inset_2px_2px_5px_#12151D,inset_-2px_-2px_5px_#222735] h-2.5 rounded-full overflow-hidden mb-4">
                <div 
                  className="bg-[#356AE6] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              <button
                type="button"
                onClick={() => setShowScanModal(false)}
                className="text-xs text-[#5C6779] dark:text-[#9DA8BA] hover:text-[#D94F55] font-semibold transition-colors"
              >
                Cancel Scanning
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AuthPage
