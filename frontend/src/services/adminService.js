import apiClient from '../api/client';

const adminService = {
  async getUsers(page = 1, perPage = 15) {
    const response = await apiClient.get('/admin/users', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },
};

export default adminService;
