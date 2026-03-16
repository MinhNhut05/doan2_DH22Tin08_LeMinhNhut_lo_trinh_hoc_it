import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Axios instance gọi backend API
// VITE_API_URL được set trong frontend/.env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3002/api/v1',
  withCredentials: true, // Tự động gửi cookie (refreshToken)
});

// Request interceptor: tự động đính accessToken vào mọi request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: nếu 401 → thử refresh token 1 lần
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:3002/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = res.data?.data?.accessToken;
        if (newToken) {
          useAuthStore.getState().setToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
