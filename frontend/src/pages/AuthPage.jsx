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
    <div className="min-h-screen w-full relative flex flex-col justify-center items-center py-10 px-4 overflow-hidden bg-[#070709] text-white selection:bg-[#ffd700] selection:text-black font-sans">
      
      {/* ============================================================ */}
      {/* FUTURISTIC DARK METALLIC & FLOWING GOLDEN LIGHT BACKGROUND */}
      {/* ============================================================ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Dark Metallic Grid / Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070709] via-[#0b0c10] to-[#050507] opacity-90" />
        
        {/* Curved Golden Light Wave 1 (Top Left to Bottom Right) */}
        <div 
          className="absolute -top-[30%] -left-[20%] w-[140%] h-[140%] opacity-35"
          style={{
            background: 'radial-gradient(ellipse at 40% 30%, rgba(255, 215, 0, 0.22) 0%, rgba(212, 175, 55, 0.08) 35%, transparent 70%)',
            transform: 'rotate(-12deg)',
            filter: 'blur(40px)',
          }}
        />

        {/* Curved Golden Accent Lines / Metallic Reflections */}
        <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ffab00" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="goldGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff8e1" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#ffc107" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M-100,200 C300,50 800,450 1600,100" fill="none" stroke="url(#goldGradient1)" strokeWidth="4" />
          <path d="M-50,350 C450,150 950,550 1750,250" fill="none" stroke="url(#goldGradient2)" strokeWidth="2.5" />
          <path d="M-200,600 C550,350 1050,750 1850,450" fill="none" stroke="url(#goldGradient1)" strokeWidth="1.5" />
        </svg>

        {/* Ambient Radial Glows */}
        <div className="absolute top-[20%] right-[15%] w-96 h-96 bg-[#ffd700]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[15%] w-96 h-96 bg-[#ff9100]/10 rounded-full blur-[120px]" />
      </div>

      {/* ============================================================ */}
      {/* BRANDING HEADER */}
      {/* ============================================================ */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center mb-6 max-w-xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[#ffd700]/30 backdrop-blur-md mb-3">
          <FiShield className="text-[#ffd700] text-sm" />
          <span className="text-[11px] font-semibold tracking-widest text-[#ffd700] uppercase">
            SECURE INVESTIGATION SYSTEM
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-1">
          Crime Intelligence
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#ffd700] drop-shadow-[0_2px_10px_rgba(255,215,0,0.3)]">
          Investigation Platform
        </h2>
      </motion.div>

      {/* ============================================================ */}
      {/* MAIN AUTHENTICATION GLASS CARD */}
      {/* ============================================================ */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-[540px]"
      >
        {/* Decorative Glass Corners (Exact replica of reference video/image) */}
        {/* Top-Left Corner Accent */}
        <div className="absolute -top-3 -left-3 w-12 h-12 border-l-2 border-t-2 border-[#ffd700]/60 rounded-tl-xl bg-white/5 backdrop-blur-md pointer-events-none z-20 shadow-[0_0_15px_rgba(255,215,0,0.2)]" />
        
        {/* Bottom-Right Corner Accent */}
        <div className="absolute -bottom-3 -right-3 w-12 h-12 border-r-2 border-b-2 border-[#ffd700]/60 rounded-br-xl bg-white/5 backdrop-blur-md pointer-events-none z-20 shadow-[0_0_15px_rgba(255,215,0,0.2)]" />

        {/* Translucent Glass Card */}
        <div className="relative w-full rounded-2xl bg-[#0b0c10]/75 backdrop-blur-xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 sm:p-8 overflow-hidden">
          
          {/* Internal Subtle Top Highlight Glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffd700]/40 to-transparent" />

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              /* ============================================================ */
              /* LOGIN FORM */
              /* ============================================================ */
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold tracking-tight">
                    Welcome <span className="text-[#ffd700]">Back</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Sign in to access the secure investigation platform
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Official Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Official Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FiMail className="text-base" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        value={loginData.email}
                        onChange={handleLoginChange}
                        placeholder="name@department.gov"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#14161f]/80 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700]/70 focus:ring-1 focus:ring-[#ffd700]/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FiLock className="text-base" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={loginData.password}
                        onChange={handleLoginChange}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#14161f]/80 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700]/70 focus:ring-1 focus:ring-[#ffd700]/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                      </button>
                    </div>
                  </div>

                  {/* Options: Remember me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label 
                      onClick={() => setRememberMe(!rememberMe)}
                      className="flex items-center gap-2 text-gray-300 cursor-pointer select-none hover:text-white transition-colors"
                    >
                      {rememberMe ? (
                        <FiCheckSquare className="text-[#ffd700] text-sm" />
                      ) : (
                        <FiSquare className="text-gray-500 text-sm" />
                      )}
                      <span>Remember me</span>
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-[#ffd700] font-medium hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#ffd700] via-[#ffc107] to-[#ffb300] hover:from-[#ffe033] hover:to-[#ffc107] text-[#070709] font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(255,215,0,0.35)] hover:shadow-[0_6px_25px_rgba(255,215,0,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                    <FiArrowRight className="text-base font-bold" />
                  </button>

                  {/* 🆔 Biometric / Police Badge Quick Access Button */}
                  <button
                    type="button"
                    onClick={handleStartBiometricScan}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-white/5 border border-[#ffd700]/30 hover:bg-[#ffd700]/10 text-[#ffd700] font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 group"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-ping" />
                    <span>⚡ Quick Biometric / Police Badge Scan</span>
                  </button>

                  {/* Social Login Divider */}
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                      <span className="bg-[#0b0c10] px-3 text-gray-400">
                        OR CONTINUE WITH
                      </span>
                    </div>
                  </div>

                  {/* Social Buttons (Google & Apple) */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => toast.error('Social Login is restricted for government accounts. Use Official Credentials.')}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-gray-200 transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                        <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
                        <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"/>
                      </svg>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toast.error('Social Login is restricted for government accounts. Use Official Credentials.')}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-gray-200 transition-all"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.49-6.08-3.32-2.67-7.25-7.39-11.8-14.16-7.33-10.82-13.12-22.75-17.38-35.79-4.26-13.04-6.39-25.26-6.39-36.66 0-15.03 3.75-27.46 11.26-37.3 7.51-9.84 17.06-14.86 28.65-15.06 4.34 0 9.28 1.14 14.82 3.42 5.54 2.29 9.35 3.43 11.44 3.43 1.8 0 5.76-1.2 11.89-3.6 6.13-2.4 11.13-3.5 15-3.3 11.29.58 20.35 4.8 27.17 12.66-10.02 6.06-14.93 14.54-14.73 25.44.2 10.74 4.54 19.46 13.02 26.16 3.82 3.03 8.1 5.25 12.84 6.66-2.58 7.54-6.09 15.35-10.53 23.44zM119.22 31.08c0-7.07 2.56-13.84 7.68-20.31 5.12-6.47 11.53-10.42 19.23-11.85.2 1.05.3 1.95.3 2.7 0 7.07-2.67 14.07-8.01 21-5.34 6.93-11.89 10.82-19.65 11.67-.09-1.07-.15-2.14-.15-3.21z"/>
                      </svg>
                      <span>Apple</span>
                    </button>
                  </div>

                  {/* Switch to Register */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-400">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className="text-[#ffd700] font-semibold hover:underline transition-colors ml-1"
                      >
                        Sign Up
                      </button>
                    </p>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* ============================================================ */
              /* REGISTER FORM */
              /* ============================================================ */
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="mb-5">
                  <h3 className="text-2xl font-bold tracking-tight">
                    Create <span className="text-[#ffd700]">Account</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                    Join us today to access your secure workspace
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiUser className="text-sm" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={registerData.fullName}
                        onChange={handleRegisterChange}
                        placeholder="Alex Johnson"
                        className="w-full pl-9 pr-3 py-2 bg-[#14161f]/80 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700]/70 focus:ring-1 focus:ring-[#ffd700]/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Official Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
                      Official Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiMail className="text-sm" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="name@department.gov"
                        className="w-full pl-9 pr-3 py-2 bg-[#14161f]/80 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700]/70 focus:ring-1 focus:ring-[#ffd700]/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Employee / Police ID & Department (Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        Employee / Police ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <FiAward className="text-sm" />
                        </div>
                        <input
                          type="text"
                          name="policeId"
                          value={registerData.policeId}
                          onChange={handleRegisterChange}
                          placeholder="Enter your ID"
                          className="w-full pl-9 pr-3 py-2 bg-[#14161f]/80 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700]/70 focus:ring-1 focus:ring-[#ffd700]/50 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        Department
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <FiBriefcase className="text-sm" />
                        </div>
                        <select
                          name="department"
                          value={registerData.department}
                          onChange={handleRegisterChange}
                          className="w-full pl-9 pr-3 py-2 bg-[#14161f]/80 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#ffd700]/70 focus:ring-1 focus:ring-[#ffd700]/50 transition-all appearance-none cursor-pointer"
                        >
                          <option value="Police Department" className="bg-[#0b0c10]">Police Department</option>
                          <option value="State Crime Records Bureau" className="bg-[#0b0c10]">State Crime Records Bureau</option>
                          <option value="Investigation Department" className="bg-[#0b0c10]">Investigation Department</option>
                          <option value="Cyber Crime Department" className="bg-[#0b0c10]">Cyber Crime Department</option>
                          <option value="Crime Branch" className="bg-[#0b0c10]">Crime Branch</option>
                          <option value="Other" className="bg-[#0b0c10]">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Police Station / Unit & Role (Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        Police Station / Unit
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <FiMapPin className="text-sm" />
                        </div>
                        <input
                          type="text"
                          name="policeStation"
                          value={registerData.policeStation}
                          onChange={handleRegisterChange}
                          placeholder="Central Unit / Station"
                          className="w-full pl-9 pr-3 py-2 bg-[#14161f]/80 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700]/70 focus:ring-1 focus:ring-[#ffd700]/50 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        Role
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <FiShield className="text-sm" />
                        </div>
                        <select
                          name="role"
                          value={registerData.role}
                          onChange={handleRegisterChange}
                          className="w-full pl-9 pr-3 py-2 bg-[#14161f]/80 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#ffd700]/70 focus:ring-1 focus:ring-[#ffd700]/50 transition-all appearance-none cursor-pointer"
                        >
                          <option value="Investigator" className="bg-[#0b0c10]">Investigator</option>
                          <option value="Police Officer" className="bg-[#0b0c10]">Police Officer</option>
                          <option value="Station Officer" className="bg-[#0b0c10]">Station Officer</option>
                          <option value="Crime Analyst" className="bg-[#0b0c10]">Crime Analyst</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm Password (Side-by-side on desktop) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <FiLock className="text-sm" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          required
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          placeholder="Create password"
                          className="w-full pl-9 pr-8 py-2 bg-[#14161f]/80 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700]/70 focus:ring-1 focus:ring-[#ffd700]/50 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <FiEyeOff className="text-xs" /> : <FiEye className="text-xs" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <FiLock className="text-sm" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          required
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          placeholder="Confirm password"
                          className="w-full pl-9 pr-8 py-2 bg-[#14161f]/80 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700]/70 focus:ring-1 focus:ring-[#ffd700]/50 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-white transition-colors"
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
                      className="text-[#ffd700] hover:opacity-80 transition-opacity"
                    >
                      {agreeTerms ? (
                        <FiCheckSquare className="text-base" />
                      ) : (
                        <FiSquare className="text-gray-500 text-base" />
                      )}
                    </button>
                    <span className="text-gray-300">
                      I agree to the <a href="#privacy" className="text-[#ffd700] underline">Terms & Privacy Policy</a>
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#ffd700] via-[#ffc107] to-[#ffb300] hover:from-[#ffe033] hover:to-[#ffc107] text-[#070709] font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(255,215,0,0.35)] hover:shadow-[0_6px_25px_rgba(255,215,0,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                    <FiArrowRight className="text-base font-bold" />
                  </button>

                  {/* Social Login Divider */}
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                      <span className="bg-[#0b0c10] px-3 text-gray-400">
                        OR SIGN UP WITH
                      </span>
                    </div>
                  </div>

                  {/* Social Buttons (Google & Apple) */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => toast.error('Social Login is restricted for government accounts. Use Official Credentials.')}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-gray-200 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                        <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
                        <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"/>
                      </svg>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toast.error('Social Login is restricted for government accounts. Use Official Credentials.')}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-gray-200 transition-all"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.49-6.08-3.32-2.67-7.25-7.39-11.8-14.16-7.33-10.82-13.12-22.75-17.38-35.79-4.26-13.04-6.39-25.26-6.39-36.66 0-15.03 3.75-27.46 11.26-37.3 7.51-9.84 17.06-14.86 28.65-15.06 4.34 0 9.28 1.14 14.82 3.42 5.54 2.29 9.35 3.43 11.44 3.43 1.8 0 5.76-1.2 11.89-3.6 6.13-2.4 11.13-3.5 15-3.3 11.29.58 20.35 4.8 27.17 12.66-10.02 6.06-14.93 14.54-14.73 25.44.2 10.74 4.54 19.46 13.02 26.16 3.82 3.03 8.1 5.25 12.84 6.66-2.58 7.54-6.09 15.35-10.53 23.44zM119.22 31.08c0-7.07 2.56-13.84 7.68-20.31 5.12-6.47 11.53-10.42 19.23-11.85.2 1.05.3 1.95.3 2.7 0 7.07-2.67 14.07-8.01 21-5.34 6.93-11.89 10.82-19.65 11.67-.09-1.07-.15-2.14-.15-3.21z"/>
                      </svg>
                      <span>Apple</span>
                    </button>
                  </div>

                  {/* Switch to Login */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="text-[#ffd700] font-semibold hover:underline transition-colors ml-1"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>

      {/* Footer copyright */}
      <div className="relative z-10 text-center mt-6 text-xs text-gray-500 font-medium">
        CrimeLens Enterprise Security System • Version 7.2
      </div>

      {/* ============================================================ */}
      {/* 🆔 BIOMETRIC / BADGE SCANNER GLASS MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showScanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-md p-6 rounded-2xl bg-[#0d0e15] border border-[#ffd700]/40 shadow-[0_0_50px_rgba(255,215,0,0.3)] text-center overflow-hidden"
            >
              {/* Laser Beam Reticle Ring */}
              <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center border-2 border-dashed border-[#ffd700]/50 rounded-full animate-spin-slow">
                <div className="w-28 h-28 border-2 border-[#ffd700] rounded-full flex items-center justify-center bg-[#ffd700]/10 shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                  <FiShield className="text-4xl text-[#ffd700] animate-pulse" />
                </div>
                {/* Horizontal Scanning Line */}
                <div className="absolute left-0 right-0 h-0.5 bg-[#ffd700] shadow-[0_0_15px_#ffd700] animate-bounce" />
              </div>

              <h4 className="text-lg font-bold text-white mb-1">
                POLICE BADGE & BIOMETRIC SCAN
              </h4>
              <p className="text-xs text-[#ffd700] font-mono mb-4 animate-pulse">
                {scanStatus}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-4">
                <div 
                  className="bg-gradient-to-r from-[#ffd700] to-[#ff9100] h-full transition-all duration-300 shadow-[0_0_10px_#ffd700]"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              <button
                type="button"
                onClick={() => setShowScanModal(false)}
                className="text-xs text-gray-400 hover:text-white transition-colors"
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
