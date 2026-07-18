export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A'
  const d = new Date(date)
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  return d.toISOString().split('T')[0]
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export const getSeverityColor = (severity) => {
  const colors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
    critical: '#e91e63',
  }
  return colors[severity] || '#1a237e'
}

export const getStatusColor = (status) => {
  const colors = {
    reported: '#ff9800',
    investigating: '#2196f3',
    in_progress: '#1a237e',
    resolved: '#4caf50',
    closed: '#9e9e9e',
    pending: '#ff9800',
  }
  return colors[status] || '#1a237e'
}

export const downloadFile = (data, filename, type = 'application/json') => {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(',')),
  ].join('\n')
  
  downloadFile(csv, filename, 'text/csv')
}

export const debounce = (func, delay = 300) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), delay)
  }
}

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {})
}

export const calculatePercentage = (part, total) => {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}