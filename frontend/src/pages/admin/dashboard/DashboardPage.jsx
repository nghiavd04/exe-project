import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/AuthContext';
import {
  Users,
  DollarSign,
  Crown,
  MessageCircle,
  Activity,
  PieChart,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { adminApi } from '../../../apis/adminApi';
import AppState from '../../../components/AppState';
import { PageHeader } from '../../../components/PageSection';
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

  const shouldShowLabel = (index, total) => {
    if (!total) return false;
    if (total <= 8) return true;
    if (index === 0 || index === total - 1) return true;
    const step = total > 15 ? 5 : 2;
    return index % step === 0;
  };

  const stats = [
    { label: 'Tổng doanh thu', value: formatCurrency(dashboardData?.totalRevenue), icon: <DollarSign />, color: '#10b981' }, // emerald
    { label: 'Gói cước hoạt động', value: dashboardData?.activeSubscriptions?.toLocaleString() || '0', icon: <Crown />, color: '#8b5cf6' }, // violet
    { label: 'Khách hàng', value: dashboardData?.totalUsers?.toLocaleString() || '0', icon: <Users />, color: '#3b82f6' }, // blue
    { label: 'Lời nhắn chờ xử lý', value: dashboardData?.unreadContactMessages?.toLocaleString() || '0', icon: <MessageCircle />, color: dashboardData?.unreadContactMessages > 0 ? '#ef4444' : '#64748b' }, // red or slate
  ];

  if (loading && !dashboardData) {
    return (
      <AppState
        variant="loading"
        title="Đang tải dữ liệu dashboard"
        description="Chúng tôi đang tổng hợp doanh thu, người dùng và hiệu suất nội dung mới nhất."
      />
    );
  }

  if (error && !dashboardData) {
    return (
      <AppState
        variant="error"
        title="Không thể tải dashboard"
        description={error}
        actionLabel="Thử lại"
        onAction={fetchDashboardStats}
      />
    );
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        className="dashboard-header"
        title="Tổng quan"
        description={`Chào mừng trở lại, ${user?.fullName || 'Administrator'}! Đây là những gì đang diễn ra hôm nay.`}
      />

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Hành động nhanh</h3>
        <div className="quick-actions-grid">
          <Link to="/admin/contact-messages?tab=unread" className="ui-card quick-action-card">
            <div className="quick-action-icon-wrap red">
              <MessageCircle size={20} />
            </div>
            <div className="quick-action-info">
              <span className="quick-action-title">Lời nhắn chưa xử lý</span>
              <span className="quick-action-desc">Phản hồi tin nhắn chờ</span>
            </div>
          </Link>
          <Link to="/admin/articles/create" className="ui-card quick-action-card">
            <div className="quick-action-icon-wrap green">
              <BookOpen size={20} />
            </div>
            <div className="quick-action-info">
              <span className="quick-action-title">Viết bài mới</span>
              <span className="quick-action-desc">Đăng bài viết kiến thức</span>
            </div>
          </Link>
          <Link to="/admin/program" className="ui-card quick-action-card">
            <div className="quick-action-icon-wrap blue">
              <Activity size={20} />
            </div>
            <div className="quick-action-info">
              <span className="quick-action-title">Quản lý phác đồ</span>
              <span className="quick-action-desc">Cấu hình lộ trình điều trị</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="ui-card stat-card">
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
        <div className="ui-card chart-card">
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
            {(() => {
              const chartValues = dashboardData?.chartData?.map(d => d.value) || [];
              const rawMax = Math.max(...chartValues, 0);
              const maxVal = rawMax < 1 ? 0 : rawMax;
              
              return dashboardData?.chartData?.map((item, i) => {
                const heightPercent = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                return (
                  <div key={i} className="chart-bar-container">
                    <div
                      role="button"
                      tabIndex={0}
                      onMouseEnter={() => setActiveBar(i)}
                      onMouseLeave={() => setActiveBar(null)}
                      onFocus={() => setActiveBar(i)}
                      onBlur={() => setActiveBar(null)}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        setActiveBar(activeBar === i ? null : i);
                      }}
                      className="chart-bar"
                      style={{
                        background: activeBar === i ? 'var(--teal)' : 'var(--teal-dark)',
                        height: `${Math.max(heightPercent, 2)}%`,
                        opacity: activeBar === i ? 1 : 0.85,
                        outline: 'none'
                      }}
                    >
                      {activeBar === i && (
                        <div className="chart-bar-tooltip">
                          {formatCurrency(item.value)}
                        </div>
                      )}
                    </div>
                    <span className={`chart-label ${activeBar === i ? 'active' : ''}`}>
                      {shouldShowLabel(i, dashboardData?.chartData?.length) || activeBar === i ? item.label : '\u00A0'}
                    </span>
                  </div>
                );
              });
            })()}
            {loading && (
              <div className="chart-loading-overlay">
                <Loader2 className="animate-spin" size={32} color="var(--teal-dark)" />
              </div>
            )}
          </div>
        </div>

        {/* Giao dịch gần đây */}
        <div className="ui-card dashboard-card">
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
        <div className="ui-card dashboard-card">
          <h3 className="card-title"><PieChart size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} /> Tỷ lệ Gói dịch vụ</h3>
          <div className="breakdown-list" style={{ marginTop: '1rem' }}>
            {(() => {
              const totalUsers = dashboardData?.totalUsers || 1;
              const items = [];
              let sumSubscribed = 0;
              const paidPlans = [];

              if (dashboardData?.subscriptionBreakdown) {
                dashboardData.subscriptionBreakdown.forEach((plan) => {
                  const nameLower = plan.planName.toLowerCase();
                  const isFreePlan = nameLower.includes('miễn phí') || nameLower.includes('free');
                  if (!isFreePlan) {
                    paidPlans.push(plan);
                    sumSubscribed += plan.count;
                  }
                });
              }

              const freeCount = Math.max(0, totalUsers - sumSubscribed);
              const freePercent = Math.round((freeCount / totalUsers) * 100);

              // Place the Free Plan at the very top
              items.push(
                <div key="plan-free" className="progress-container">
                  <div className="progress-header">
                    <span>Miễn phí / Chưa đăng ký gói</span>
                    <span>{freeCount} ({freePercent}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${freePercent}%`, background: '#64748b' }}></div>
                  </div>
                </div>
              );

              // Render paid plans below the Free Plan
              paidPlans.forEach((plan, idx) => {
                const percent = Math.round((plan.count / totalUsers) * 100);
                items.push(
                  <div key={`plan-${idx}`} className="progress-container">
                    <div className="progress-header">
                      <span>{plan.planName}</span>
                      <span>{plan.count} ({percent}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${percent}%`, background: idx % 2 === 0 ? '#3b82f6' : '#8b5cf6' }}></div>
                    </div>
                  </div>
                );
              });

              return items;
            })()}
          </div>
        </div>

        {/* Tương tác AI & Phác đồ */}
        {/* <div className="ui-card dashboard-card">
          <h3 className="card-title">
            <Activity size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
            Tương tác AI & Phác đồ
          </h3>
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="stat-highlight">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600 }}>Phiên Chat AI tuần này</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--teal-dark)', marginTop: '0.25rem' }}>
                {dashboardData?.aiChatStats?.totalAiSessionsToday !== undefined ? dashboardData.aiChatStats.totalAiSessionsToday : (dashboardData?.aiChatStats?.totalSessionsToday || 0)}{' '}
                <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>yêu cầu</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                Trợ lý ảo tư vấn tự động
              </div>
            </div>

            <div className="stat-highlight">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600 }}>Hỗ trợ trực tiếp tuần này (Hỗ trợ viên)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', background: '#dbeafe', padding: '2px 6px', borderRadius: '6px' }}>
                  <span className="live-indicator-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span> Trực tuyến
                </span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.25rem' }}>
                {dashboardData?.aiChatStats?.totalSupportSessionsToday || 0}{' '}
                <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>phiên tiếp quản</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                Tương tác trực tiếp giữa Admin và người dùng
              </div>
            </div>

            <div className="stat-highlight">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600 }}>Tỷ lệ Check-in Phác đồ hôm nay</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
                {dashboardData?.programProgress?.usersCheckedInToday || 0}{' '}
                <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 500 }}>
                  / {dashboardData?.programProgress?.totalActiveUsers || 0} hoạt động ({dashboardData?.programProgress?.totalActiveUsers ? Math.round((dashboardData.programProgress.usersCheckedInToday / dashboardData.programProgress.totalActiveUsers) * 100) : 0}%)
                </span>
              </div>
              <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${dashboardData?.programProgress?.totalActiveUsers ? ((dashboardData.programProgress.usersCheckedInToday / dashboardData.programProgress.totalActiveUsers) * 100) : 0}%`,
                    background: '#f59e0b'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div> */}

        {/* MOCKUP TƯƠNG TÁC AI & PHÁC ĐỒ */}
        <div className="ui-card dashboard-card">
          <h3 className="card-title">
            <Activity size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
            Tương tác & Phác đồ
          </h3>
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="stat-highlight">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600 }}>Phiên Chat AI tuần trước</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: '#d1fae5', padding: '2px 6px', borderRadius: '6px' }}>+12% so với tuần trước</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--teal-dark)', marginTop: '0.25rem' }}>
                10 <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>yêu cầu</span>
              </div>
            </div>

            <div className="stat-highlight">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600 }}>Hỗ trợ trực tiếp tuần trước</span>

              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.25rem' }}>
                8 <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>phiên tiếp quản</span>
              </div>
            </div>

            <div className="stat-highlight">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600 }}>Tỷ lệ Check-in Phác đồ hôm nay</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', background: '#fef3c7', padding: '2px 6px', borderRadius: '6px' }}>Mục tiêu: 80%</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
                4 <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 500 }}>/ 14 tích cực (28.57%)</span>
              </div>
              <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                <div className="progress-fill" style={{ width: '28.57%', background: '#f59e0b' }}></div>
              </div>
            </div>
          </div>
        </div>


        {/* Nội dung nổi bật */}
        <div className="ui-card dashboard-card">
          <h3 className="card-title"><BookOpen size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} /> Nội dung nổi bật</h3>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Top Bài Test</h4>
            {dashboardData?.contentPerformance?.topQuizzes?.map((quiz, idx) => (
              <div key={idx} className="list-item">
                <div className="list-item-left">
                  <span className="list-item-title" title={quiz.title}>{quiz.title}</span>
                </div>
                <span className="list-item-right" style={{ fontSize: '0.85rem' }}>{quiz.attemptCount} lượt</span>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Top Bài Viết</h4>
            {dashboardData?.contentPerformance?.topArticles?.map((article, idx) => (
              <div key={idx} className="list-item">
                <div className="list-item-left">
                  <span className="list-item-title" title={article.title}>{article.title}</span>
                </div>
                <span className="list-item-right" style={{ fontSize: '0.85rem' }}>{article.viewCount} view</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
