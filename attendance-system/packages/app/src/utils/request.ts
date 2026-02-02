import axios from 'axios';
import { getToken, clearAuth } from './auth';

// Use local IP for Android Emulator or physical device
// localhost works for iOS simulator but not Android
// You might need to change this to your machine's IP
const BASE_URL = 'http://10.0.2.2:3000/api/v1'; // Android Emulator default

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

request.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        await clearAuth();
        // Navigation logic to redirect to login might be needed here
        // or handle it in the UI
      }
    }
    return Promise.reject(error);
  }
);

export default request;
