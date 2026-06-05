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
      window.location.href = '/dang-nhap';
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

export const contactApi = {
  submitContact: (data) => apiClient.post('/contact', data),
};

export const subscriptionApi = {
  getActivePlans: () => apiClient.get('/subscription-plans'),
  subscribeToPlan: (planId, paymentMethod) => apiClient.post(`/subscription-plans/${planId}/subscribe`, { paymentMethod }),
  createPayOSPayment: (planId) => apiClient.post('/subscription-plans/payos/create-link', { planId }),
  syncPayOSPayment: (orderCode) => apiClient.post(`/subscription-plans/payos/sync/${orderCode}`),
  getUpgradePreview: (targetPlanId) => apiClient.get('/subscription-plans/upgrade-preview', { params: { targetPlanId } }),
};

export const programApi = {
  enroll: () => apiClient.post('/program/enroll'),
  getProgress: () => apiClient.get('/program/progress'),
  getDayDetail: (dayNumber) => apiClient.get(`/program/day/${dayNumber}`),
  getWeekDetail: (weekNumber) => apiClient.get(`/program/week/${weekNumber}`),
  toggleTask: (dayNumber, weekNumber, taskIndex, isCompleted) => 
    apiClient.post('/program/toggle-task', null, { params: { dayNumber, weekNumber, taskIndex, isCompleted } }),
  saveDailyLog: (dayNumber, data) => apiClient.post(`/program/day/${dayNumber}/log`, data),
  saveWeeklyLog: (weekNumber, data) => apiClient.post(`/program/week/${weekNumber}/log`, data),
  getAnalytics: () => apiClient.get('/program/analytics'),
  getMetadata: () => apiClient.get('/program/metadata'),
  advanceDay: () => apiClient.post('/program/advance-day'),
  getProgramMedias: () => apiClient.get('/program/medias'),
  resume: () => apiClient.post('/program/resume'),
  restart: () => apiClient.post('/program/restart'),
};

export const notificationApi = {
  getNotifications: () => apiClient.get('/notifications'),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
};

export default apiClient;
