import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';

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
    { name: 'Quản lý Quizzes', path: '/admin/quizzes', icon: <ClipboardList size={20} /> },
    { name: 'Quản lý Bài viết', path: '/admin/articles', icon: <BookOpen size={20} /> },
    { name: 'Người dùng', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Cài đặt', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7fafc' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', 
        background: 'var(--teal-dark)', 
        color: '#fff', 
        padding: '2rem 1.25rem', 
        position: 'fixed',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 15px rgba(0,0,0,0.05)'
      }}>
        <Link to="/admin" style={{ textDecoration: 'none', marginBottom: '2.5rem', display: 'block', paddingLeft: '0.5rem' }}>
          <h2 style={{ 
            color: '#fff', 
            margin: 0, 
            fontFamily: '"Outfit", sans-serif', 
            fontWeight: '800',
            fontSize: '1.5rem',
            letterSpacing: '-0.5px'
          }}>
            EXE<span style={{ color: 'var(--accent)' }}>Admin.</span>
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Management Portal
          </p>
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.65)', 
                  textDecoration: 'none', 
                  padding: '0.85rem 1rem', 
                  borderRadius: '12px', 
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  transition: 'all 0.2s ease',
                  fontWeight: isActive ? '600' : '500'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  if (!isActive) e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                  if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                }}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.name}</span>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <button 
          onClick={handleLogout} 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%', 
            padding: '0.85rem 1rem', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            color: '#fff', 
            borderRadius: '12px', 
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(229, 62, 62, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <LogOut size={20} />
          Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '280px', padding: '2.5rem', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
