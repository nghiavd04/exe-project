import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/AuthContext';
import { 
  Users, 
  CheckCircle, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Loader2
} from 'lucide-react';
import { adminApi } from '../../../apis/adminApi';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [activeBar, setActiveBar] = useState(null);

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
      <div className="dashboard-loading">
        <Loader2 className="animate-spin" size={48} />
        <p>Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Chào mừng trở lại, <span>{user?.fullName || 'Administrator'}</span>! Đây là những gì đang diễn ra hôm nay.</p>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper" style={{ background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-growth">
                <ArrowUpRight size={14} />
                {stat.growth}
              </div>
            </div>
            <h3 className="stat-label">{stat.label}</h3>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-charts-container">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Tổng quan hệ thống</h3>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="chart-select"
            >
              <option value="7d">7 ngày qua</option>
              <option value="14d">14 ngày qua</option>
            </select>
          </div>
          
          <div className="chart-body">
             {dashboardData?.chartData?.map((item, i) => (
               <div key={i} className="chart-bar-container">
                 <div 
                   onMouseEnter={() => setActiveBar(i)}
                   onMouseLeave={() => setActiveBar(null)}
                   className="chart-bar"
                   style={{ 
                     background: activeBar === i ? 'var(--accent)' : 'var(--teal-dark)', 
                     height: `${(item.value / 40) * 100}%`, 
                     opacity: activeBar === i ? 1 : 0.7 + (i * 0.02),
                   }}
                 >
                   {activeBar === i && (
                     <div className="chart-bar-tooltip">
                       {item.value}
                     </div>
                   )}
                 </div>
                 <span className={`chart-label ${activeBar === i ? 'active' : ''}`}>
                    {item.label}
                 </span>
               </div>
             ))}
             {loading && (
               <div className="chart-loading-overlay">
                 <Loader2 className="animate-spin" size={32} color="var(--teal-dark)" />
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
