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
  MessageSquare,
  Music,
  Milestone,
  Bot,
  Bell
} from 'lucide-react';
import { adminApi } from '../../apis/adminApi';
import { Client } from '@stomp/stompjs';
import './AdminLayout.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [aiChatUnreadCount, setAiChatUnreadCount] = useState(0);

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

  const fetchAiChatUnreadCount = async () => {
    try {
      const res = await adminApi.getAiChatUnreadCount();
      if (res.data.success) {
        setAiChatUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching ai chat unread count:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchAiChatUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchAiChatUnreadCount();
    }, 15000); // Tự động cập nhật mỗi 15 giây
    return () => clearInterval(interval);
  }, [location.pathname]); // Cập nhật lại khi chuyển đổi trang

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    let brokerURL = '';
    if (baseUrl.startsWith('http')) {
      const wsProto = baseUrl.startsWith('https') ? 'wss' : 'ws';
      const host = baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      brokerURL = `${wsProto}://${host}/ws-chat`;
    } else {
      const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      brokerURL = `${wsProto}://${window.location.host}${baseUrl}/ws-chat`;
    }

    const client = new Client({
      brokerURL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe('/topic/admin/chat/alerts', (message) => {
        const body = JSON.parse(message.body);
        if (body.eventType === 'NEW_MESSAGE') {
          // Increment immediately to avoid transaction commit lag
          setAiChatUnreadCount(prev => prev + 1);
          // Fetch again after 1s just to sync exactly
          setTimeout(() => {
            fetchAiChatUnreadCount();
          }, 1000);
        }
      });
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  const navItems = [
    { name: 'Tổng quan', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Người dùng', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Quản lý Quizzes', path: '/admin/quizzes', icon: <ClipboardList size={20} /> },
    { name: 'Quản lý Bài viết', path: '/admin/articles', icon: <BookOpen size={20} /> },
    { name: 'Quản lý Media', path: '/admin/medias', icon: <Music size={20} /> },
    { name: 'Gói dịch vụ', path: '/admin/subscriptions', icon: <CreditCard size={20} /> },
    { name: 'Quản lý Phác đồ', path: '/admin/program', icon: <Milestone size={20} /> },
    { name: 'Lời nhắn liên hệ', path: '/admin/contact-messages', icon: <MessageSquare size={20} /> },
    { name: 'Lịch sử thông báo', path: '/admin/notifications', icon: <Bell size={20} /> },
    { name: 'Cấu hình AI Chat', path: '/admin/ai-chat/prompt', icon: <Bot size={20} /> },
    { name: 'Lịch sử AI Chat', path: '/admin/ai-chat/logs', icon: <MessageSquare size={20} /> },
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
            Cổng quản trị
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
                {item.name === 'Lịch sử AI Chat' && aiChatUnreadCount > 0 && (
                  <span className="admin-sidebar-badge" style={{ backgroundColor: '#ef4444' }}>{aiChatUnreadCount}</span>
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
