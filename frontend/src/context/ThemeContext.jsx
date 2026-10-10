import React, { createContext, useState, useContext, useEffect, useMemo } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'

// Create context
const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  // Check localStorage for saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'light'
  const [mode, setMode] = useState(savedTheme)

  useEffect(() => {
    localStorage.setItem('theme', mode)
    document.documentElement.setAttribute('data-theme', mode)
    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [mode])

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
  }

  const theme = useMemo(() => {
    const isDark = mode === 'dark'
    const bg = isDark ? '#1A1E29' : '#E8ECF3'
    const textPrimary = isDark ? '#F0F4FC' : '#202A3A'
    const textSecondary = isDark ? '#9DA8BA' : '#5C6779'
    const raisedShadow = isDark
      ? '6px 6px 14px #12151D, -6px -6px 14px #222735'
      : '7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF'
    const insetShadow = isDark
      ? 'inset 3px 3px 7px #12151D, inset -3px -3px 7px #232837'
      : 'inset 4px 4px 8px #C7CDD7, inset -4px -4px 8px #FFFFFF'
    const divider = isDark ? '#262B3A' : '#D7DDE7'

    return createTheme({
      palette: {
        mode: mode,
        primary: {
          main: '#356AE6',
          light: '#5C85F7',
          dark: '#254EBF',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#5C85F7',
          light: '#82A3FA',
          dark: '#3D68DE',
          contrastText: '#FFFFFF',
        },
        success: {
          main: '#239B62',
          light: '#36B679',
          dark: '#1B7A4C',
        },
        warning: {
          main: '#D99118',
          light: '#EAB043',
          dark: '#B07310',
        },
        error: {
          main: '#D94F55',
          light: '#E77378',
          dark: '#B5383D',
        },
        info: {
          main: '#2B78E4',
          light: '#5695EC',
          dark: '#1C5BBA',
        },
        background: {
          default: bg,
          paper: bg,
        },
        text: {
          primary: textPrimary,
          secondary: textSecondary,
        },
        divider: divider,
      },
      typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h4: {
          fontWeight: 700,
          color: textPrimary,
          letterSpacing: '-0.02em',
        },
        h5: {
          fontWeight: 600,
          color: textPrimary,
          letterSpacing: '-0.01em',
        },
        h6: {
          fontWeight: 600,
          color: textPrimary,
        },
        subtitle1: {
          color: textSecondary,
          fontWeight: 500,
        },
        subtitle2: {
          color: textSecondary,
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 16,
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: bg,
              color: textPrimary,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: bg,
              backgroundImage: 'none',
              boxShadow: raisedShadow,
              borderRadius: 18,
              border: '1px solid rgba(255, 255, 255, 0.45)',
            },
            elevation0: {
              boxShadow: 'none',
              border: 'none',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: bg,
              backgroundImage: 'none',
              boxShadow: raisedShadow,
              borderRadius: 18,
              border: '1px solid rgba(255, 255, 255, 0.45)',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 12,
              padding: '8px 18px',
              transition: 'all 0.2s ease',
            },
            containedPrimary: {
              backgroundColor: '#356AE6',
              boxShadow: isDark
                ? '5px 5px 14px rgba(77, 125, 242, 0.35), -3px -3px 10px rgba(37, 43, 58, 0.8)'
                : '5px 5px 14px rgba(53, 106, 230, 0.35), -5px -5px 14px rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: '#2955C4',
                boxShadow: '6px 6px 18px rgba(53, 106, 230, 0.45)',
              },
            },
            containedSecondary: {
              backgroundColor: '#5C85F7',
              '&:hover': {
                backgroundColor: '#3D68DE',
              },
            },
            outlined: {
              backgroundColor: bg,
              boxShadow: raisedShadow,
              border: '1px solid rgba(255, 255, 255, 0.5)',
              color: textPrimary,
              '&:hover': {
                backgroundColor: bg,
                border: '1px solid #356AE6',
              },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              backgroundColor: bg,
              borderRadius: 14,
              boxShadow: insetShadow,
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: '1.5px solid #356AE6',
              },
            },
            input: {
              padding: '10px 14px',
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            outlined: {
              backgroundColor: bg,
              borderRadius: 14,
              boxShadow: insetShadow,
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 20,
              fontWeight: 600,
              boxShadow: isDark
                ? '2px 2px 5px #12151D, -2px -2px 5px #222735'
                : '2px 2px 5px #C7CDD7, -2px -2px 5px #FFFFFF',
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: bg,
              backgroundImage: 'none',
              boxShadow: raisedShadow,
              borderRadius: 22,
            },
          },
        },
      },
    })
  }, [mode])

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