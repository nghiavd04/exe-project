import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1/customer';

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

export default apiClient;
