import axios from './axios'

export const tacticalAPI = {
  // 1. Modus Operandi Pattern Clusters & Linkage
  getMoPatterns: () => axios.get('/api/tactical/mo-patterns'),
  matchMoLinkage: (params = {}) => axios.get('/api/tactical/mo-linkage', { params }),

  // 2. AI Predictive Patrol Route Generator
  getPatrolRoutes: (params = {}) => axios.get('/api/tactical/patrol-routes', { params }),

  // 3. Suspect Facial & Witness Sketch Biometrics Desk
  getBiometrics: () => axios.get('/api/tactical/biometrics'),

  // 4. CDR & Tower Dump Co-Location Matrix
  getCdrAnalysis: () => axios.get('/api/tactical/cdr-analysis'),

  // 5. Tactical BOLO Desk & Interstate Checkpoints
  getBoloAlerts: () => axios.get('/api/tactical/bolo'),

  // 6. Cryptographic Evidence Locker & Chain of Custody
  getEvidenceLocker: () => axios.get('/api/tactical/evidence-locker'),
  verifyHash: (payload) => axios.post('/api/tactical/evidence-locker/verify', payload),
}

export default tacticalAPI
