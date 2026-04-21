import apiClient from './authApi';

export const adminApi = {
  getDashboardStats: (period) => apiClient.get(`/v1/admin/dashboard/stats?period=${period || '7d'}`),
  
  // Future methods
  getQuizzes: (params) => apiClient.get('/v1/admin/quizzes', { params }),
  getQuizStats: () => apiClient.get('/v1/admin/quizzes/stats'),
  publishQuiz: (id) => apiClient.patch(`/v1/admin/quizzes/${id}/publish`),
  archiveQuiz: (id) => apiClient.patch(`/v1/admin/quizzes/${id}/archive`),
  unarchiveQuiz: (id) => apiClient.patch(`/v1/admin/quizzes/${id}/unarchive`),
  deleteQuiz: (id) => apiClient.delete(`/v1/admin/quizzes/${id}`),

  // Articles
  getArticles: (params) => apiClient.get('/v1/admin/articles', { params }),
  getArticleStats: () => apiClient.get('/v1/admin/articles/stats'),
  publishArticle: (id) => apiClient.patch(`/v1/admin/articles/${id}/publish`),
  archiveArticle: (id) => apiClient.patch(`/v1/admin/articles/${id}/archive`),
  unarchiveArticle: (id) => apiClient.patch(`/v1/admin/articles/${id}/unarchive`),
  deleteArticle: (id) => apiClient.delete(`/v1/admin/articles/${id}`),
};
