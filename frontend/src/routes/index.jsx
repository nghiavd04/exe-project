import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import OAuth2RedirectPage from '../pages/auth/OAuth2RedirectPage';

import AdminRoute from './AdminRoute';
import AdminLayout from '../layouts/admin/AdminLayout';
import DashboardPage from '../pages/admin/dashboard/DashboardPage';

import CustomerLayout from '../layouts/customer/CustomerLayout';
import HomePage from '../pages/customer/home/HomePage';
import AboutPage from '../pages/customer/about/AboutPage';
import TestPage from '../pages/customer/testpage/TestPage';
import NewsPage from '../pages/customer/news/NewsPage';
import NewsDetailPage from '../pages/customer/news/NewsDetailPage';
import ContactPage from '../pages/customer/contact/ContactPage';
import PlaceholderPage from '../pages/customer/PlaceholderPage';

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
      { path: 'bai-test', element: <TestPage /> },
      { path: 'tin-tuc', element: <NewsPage /> },
      { path: 'tin-tuc/:id', element: <NewsDetailPage /> },
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
          { path: '', element: <DashboardPage /> }
        ]
      }
    ]
  }
]);
