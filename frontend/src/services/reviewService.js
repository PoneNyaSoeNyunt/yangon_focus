import apiClient from '../api/client';

const reviewService = {
  async getHostelReviews(hostelId) {
    const response = await apiClient.get(`/public/hostels/${hostelId}/reviews`);
    return response.data;
  },

  async submitReview(bookingId, data) {
    const response = await apiClient.post(`/guest/bookings/${bookingId}/review`, data);
    return response.data;
  },
};

export default reviewService;
