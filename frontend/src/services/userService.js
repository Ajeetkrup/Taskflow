// File: src/services/userService.js
import apiClient from './apiClient';

export const userService = {
  async updateProfile(profileData) {
    const response = await apiClient.put('/api/users/profile', profileData);
    return response.data;
  },

  async updatePassword(passwordData) {
    const response = await apiClient.put('/api/users/password', passwordData);
    return response.data;
  },

  async deactivateAccount() {
    const response = await apiClient.delete('/api/users/deactivate');
    return response.data;
  },

  async getUserById(id) {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  }
};