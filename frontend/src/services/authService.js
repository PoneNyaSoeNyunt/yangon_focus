import axios from 'axios';
import apiClient from '../api/client';

const authService = {
  async register(userData) {
    const response = await apiClient.post('/register', userData);
    return response.data;
  },

  async login(credentials) {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
    });
    
    const response = await apiClient.post('/login', credentials);
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/logout');
    return response.data;
  },
};

export default authService;
