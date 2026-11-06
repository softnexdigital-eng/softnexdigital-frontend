import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'softnexdigital-backend.vercel.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on auth endpoints (register, verify, resend-otp)
    const authEndpoints = ['/auth/register', '/auth/verify', '/auth/resend-otp'];
    const isAuthEndpoint = error.config?.url && authEndpoints.some(e => error.config.url.includes(e));
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
