import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Award,
  Percent,
  Clock,
  Search,
  Filter,
  Eye,
  RefreshCw,
  BarChart2,
  Calendar,
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { adminApi } from '../../../apis/adminApi';
import AppState from '../../../components/AppState';
import { PageHeader } from '../../../components/PageSection';
import './QuizAnalyticsPage.css';

export default function QuizAnalyticsPage() {
  const navigate = useNavigate();

  // State
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [quizPerformance, setQuizPerformance] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart & Filter States
  const [period, setPeriod] = useState('7d');
  const [activeChartBar, setActiveChartBar] = useState(null);

  // Table & Filters State
  const [filterQuizId, setFilterQuizId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    fetchQuizzesList();
    fetchOverallData();
  }, []);

  useEffect(() => {
    fetchChartTrend();
  }, [period]);

  useEffect(() => {
    fetchAttemptsList();
  }, [currentPage]);

  const fetchQuizzesList = async () => {
    try {
      const response = await adminApi.getQuizzes({ size: 100 });
      if (response.data?.success) {
        setQuizzes(response.data.data.content || []);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const fetchOverallData = async () => {
    try {
      setLoading(true);
      const [statsRes, performanceRes] = await Promise.all([
        adminApi.getQuizAttemptStats(),
        adminApi.getQuizAttemptsByQuiz()
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
      if (performanceRes.data?.success) {
        setQuizPerformance(performanceRes.data.data || []);
      }

      await fetchChartTrend();
      await fetchAttemptsList();

      setError(null);
    } catch (err) {
      console.error('Error fetching analytics overview:', err);
      setError('Không thể tải dữ liệu thống kê bài làm. Vui lòng kiểm tra kết nối.');
    } finally {
      setLoading(false);
    }
  };

  const fetchChartTrend = async () => {
    try {
      const res = await adminApi.getQuizAttemptChart(period);
      if (res.data?.success) {
        setChartData(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching chart trend:', err);
    }
  };

  const fetchAttemptsList = async () => {
    try {
      setTableLoading(true);
      const params = {
        page: currentPage,
        size: 10,
        sort: 'startedAt,desc'
      };

      if (filterQuizId) params.quizId = filterQuizId;
      if (filterStatus) params.status = filterStatus;
      if (filterKeyword) params.keyword = filterKeyword;
      
      if (filterFromDate) {
        params.fromDate = filterFromDate.includes('T') ? filterFromDate : `${filterFromDate}T00:00:00`;
      }
      if (filterToDate) {
        params.toDate = filterToDate.includes('T') ? filterToDate : `${filterToDate}T23:59:59`;
      }

      const res = await adminApi.getQuizAttempts(params);
      if (res.data?.success) {
        setAttempts(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 0);
        setTotalElements(res.data.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Error fetching attempts list:', err);
    } finally {
      setTableLoading(false);
    }
  };

  const handleFilterSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchAttemptsList();
  };

  const handleFilterReset = () => {
    setFilterQuizId('');
    setFilterStatus('');
    setFilterKeyword('');
    setFilterFromDate('');
    setFilterToDate('');
    setCurrentPage(0);
    setTimeout(() => {
      fetchAttemptsList();
    }, 50);
  };

  const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined) return 'Đang thực hiện';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds} giây`;
    return `${minutes} phút ${remainingSeconds} giây`;
  };

  const shouldShowLabel = (index, total) => {
    if (!total) return false;
    if (total <= 8) return true;
    if (index === 0 || index === total - 1) return true;
    const step = total > 15 ? 5 : 2;
    return index % step === 0;
  };

  const formatDateString = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="attempt-badge badge-completed">Hoàn thành</span>;
      case 'IN_PROGRESS':
        return <span className="attempt-badge badge-progress">Đang làm</span>;
      case 'EXPIRED':
      default:
        return <span className="attempt-badge badge-expired">Bỏ dở / Hết hạn</span>;
    }
  };

  if (loading && !stats) {
    return (
      <AppState
        variant="loading"
        title="Đang tải dữ liệu phân tích bài test"
        description="Đang tổng hợp thông tin, tính toán điểm trung bình và biểu đồ lượt làm bài của người dùng..."
      />
    );
  }

  if (error) {
    return (
      <AppState
        variant="error"
        title="Không thể tải phân tích"
        description={error}
        actionLabel="Thử lại"
        onAction={fetchOverallData}
      />
    );
  }

  const kpis = [
    { label: 'Tổng số lượt làm', value: stats?.totalAttempts?.toLocaleString() || '0', sub: `Hôm nay: +${stats?.attemptsToday || 0}`, icon: <FileText />, color: '#3b82f6' },
    { label: 'Số user đã làm bài', value: stats?.uniqueUsers?.toLocaleString() || '0', sub: 'Khách hàng đăng ký', icon: <Users />, color: '#8b5cf6' },
    { label: 'Tỷ lệ hoàn thành', value: `${stats?.completionRate ? Math.round(stats.completionRate) : 0}%`, sub: `Đang làm: ${stats?.inProgressAttempts || 0}`, icon: <Percent />, color: '#10b981' },
    { label: 'Điểm trung bình', value: stats?.averageScore ? stats.averageScore.toFixed(1) : '0.0', sub: 'Thống kê tổng quan', icon: <Award />, color: '#f59e0b' }
  ];

  return (
    <div className="quiz-analytics-page">
      <PageHeader
        title="Kết Quả Bài Đánh Giá"
        description="Phân tích chi tiết lượt làm bài trắc nghiệm sàng lọc, chỉ số phản hồi của khách hàng và chất lượng bài test."
      />

      {/* KPI Section */}
      <div className="analytics-kpi-grid">
        {kpis.map((kpi, index) => (
          <div key={index} className="ui-card kpi-card">
            <div className="kpi-card-header">
              <div className="kpi-icon-wrap" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                {kpi.icon}
              </div>
              <span className="kpi-subtext">{kpi.sub}</span>
            </div>
            <h3 className="kpi-label">{kpi.label}</h3>
            <p className="kpi-value">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="analytics-row-2">
        {/* Trend Chart */}
        <div className="ui-card analytics-chart-card">
          <div className="analytics-chart-header">
            <div className="header-left">
              <BarChart2 className="header-icon" />
              <h3>Xu hướng làm bài đánh giá</h3>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="analytics-select"
            >
              <option value="7d">7 ngày gần nhất</option>
              <option value="14d">14 ngày gần nhất</option>
              <option value="30d">30 ngày gần nhất</option>
              <option value="month">Tháng này</option>
            </select>
          </div>
          <div className="analytics-chart-body">
            {chartData.map((item, idx) => {
              const maxVal = Math.max(...chartData.map(d => d.totalAttempts), 1);
              const heightPercent = (item.totalAttempts / maxVal) * 100;
              const completedHeight = item.totalAttempts > 0 ? (item.completedAttempts / item.totalAttempts) * heightPercent : 0;
              
              return (
                <div key={idx} className="chart-bar-container">
                  <div
                    className="chart-bar-group"
                    onMouseEnter={() => setActiveChartBar(idx)}
                    onMouseLeave={() => setActiveChartBar(null)}
                  >
                    {/* Background total attempts bar */}
                    <div 
                      className="chart-bar-total" 
                      style={{ height: `${Math.max(heightPercent, 3)}%` }}
                    >
                      {/* Completed attempts inner overlay */}
                      <div 
                        className="chart-bar-completed" 
                        style={{ height: `${(item.completedAttempts / Math.max(item.totalAttempts, 1)) * 100}%` }}
                      />
                    </div>
                    {activeChartBar === idx && (
                      <div className="chart-tooltip">
                        <div className="tooltip-date">{item.label}</div>
                        <div className="tooltip-row">
                          <span className="dot blue"></span> Lượt bắt đầu: <strong>{item.totalAttempts}</strong>
                        </div>
                        <div className="tooltip-row">
                          <span className="dot green"></span> Hoàn thành: <strong>{item.completedAttempts}</strong>
                        </div>
                        <div className="tooltip-row">
                          <span className="dot red"></span> Bỏ dở: <strong>{item.abandonedAttempts}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className={`chart-label ${activeChartBar === idx ? 'active' : ''}`}>
                    {shouldShowLabel(idx, chartData.length) || activeChartBar === idx ? item.label : '\u00A0'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot completed"></span> Lượt hoàn thành</span>
            <span className="legend-item"><span className="legend-dot in-progress"></span> Lượt bắt đầu/Bỏ dở</span>
          </div>
        </div>

        {/* Breakdown by Quiz */}
        <div className="ui-card analytics-breakdown-card">
          <h3 className="card-title"><TrendingUp size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} /> Thống kê theo bài trắc nghiệm</h3>
          <div className="quiz-performance-list">
            {quizPerformance.map((quiz, idx) => {
              const compPercent = Math.round(quiz.completionRate || 0);
              return (
                <div key={quiz.quizId || idx} className="quiz-performance-item">
                  <div className="quiz-performance-header">
                    <span className="quiz-perf-title" title={quiz.quizTitle}>{quiz.quizTitle}</span>
                    <span className="quiz-perf-count">{quiz.totalAttempts} lượt làm</span>
                  </div>
                  <div className="quiz-performance-details">
                    <span>User: <strong>{quiz.uniqueUsers}</strong></span>
                    <span>Điểm TB: <strong>{quiz.averageScore ? quiz.averageScore.toFixed(1) : '-'}</strong></span>
                    <span>Hoàn thành: <strong>{compPercent}%</strong></span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${compPercent}%`, 
                        background: compPercent > 70 ? '#10b981' : compPercent > 40 ? '#f59e0b' : '#ef4444' 
                      }}
                    ></div>
                  </div>
                  <span className="quiz-perf-time">Gần nhất: {formatDateString(quiz.lastAttemptAt)}</span>
                </div>
              );
            })}
            {quizPerformance.length === 0 && (
              <p className="no-data-text">Không có dữ liệu bài trắc nghiệm nào</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Attempts Search List */}
      <div className="ui-card attempts-list-card">
        <h3 className="card-title">Bộ lọc & Tra cứu lượt làm bài</h3>
        
        {/* Filter Bar */}
        <form onSubmit={handleFilterSearch} className="attempts-filter-form">
          <div className="filter-grid">
            <div className="filter-field">
              <label>Tìm kiếm user</label>
              <div className="input-with-icon">
                <Search size={18} className="field-icon" />
                <input 
                  type="text" 
                  placeholder="Nhập tên hoặc email..." 
                  value={filterKeyword}
                  onChange={(e) => setFilterKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-field">
              <label>Bài trắc nghiệm</label>
              <select 
                value={filterQuizId}
                onChange={(e) => setFilterQuizId(e.target.value)}
              >
                <option value="">Tất cả bài trắc nghiệm</option>
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label>Trạng thái</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="IN_PROGRESS">Đang làm</option>
                <option value="EXPIRED">Bỏ dở / Hết hạn</option>
              </select>
            </div>

            <div className="filter-field">
              <label>Từ ngày</label>
              <div className="input-with-icon">
                <Calendar size={18} className="field-icon" />
                <input 
                  type="date" 
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-field">
              <label>Đến ngày</label>
              <div className="input-with-icon">
                <Calendar size={18} className="field-icon" />
                <input 
                  type="date" 
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button type="button" onClick={handleFilterReset} className="btn-secondary">
              Đặt lại
            </button>
            <button type="submit" className="btn-primary">
              <Filter size={18} /> Lọc kết quả
            </button>
          </div>
        </form>

        {/* Table list */}
        <div className="table-responsive-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Bài trắc nghiệm</th>
                <th>Trạng thái</th>
                <th className="text-center">Điểm số</th>
                <th>Đánh giá kết luận</th>
                <th>Bắt đầu lúc</th>
                <th>Thời lượng</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="user-info-cell">
                      <span className="user-name">{item.customerName}</span>
                      <span className="user-email">{item.customerEmail}</span>
                    </div>
                  </td>
                  <td>
                    <span className="quiz-title-cell" title={item.quizTitle}>{item.quizTitle}</span>
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td className="text-center font-bold">
                    {item.totalScore !== null && item.totalScore !== undefined ? item.totalScore : '-'}
                  </td>
                  <td>
                    <span className="assessment-verdict" title={item.assessmentResult}>
                      {item.assessmentResult || '-'}
                    </span>
                  </td>
                  <td>
                    <span className="date-time-cell">{formatDateString(item.startedAt)}</span>
                  </td>
                  <td>{formatDuration(item.durationSeconds)}</td>
                  <td className="text-center">
                    <button 
                      onClick={() => navigate(`/admin/quizzes/attempts/${item.id}`)}
                      className="action-btn-view"
                      title="Xem chi tiết câu trả lời"
                    >
                      <Eye size={16} /> Xem
                    </button>
                  </td>
                </tr>
              ))}
              {!tableLoading && attempts.length === 0 && (
                <tr>
                  <td colSpan="8" className="table-no-data">
                    <AlertCircle size={24} />
                    <p>Không tìm thấy lượt làm bài trắc nghiệm nào khớp với điều kiện lọc.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {tableLoading && (
            <div className="table-loading-spinner">
              <RefreshCw className="animate-spin" size={32} />
              <p>Đang truy vấn dữ liệu...</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <span className="pagination-info">
              Hiển thị trang <strong>{currentPage + 1}</strong> / {totalPages} (Tổng <strong>{totalElements}</strong> kết quả)
            </span>
            <div className="pagination-buttons">
              <button 
                disabled={currentPage === 0 || tableLoading}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="pagination-btn"
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, pageIdx) => {
                // Show maximum of 5 page buttons
                if (Math.abs(pageIdx - currentPage) <= 2 || pageIdx === 0 || pageIdx === totalPages - 1) {
                  return (
                    <button
                      key={pageIdx}
                      onClick={() => setCurrentPage(pageIdx)}
                      className={`pagination-number-btn ${currentPage === pageIdx ? 'active' : ''}`}
                      disabled={tableLoading}
                    >
                      {pageIdx + 1}
                    </button>
                  );
                } else if (pageIdx === 1 || pageIdx === totalPages - 2) {
                  return <span key={pageIdx} className="pagination-ellipsis">...</span>;
                }
                return null;
              })}
              <button 
                disabled={currentPage === totalPages - 1 || tableLoading}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="pagination-btn"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
