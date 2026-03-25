import apiClient from '../api/client';

const bookingService = {
  async create(data) {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },

  async getMyBookings() {
    const response = await apiClient.get('/my-bookings');
    return response.data;
  },

  async uploadPayment(bookingId, formData) {
    const response = await apiClient.post(`/bookings/${bookingId}/payment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getOwnerBookings() {
    const response = await apiClient.get('/owner/bookings');
    return response.data;
  },
};

export default bookingService;
