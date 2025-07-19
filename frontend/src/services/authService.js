import apiClient from './apiClient';
import { setStoredToken, clearStoredToken } from '../utils/storage';

export const authService = {
  async login(credentials) {
    const response = await apiClient.post('/api/auth/login', credentials);
    const { token, user } = response.data;
    setStoredToken(token);
    return { user, token };
  },

  async register(userData) {
    console.log("                         *************************************");
    console.log("api base url -- ", import.meta.env.VITE_API_BASE_URL);
    const response = await apiClient.post('/api/auth/register', userData);
    const { token, user } = response.data;
    setStoredToken(token);
    return { user, token };
  },

  async logout() {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      clearStoredToken();
    }
  },

  async verifyToken() {
    const response = await apiClient.get('/api/auth/verify');
    return response.data.user;
  },

  async getProfile() {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  }
};