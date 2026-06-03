import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

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
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  // If user does not meet the required weight, redirect to subscription plans
  if (userWeight < requiredWeight) {
    return <Navigate to="/goi-dich-vu" replace />;
  }

  return children;
};

export default TierRoute;
