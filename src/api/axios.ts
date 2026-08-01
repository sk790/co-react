import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useSessionStore } from '../store/sessionStore';

// Base URL for the backend API
const API_URL = 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Auth token & Selected Academic Session ID
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const activeSessionId = useSessionStore.getState().activeSessionId;
  if (activeSessionId) {
    if (!config.headers['x-session-id']) {
      config.headers['x-session-id'] = activeSessionId;
    }
    if (!config.headers['sessionid']) {
      config.headers['sessionid'] = activeSessionId;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);
