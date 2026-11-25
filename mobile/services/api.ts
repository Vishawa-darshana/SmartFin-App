import axios from 'axios';
import { Platform } from 'react-native';

/**
 * Default API host addresses:
 * - Android Emulator: 10.0.2.2
 * - iOS Simulator / Web: localhost
 * - Physical Device: Replace with your development machine's local LAN IP (e.g., 192.168.1.X)
 */
const getDefaultBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api';
  }
  return 'http://localhost:8000/api';
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.detail || error?.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
