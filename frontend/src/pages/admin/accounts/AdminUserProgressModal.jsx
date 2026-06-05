import React, { useState, useEffect } from 'react';
import { 
  X, Activity, Calendar, Flame, Clock, Lock, 
  BarChart3, ListCollapse, TrendingUp, AlertCircle 
} from 'lucide-react';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import './AdminUserProgressModal.css';

export default function AdminUserProgressModal({ isOpen, onClose, user }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'daily' | 'weekly'

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchProgressDetails();
      setActiveTab('overview');
    }
  }, [isOpen, user]);

  const fetchProgressDetails = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUserProgressDetails(user.id);
      if (response.data && response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching progress details:', err);
      toast.error(err.response?.data?.message || 'Không thể tải tiến trình của người dùng');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Formatting date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa cập nhật';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculations for averages
  const calculateAverages = () => {
    if (!data || !data.dailyLogs || data.dailyLogs.length === 0) return null;
    const logs = data.dailyLogs;
    const count = logs.length;

    let totalScreenTime = 0;
    let totalMood = 0;
    let totalSleep = 0;
    let totalUrge = 0;
    let totalFocus = 0;

    logs.forEach(log => {
      totalScreenTime += log.screenTimeMinutes || 0;
      totalMood += log.moodScore || 0;
      totalSleep += log.sleepScore || 0;
      totalUrge += log.urgeScore || 0;
      totalFocus += log.focusScore || 0;
    });

    return {
      screenTime: Math.round(totalScreenTime / count),
      mood: (totalMood / count).toFixed(1),
      sleep: (totalSleep / count).toFixed(1),
      urge: (totalUrge / count).toFixed(1),
      focus: (totalFocus / count).toFixed(1)
    };
  };

  const averages = calculateAverages();

  // Get trend color/status
  const getMetricProgressStyle = (type, val) => {
    let percentage = 0;
    let status = 'middle'; // 'good' | 'middle' | 'danger'

    if (type === 'screenTime') {
      percentage = Math.round((val / 480) * 100);
      if (val < 120) status = 'good';
      else if (val <= 240) status = 'middle';
      else status = 'danger';
    } else {
      percentage = Math.round(((val - 1) / 9) * 100);
      if (type === 'urge') {
        if (val <= 3) status = 'good';
        else if (val <= 7) status = 'middle';
        else status = 'danger';
      } else {
        if (val >= 8) status = 'good';
        else if (val >= 5) status = 'middle';
        else status = 'danger';
      }
    }
    return { percentage, status };
  };

  // Get latest 7 daily logs for trend charts
  const getTrendLogs = () => {
    if (!data || !data.dailyLogs) return [];
    return data.dailyLogs.slice(-7);
  };

  const trendLogs = getTrendLogs();

  return (
    <div className="admin-progress-modal-overlay" onClick={onClose}>
      <div className="admin-progress-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-progress-modal-header">
          <div className="admin-progress-modal-title-wrap">
            <div className="admin-progress-modal-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" />
              ) : (
                user.fullName?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="admin-progress-modal-user-info">
              <h3>Theo dõi tiến trình: {user.fullName}</h3>
              <p>{user.email} • Gói: <strong style={{ color: 'var(--teal)' }}>{user.subscriptionPlan}</strong></p>
            </div>
          </div>
          <button className="admin-progress-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="admin-progress-modal-body">
          {loading ? (
            <div className="admin-progress-modal-loading">
              <div className="admin-progress-spinner" />
              <span>Đang tải thông tin tiến trình & chỉ số...</span>
            </div>
          ) : !data ? (
            <div className="admin-progress-empty-state">
              <span className="admin-progress-empty-icon">⚠️</span>
              <h4>Chưa có dữ liệu tiến trình</h4>
              <p>Người dùng này chưa kích hoạt hoặc chưa bắt đầu lưu chỉ số lộ trình.</p>
            </div>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="admin-progress-overview-grid">
                <div className="admin-progress-stat-card">
                  <div className="admin-progress-stat-icon"><Activity size={20} /></div>
                  <div className="admin-progress-stat-info">
                    <span className="admin-progress-stat-label">Ngày lộ trình</span>
                    <span className="admin-progress-stat-val">Ngày {data.currentDay}/120</span>
                  </div>
                </div>

                <div className="admin-progress-stat-card">
                  <div className="admin-progress-stat-icon"><Flame size={20} style={{ color: '#f97316' }} /></div>
                  <div className="admin-progress-stat-info">
                    <span className="admin-progress-stat-label">Chuỗi Streak</span>
                    <span className="admin-progress-stat-val">🔥 {data.streakCount} ngày</span>
                  </div>
                </div>

                <div className="admin-progress-stat-card">
                  <div className="admin-progress-stat-icon"><Calendar size={20} /></div>
                  <div className="admin-progress-stat-info">
                    <span className="admin-progress-stat-label">Bắt đầu lúc</span>
                    <span className="admin-progress-stat-val" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      {formatDate(data.startedAt).split(' ')[0]}
                    </span>
                  </div>
                </div>

                <div className="admin-progress-stat-card">
                  <div className="admin-progress-stat-icon"><Clock size={20} /></div>
                  <div className="admin-progress-stat-info">
                    <span className="admin-progress-stat-label">Cập nhật cuối</span>
                    <span className="admin-progress-stat-val" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      {data.lastCheckedInAt ? formatDate(data.lastCheckedInAt).split(' ')[0] : 'Chưa điểm danh'}
                    </span>
                  </div>
                </div>

                <div className="admin-progress-stat-card">
                  <div className="admin-progress-stat-icon">
                    <span style={{ fontSize: '1.2rem' }}>
                      {data.status === 'ACTIVE' ? '🟢' : '🔵'}
                    </span>
                  </div>
                  <div className="admin-progress-stat-info">
                    <span className="admin-progress-stat-label">Trạng thái</span>
                    <span className={`admin-progress-stat-val ${data.status === 'ACTIVE' ? 'active-text' : 'completed-text'}`}>
                      {data.status === 'ACTIVE' ? 'Hoạt động' : 'Hoàn thành'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="admin-progress-tabs">
                <button 
                  className={`admin-progress-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <BarChart3 size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Chỉ số TB & Xu hướng
                </button>
                <button 
                  className={`admin-progress-tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
                  onClick={() => setActiveTab('daily')}
                >
                  <ListCollapse size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Nhật ký hàng ngày (Month 1)
                </button>
                <button 
                  className={`admin-progress-tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
                  onClick={() => setActiveTab('weekly')}
                >
                  <TrendingUp size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Nhật ký hàng tuần (Month 2-4)
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'overview' && (
                <div className="admin-progress-averages-layout">
                  {/* Left Column: Averages Progress Bars */}
                  <div className="admin-progress-section-card">
                    <h4>Chỉ số trung bình</h4>
                    {averages ? (
                      <div className="admin-progress-bar-list">
                        {/* Screen Time */}
                        <div className="admin-progress-bar-item">
                          <div className="admin-progress-bar-label-row">
                            <span className="admin-progress-bar-name">📱 Thời gian màn hình</span>
                            <span className="admin-progress-bar-val">{averages.screenTime} phút/ngày</span>
                          </div>
                          <div className="admin-progress-bar-track">
                            <div 
                              className={`admin-progress-bar-fill ${getMetricProgressStyle('screenTime', averages.screenTime).status}`}
                              style={{ width: `${Math.min(100, getMetricProgressStyle('screenTime', averages.screenTime).percentage)}%` }}
                            />
                          </div>
                        </div>

                        {/* Mood Score */}
                        <div className="admin-progress-bar-item">
                          <div className="admin-progress-bar-label-row">
                            <span className="admin-progress-bar-name">😊 Chỉ số cảm xúc</span>
                            <span className="admin-progress-bar-val">{averages.mood}/10</span>
                          </div>
                          <div className="admin-progress-bar-track">
                            <div 
                              className={`admin-progress-bar-fill ${getMetricProgressStyle('mood', averages.mood).status}`}
                              style={{ width: `${getMetricProgressStyle('mood', averages.mood).percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Sleep Score */}
                        <div className="admin-progress-bar-item">
                          <div className="admin-progress-bar-label-row">
                            <span className="admin-progress-bar-name">🌙 Chất lượng giấc ngủ</span>
                            <span className="admin-progress-bar-val">{averages.sleep}/10</span>
                          </div>
                          <div className="admin-progress-bar-track">
                            <div 
                              className={`admin-progress-bar-fill ${getMetricProgressStyle('sleep', averages.sleep).status}`}
                              style={{ width: `${getMetricProgressStyle('sleep', averages.sleep).percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Urge Score */}
                        <div className="admin-progress-bar-item">
                          <div className="admin-progress-bar-label-row">
                            <span className="admin-progress-bar-name">⚡ Mức độ thôi thúc sử dụng</span>
                            <span className="admin-progress-bar-val">{averages.urge}/10</span>
                          </div>
                          <div className="admin-progress-bar-track">
                            <div 
                              className={`admin-progress-bar-fill ${getMetricProgressStyle('urge', averages.urge).status}`}
                              style={{ width: `${getMetricProgressStyle('urge', averages.urge).percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Focus Score */}
                        <div className="admin-progress-bar-item">
                          <div className="admin-progress-bar-label-row">
                            <span className="admin-progress-bar-name">🎯 Chỉ số tập trung</span>
                            <span className="admin-progress-bar-val">{averages.focus}/10</span>
                          </div>
                          <div className="admin-progress-bar-track">
                            <div 
                              className={`admin-progress-bar-fill ${getMetricProgressStyle('focus', averages.focus).status}`}
                              style={{ width: `${getMetricProgressStyle('focus', averages.focus).percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: '#64748b', fontSize: '0.88rem', textAlign: 'center', padding: '2rem 0' }}>
                        Chưa có đủ nhật ký hàng ngày để tính toán chỉ số trung bình.
                      </p>
                    )}
                  </div>

                  {/* Right Column: Custom Trend Charts */}
                  <div className="admin-charts-grid">
                    {/* Screen Time Trend */}
                    <div className="admin-chart-box">
                      <div className="admin-chart-title">Xu hướng thời gian màn hình</div>
                      <div className="admin-chart-sub">Biểu đồ 7 ngày gần nhất (phút)</div>
                      {trendLogs.length > 0 ? (
                        <div className="admin-bar-chart">
                          {trendLogs.map((log, index) => {
                            const val = log.screenTimeMinutes || 0;
                            // cap max at 480 for styling
                            const heightPct = Math.round((Math.min(480, val) / 480) * 100);
                            return (
                              <div key={index} className="admin-bar-col">
                                <span className="admin-bar-val">{val}</span>
                                <div 
                                  className="admin-bar"
                                  style={{ height: `${Math.max(5, heightPct)}%` }}
                                  title={`Ngày ${log.dayNumber}: ${val} phút`}
                                />
                                <span className="admin-bar-day">N.{log.dayNumber}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center', padding: '2rem 0' }}>
                          Chưa có biểu đồ xu hướng.
                        </p>
                      )}
                    </div>

                    {/* Mood Trend */}
                    <div className="admin-chart-box">
                      <div className="admin-chart-title">Biến động tâm trạng</div>
                      <div className="admin-chart-sub">Biểu đồ 7 ngày gần nhất (thang điểm 1-10)</div>
                      {trendLogs.length > 0 ? (
                        <div className="admin-bar-chart">
                          {trendLogs.map((log, index) => {
                            const val = log.moodScore || 1;
                            const heightPct = Math.round((val / 10) * 100);
                            return (
                              <div key={index} className="admin-bar-col">
                                <span className="admin-bar-val">{val}</span>
                                <div 
                                  className="admin-bar mood-bar"
                                  style={{ height: `${heightPct}%` }}
                                  title={`Ngày ${log.dayNumber}: ${val}/10`}
                                />
                                <span className="admin-bar-day">N.{log.dayNumber}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center', padding: '2rem 0' }}>
                          Chưa có biểu đồ xu hướng.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'daily' && (
                <div className="admin-logs-table-wrapper">
                  <div className="admin-logs-scroll-area">
                    <table className="admin-logs-table">
                      <thead>
                        <tr>
                          <th>Ngày phác đồ</th>
                          <th>Thời gian màn hình</th>
                          <th>Số lần mở đt</th>
                          <th>Thôi thúc</th>
                          <th>Giờ ngủ</th>
                          <th>Cảm xúc</th>
                          <th>Tập trung</th>
                          <th>Nhật ký tự do</th>
                          <th>Ngày ghi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!data.dailyLogs || data.dailyLogs.length === 0 ? (
                          <tr>
                            <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                              Người dùng chưa lưu bất kỳ nhật ký hàng ngày nào.
                            </td>
                          </tr>
                        ) : (
                          data.dailyLogs.map((log, i) => (
                            <tr key={i}>
                              <td><span className="admin-log-day-badge">Ngày {log.dayNumber}</span></td>
                              <td>{log.screenTimeMinutes} phút</td>
                              <td>{log.unconsciousOpenCount} lần</td>
                              <td>{log.urgeLevel}/10</td>
                              <td>{log.sleepHours} giờ (điểm ngủ: {log.sleepScore})</td>
                              <td>{log.moodScore}/10</td>
                              <td>{log.focusScore}/10</td>
                              <td>
                                <span className="admin-log-privacy-chip">
                                  <Lock size={12} /> Bị ẩn vì quyền riêng tư
                                </span>
                              </td>
                              <td style={{ color: '#64748b', fontSize: '0.78rem' }}>
                                {formatDate(log.createdAt)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'weekly' && (
                <div className="admin-logs-table-wrapper">
                  <div className="admin-logs-scroll-area">
                    <table className="admin-logs-table">
                      <thead>
                        <tr>
                          <th>Tuần phác đồ</th>
                          <th>Màn hình (TB)</th>
                          <th>Mạng xã hội (TB)</th>
                          <th>Tập trung sâu (TB)</th>
                          <th>Cảm xúc (TB)</th>
                          <th>Năng suất (số lượng)</th>
                          <th>Chuỗi Streak</th>
                          <th>Hài lòng mối quan hệ</th>
                          <th>Ngày ghi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!data.weeklyLogs || data.weeklyLogs.length === 0 ? (
                          <tr>
                            <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                              Người dùng chưa lưu bất kỳ nhật ký hàng tuần nào.
                            </td>
                          </tr>
                        ) : (
                          data.weeklyLogs.map((log, i) => (
                            <tr key={i}>
                              <td><span className="admin-log-day-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#2563eb' }}>Tuần {log.weekNumber}</span></td>
                              <td>{log.screenTimeAvgMinutes} phút</td>
                              <td>{log.socialMediaAvgMinutes} phút</td>
                              <td>{log.deepWorkAvgMinutes} phút</td>
                              <td>{log.moodAvgScore}/10</td>
                              <td>{log.outputCount} việc</td>
                              <td>🔥 {log.streakCount} ngày</td>
                              <td>{log.relationshipSatisfaction}/10</td>
                              <td style={{ color: '#64748b', fontSize: '0.78rem' }}>
                                {formatDate(log.createdAt)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="admin-progress-modal-footer">
          <button className="admin-progress-modal-btn-close" onClick={onClose}>
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}
