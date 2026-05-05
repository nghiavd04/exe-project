import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../apis/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState('FREE');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you'd call a /me endpoint to get user data and subscription status
      // For now, let's assume we store user in localStorage or fetch it
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser) {
        setUser(savedUser);
        if (savedUser.subscriptionTier) {
          setUserTier(savedUser.subscriptionTier);
        } else {
          setUserTier('FREE');
        }
      }
    }
    setLoading(false);
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

  return (
    <AuthContext.Provider value={{ user, loading, userTier, setUserTier, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
