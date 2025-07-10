import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../config/environment';

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await authAPI.refreshToken(refreshToken);
          const { token } = response.data;
          await AsyncStorage.setItem('token', token);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${token}`;
          return apiClient.request(error.config);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await AsyncStorage.multiRemove(['token', 'refreshToken']);
        // Note: In a real app, you'd dispatch a logout action here
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  register: (userData: { username: string; email: string; password: string }) =>
    apiClient.post('/auth/register', userData),
  
  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
  
  logout: () =>
    apiClient.post('/auth/logout'),

  getProfile: () =>
    apiClient.get('/auth/profile'),
};

export const chatAPI = {
  getConversations: () =>
    apiClient.get('/chat/conversations'),
  
  getMessages: (conversationId: string, page = 1, limit = 50) =>
    apiClient.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit }
    }),
  
  createConversation: (participantIds: string[], title?: string) =>
    apiClient.post('/chat/conversations', { participantIds, title }),

  sendMessage: (conversationId: string, data: { content: string; type?: string }) =>
    apiClient.post(`/chat/conversations/${conversationId}/messages`, data),
};

// Token management utilities
export const tokenStorage = {
  setTokens: async (token: string, refreshToken: string) => {
    await AsyncStorage.multiSet([
      ['token', token],
      ['refreshToken', refreshToken]
    ]);
  },

  getToken: async () => {
    return await AsyncStorage.getItem('token');
  },

  getRefreshToken: async () => {
    return await AsyncStorage.getItem('refreshToken');
  },

  clearTokens: async () => {
    await AsyncStorage.multiRemove(['token', 'refreshToken']);
  },
};