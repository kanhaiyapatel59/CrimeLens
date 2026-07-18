export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const isValidPhone = (phone) => {
  return /^[0-9]{10}$/.test(phone)
}

export const isValidPassword = (password) => {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password)
}

export const isValidFIRNumber = (fir) => {
  return /^[A-Z0-9]{5,20}$/.test(fir)
}

export const isValidCoordinates = (lat, lng) => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

export const validateCrimeData = (data) => {
  const errors = {}
  
  if (!data.firNumber) errors.firNumber = 'FIR number is required'
  if (!data.incidentId) errors.incidentId = 'Incident ID is required'
  if (!data.crimeType) errors.crimeType = 'Crime type is required'
  if (!data.date) errors.date = 'Date is required'
  if (!data.description || data.description.length < 10) {
    errors.description = 'Description must be at least 10 characters'
  }
  if (data.severity && !['low', 'medium', 'high', 'critical'].includes(data.severity)) {
    errors.severity = 'Invalid severity level'
  }
  if (data.status && !['reported', 'investigating', 'in_progress', 'resolved', 'closed', 'pending'].includes(data.status)) {
    errors.status = 'Invalid status'
  }
  
  return errors
}

export const validateLoginData = (data) => {
  const errors = {}
  
  if (!data.email) errors.email = 'Email is required'
  else if (!isValidEmail(data.email)) errors.email = 'Invalid email format'
  
  if (!data.password) errors.password = 'Password is required'
  else if (data.password.length < 8) errors.password = 'Password must be at least 8 characters'
  
  return errors
}

export const validateRegisterData = (data) => {
  const errors = {}
  
  if (!data.firstName) errors.firstName = 'First name is required'
  if (!data.lastName) errors.lastName = 'Last name is required'
  
  if (!data.email) errors.email = 'Email is required'
  else if (!isValidEmail(data.email)) errors.email = 'Invalid email format'
  
  if (!data.password) errors.password = 'Password is required'
  else if (!isValidPassword(data.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and a number'
  }
  
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }
  
  return errors
}