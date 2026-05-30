import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import OAuth2RedirectPage from '../pages/auth/OAuth2RedirectPage';
import ProtectedRoute from '../components/ProtectedRoute';

import AdminRoute from './AdminRoute';
import AdminLayout from '../layouts/admin/AdminLayout';
import DashboardPage from '../pages/admin/dashboard/DashboardPage';

import CustomerLayout from '../layouts/customer/CustomerLayout';
import HomePage from '../pages/customer/home/HomePage';
import AboutPage from '../pages/customer/about/AboutPage';
import ContactPage from '../pages/customer/contact/ContactPage';
import PlaceholderPage from '../pages/customer/PlaceholderPage';
import ArticleListPage from '../pages/customer/articles/ArticleListPage';
import ArticleDetailPage from '../pages/customer/articles/ArticleDetailPage';
import QuizListPage from '../pages/customer/quizzes/QuizListPage';
import QuizRunnerPage from '../pages/customer/quizzes/QuizRunnerPage';
import ProfilePage from '../pages/customer/profile/ProfilePage';
import TermsAndPrivacyPage from '../pages/customer/legal/TermsAndPrivacyPage';
import SubscriptionPlansPage from '../pages/customer/plans/SubscriptionPlansPage';
import PaymentSuccessPage from '../pages/customer/plans/PaymentSuccessPage';
import PaymentCancelPage from '../pages/customer/plans/PaymentCancelPage';

import AdminQuizListPage from '../pages/admin/quizzes/QuizListPage';
import AdminArticleListPage from '../pages/admin/articles/ArticleListPage';
import CreateArticlePage from '../pages/admin/articles/CreateArticlePage';
import CreateQuizPage from '../pages/admin/quizzes/CreateQuizPage';
import AdminManagerAccountPage from '../pages/admin/accounts/AdminManagerAccountPage';
import AdminSubscriptionPage from '../pages/admin/subscriptions/AdminSubscriptionPage';
import AdminContactMessagesPage from '../pages/admin/contact/AdminContactMessagesPage';

export const router = createBrowserRouter([
  {
    path: '/dang-nhap',
    element: <LoginPage />,
  },
  {
    path: '/dang-ky',
    element: <RegisterPage />,
  },
  {
    path: '/oauth2/redirect',
    element: <OAuth2RedirectPage />,
  },
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'gioi-thieu', element: <AboutPage /> },
      { path: 'bai-viet', element: <ArticleListPage /> },
      { path: 'goi-dich-vu', element: <SubscriptionPlansPage /> },
      { path: 'payment-success', element: <PaymentSuccessPage /> },
      { path: 'payment-cancel', element: <PaymentCancelPage /> },
      { path: 'bai-viet/:slug', element: <ArticleDetailPage /> },
      { path: 'trac-nghiem', element: <QuizListPage /> },
      { 
        path: 'trac-nghiem/:id/bat-dau', 
        element: (
          <ProtectedRoute>
            <QuizRunnerPage />
          </ProtectedRoute>
        ) 
      },
      { path: 'lien-he', element: <ContactPage /> },
      { 
        path: 'ho-so', 
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ) 
      },
      { path: 'dieu-khoan-dich-vu', element: <TermsAndPrivacyPage /> },
      { 
        path: '*', 
        element: <PlaceholderPage 
          title="404 – Không tìm thấy trang" 
          emoji="🔍" 
          description="Trang bạn đang tìm kiếm không tồn tại." 
        /> 
      }
    ]
  },
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        path: '',
        element: <AdminLayout />,
        children: [
          { path: '', element: <DashboardPage /> },
          { path: 'quizzes', element: <AdminQuizListPage /> },
          { path: 'quizzes/create', element: <CreateQuizPage /> },
          { path: 'quizzes/edit/:id', element: <CreateQuizPage /> },
          { path: 'articles', element: <AdminArticleListPage /> },
          { path: 'articles/create', element: <CreateArticlePage /> },
          { path: 'articles/edit/:id', element: <CreateArticlePage /> },
          { path: 'users', element: <AdminManagerAccountPage /> },
          { path: 'subscriptions', element: <AdminSubscriptionPage /> },
          { path: 'contact-messages', element: <AdminContactMessagesPage /> },
          { path: 'settings', element: <PlaceholderPage title="Cài đặt hệ thống" emoji="⚙️" description="Tính năng đang được phát triển." backLink="/admin" /> },
        ]
      }
    ]
  }
]);
