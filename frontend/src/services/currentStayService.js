import apiClient from '../api/client';

const currentStayService = {
  async getCurrentStay() {
    const response = await apiClient.get('/guest/current-stay');
    return response.data.data ?? null;
  },
};

export default currentStayService;
