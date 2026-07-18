import axios from './axios'

export const dashboardAPI = {
  getKPIs: (params = {}) =>
    axios.get('/api/dashboard/kpis', { params }),
  
  getCharts: (params = {}) =>
    axios.get('/api/dashboard/charts', { params }),
  
  getOverview: (params = {}) =>
    axios.get('/api/dashboard/overview', { params }),
  
  getDistricts: (params = {}) =>
    axios.get('/api/dashboard/districts', { params }),
  
  getHeatmap: (params = {}) =>
    axios.get('/api/dashboard/heatmap', { params }),
  
  getAlerts: (params = {}) =>
    axios.get('/api/dashboard/alerts', { params }),
  
  getTimeline: (params = {}) =>
    axios.get('/api/dashboard/timeline', { params }),
}