import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token from localStorage as fallback
apiClient.interceptors.request.use((config) => {
  // Try to get token from localStorage as fallback if cookie isn't working
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('restaurantId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient; 