import React, { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--teal-dark)' }}>Dashboard</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Chào mừng trở lại, {user?.fullName || 'Admin'}!</p>
        </div>
        <div style={{ padding: '0.8rem 1.5rem', background: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', fontWeight: '600' }}>
          Vai trò: <span style={{ color: 'var(--accent)' }}>{user?.role}</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Stat Cards */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: 0, color: 'var(--muted)', fontSize: '1rem', fontWeight: '500' }}>Tổng số User</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2.5rem', fontWeight: '700', color: 'var(--teal-dark)' }}>1,248</p>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: 0, color: 'var(--muted)', fontSize: '1rem', fontWeight: '500' }}>Bài Test Đã Hoàn Thành</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2.5rem', fontWeight: '700', color: 'var(--teal-dark)' }}>853</p>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: 0, color: 'var(--muted)', fontSize: '1rem', fontWeight: '500' }}>Đăng ký Mới Tuần Này</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2.5rem', fontWeight: '700', color: 'var(--teal-dark)' }}>+42</p>
        </div>
      </div>
    </div>
  );
}
