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
};

export default currentStayService;
