import apiClient from './authApi';

export const adminApi = {
  getDashboardStats: (period) => apiClient.get(`/v1/admin/dashboard/stats?period=${period || '7d'}`),
  
  // Future methods
  // getArticles: () => apiClient.get('/v1/admin/articles'),
  // getQuizzes: () => apiClient.get('/v1/admin/quizzes'),
};
