import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

export default function AdminRoute() {
  const { user, loading } = useAuth();

  // Loading chỉ true vài ms (đọc localStorage đồng bộ)
  // Trả về div trong suốt để tránh layout shift
  if (loading) {
    return <div style={{ minHeight: '100vh' }} />;
  }

  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
