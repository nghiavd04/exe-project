import React from 'react';
import { useAuth } from '../../hooks/AuthContext';
import AppState from '../AppState';

/**
 * FeatureGate - Conditionally renders children based on minimum subscription tier weight.
 * @param {number} requiredWeight - The minimum weight required (e.g. 1 for BASIC, 2 for PREMIUM)
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {React.ReactNode} fallback - Optional component to render if NOT authorized
 */
const FeatureGate = ({ requiredWeight, children, fallback = null }) => {
  const { userWeight } = useAuth();

  if (userWeight >= requiredWeight) {
    return children;
  }

  if (fallback === null) {
    return (
      <AppState
        variant="paywall"
        compact
        title="Tính năng dành cho thành viên"
        description="Hãy nâng cấp gói dịch vụ để sử dụng đầy đủ tính năng này và mở khóa toàn bộ trải nghiệm nâng cao."
        actionLabel="Nâng cấp ngay"
        actionTo="/goi-dich-vu"
      />
    );
  }

  return fallback;
};

export default FeatureGate;
