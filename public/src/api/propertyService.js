import api from '../utils/api'

export const propertyAPI = {
  getAll: (params = {}) => api.get('/properties/all', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  search: (filters) => api.get('/properties/search', { params: filters }),
  create: (propertyData) => api.post('/properties/create', propertyData),
  update: (id, propertyData) => api.put(`/properties/update/${id}`, propertyData),
  delete: (id) => api.delete(`/properties/delete/${id}`),
  getMyProperties: () => api.get('/properties/owner/my-properties')
}