import apiClient from '../api/client';

const adminService = {
  async getUsers(page = 1, perPage = 15, filters = {}) {
    const response = await apiClient.get('/admin/users', {
      params: { page, per_page: perPage, ...filters },
    });
    return response.data;
  },

  async updateUserStatus(userId, label) {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { label });
    return response.data;
  },

  async getAnalytics() {
    const response = await apiClient.get('/admin/analytics');
    return response.data;
  },
};

export default adminService;
