import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/auth/register', { name, email, password });
      // For now, we don't auto-login after register. User will need to login manually.
      // You might want to handle email verification flow here if needed.
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
    setUser(null);
    setIsLoading(false);
  };

  const checkLoggedInUser = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Validate token or fetch user profile to ensure it's still valid
        const response = await apiClient.get('/auth/profile'); //
        setUser(response.data);
        setUserToken(token);
      }
    } catch (e) {
      console.log('Error checking user session:', e);
      await AsyncStorage.removeItem('userToken'); // Clear invalid token
      setUserToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  return (
    <AuthContext.Provider value={{ userToken, user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};