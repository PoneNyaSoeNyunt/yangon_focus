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

  async updateReview(reviewId, data) {
    const response = await apiClient.put(`/guest/reviews/${reviewId}`, data);
    return response.data;
  },

  async deleteReview(reviewId) {
    const response = await apiClient.delete(`/guest/reviews/${reviewId}`);
    return response.data;
  },

  async getReviewEligibility(hostelId) {
    const response = await apiClient.get(`/guest/hostels/${hostelId}/review-eligibility`);
    return response.data;
  },
};

export default reviewService;
