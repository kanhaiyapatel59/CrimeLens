import axios from './axios'

export const networkAPI = {
  getNodes: (params = {}) =>
    axios.get('/api/network/nodes', { params }),
  
  getEdges: (params = {}) =>
    axios.get('/api/network/edges', { params }),
  
  getGraph: (params = {}) =>
    axios.get('/api/network/graph', { params }),
  
  findPath: (params = {}) =>
    axios.get('/api/network/path', { params }),
  
  getCentrality: (id) =>
    axios.get(`/api/network/centrality/${id}`),
  
  getCommunities: (params = {}) =>
    axios.get('/api/network/communities', { params }),
  
  getSuspectNetwork: (id, params = {}) =>
    axios.get(`/api/network/suspect/${id}`, { params }),
  
  getCrimeNetwork: (id, params = {}) =>
    axios.get(`/api/network/crime/${id}`, { params }),
  
  getStats: () =>
    axios.get('/api/network/statistics'),
}