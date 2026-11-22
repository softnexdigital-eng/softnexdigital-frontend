import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
    const branchId = localStorage.getItem('selectedBranchId');
    if (branchId) {
      config.headers['x-branch-id'] = branchId;
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
    // Also don't redirect on branches - some users may not have branch access but token is valid
    const excludedEndpoints = ['/auth/register', '/auth/verify', '/auth/resend-otp', '/branches'];
    const isExcludedEndpoint = error.config?.url && excludedEndpoints.some(e => error.config.url.includes(e));
    
    if (error.response?.status === 401 && !isExcludedEndpoint) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedBranchId');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    } else if (error.response?.status === 403 && !isExcludedEndpoint) {
      // Forbidden - token may be invalid or insufficient permissions; clear session and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedBranchId');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
