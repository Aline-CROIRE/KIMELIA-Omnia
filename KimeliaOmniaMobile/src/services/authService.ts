// src/services/authService.ts
import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, RegisterCredentials, UserProfile } from '../types/auth'; // Define these types later

export const registerUser = async (credentials: RegisterCredentials) => {
  const response = await apiClient.post('/auth/register', credentials);
  return response.data; // Will contain user data, possibly a message about email verification
};

export const verifyEmail = async (token: string) => {
  const response = await apiClient.post('/auth/verify-email', { token });
  return response.data; // Success message
};

export const loginUser = async (credentials: LoginCredentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  const { token, user } = response.data;

  // Store the JWT token securely
  await AsyncStorage.setItem('jwtToken', token);
  return user; // Return user profile or relevant data
};

export const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await apiClient.put('/auth/profile', profileData);
  return response.data;
};

export const logoutUser = async () => {
  // On logout, remove the stored token
  await AsyncStorage.removeItem('jwtToken');
  // No backend API call usually needed for JWT logout (token just expires)
};