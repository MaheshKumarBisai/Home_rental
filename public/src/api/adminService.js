import api from '../utils/api'

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUserDetails: (userId) => api.get(`/admin/user/${userId}`),
  blockUser: (userId, isBlocked) => api.put(`/admin/block/${userId}`, { isBlocked }),
  deleteProperty: (propertyId) => api.delete(`/admin/property/${propertyId}`),
  deleteUser: (userId) => api.delete(`/admin/user/${userId}`)
}