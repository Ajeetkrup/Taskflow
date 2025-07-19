import axios from 'axios';

// Base configurations for different services
const API_CONFIGS = {
  auth: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 10000,
  },
  user: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 10000,
  },
  task: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 10000,
  },
  analytics: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 10000,
  },
  notification: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 10000,
  },
};

// Create axios instances for each service
const createApiClient = (service) => {
  const client = axios.create(API_CONFIGS[service]);
  
  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
  
  return client;
};

// Export individual service clients
export const authApiClient = createApiClient('auth');
export const userApiClient = createApiClient('user');
export const taskApiClient = createApiClient('task');
export const analyticsApiClient = createApiClient('analytics');
export const notificationApiClient = createApiClient('notification');

// Default export (for backward compatibility)
export default authApiClient;
