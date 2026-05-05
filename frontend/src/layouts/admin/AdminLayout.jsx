import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import './AdminLayout.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Tổng quan', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Người dùng', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Quản lý Quizzes', path: '/admin/quizzes', icon: <ClipboardList size={20} /> },
    { name: 'Quản lý Bài viết', path: '/admin/articles', icon: <BookOpen size={20} /> },
    { name: 'Gói dịch vụ', path: '/admin/subscriptions', icon: <CreditCard size={20} /> },
    { name: 'Cài đặt', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-logo-link">
          <h2 className="admin-logo-text">
            EXE<span className="admin-logo-accent">Admin.</span>
          </h2>
          <p className="admin-logo-subtext">
            Management Portal
          </p>
        </Link>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`admin-nav-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span className="admin-nav-text">{item.name}</span>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <button 
          onClick={handleLogout} 
          className="admin-logout-btn"
        >
          <LogOut size={20} />
          Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        <div className="admin-content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
