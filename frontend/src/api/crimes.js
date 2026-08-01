import axios from './axios'

export const crimeAPI = {
  getAll: (params = {}) =>
    axios.get('/api/crimes', { params }),
  
  getById: (id) =>
    axios.get(`/api/crimes/${id}`),
  
  create: (data) =>
    axios.post('/api/crimes', data),
  
  update: (id, data) =>
    axios.put(`/api/crimes/${id}`, data),
  
  delete: (id) =>
    axios.delete(`/api/crimes/${id}`),
  
  getStats: (params = {}) =>
    axios.get('/api/crimes/stats', { params }),
  
  getTrends: (params = {}) =>
    axios.get('/api/crimes/trends', { params }),
  
  getHotspots: (params = {}) =>
    axios.get('/api/crimes/hotspots', { params }),
  
  getCrimeTypes: () =>
    axios.get('/api/crimes/types'),

  bulkUpload: (data) =>
    axios.post('/api/crimes/bulk', data),     
  
  matchMO: (query) =>
    axios.post('/api/crimes/match-mo', { query }),

  export: (params = {}) =>
    axios.get('/api/crimes/export', { params, responseType: 'blob' }),
}