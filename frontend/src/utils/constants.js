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
    PASSWORD_UPDATE: 'Password updated successfully!',
    TASK_CREATE: 'Task created successfully!',
    TASK_UPDATE: 'Task updated successfully!',
    TASK_DELETE: 'Task deleted successfully!',
    TASK_STATUS: 'Task status changed successfully!'
  },
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    VALIDATION: 'Please check your input and try again.'
  }
};

export const INITIALNOTIFICATION = {
  message:"",
  status: ""
}