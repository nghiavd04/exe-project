import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Clock,
  Award,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { adminApi } from '../../../apis/adminApi';
import AppState from '../../../components/AppState';
import './QuizAttemptDetailPage.css';

export default function QuizAttemptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttemptDetail();
  }, [id]);

  const fetchAttemptDetail = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getQuizAttemptDetail(id);
      if (res.data?.success) {
        setAttempt(res.data.data);
        setError(null);
      } else {
        setError('Không thể tìm thấy thông tin lượt làm bài này.');
      }
    } catch (err) {
      console.error('Error fetching quiz attempt detail:', err);
      setError('Lỗi khi kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return 'Đang thực hiện / Không xác định';
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffSeconds = Math.floor((endTime - startTime) / 1000);
    
    if (diffSeconds < 0) return '0 giây';
    
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    if (minutes === 0) return `${seconds} giây`;
    return `${minutes} phút ${seconds} giây`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED': return 'badge-completed';
      case 'IN_PROGRESS': return 'badge-progress';
      case 'EXPIRED':
      default: return 'badge-expired';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'IN_PROGRESS': return 'Đang làm';
      case 'EXPIRED':
      default: return 'Bỏ dở / Hết hạn';
    }
  };

  if (loading) {
    return (
      <AppState
        variant="loading"
        title="Đang tải chi tiết lượt làm bài"
        description="Đang nạp thông tin khách hàng, tổng hợp điểm số và câu trả lời..."
      />
    );
  }

  if (error || !attempt) {
    return (
      <AppState
        variant="error"
        title="Không tìm thấy lượt làm bài"
        description={error || 'Đã xảy ra lỗi không xác định.'}
        actionLabel="Quay lại danh sách"
        onAction={() => navigate('/admin/quizzes/attempts')}
      />
    );
  }

  return (
    <div className="attempt-detail-page">
      {/* Back navigation */}
      <button 
        onClick={() => navigate('/admin/quizzes/attempts')}
        className="back-navigation-btn"
      >
        <ArrowLeft size={16} /> Quay lại danh sách lượt làm bài
      </button>

      <div className="attempt-detail-header-wrap">
        <h2>Chi tiết lượt làm bài #{attempt.id}</h2>
        <span className={`attempt-badge ${getStatusBadgeClass(attempt.status)}`}>
          {getStatusText(attempt.status)}
        </span>
      </div>

      <div className="attempt-detail-grid">
        {/* Sidebar Info Card */}
        <div className="attempt-sidebar-info">
          {/* User info card */}
          <div className="ui-card info-card">
            <h3 className="section-title">Thông tin khách hàng</h3>
            <div className="user-profile-summary">
              {attempt.avatarUrl ? (
                <img 
                  src={attempt.avatarUrl} 
                  alt={attempt.customerName} 
                  className="user-avatar-large"
                />
              ) : (
                <div className="user-avatar-placeholder">
                  <User size={32} />
                </div>
              )}
              <div className="user-profile-names">
                <h4>{attempt.customerName}</h4>
                <p>Khách hàng sàng lọc</p>
              </div>
            </div>
            
            <div className="profile-details-list">
              <div className="detail-item">
                <Mail size={16} className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Email liên hệ</span>
                  <span className="detail-value">{attempt.customerEmail}</span>
                </div>
              </div>
              <div className="detail-item">
                <Calendar size={16} className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Mã khách hàng</span>
                  <span className="detail-value">#{attempt.customerId || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Test summary card */}
          <div className="ui-card info-card">
            <h3 className="section-title">Tổng quan bài đánh giá</h3>
            <div className="detail-item">
              <FileText size={16} className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Tên bài test</span>
                <span className="detail-value font-bold">{attempt.quizTitle}</span>
              </div>
            </div>
            {attempt.quizDescription && (
              <p className="quiz-desc-text">{attempt.quizDescription}</p>
            )}

            <div className="horizontal-separator"></div>

            <div className="detail-item">
              <Clock size={16} className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Bắt đầu lúc</span>
                <span className="detail-value">{formatDate(attempt.startedAt)}</span>
              </div>
            </div>
            <div className="detail-item">
              <Clock size={16} className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Nộp bài lúc</span>
                <span className="detail-value">{formatDate(attempt.submittedAt)}</span>
              </div>
            </div>
            <div className="detail-item">
              <Clock size={16} className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Thời gian thực hiện</span>
                <span className="detail-value font-medium">
                  {formatDuration(attempt.startedAt, attempt.submittedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Result card */}
          <div className="ui-card result-summary-card">
            <div className="result-score-block">
              <Award size={36} className="score-icon" />
              <div className="score-texts">
                <span className="score-label">Điểm số đạt được</span>
                <p className="score-value">
                  {attempt.totalScore !== null ? attempt.totalScore : '-'} <span className="score-max">điểm</span>
                </p>
              </div>
            </div>
            
            {attempt.assessmentResult && (
              <div className="verdict-block">
                <span className="verdict-label">Kết luận sàng lọc</span>
                <div className="verdict-bubble">
                  {attempt.assessmentResult}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Questions and Answers Chosen */}
        <div className="attempt-main-questions ui-card">
          <h3 className="section-title">Chi tiết câu trả lời đã chọn</h3>
          
          <div className="question-list-wrapper">
            {attempt.questions && attempt.questions.map((q, idx) => {
              const hasAnswers = q.selectedAnswerIds && q.selectedAnswerIds.length > 0;
              
              return (
                <div key={q.questionId || idx} className="question-block">
                  <div className="question-header">
                    <span className="question-number">Câu hỏi {idx + 1}</span>
                    <span className="question-type">
                      {q.type === 'SINGLE_CHOICE' ? 'Lựa chọn đơn' : 'Lựa chọn nhiều'}
                    </span>
                  </div>
                  
                  <h4 className="question-text">{q.content}</h4>

                  <div className="options-grid">
                    {q.options && q.options.map(option => {
                      const isSelected = q.selectedAnswerIds && q.selectedAnswerIds.includes(option.id);
                      
                      return (
                        <div 
                          key={option.id} 
                          className={`option-item-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div className="option-checkbox-wrap">
                            {isSelected ? (
                              q.type === 'SINGLE_CHOICE' ? (
                                <div className="radio-indicator active">
                                  <div className="radio-dot"></div>
                                </div>
                              ) : (
                                <div className="checkbox-indicator active">
                                  <CheckCircle size={14} className="checkbox-check" />
                                </div>
                              )
                            ) : (
                              q.type === 'SINGLE_CHOICE' ? (
                                <div className="radio-indicator"></div>
                              ) : (
                                <div className="checkbox-indicator"></div>
                              )
                            )}
                          </div>
                          
                          <div className="option-content">
                            <span className="option-text">{option.content}</span>
                          </div>

                          {option.value !== undefined && option.value !== null && (
                            <span className={`option-value-badge ${isSelected ? 'selected' : ''}`}>
                              +{option.value} đ
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!hasAnswers && (
                    <div className="no-answer-alert">
                      <AlertCircle size={16} />
                      <span>Không có câu trả lời cho câu hỏi này (Bỏ qua hoặc chưa chọn)</span>
                    </div>
                  )}
                </div>
              );
            })}
            {(!attempt.questions || attempt.questions.length === 0) && (
              <div className="empty-questions-state">
                <HelpCircle size={48} />
                <p>Không có thông tin chi tiết câu hỏi cho lượt làm bài này.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
