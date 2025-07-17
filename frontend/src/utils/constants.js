// File: src/utils/constants.js
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
    VERIFY: '/api/auth/verify'
  },
  USER: {
    PROFILE: '/api/users/profile',
    PASSWORD: '/api/users/password',
    DEACTIVATE: '/api/users/deactivate'
  }
};

export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful!',
    REGISTER: 'Registration successful!',
    PROFILE_UPDATE: 'Profile updated successfully!',
    PASSWORD_UPDATE: 'Password updated successfully!'
  },
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    VALIDATION: 'Please check your input and try again.'
  }
};