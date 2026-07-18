export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
export const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:5001'

export const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#4caf50' },
  { value: 'medium', label: 'Medium', color: '#ff9800' },
  { value: 'high', label: 'High', color: '#f44336' },
  { value: 'critical', label: 'Critical', color: '#e91e63' },
]

export const STATUS_OPTIONS = [
  { value: 'reported', label: 'Reported' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'pending', label: 'Pending' },
]

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrator' },
  { value: 'scrb_officer', label: 'SCRB Officer' },
  { value: 'district_officer', label: 'District Officer' },
  { value: 'station_officer', label: 'Station Officer' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'viewer', label: 'Viewer' },
]

export const CHART_COLORS = [
  '#1a237e', '#3949ab', '#5c6bc0', '#7986cb',
  '#9fa8da', '#c5cae9', '#e8eaf6', '#283593',
  '#0d1442', '#3f51b5', '#6f7dc7', '#8e99d3',
]

export const PAGINATION_OPTIONS = [5, 10, 25, 50, 100]