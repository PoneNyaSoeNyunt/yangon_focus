import apiClient from '../api/client';

const reportService = {
  async fileReport(formData) {
    const response = await apiClient.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getReports(status = null) {
    const params = status ? { status } : {};
    const response = await apiClient.get('/admin/reports', { params });
    return response.data;
  },

  async resolveReport(id, payload) {
    const response = await apiClient.patch(`/admin/reports/${id}/resolve`, payload);
    return response.data;
  },
};

export default reportService;
