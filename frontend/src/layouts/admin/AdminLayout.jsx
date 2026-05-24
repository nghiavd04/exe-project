import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { adminApi } from '../../apis/adminApi';
import './AdminLayout.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/dang-nhap');
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await adminApi.getUnreadContactMessagesCount();
      if (res.data.success) {
        setUnreadCount(res.data.data.count);
      }
    } catch (err) {
      console.error('Error fetching unread contact count:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000); // Tự động cập nhật mỗi 15 giây
    return () => clearInterval(interval);
  }, [location.pathname]); // Cập nhật lại khi chuyển đổi trang

  const navItems = [
    { name: 'Tổng quan', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Người dùng', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Quản lý Quizzes', path: '/admin/quizzes', icon: <ClipboardList size={20} /> },
    { name: 'Quản lý Bài viết', path: '/admin/articles', icon: <BookOpen size={20} /> },
    { name: 'Gói dịch vụ', path: '/admin/subscriptions', icon: <CreditCard size={20} /> },
    { name: 'Lời nhắn liên hệ', path: '/admin/contact-messages', icon: <MessageSquare size={20} /> },
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
                {item.name === 'Lời nhắn liên hệ' && unreadCount > 0 && (
                  <span className="admin-sidebar-badge">{unreadCount}</span>
                )}
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
