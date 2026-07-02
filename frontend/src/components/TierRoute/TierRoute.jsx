import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import AppState from '../AppState';

/**
 * TierRoute - A protected route that checks for minimum subscription tier weight.
 * @param {number} requiredWeight - The minimum weight required (e.g. 1 for BASIC, 2 for PREMIUM)
 * @param {React.ReactNode} children - The component to render if authorized
 */
const TierRoute = ({ requiredWeight, children }) => {
  const { user, loading, userWeight } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <AppState
        variant="loading"
        compact
        title="Đang xác thực quyền truy cập"
        description="Chúng tôi đang kiểm tra gói dịch vụ và quyền sử dụng của bạn."
      />
    );
  }

  if (!user) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  if (userWeight < requiredWeight) {
    return <Navigate to="/goi-dich-vu" replace />;
  }

  return children;
};

export default TierRoute;
