import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

// Handle 401 Unauthorized responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if it's a 401 error AND we're NOT doing an auth-related request
    const isAuthRequest = error.config?.url?.includes('/auth/');

    if (error.response && error.response.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/dang-nhap';
    }
    return Promise.reject(error);
  }
);



export const authApi = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  register: (email, password, fullName) =>
    apiClient.post('/auth/register', { email, password, fullName }),

  sendCode: (email) =>
    apiClient.post(`/auth/send-code?email=${email}`),

  verifyCode: (email, code) =>
    apiClient.post(`/auth/verify-code?email=${email}&code=${code}`),

  forgotPassword: (email) =>
    apiClient.post(`/auth/forgot-password?email=${email}`),

  resetPassword: (data) =>
    apiClient.post('/auth/reset-password', data),

  googleLogin: () => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
    const frontendUrl = window.location.origin;
    window.location.href = `${backendUrl}/oauth2/authorize/google?redirect_uri=${frontendUrl}/oauth2/redirect`;
  },
};

export default apiClient;
