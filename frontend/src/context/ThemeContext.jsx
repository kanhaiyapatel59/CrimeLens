import React, { createContext, useState, useContext, useEffect } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'

// Create context
const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  // Check localStorage for saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'light'
  const [mode, setMode] = useState(savedTheme)

  useEffect(() => {
    localStorage.setItem('theme', mode)
  }, [mode])

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
  }

  const theme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#1a237e',
        light: '#3949ab',
        dark: '#0d1442',
      },
      secondary: {
        main: '#e91e63',
        light: '#f48fb1',
        dark: '#880e4f',
      },
      background: {
        default: mode === 'light' ? '#f5f7fa' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
      },
    },
  })

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext