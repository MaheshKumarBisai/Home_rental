import api from '../utils/api'

export const bookingAPI = {
  create: (bookingData) => api.post('/bookings/create', bookingData),
  getUserBookings: (userId) => api.get(`/bookings/user/${userId}`),
  getPropertyBookings: (propertyId) => api.get(`/bookings/property/${propertyId}`),
  getDetails: (bookingId) => api.get(`/bookings/${bookingId}`),
  cancel: (bookingId) => api.delete(`/bookings/cancel/${bookingId}`)
}