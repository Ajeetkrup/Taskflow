import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { getStoredToken, clearStoredToken } from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthContext: Initializing auth...');
      const token = getStoredToken();
      
      if (token) {
        console.log('AuthContext: Token found, verifying...');
        try {
          const userData = await authService.verifyToken();
          console.log('AuthContext: Token verified, user data:', userData);
          setUser(userData);
        } catch (error) {
          console.error('AuthContext: Token verification failed:', error);
          clearStoredToken();
        }
      } else {
        console.log('AuthContext: No token found');
      }
      
      setLoading(false);
      console.log('AuthContext: Initialization complete');
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    console.log('AuthContext: Login attempt...');
    try {
      const response = await authService.login(credentials);
      console.log('AuthContext: Login successful, user:', response.user);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    console.log('AuthContext: Register attempt...');
    try {
      const response = await authService.register(userData);
      console.log('AuthContext: Registration successful, user:', response.user);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('AuthContext: Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('AuthContext: Logout...');
    try {
      await authService.logout();
      setUser(null);
      console.log('AuthContext: Logout successful');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      // Still clear user on logout error
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};