import axios from './axios'

export const correlationAPI = {
  // Get correlation matrix
  getMatrix: (params = {}) =>
    axios.get('/api/correlation/matrix', { params }),
  
  // Get district correlation
  getDistrictCorrelation: (districtId, params = {}) =>
    axios.get(`/api/correlation/district/${districtId}`, { params }),
  
  // Get top factors
  getTopFactors: (districtId) =>
    axios.get(`/api/correlation/district/${districtId}/factors`),
  
  // Get economic data
  getEconomicData: (districtId) =>
    axios.get(`/api/correlation/district/${districtId}/economic`),
  
  // Update economic data
  updateEconomicData: (districtId, data) =>
    axios.put(`/api/correlation/district/${districtId}/economic`, data),
  
  // Seed economic data (admin only)
  seedEconomicData: () =>
    axios.post('/api/correlation/seed'),
}