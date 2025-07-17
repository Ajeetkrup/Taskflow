// File: src/services/userService.js
import { userApiClient } from './apiClient';

export const userService = {
  async updateProfile(profileData) {
    const response = await userApiClient.put('/api/users/profile', profileData);
    return response.data;
  },

  async updatePassword(passwordData) {
    const response = await userApiClient.put('/api/users/password', passwordData);
    return response.data;
  },

  async deactivateAccount() {
    const response = await userApiClient.delete('/api/users/deactivate');
    return response.data;
  },

  async getUserById(id) {
    const response = await userApiClient.get(`/api/users/${id}`);
    return response.data;
  }
};