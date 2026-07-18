import axios from './axios'

export const aiAPI = {
  health: () =>
    axios.get('/api/ai/health'),
  
  status: () =>
    axios.get('/api/ai/status'),
  
  insights: () =>
    axios.get('/api/ai/insights'),
  
  predictCrime: (data) =>
    axios.post('/api/ai/predict/crime', data),
  
  predictRisk: (data) =>
    axios.post('/api/ai/predict/risk', data),
  
  detectAnomalies: (data = {}) =>
    axios.post('/api/ai/detect/anomalies', data),
  
  detectMO: (data = {}) =>
    axios.post('/api/ai/detect/mo', data),
  
  train: (modelType = 'all') =>
    axios.post('/api/ai/train', { modelType }),
  
  getTrends: (params = {}) =>
    axios.get('/api/ai/trends', { params }),
  
  getHotspots: (params = {}) =>
    axios.get('/api/ai/hotspots', { params }),
}