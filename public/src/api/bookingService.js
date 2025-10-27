import api from '../utils/api'

export const bookingAPI = {
  apply: (propertyId) => api.post('/bookings/apply', { propertyId }),
  getUserBookings: (userId) => api.get(`/bookings/user/${userId}`),
  getOwnerBookings: () => api.get('/bookings/owner'),
  getPropertyBookings: (propertyId) => api.get(`/bookings/property/${propertyId}`),
  getDetails: (bookingId) => api.get(`/bookings/${bookingId}`),
  cancel: (bookingId) => api.delete(`/bookings/cancel/${bookingId}`),
  updateApplicationStatus: (bookingId, status) => api.put(`/bookings/applications/${bookingId}/status`, { status })
}