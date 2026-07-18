import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import crimeReducer from './slices/crimeSlice'
import dashboardReducer from './slices/dashboardSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    crime: crimeReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export default store