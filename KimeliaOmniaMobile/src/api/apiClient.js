import axios from 'axios';
import { API_BASE_URL } from './constants'; // Assuming constants.js is in the parent directory
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token for authenticated requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving user token from AsyncStorage:", error);
      // Optionally handle token retrieval error, e.g., redirect to login
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;