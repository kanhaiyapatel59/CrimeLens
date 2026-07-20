import axios from './axios'

export const aiAPI = {
  // Chat with AI
  chat: (data) =>
    axios.post('/api/ai/chat', data),
  
  // Analyze crime patterns
  analyze: (data) =>
    axios.post('/api/ai/analyze', data),
  
  // Predict hotspots
  predictHotspots: (data) =>
    axios.post('/api/ai/predict-hotspots', data),
  
  // Analyze network
  analyzeNetwork: (data) =>
    axios.post('/api/ai/analyze-network', data),
  
  // Generate report
  generateReport: (data) =>
    axios.post('/api/ai/generate-report', data),
  
  // Quick query
  query: (data) =>
    axios.post('/api/ai/query', data),
}