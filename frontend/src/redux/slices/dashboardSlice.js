import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  kpis: null,
  charts: {},
  overview: null,
  districts: [],
  alerts: [],
  loading: false,
  error: null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setKPIs: (state, action) => {
      state.kpis = action.payload
    },
    setCharts: (state, action) => {
      state.charts = action.payload
    },
    setOverview: (state, action) => {
      state.overview = action.payload
    },
    setDistricts: (state, action) => {
      state.districts = action.payload
    },
    setAlerts: (state, action) => {
      state.alerts = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setKPIs,
  setCharts,
  setOverview,
  setDistricts,
  setAlerts,
  setLoading,
  setError,
  clearError,
} = dashboardSlice.actions

export default dashboardSlice.reducer