import React from 'react';
import { useAuth } from '../hooks/AuthContext';
import { Link } from 'react-router-dom';

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

  // Default fallback if none is provided
  if (fallback === null) {
    return (
      <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center my-4">
        <div className="text-orange-500 mb-2">
          <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-orange-800 mb-1">Tính năng cao cấp</h4>
        <p className="text-xs text-orange-600 mb-3">Vui lòng nâng cấp gói dịch vụ để sử dụng tính năng này.</p>
        <Link to="/goi-dich-vu" className="inline-block px-4 py-2 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors">
          Nâng cấp ngay
        </Link>
      </div>
    );
  }

  return fallback;
};

export default FeatureGate;
