import api from '../utils/api'

export const reviewAPI = {
  add: (reviewData) => api.post('/reviews/add', reviewData),
  getPropertyReviews: (propertyId) => api.get(`/reviews/property/${propertyId}`),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`)
}