import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Get token from storage
    const token = null; // AsyncStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      // TODO: Redirect to login or refresh token
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
};

export const chatAPI = {
  getConversations: () =>
    apiClient.get('/conversations'),
  
  getMessages: (conversationId: string, page = 1, limit = 50) =>
    apiClient.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit }
    }),
  
  createConversation: (participantIds: string[], title?: string) =>
    apiClient.post('/conversations', { participantIds, title }),
};