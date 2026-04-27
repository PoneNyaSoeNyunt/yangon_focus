import apiClient from '../api/client';

const paymentService = {
  async getPendingDigitalPayments() {
    const response = await apiClient.get('/owner/payments/pending');
    return response.data;
  },

  async recordCash(bookingId) {
    const response = await apiClient.post(`/owner/bookings/${bookingId}/cash`);
    return response.data;
  },

  async verifyPayment(paymentId) {
    const response = await apiClient.patch(`/owner/payments/${paymentId}/verify`);
    return response.data;
  },

  async rejectPayment(paymentId, reason) {
    const response = await apiClient.patch(`/owner/payments/${paymentId}/reject`, { reason });
    return response.data;
  },
};

export default paymentService;
