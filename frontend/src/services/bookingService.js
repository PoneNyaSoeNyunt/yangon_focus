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

  async getGuestBookings() {
    const response = await apiClient.get('/guest/bookings');
    return response.data.data ?? response.data;
  },

  async cancelBooking(bookingId, reason = null) {
    const response = await apiClient.delete(`/guest/bookings/${bookingId}`, {
      data: reason ? { reason } : {},
    });
    return response.data;
  },

  async payCash(bookingId) {
    const response = await apiClient.patch(`/guest/bookings/${bookingId}/pay-cash`);
    return response.data;
  },

  async getOwnerBookings() {
    const response = await apiClient.get('/owner/bookings');
    return response.data;
  },

  async ownerCancelBooking(bookingId, reason) {
    const response = await apiClient.patch(`/owner/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },
};

export default bookingService;
