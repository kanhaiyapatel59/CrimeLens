import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
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
    background: {
      default: '#E8ECF3',
      paper: '#E8ECF3',
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
    text: {
      primary: '#202A3A',
      secondary: '#5C6779',
    },
    divider: '#D7DDE7',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 700, fontSize: '2rem' },
    h3: { fontWeight: 600, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    subtitle1: { fontSize: '0.875rem', color: '#5C6779' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 20px',
          borderRadius: 12,
        },
        containedPrimary: {
          backgroundColor: '#356AE6',
          boxShadow: '5px 5px 14px rgba(53, 106, 230, 0.35), -5px -5px 14px rgba(255, 255, 255, 0.9)',
          '&:hover': {
            backgroundColor: '#2955C4',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          backgroundColor: '#E8ECF3',
          boxShadow: '7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.45)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          backgroundColor: '#E8ECF3',
          boxShadow: '7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.45)',
        },
      },
    },
  },
})

export default theme