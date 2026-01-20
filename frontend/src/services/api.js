import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          useAuthStore.getState().setTokens(accessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    // Extract error message
    const message = error.response?.data?.error?.message || 
                    error.message || 
                    'An unexpected error occurred';

    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Chat API
export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  createChat: () => api.post('/chat/new'),
  getChatHistory: (params) => api.get('/chat/history', { params }),
  getChatById: (chatId) => api.get(`/chat/${chatId}`),
  deleteChat: (chatId) => api.delete(`/chat/${chatId}`),
  addFeedback: (messageId, data) => api.post(`/chat/feedback/${messageId}`, data),
};

// Document API
export const documentAPI = {
  getDocuments: (params) => api.get('/documents', { params }),
  getDocument: (id) => api.get(`/documents/${id}`),
  uploadDocument: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadMultiple: (formData) => api.post('/documents/upload-multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateDocument: (id, data) => api.put(`/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  reprocessDocument: (id) => api.post(`/documents/${id}/reprocess`),
  getCategories: () => api.get('/documents/categories'),
  getAnalytics: () => api.get('/documents/analytics'),
};

// FAQ API
export const faqAPI = {
  getPublicFAQs: (category) => api.get('/faqs', { params: { category } }),
  getAllFAQs: (params) => api.get('/faqs/admin/all', { params }),
  getFAQ: (id) => api.get(`/faqs/${id}`),
  createFAQ: (data) => api.post('/faqs', data),
  updateFAQ: (id, data) => api.put(`/faqs/${id}`, data),
  deleteFAQ: (id) => api.delete(`/faqs/${id}`),
  addFeedback: (id, data) => api.post(`/faqs/${id}/feedback`, data),
  getCategories: () => api.get('/faqs/categories'),
  bulkImport: (data) => api.post('/faqs/bulk-import', data),
  getAnalytics: () => api.get('/faqs/admin/analytics'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllChats: (params) => api.get('/admin/chats', { params }),
  getChatDetails: (chatId) => api.get(`/admin/chats/${chatId}`),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getSystemHealth: () => api.get('/admin/system/health'),
};

// User API
export const userAPI = {
  getUser: (id) => api.get(`/users/${id}`),
  searchUsers: (q, limit) => api.get('/users/search', { params: { q, limit } }),
};
