import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/dang-nhap" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role !== 'ADMIN') {
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    return <Navigate to="/dang-nhap" replace />;
  }

  return <Outlet />;
}
