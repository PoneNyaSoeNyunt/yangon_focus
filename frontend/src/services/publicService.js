import apiClient from '../api/client';

const publicService = {
  async getHostels(params = {}) {
    const response = await apiClient.get('/public/hostels', { params });
    return response.data;
  },

  async getHostel(id) {
    const response = await apiClient.get(`/public/hostels/${id}`);
    return response.data;
  },

  async getTownships() {
    const response = await apiClient.get('/townships');
    return response.data;
  },
};

export default publicService;
