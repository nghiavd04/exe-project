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

import AdminQuizListPage from '../pages/admin/quizzes/QuizListPage';
import AdminArticleListPage from '../pages/admin/articles/ArticleListPage';
import CreateArticlePage from '../pages/admin/articles/CreateArticlePage';
import CreateQuizPage from '../pages/admin/quizzes/CreateQuizPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
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
      { path: 'articles', element: <ArticleListPage /> },
      { path: 'articles/:slug', element: <ArticleDetailPage /> },
      { path: 'quizzes', element: <QuizListPage /> },
      { 
        path: 'quizzes/:id/start', 
        element: (
          <ProtectedRoute>
            <QuizRunnerPage />
          </ProtectedRoute>
        ) 
      },
      { path: 'lien-he', element: <ContactPage /> },
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
          { path: 'articles', element: <AdminArticleListPage /> },
          { path: 'articles/create', element: <CreateArticlePage /> },
          { path: 'users', element: <PlaceholderPage title="Quản lý người dùng" emoji="👥" description="Tính năng đang được phát triển." /> },
          { path: 'settings', element: <PlaceholderPage title="Cài đặt hệ thống" emoji="⚙️" description="Tính năng đang được phát triển." /> },
        ]
      }
    ]
  }
]);
