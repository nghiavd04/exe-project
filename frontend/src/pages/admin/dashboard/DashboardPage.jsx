import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/AuthContext';
import { 
  Users, 
  DollarSign, 
  Crown,
  MessageCircle,
  TrendingUp,
  Activity,
  PieChart,
  List,
  BookOpen,
  MessageSquare,
  ArrowUpRight, 
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const stats = [
    { label: 'Tổng doanh thu', value: formatCurrency(dashboardData?.totalRevenue), icon: <DollarSign />, color: '#10b981' }, // emerald
    { label: 'Gói Premium', value: dashboardData?.activeSubscriptions?.toLocaleString() || '0', icon: <Crown />, color: '#8b5cf6' }, // violet
    { label: 'Tổng người dùng', value: dashboardData?.totalUsers?.toLocaleString() || '0', icon: <Users />, color: '#3b82f6' }, // blue
    { label: 'Lời nhắn chờ xử lý', value: dashboardData?.unreadContactMessages?.toLocaleString() || '0', icon: <MessageCircle />, color: dashboardData?.unreadContactMessages > 0 ? '#ef4444' : '#64748b' }, // red or slate
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
            </div>
            <h3 className="stat-label">{stat.label}</h3>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-row-2">
        {/* Doanh thu */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Biểu đồ Doanh thu</h3>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="chart-select"
            >
              <option value="7d">7 ngày qua</option>
              <option value="14d">14 ngày qua</option>
              <option value="30d">30 ngày qua</option>
              <option value="month">Tháng này</option>
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
                     background: activeBar === i ? 'var(--teal)' : 'var(--teal-dark)', 
                     height: `${Math.max((item.value / Math.max(...(dashboardData?.chartData?.map(d => d.value) || [1]))) * 100, 2)}%`, 
                     opacity: activeBar === i ? 1 : 0.85,
                   }}
                 >
                   {activeBar === i && (
                     <div className="chart-bar-tooltip">
                       {formatCurrency(item.value)}
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

        {/* Giao dịch gần đây */}
        <div className="dashboard-card">
          <h3 className="card-title">Giao dịch gần đây</h3>
          <div className="recent-transactions">
            {dashboardData?.recentTransactions?.map((tx, idx) => (
              <div key={idx} className="list-item">
                <div className="list-item-left">
                  <span className="list-item-title">{tx.customerName}</span>
                  <span className="list-item-subtitle">{tx.planName} • {new Date(tx.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="list-item-right" style={{ color: tx.status === 'SUCCESS' ? '#10b981' : '#ef4444' }}>
                  {tx.status === 'SUCCESS' ? '+' : ''}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
            {(!dashboardData?.recentTransactions || dashboardData.recentTransactions.length === 0) && (
              <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '2rem' }}>Chưa có giao dịch nào</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-row-3">
        {/* Tỷ lệ Gói dịch vụ */}
        <div className="dashboard-card">
          <h3 className="card-title"><PieChart size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} /> Tỷ lệ Gói dịch vụ</h3>
          <div className="breakdown-list" style={{ marginTop: '1rem' }}>
            {dashboardData?.subscriptionBreakdown?.map((plan, idx) => {
              const totalSubs = dashboardData.subscriptionBreakdown.reduce((acc, p) => acc + p.count, 0) || 1;
              const percent = Math.round((plan.count / totalSubs) * 100);
              return (
                <div key={idx} className="progress-container">
                  <div className="progress-header">
                    <span>{plan.planName}</span>
                    <span>{plan.count} ({percent}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percent}%`, background: idx % 2 === 0 ? '#8b5cf6' : '#3b82f6' }}></div>
                  </div>
                </div>
              );
            })}
            {(!dashboardData?.subscriptionBreakdown || dashboardData.subscriptionBreakdown.length === 0) && (
              <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Chưa có dữ liệu gói</p>
            )}
          </div>
        </div>

        {/* Tương tác AI & Phác đồ */}
        <div className="dashboard-card">
          <h3 className="card-title"><Activity size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} /> Tương tác AI & Phác đồ</h3>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="stat-highlight">
              <span style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600 }}>Phiên Chat AI hôm nay</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--teal-dark)' }}>
                {dashboardData?.aiChatStats?.totalSessionsToday || 0}
              </div>
            </div>
            
            <div className="stat-highlight">
              <span style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600 }}>Tỷ lệ Check-in Phác đồ</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>
                {dashboardData?.programProgress?.usersCheckedInToday || 0} <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/ {dashboardData?.programProgress?.totalActiveUsers || 0}</span>
              </div>
              <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                <div className="progress-fill" style={{ width: `${dashboardData?.programProgress?.totalActiveUsers ? ((dashboardData.programProgress.usersCheckedInToday / dashboardData.programProgress.totalActiveUsers) * 100) : 0}%`, background: '#f59e0b' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Nội dung nổi bật */}
        <div className="dashboard-card">
          <h3 className="card-title"><BookOpen size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} /> Nội dung nổi bật</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Top Bài Test</h4>
            {dashboardData?.contentPerformance?.topQuizzes?.map((quiz, idx) => (
              <div key={idx} className="list-item">
                <span className="list-item-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>{quiz.title}</span>
                <span className="list-item-right" style={{ fontSize: '0.85rem' }}>{quiz.attemptCount} lượt</span>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Top Bài Viết</h4>
            {dashboardData?.contentPerformance?.topArticles?.map((article, idx) => (
              <div key={idx} className="list-item">
                <span className="list-item-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>{article.title}</span>
                <span className="list-item-right" style={{ fontSize: '0.85rem' }}>{article.viewCount} view</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
