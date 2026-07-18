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
  
  bulkUpload: (data) =>
    axios.post('/api/crimes/bulk', data),     
  
  export: (params = {}) =>
    axios.get('/api/crimes/export', { params, responseType: 'blob' }),
}