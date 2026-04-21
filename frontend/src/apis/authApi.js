import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  register: (email, password, fullName) =>
    apiClient.post('/auth/register', { email, password, fullName }),

  googleLogin: () => {
    window.location.href = 'http://localhost:8080/oauth2/authorize/google?redirect_uri=http://localhost:5173/oauth2/redirect';
  },
};

export default apiClient;
