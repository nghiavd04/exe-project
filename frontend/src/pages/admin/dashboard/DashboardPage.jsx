import React, { useEffect, useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  ExternalLink,
  Loader2
} from 'lucide-react';
import { adminApi } from '../../../apis/adminApi';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [activeBar, setActiveBar] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
    setActiveBar(null); // Reset active bar when period changes
  }, [period]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboardStats(period);
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Tổng người dùng', value: dashboardData?.totalUsers?.toLocaleString() || '0', growth: '+0%', icon: <Users />, color: '#4299e1' },
    { label: 'Bài test hoàn thành', value: dashboardData?.totalCompletedQuizzes?.toLocaleString() || '0', growth: '+0%', icon: <CheckCircle />, color: '#48bb78' },
    { label: 'Lượt xem bài viết', value: dashboardData?.totalArticleViews?.toLocaleString() || '0', growth: '+0%', icon: <TrendingUp />, color: '#f6ad55' },
  ];

  if (loading && !dashboardData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--teal-dark)' }}>
        <Loader2 className="animate-spin" size={48} style={{ marginBottom: '1rem' }} />
        <p style={{ fontWeight: '600' }}>Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: 'var(--teal-dark)' }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Chào mừng trở lại, <span style={{ color: 'var(--teal-dark)', fontWeight: '600' }}>{user?.fullName || 'Administrator'}</span>! Đây là những gì đang diễn ra hôm nay.</p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ 
            background: '#fff', 
            padding: '1.75rem', 
            borderRadius: '24px', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.02)',
            border: '1px solid #f0f4f8'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ 
                background: `${stat.color}15`, 
                color: stat.color, 
                padding: '0.75rem', 
                borderRadius: '16px' 
              }}>
                {stat.icon}
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem', 
                fontSize: '0.85rem', 
                fontWeight: '700',
                color: '#48bb78',
                background: '#f0fff4',
                padding: '0.25rem 0.5rem',
                borderRadius: '8px'
              }}>
                <ArrowUpRight size={14} />
                {stat.growth}
              </div>
            </div>
            <h3 style={{ margin: 0, color: 'var(--muted)', fontSize: '0.95rem', fontWeight: '500' }}>{stat.label}</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '2.25rem', fontWeight: '800', color: 'var(--teal-dark)' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', border: '1px solid #f0f4f8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Tổng quan hệ thống</h3>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid #edf2f7', outline: 'none', background: '#f8fafc', fontWeight: '600', color: 'var(--teal-dark)', cursor: 'pointer' }}
            >
              <option value="7d">7 ngày qua</option>
              <option value="14d">14 ngày qua</option>
            </select>
          </div>
          
          <div style={{ height: '350px', width: '100%', background: '#f8fafc', borderRadius: '20px', display: 'flex', alignItems: 'flex-end', padding: '3rem 1.5rem 1.5rem', gap: '1rem', position: 'relative' }}>
             {dashboardData?.chartData?.map((item, i) => (
               <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                 <div 
                   onMouseEnter={() => setActiveBar(i)}
                   onMouseLeave={() => setActiveBar(null)}
                   style={{ 
                     width: '100%', 
                     background: activeBar === i ? 'var(--accent)' : 'var(--teal-dark)', 
                     height: `${(item.value / 40) * 100}%`, // Simplified max height logic
                     borderRadius: '8px 8px 0 0', 
                     opacity: activeBar === i ? 1 : 0.7 + (i * 0.02),
                     transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                     cursor: 'pointer',
                     position: 'relative'
                   }}
                 >
                   {activeBar === i && (
                     <div style={{ 
                       position: 'absolute', 
                       top: '-35px', 
                       left: '50%', 
                       transform: 'translateX(-50%)',
                       background: 'var(--teal-dark)',
                       color: 'white',
                       padding: '4px 10px',
                       borderRadius: '8px',
                       fontSize: '0.85rem',
                       fontWeight: '700',
                       whiteSpace: 'nowrap',
                       boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                       zIndex: 10
                     }}>
                       {item.value}
                       <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: '8px', height: '8px', background: 'var(--teal-dark)' }}></div>
                     </div>
                   )}
                 </div>
                 <span style={{ marginTop: '1rem', fontSize: '0.75rem', color: activeBar === i ? 'var(--teal-dark)' : 'var(--muted)', fontWeight: activeBar === i ? '800' : '600' }}>
                    {item.label}
                 </span>
               </div>
             ))}
             {loading && (
               <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px' }}>
                 <Loader2 className="animate-spin" size={32} color="var(--teal-dark)" />
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
