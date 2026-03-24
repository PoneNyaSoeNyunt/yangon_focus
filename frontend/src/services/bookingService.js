import apiClient from '../api/client';

const bookingService = {
  async create(data) {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },
};

export default bookingService;
