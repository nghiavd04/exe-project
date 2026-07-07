import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../apis/authApi';

export const TIER_WEIGHTS = {
  FREE: 0,
  BASIC: 1,
  PREMIUM: 2,
  ELITE: 3,
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Lazy initializer: đọc localStorage TRƯỚC lần render đầu tiên
  // → loading luôn false, user/tier luôn đúng ngay từ frame đầu tiên
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [userTier, setUserTier] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed?.subscriptionTier || 'FREE';
    } catch { return 'FREE'; }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Fetch profile ngầm (background) để đồng bộ tier mới nhất từ server
    // Không block UI — chỉ cập nhật state nếu có thay đổi
    apiClient.get('/v1/customer/profile')
      .then((res) => {
        if (res.data && res.data.success) {
          const freshUser = res.data.data;
          localStorage.setItem('user', JSON.stringify(freshUser));
          setUser(freshUser);
          setUserTier(freshUser.subscriptionTier || 'FREE');
        }
      })
      .catch((err) => {
        // 401 → interceptor xử lý redirect
        console.error('Background profile refresh failed:', err);
      });
  }, []);

  const login = React.useCallback((userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.subscriptionTier) {
      setUserTier(userData.subscriptionTier);
    } else {
      setUserTier('FREE');
    }
  }, []);

  const updateUser = React.useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.subscriptionTier) {
      setUserTier(userData.subscriptionTier);
    }
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUserTier('FREE');
  }, []);

  const userWeight = TIER_WEIGHTS[userTier] || 0;

  return (
    <AuthContext.Provider value={{ user, loading, userTier, userWeight, setUserTier, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
