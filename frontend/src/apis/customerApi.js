import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/v1/customer`;

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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const articleApi = {
  getArticles: (params) => apiClient.get('/articles', { params }),
  getArticleDetail: (slug) => apiClient.get(`/articles/${slug}`),
  getCategories: () => apiClient.get('/articles/categories'),
  incrementViewCount: (id) => apiClient.post(`/articles/${id}/view`),
};

export const quizApi = {
  getQuizzes: (params) => apiClient.get('/quizzes', { params }),
  getQuizDetail: (id) => apiClient.get(`/quizzes/${id}`),
  startQuiz: (id) => apiClient.post(`/quizzes/${id}/attempts`),
  submitAnswer: (attemptId, data) => apiClient.post(`/attempts/${attemptId}/answers`, data),
  finishQuiz: (attemptId) => apiClient.post(`/attempts/${attemptId}/submit`),
};

export const profileApi = {
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (data) => apiClient.put('/profile', data),
  updatePassword: (data) => apiClient.patch('/profile/password', data),
  updateEmail: (data) => apiClient.patch('/profile/email', data),
  updateAvatar: (avatarUrl, publicId) => 
    apiClient.patch('/profile/avatar', null, { params: { avatarUrl, publicId } }),
};

export const imageApi = {
  uploadImage: (formData) => axios.post(`${import.meta.env.VITE_API_BASE_URL}/v1/images/upload`, formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }),
};

export default apiClient;
