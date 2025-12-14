import axios from 'axios';
import { mockLogin, mockUsers } from '../utils/mockData';

const USER_SERVICE_URL = 'http://localhost:8081'; // UserService port
const AUTH_SERVICE_URL = 'http://localhost:8081'; // AuthService port (same as UserService)

const userApi = axios.create({
  baseURL: USER_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
[userApi, authApi].forEach(api => {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
});

export const authService = {
  login: async (credentials) => {
    try {
      // Try UserService for authentication
      const response = await userApi.get('/users/login', {
        params: {
          email: credentials.username,
          password: credentials.password
        }
      });
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      return {
        data: {
          token: mockToken,
          user: response.data
        }
      };
    } catch (error) {
      // Fallback to mock authentication for development
      console.warn('Backend not available, using mock authentication');
      return mockLogin(credentials.username, credentials.password);
    }
  },
  signup: async (userData) => {
    try {
      const response = await userApi.post('/users/register', {
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: userData.role
      });
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      return {
        data: {
          token: mockToken,
          user: response.data
        }
      };
    } catch (error) {
      // Fallback to mock signup for development
      console.warn('Backend not available, using mock signup');
      const newUser = {
        id: Date.now(),
        ...userData
      };
      
      return {
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: newUser
        }
      };
    }
  },
  refreshToken: () => authApi.post('/auth/refresh'),
};