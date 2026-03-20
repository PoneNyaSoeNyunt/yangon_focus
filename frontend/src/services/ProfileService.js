import apiClient from '../api/client';

const ProfileService = {
  async updateProfile(data) {
    const response = await apiClient.patch('/user/profile', data);
    return response.data;
  },

  async updatePassword(data) {
    const response = await apiClient.patch('/user/password', data);
    return response.data;
  },
};

export default ProfileService;
