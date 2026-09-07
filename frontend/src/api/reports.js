import axios from './axios'

export const reportsAPI = {
  getAll: () => axios.get('/api/reports'),
  generate: (data) => axios.post('/api/reports/generate', data),
  getById: (id) => axios.get(`/api/reports/${id}`),
  delete: (id) => axios.delete(`/api/reports/${id}`),
}
