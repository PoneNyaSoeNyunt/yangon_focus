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

  async getHostel(id) {
    const response = await apiClient.get(`/owner/hostels/${id}`);
    return response.data;
  },

  async updateHostel(id, data) {
    const response = await apiClient.patch(`/owner/hostels/${id}`, data);
    return response.data;
  },

  async addRooms(hostelId, rooms) {
    const response = await apiClient.post(`/owner/hostels/${hostelId}/rooms`, { rooms });
    return response.data;
  },

  async updateRoom(roomId, data) {
    const response = await apiClient.patch(`/owner/rooms/${roomId}`, data);
    return response.data;
  },

  async deleteRoom(roomId) {
    const response = await apiClient.delete(`/owner/rooms/${roomId}`);
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

  async makeImagePrimary(hostelId, imageId) {
    const response = await apiClient.patch(`/owner/hostels/${hostelId}/images/${imageId}/primary`);
    return response.data;
  },

  async deleteImage(hostelId, imageId) {
    const response = await apiClient.delete(`/owner/hostels/${hostelId}/images/${imageId}`);
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

  async getOwnerRenters() {
    const response = await apiClient.get('/owner/renters');
    return response.data;
  },

  async getRenterPayments(userId) {
    const response = await apiClient.get(`/owner/renters/${userId}/payments`);
    return response.data;
  },
};

export default ownerService;
