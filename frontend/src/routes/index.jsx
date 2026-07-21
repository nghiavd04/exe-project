import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppState from '../components/AppState';

import ProtectedRoute from '../components/ProtectedRoute';
import TierRoute from '../components/TierRoute';

// A simple wrapper to enable Suspense during lazy loading
const Suspended = ({ element }) => (
  <Suspense fallback={<AppState variant="loading" compact title="Đang tải trang..." />}>
    {element}
  </Suspense>
);

// Admin / Layout Shells (Lazy Loaded)
const AdminRoute = lazy(() => import('./AdminRoute'));
const AdminLayout = lazy(() => import('../layouts/admin/AdminLayout'));
const CustomerLayout = lazy(() => import('../layouts/customer/CustomerLayout'));

// Auth Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const OAuth2RedirectPage = lazy(() => import('../pages/auth/OAuth2RedirectPage'));

// Admin Pages
const DashboardPage = lazy(() => import('../pages/admin/dashboard/DashboardPage'));
const AdminQuizListPage = lazy(() => import('../pages/admin/quizzes/QuizListPage'));
const CreateQuizPage = lazy(() => import('../pages/admin/quizzes/CreateQuizPage'));
const QuizAnalyticsPage = lazy(() => import('../pages/admin/quiz-analytics/QuizAnalyticsPage'));
const QuizAttemptDetailPage = lazy(() => import('../pages/admin/quiz-analytics/QuizAttemptDetailPage'));
const AdminArticleListPage = lazy(() => import('../pages/admin/articles/ArticleListPage'));
const CreateArticlePage = lazy(() => import('../pages/admin/articles/CreateArticlePage'));
const AdminManagerAccountPage = lazy(() => import('../pages/admin/accounts/AdminManagerAccountPage'));
const AdminSubscriptionPage = lazy(() => import('../pages/admin/subscriptions/AdminSubscriptionPage'));
const AdminContactMessagesPage = lazy(() => import('../pages/admin/contact/AdminContactMessagesPage'));
const AdminNotificationsPage = lazy(() => import('../pages/admin/AdminNotificationsPage'));
const AdminMediaListPage = lazy(() => import('../pages/admin/medias/AdminMediaListPage'));
const AdminProgramPage = lazy(() => import('../pages/admin/program/AdminProgramPage'));
const AdminAiChatLogs = lazy(() => import('../pages/admin/ai-chat/AdminAiChatLogs'));

// Customer Pages
const HomePage = lazy(() => import('../pages/customer/home/HomePage'));
const AboutPage = lazy(() => import('../pages/customer/about/AboutPage'));
const ContactPage = lazy(() => import('../pages/customer/contact/ContactPage'));
const PlaceholderPage = lazy(() => import('../pages/customer/PlaceholderPage'));
const ArticleListPage = lazy(() => import('../pages/customer/articles/ArticleListPage'));
const ArticleDetailPage = lazy(() => import('../pages/customer/articles/ArticleDetailPage'));
const QuizListPage = lazy(() => import('../pages/customer/quizzes/QuizListPage'));
const QuizRunnerPage = lazy(() => import('../pages/customer/quizzes/QuizRunnerPage'));
const ProfilePage = lazy(() => import('../pages/customer/profile/ProfilePage'));
const TermsAndPrivacyPage = lazy(() => import('../pages/customer/legal/TermsAndPrivacyPage'));
const SubscriptionPlansPage = lazy(() => import('../pages/customer/plans/SubscriptionPlansPage'));
const PaymentSuccessPage = lazy(() => import('../pages/customer/plans/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('../pages/customer/plans/PaymentCancelPage'));
const ProgramLayout = lazy(() => import('../pages/customer/program/ProgramLayout'));
const ProgramRoadmapPage = lazy(() => import('../pages/customer/program/ProgramRoadmapPage'));
const ProgramDetailPage = lazy(() => import('../pages/customer/program/ProgramDetailPage'));
const ProgramMediaPage = lazy(() => import('../pages/customer/program/ProgramMediaPage'));

export const router = createBrowserRouter([
  {
    path: '/dang-nhap',
    element: <Suspended element={<LoginPage />} />,
  },
  {
    path: '/dang-ky',
    element: <Suspended element={<RegisterPage />} />,
  },
  {
    path: '/oauth2/redirect',
    element: <Suspended element={<OAuth2RedirectPage />} />,
  },
  {
    path: '/admin',
    element: <Suspended element={<AdminRoute />} />,
    children: [
      {
        path: '',
        element: <Suspended element={<AdminLayout />} />,
        children: [
          { path: '', element: <Suspended element={<DashboardPage />} /> },
          { path: 'quizzes', element: <Suspended element={<AdminQuizListPage />} /> },
          { path: 'quizzes/create', element: <Suspended element={<CreateQuizPage />} /> },
          { path: 'quizzes/edit/:id', element: <Suspended element={<CreateQuizPage />} /> },
          { path: 'quizzes/attempts', element: <Suspended element={<QuizAnalyticsPage />} /> },
          { path: 'quizzes/attempts/:id', element: <Suspended element={<QuizAttemptDetailPage />} /> },
          { path: 'articles', element: <Suspended element={<AdminArticleListPage />} /> },
          { path: 'articles/create', element: <Suspended element={<CreateArticlePage />} /> },
          { path: 'articles/edit/:id', element: <Suspended element={<CreateArticlePage />} /> },
          { path: 'users', element: <Suspended element={<AdminManagerAccountPage />} /> },
          { path: 'subscriptions', element: <Suspended element={<AdminSubscriptionPage />} /> },
          { path: 'contact-messages', element: <Suspended element={<AdminContactMessagesPage />} /> },
          { path: 'notifications', element: <Suspended element={<AdminNotificationsPage />} /> },
          { path: 'medias', element: <Suspended element={<AdminMediaListPage />} /> },
          { path: 'program', element: <Suspended element={<AdminProgramPage />} /> },
          { path: 'ai-chat/logs', element: <Suspended element={<AdminAiChatLogs />} /> },
          { path: 'settings', element: <Suspended element={<PlaceholderPage title="Cài đặt hệ thống" emoji="⚙️" description="Tính năng đang được phát triển." backLink="/admin" />} /> },
        ]
      }
    ]
  },
  {
    path: '/',
    element: <Suspended element={<CustomerLayout />} />,
    children: [
      { path: '', element: <Suspended element={<HomePage />} /> },
      { path: 'gioi-thieu', element: <Suspended element={<AboutPage />} /> },
      { path: 'bai-viet', element: <Suspended element={<ArticleListPage />} /> },
      { path: 'goi-dich-vu', element: <Suspended element={<SubscriptionPlansPage />} /> },
      { path: 'payment-success', element: <Suspended element={<PaymentSuccessPage />} /> },
      { path: 'payment-cancel', element: <Suspended element={<PaymentCancelPage />} /> },
      { path: 'bai-viet/:slug', element: <Suspended element={<ArticleDetailPage />} /> },
      { path: 'trac-nghiem', element: <Suspended element={<QuizListPage />} /> },
      { 
        path: 'trac-nghiem/:id/bat-dau', 
        element: (
          <ProtectedRoute>
            <Suspended element={<QuizRunnerPage />} />
          </ProtectedRoute>
        ) 
      },
      { path: 'lien-he', element: <Suspended element={<ContactPage />} /> },
      { 
        path: 'ho-so', 
        element: (
          <ProtectedRoute>
            <Suspended element={<ProfilePage />} />
          </ProtectedRoute>
        ) 
      },
      {
        path: 'phac-do',
        element: (
          <ProtectedRoute>
            <Suspended element={<ProgramLayout />} />
          </ProtectedRoute>
        ),
        children: [
          { path: '', element: <Suspended element={<ProgramRoadmapPage />} /> },
          { path: 'chi-tiet', element: <Suspended element={<ProgramDetailPage />} /> },
          { path: 'tai-nguyen', element: <Suspended element={<ProgramMediaPage />} /> }
        ]
      },
      { path: 'dieu-khoan-dich-vu', element: <Suspended element={<TermsAndPrivacyPage />} /> },
      { 
        path: '*', 
        element: <Suspended element={<PlaceholderPage 
          title="404 – Không tìm thấy trang" 
          emoji="🔍" 
          description="Trang bạn đang tìm kiếm không tồn tại." 
        />} /> 
      }
    ]
  }
]);
