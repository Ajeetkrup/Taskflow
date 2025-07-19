const TOKEN_KEY = 'authToken';

export const setStoredToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};