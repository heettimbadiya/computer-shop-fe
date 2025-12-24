import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getParts = async (category = null, compatibleWith = null) => {
  try {
    const params = {}
    if (category) params.category = category
    if (compatibleWith) params.compatibleWith = JSON.stringify(compatibleWith)
    // Always include second-hand items now
    
    const response = await api.get('/parts', { params })
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching parts:', error)
    throw error
  }
}

export const getCompatibleParts = async (category, selectedParts) => {
  try {
    // Add timestamp to prevent caching
    const params = { 
      category, 
      compatibleWith: JSON.stringify(selectedParts),
      _t: Date.now() // Cache busting parameter
    }
    const response = await api.get('/parts', { params })
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching compatible parts:', error)
    throw error
  }
}

export const submitConfigRequest = async (configData) => {
  try {
    const response = await api.post('/config-requests', configData)
    return response.data
  } catch (error) {
    console.error('Error submitting config request:', error)
    throw error
  }
}

// Admin API functions
export const createPart = async (partData) => {
  try {
    const response = await api.post('/parts', partData)
    return response.data
  } catch (error) {
    console.error('Error creating part:', error)
    throw error
  }
}

export const updatePart = async (partId, partData) => {
  try {
    const response = await api.put(`/parts/${partId}`, partData)
    return response.data
  } catch (error) {
    console.error('Error updating part:', error)
    throw error
  }
}

export const deletePart = async (partId) => {
  try {
    const response = await api.delete(`/parts/${partId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting part:', error)
    throw error
  }
}

export const getPartById = async (partId) => {
  try {
    const response = await api.get(`/parts/${partId}`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching part:', error)
    throw error
  }
}

export const getAllConfigRequests = async (status = null) => {
  try {
    const params = status ? { status } : {}
    // Add cache busting to ensure fresh data
    params._t = Date.now()
    const response = await api.get('/config-requests', { params })
    console.log('API Response:', response.data)
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching config requests:', error)
    console.error('Error response:', error.response?.data)
    throw error
  }
}

export const getConfigRequestById = async (requestId) => {
  try {
    const response = await api.get(`/config-requests/${requestId}`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching config request:', error)
    throw error
  }
}

export const updateConfigRequestStatus = async (requestId, status) => {
  try {
    const response = await api.put(`/config-requests/${requestId}/status`, { status })
    return response.data
  } catch (error) {
    console.error('Error updating config request status:', error)
    throw error
  }
}

// Contact Information API
export const getContactInfo = async () => {
  try {
    const response = await api.get('/contact-info')
    return response.data.data
  } catch (error) {
    console.error('Error fetching contact info:', error)
    // Return default values if API fails
    return {
      workerPhone: '+90 551 894 00 69',
      instagramUrl: 'https://www.instagram.com/xpanbilgisayar',
    }
  }
}

export const updateContactInfo = async (contactData) => {
  try {
    const response = await api.put('/contact-info', contactData)
    return response.data
  } catch (error) {
    console.error('Error updating contact info:', error)
    throw error
  }
}

export default api

