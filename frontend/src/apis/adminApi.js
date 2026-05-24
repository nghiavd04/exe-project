import apiClient from './authApi';

export const adminApi = {
  getDashboardStats: (period) => apiClient.get(`/v1/admin/dashboard/stats?period=${period || '7d'}`),
  
  // Future methods
  getQuizzes: (params) => apiClient.get('/v1/admin/quizzes', { params }),
  getQuizDetail: (id) => apiClient.get(`/v1/admin/quizzes/${id}`),
  getQuizStats: () => apiClient.get('/v1/admin/quizzes/stats'),
  createQuiz: (data) => apiClient.post('/v1/admin/quizzes', data),
  updateQuiz: (id, data) => apiClient.put(`/v1/admin/quizzes/${id}`, data),
  publishQuiz: (id) => apiClient.patch(`/v1/admin/quizzes/${id}/publish`),
  archiveQuiz: (id) => apiClient.patch(`/v1/admin/quizzes/${id}/archive`),
  unarchiveQuiz: (id) => apiClient.patch(`/v1/admin/quizzes/${id}/unarchive`),
  deleteQuiz: (id) => apiClient.delete(`/v1/admin/quizzes/${id}`),

  // Articles
  getArticles: (params) => apiClient.get('/v1/admin/articles', { params }),
  getArticleDetail: (id) => apiClient.get(`/v1/admin/articles/${id}`),
  getArticleStats: () => apiClient.get('/v1/admin/articles/stats'),
  createArticle: (data) => apiClient.post('/v1/admin/articles', data),
  updateArticle: (id, data) => apiClient.put(`/v1/admin/articles/${id}`, data),
  publishArticle: (id) => apiClient.patch(`/v1/admin/articles/${id}/publish`),
  archiveArticle: (id) => apiClient.patch(`/v1/admin/articles/${id}/archive`),
  unarchiveArticle: (id) => apiClient.patch(`/v1/admin/articles/${id}/unarchive`),
  getArticleCategories: () => apiClient.get('/v1/customer/articles/categories'),
  getArticleTiers: () => apiClient.get('/v1/customer/articles/tiers'),
  deleteArticle: (id) => apiClient.delete(`/v1/admin/articles/${id}`),

  uploadImage: (formData) => apiClient.post('/v1/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Users
  getUsers: (params) => apiClient.get('/v1/admin/users', { params }),
  toggleUserStatus: (id) => apiClient.patch(`/v1/admin/users/${id}/toggle-status`),
  createAdmin: (data) => apiClient.post('/v1/admin/users/admins', data),

  // Subscription Plans
  getSubscriptionPlans: (params) => apiClient.get('/v1/admin/subscription-plans', { params }),
  createSubscriptionPlan: (data) => apiClient.post('/v1/admin/subscription-plans', data),
  updateSubscriptionPlan: (id, data) => apiClient.put(`/v1/admin/subscription-plans/${id}`, data),
  deleteSubscriptionPlan: (id) => apiClient.delete(`/v1/admin/subscription-plans/${id}`),
  toggleSubscriptionPlanStatus: (id) => apiClient.patch(`/v1/admin/subscription-plans/${id}/toggle-status`),

  // Contact messages
  getContactMessages: (params) => apiClient.get('/v1/admin/contact-messages', { params }),
  replyContactMessage: (id, data) => apiClient.post(`/v1/admin/contact-messages/${id}/reply`, data),
  markContactMessageRead: (id) => apiClient.patch(`/v1/admin/contact-messages/${id}/read`),
  getUnreadContactMessagesCount: () => apiClient.get('/v1/admin/contact-messages/unread-count'),
  deleteContactMessage: (id) => apiClient.delete(`/v1/admin/contact-messages/${id}`),
};
