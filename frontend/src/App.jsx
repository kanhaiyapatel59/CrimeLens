import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

// Layout Components
import Layout from './components/layout/Layout'

// Pages - Public
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'

// Pages - Protected
import Dashboard from './pages/Dashboard'
import Crimes from './pages/Crimes'
import Map from './pages/Map'
import Network from './pages/Network'
import AIChat from './pages/AIChat'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

// Components
import PrivateRoute from './components/common/PrivateRoute'

// Context
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'  // ✅ ADD THIS

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4caf50',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#f44336',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              
              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/crimes" element={<Crimes />} />
                  <Route path="/map" element={<Map />} />
                  <Route path="/network" element={<Network />} />
                  <Route path="/ai-chat" element={<AIChat />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
              
              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App