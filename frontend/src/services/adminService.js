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

  async getLicenses(page = 1, filters = {}) {
    const response = await apiClient.get('/admin/licenses', {
      params: { page, ...filters },
    });
    return response.data;
  },

  async verifyLicense(id, label, reason = null) {
    const response = await apiClient.patch(`/admin/licenses/${id}/verify`, { label, reason });
    return response.data;
  },

  async disableLicense(id, reason) {
    const response = await apiClient.patch(`/admin/licenses/${id}/disable`, { reason });
    return response.data;
  },

  async getComments(filters = {}) {
    const response = await apiClient.get('/admin/comments', { params: filters });
    return response.data;
  },

  async resolveComment(id) {
    const response = await apiClient.patch(`/admin/comments/${id}/resolve`);
    return response.data;
  },
};

export default adminService;
