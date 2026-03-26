import apiClient from '../api/client';

const currentStayService = {
  async getCurrentStays() {
    const response = await apiClient.get('/guest/current-stays');
    return response.data.data ?? [];
  },
  async getStayDetail(bookingId) {
    const response = await apiClient.get(`/guest/current-stays/${bookingId}`);
    return response.data.data ?? null;
  },
  async finishStay(bookingId) {
    const response = await apiClient.patch(`/guest/bookings/${bookingId}/finish`);
    return response.data;
  },
  async submitAdvancePayment(bookingId, formData) {
    const response = await apiClient.post(`/guest/bookings/${bookingId}/advance-payment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default currentStayService;
