import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Base URL for the backend API
// Note: You can also use environment variables like import.meta.env.VITE_API_URL in the future
const API_URL = 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies/sessions if needed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally, add interceptors for handling tokens later
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling can go here
    return Promise.reject(error);
  }
);
