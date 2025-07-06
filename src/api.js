// src/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', data.message || 'Insufficient permissions');
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', data.message || 'The requested resource was not found');
          break;
          
        case 422:
          // Validation error
          console.error('Validation error:', data.errors || data.message);
          break;
          
        case 500:
          // Server error
          console.error('Server error:', data.message || 'Internal server error');
          break;
          
        default:
          console.error('API error:', data.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API methods for different endpoints
export const authAPI = {
  // Authentication endpoints
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  
  // Get current user
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

export const userAPI = {
  // User management endpoints
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  toggleUserStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

export const adminAPI = {
  // Admin-specific endpoints
  getDashboardStats: () => api.get('/admin/dashboard'),
  getSystemLogs: (params) => api.get('/admin/logs', { params }),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  backupDatabase: () => api.post('/admin/backup'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.put('/admin/settings', settings),
};

// Generic CRUD operations helper
export const createCRUDAPI = (endpoint) => ({
  getAll: (params) => api.get(endpoint, { params }),
  getById: (id) => api.get(`${endpoint}/${id}`),
  create: (data) => api.post(endpoint, data),
  update: (id, data) => api.put(`${endpoint}/${id}`, data),
  delete: (id) => api.delete(`${endpoint}/${id}`),
  patch: (id, data) => api.patch(`${endpoint}/${id}`, data),
});

// File upload helper
export const uploadAPI = {
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
  
  uploadMultipleFiles: (files, onProgress) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
};

// Error handling helper
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      status,
      message: data.message || 'An error occurred',
      errors: data.errors || {},
    };
  } else if (error.request) {
    // Network error
    return {
      status: 0,
      message: 'Network error. Please check your connection.',
      errors: {},
    };
  } else {
    // Other error
    return {
      status: 0,
      message: error.message || 'An unexpected error occurred',
      errors: {},
    };
  }
};

// Export the main api instance as default
export default api;