import apiClient from '../api/client';

const ownerService = {
  async getHostels() {
    const response = await apiClient.get('/owner/hostels');
    return response.data;
  },

  async createHostel(data) {
    const response = await apiClient.post('/owner/hostels', data);
    return response.data;
  },

  async addRooms(hostelId, rooms) {
    const response = await apiClient.post(`/owner/hostels/${hostelId}/rooms`, { rooms });
    return response.data;
  },

  async uploadLicense(hostelId, licenseNumber, imageFile) {
    const form = new FormData();
    form.append('license_number', licenseNumber);
    form.append('image', imageFile);
    const response = await apiClient.post(`/owner/hostels/${hostelId}/license`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async uploadImages(hostelId, files) {
    const form = new FormData();
    files.forEach((file) => form.append('images[]', file));
    const response = await apiClient.post(`/owner/hostels/${hostelId}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getTownships() {
    const response = await apiClient.get('/townships');
    return response.data;
  },

  async getRoomTypes() {
    const response = await apiClient.get('/room-types');
    return response.data;
  },
};

export default ownerService;
