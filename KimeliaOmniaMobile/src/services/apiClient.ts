// src/services/apiClient.ts
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage'; // We'll install this next

// Install AsyncStorage first: expo install @react-native-async-storage/async-storage

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token to outgoing requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken'); // Store your token securely
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving token from AsyncStorage:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Example: Handle 401 Unauthorized globally
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite retry loop
      console.warn("401 Unauthorized. User might need to log in again.");
      // You could dispatch a logout action here via the AuthContext
      // Example:
      // const { logout } = useAuth(); // (Cannot call hooks here directly, needs context/callback)
      // await AsyncStorage.removeItem('jwtToken');
      // // navigate to login screen if not already there
      // eventEmitter.emit('unauthorized'); // Use an event emitter for global logout

      // For now, just remove the token and let user be redirected by AuthProvider
      await AsyncStorage.removeItem('jwtToken');
      // You would typically reload the app or navigate to login here.
      // For now, AuthProvider (when connected to real auth state) will handle.
    }

    return Promise.reject(error);
  }
);

export default apiClient;