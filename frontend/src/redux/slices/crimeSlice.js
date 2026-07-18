import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  crimes: [],
  selectedCrime: null,
  filters: {
    page: 1,
    limit: 10,
    search: '',
    crimeType: '',
    severity: '',
    status: '',
    startDate: '',
    endDate: '',
  },
  total: 0,
  loading: false,
  error: null,
}

const crimeSlice = createSlice({
  name: 'crime',
  initialState,
  reducers: {
    setCrimes: (state, action) => {
      state.crimes = action.payload
    },
    setSelectedCrime: (state, action) => {
      state.selectedCrime = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    setTotal: (state, action) => {
      state.total = action.payload
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
  setCrimes,
  setSelectedCrime,
  setFilters,
  resetFilters,
  setTotal,
  setLoading,
  setError,
  clearError,
} = crimeSlice.actions

export default crimeSlice.reducer