import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'var(--teal-dark)', color: '#fff', padding: '2rem 1rem', position: 'relative' }}>
        <h2 style={{ color: '#fff', marginBottom: '2rem', fontFamily: '"Outfit", sans-serif', fontWeight: '800' }}>
          EXE<span style={{ color: 'var(--accent)' }}>Admin.</span>
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/admin" style={{ color: '#fff', textDecoration: 'none', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)' }}>Dashboard</Link>
          <Link to="/admin" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '0.8rem' }}>Quản lý người dùng</Link>
          <Link to="/admin" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '0.8rem' }}>Cài đặt</Link>
        </nav>
        <button onClick={handleLogout} style={{ position: 'absolute', bottom: '2rem', width: 'calc(100% - 2rem)', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
          Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', paddingTop: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
