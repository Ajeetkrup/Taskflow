// File: src/utils/storage.js
const TOKEN_KEY = 'taskflow_token';

export const setStoredToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};