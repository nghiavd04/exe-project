import apiClient from './authApi';

export const adminApi = {
  getDashboardStats: (period) => apiClient.get(`/v1/admin/dashboard/stats?period=${period || '7d'}`),
  sendNotification: (data) => apiClient.post('/v1/admin/notifications', data),
  getSentNotifications: (params) => apiClient.get('/v1/admin/notifications', { params }),
  
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
  getUserProgressDetails: (id) => apiClient.get(`/v1/admin/users/${id}/progress-details`),

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

  // Program Medias
  getMedias: () => apiClient.get('/v1/admin/medias'),
  getMediaDetail: (id) => apiClient.get(`/v1/admin/medias/${id}`),
  createMedia: (data) => apiClient.post('/v1/admin/medias', data),
  updateMedia: (id, data) => apiClient.put(`/v1/admin/medias/${id}`, data),
  deleteMedia: (id) => apiClient.delete(`/v1/admin/medias/${id}`),
  uploadMediaFile: (formData, onUploadProgress) => apiClient.post('/v1/admin/medias/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  }),

  // Admin Subscriptions History
  getPayments: (params) => apiClient.get('/v1/admin/subscriptions/payments', { params }),

  // Admin Program Metadata
  getProgramMetadata: () => apiClient.get('/v1/admin/program/metadata'),
  createProgramPhase: (data) => apiClient.post('/v1/admin/program/phases', data),
  deleteProgramPhase: (phaseNum) => apiClient.delete(`/v1/admin/program/phases/${phaseNum}`),
  updateProgramPhase: (phaseNum, data) => apiClient.put(`/v1/admin/program/phases/${phaseNum}`, data),
  updateProgramWeek: (weekNum, data) => apiClient.put(`/v1/admin/program/weeks/${weekNum}`, data),
  createProgramTask: (data) => apiClient.post('/v1/admin/program/tasks', data),
  updateProgramTask: (id, data) => apiClient.put(`/v1/admin/program/tasks/${id}`, data),
  deleteProgramTask: (id) => apiClient.delete(`/v1/admin/program/tasks/${id}`),
  createProgramMetric: (data) => apiClient.post('/v1/admin/program/metrics', data),
  updateProgramMetric: (id, data) => apiClient.put(`/v1/admin/program/metrics/${id}`, data),
  deleteProgramMetric: (id) => apiClient.delete(`/v1/admin/program/metrics/${id}`),

  // Admin AI Chat Configurations & Logs
  getAiPrompt: () => apiClient.get('/v1/admin/ai-chat/prompt'),
  updateAiPrompt: (promptText) => apiClient.put('/v1/admin/ai-chat/prompt', { prompt: promptText }),
  getAiChatSessions: (params) => apiClient.get('/v1/admin/ai-chat/sessions', { params }),
  getAiChatMessages: (sessionId) => apiClient.get(`/v1/admin/ai-chat/sessions/${sessionId}/messages`),
  claimSession: (sessionId) => apiClient.post(`/v1/admin/ai-chat/sessions/${sessionId}/claim`),
  takeoverSession: (sessionId) => apiClient.post(`/v1/admin/ai-chat/sessions/${sessionId}/takeover`),
  sendAdminMessage: (sessionId, content) => apiClient.post(`/v1/admin/ai-chat/sessions/${sessionId}/message`, { content }),
  getAiChatUnreadCount: () => apiClient.get('/v1/admin/ai-chat/unread-count'),
  markSessionAsRead: (sessionId) => apiClient.put(`/v1/admin/ai-chat/sessions/${sessionId}/mark-read`),
};

