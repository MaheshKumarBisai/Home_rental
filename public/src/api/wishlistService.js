import api from '../utils/api';

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (propertyId) => api.post('/wishlist/add', { propertyId }),
  remove: (propertyId) => api.delete(`/wishlist/remove/${propertyId}`),
};
