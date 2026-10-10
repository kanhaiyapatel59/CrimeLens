import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

// Layout Components
import Layout from './components/layout/Layout'

// Pages - Public
import AuthPage from './pages/AuthPage'
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
import Forensics from './pages/Forensics'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

// Components
import PrivateRoute from './components/common/PrivateRoute'
import PublicRoute from './components/common/PublicRoute'

// Context
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[#E8ECF3] dark:bg-[#1A1E29] text-[#202A3A] dark:text-[#F0F4FC] transition-colors duration-200">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--neu-surface, #E8ECF3)',
                color: 'var(--neu-text-primary, #202A3A)',
                boxShadow: 'var(--neu-shadow-raised, 7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF)',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                fontWeight: 500,
                fontSize: '0.875rem',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#239B62',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#D94F55',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes (Redirect logged in users to /dashboard) */}
              <Route element={<PublicRoute />}>
                <Route path="/" element={<AuthPage initialMode="login" />} />
                <Route path="/login" element={<AuthPage initialMode="login" />} />
                <Route path="/register" element={<AuthPage initialMode="register" />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
              </Route>
              
              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/crimes" element={<Crimes />} />
                  <Route path="/map" element={<Map />} />
                  <Route path="/network" element={<Network />} />
                  <Route path="/ai-chat" element={<AIChat />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/forensics" element={<Forensics />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
              
              {/* 404 */}
              <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
              />

            </Routes>
          </AnimatePresence>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App