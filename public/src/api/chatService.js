import api from '../utils/api'

export const chatAPI = {
  getChatHistory: (bookingId) => api.get(`/chat/booking/${bookingId}`)
}