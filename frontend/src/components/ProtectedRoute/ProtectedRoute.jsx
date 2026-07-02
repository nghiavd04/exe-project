import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const location = useLocation();

  if (!token) {
    // Lưu lại vị trí trang hiện tại để sau khi đăng nhập có thể quay lại
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  // Nếu có yêu cầu về Role (ví dụ: chỉ Admin mới được vào)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
