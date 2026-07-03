import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Edit3, Save, Calendar, CheckCircle, Flame, Play } from 'lucide-react';
import { useProgram } from './ProgramLayout';
import { programApi } from '../../../apis/customerApi';

import DayNavigation from './components/DayNavigation';
import TodayTasksCard from './components/TodayTasksCard';
import MetricsTracker from './components/MetricsTracker';
import JournalCard from './components/JournalCard';

export default function ProgramDetailPage() {
  const navigate = useNavigate();
  const {
    programMetadata,
    userProgress,
    dayDetail,
    isEnrolled,
    tasks,
    metrics,
    journal,
    setJournal,
    savedToast,
    handleToggleTask,
    handleMetric,
    handleSaveLogs,
    analytics,
    handleAdvanceDay,
    loadDayDetail,
    showToastMessage
  } = useProgram();

  const [isEditing, setIsEditing] = useState(false);
  const [searchParams] = useSearchParams();
  const queryDay = searchParams.get('day');
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [advanceError, setAdvanceError] = useState('');

  // Monthly review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [protocolsList, setProtocolsList] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    suitabilityRating: 5,
    completionConfidence: 5,
    difficultyLevel: 3,
    wantsToSwitch: false,
    userNotes: '',
    nextAction: 'KEEP',
    switchProtocolId: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        const res = await programApi.getProtocols();
        if (res.data && res.data.success) {
          setProtocolsList(res.data.data);
        }
      } catch (err) {
        console.error("Error loading protocols:", err);
      }
    };
    if (isEnrolled) {
      fetchProtocols();
    }
  }, [isEnrolled]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setReviewError('');
    try {
      const payload = {
        ...reviewForm,
        switchProtocolId: reviewForm.nextAction === 'SWITCH_PROTOCOL' ? Number(reviewForm.switchProtocolId) : null
      };
      const res = await programApi.submitReview(payload);
      if (res.data && res.data.success) {
        setShowReviewModal(false);
        window.location.reload();
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (userProgress) {
      if (queryDay) {
        const targetDay = parseInt(queryDay, 10);
        if (targetDay > 0 && targetDay <= userProgress.currentDay) {
          loadDayDetail(targetDay);
          return;
        }
      }
      loadDayDetail(userProgress.currentDay);
    }
  }, [queryDay, userProgress]);

  useEffect(() => {
    if (dayDetail) {
      const hasLogged = !!dayDetail.loggedData;
      setIsEditing(!hasLogged);
    }
  }, [dayDetail]);

  if (!isEnrolled) {
    return (
      <div className="pd-page pd-not-enrolled-page">
        <div className="pd-clean-hero">
          <span className="pd-hero-icon-large">🔒</span>
          <h1 className="pd-clean-hero-title">Lộ trình chưa được kích hoạt</h1>
          <p className="pd-clean-hero-desc">
            Vui lòng quay trở lại trang Tổng quan để bắt đầu kích hoạt và tham gia lộ trình học của bạn.
          </p>
          <button className="pd-btn-primary" onClick={() => navigate('/phac-do')}>
            Quay lại Tổng quan
          </button>
        </div>
      </div>
    );
  }

  const currentDayNum = dayDetail?.dayNumber || 1;
  const totalDays = userProgress?.durationDays || 120;
  const completedTasks = tasks.filter(t => t.done).length;
  const allDone = tasks.length > 0 && completedTasks === tasks.length;
  const isReviewDue = userProgress && userProgress.reviewDueAt && new Date(userProgress.reviewDueAt) <= new Date();
  const isPastDay = currentDayNum < (userProgress?.currentDay || 1);
  const taskPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Hero status logic
  const getHeroStatus = () => {
    if (isPastDay) return { label: 'Đã ghi nhận', cls: 'completed', icon: '✓' };
    if (allDone && !isEditing) return { label: 'Đã hoàn tất', cls: 'completed', icon: '✓' };
    if (!isEditing && dayDetail?.loggedData) return { label: 'Đã ghi nhận', cls: 'saved', icon: '✓' };
    return { label: 'Đang theo dõi', cls: 'active', icon: '●' };
  };

  // Single CTA logic
  const getMainCTA = () => {
    if (isPastDay) {
      return {
        label: 'Lưu quan sát',
        icon: <Save size={16} />,
        action: async () => {
          const success = await handleSaveLogs();
          if (success) showToastMessage('Đã lưu quan sát ngày cũ', 'success');
        }
      };
    }
    if (isEditing) {
      return {
        label: 'Lưu tín hiệu',
        icon: <Save size={16} />,
        action: async () => {
          const success = await handleSaveLogs();
          if (success) setIsEditing(false);
        }
      };
    }
    if (currentDayNum === userProgress?.currentDay) {
      return {
        label: 'Khép lại ngày',
        icon: <ArrowRight size={16} />,
        action: () => setShowAdvanceModal(true)
      };
    }
    return null;
  };

  const confirmAdvanceDay = async () => {
    setIsAdvancing(true);
    setAdvanceError('');
    const res = await handleAdvanceDay();
    if (res && res.success) {
      setShowAdvanceModal(false);
      navigate(`/phac-do/chi-tiet?day=${currentDayNum + 1}`);
    } else {
      setAdvanceError(res?.message || 'Không thể khép lại ngày hôm nay.');
    }
    setIsAdvancing(false);
  };

  const getMoodEmoji = (val) => {
    if (val <= 2) return 'Tệ';
    if (val <= 4) return '😐 Hơi tệ';
    if (val <= 6) return '🙂 Bình thường';
    if (val <= 8) return '😊 Vui vẻ';
    return '🤩 Rất tốt';
  };

  const getMetricStyle = (type, val) => {
    let status = 'middle';
    let percentage = 0;

    if (type === 'screenTime') {
      percentage = Math.round((val / 480) * 100);
      if (val < 120) status = 'good';
      else if (val <= 240) status = 'middle';
      else status = 'bad';
    } else {
      percentage = Math.round(((val - 1) / 9) * 100);
      if (type === 'urge') {
        if (val <= 3) status = 'good';
        else if (val <= 7) status = 'middle';
        else status = 'bad';
      } else {
        if (val >= 8) status = 'good';
        else if (val >= 5) status = 'middle';
        else status = 'bad';
      }
    }

    let clrActive = '#0d9488';
    let clrBg = 'rgba(13, 148, 136, 0.1)';
    let clrShadow = 'rgba(13, 148, 136, 0.2)';

    if (status === 'middle') {
      clrActive = '#eab308';
      clrBg = 'rgba(234, 179, 8, 0.1)';
      clrShadow = 'rgba(234, 179, 8, 0.2)';
    } else if (status === 'bad') {
      clrActive = '#f43f5e';
      clrBg = 'rgba(244, 63, 94, 0.1)';
      clrShadow = 'rgba(244, 63, 94, 0.2)';
    }

    return {
      '--val': `${percentage}%`,
      '--clr-active': clrActive,
      '--clr-bg': clrBg,
      '--clr-shadow': clrShadow
    };
  };

  const getRuleBasedInsight = () => {
    const hasScreenTime = metrics.screenTime > 0;
    const completedCount = tasks.filter(t => t.done).length;

    if (!hasScreenTime && completedCount === 0) {
      return "Hãy bắt đầu bằng cách tick các việc giữ nhịp và kéo thanh tín hiệu phía trên.";
    }
    if (completedCount === tasks.length && tasks.length > 0) {
      if (metrics.urge >= 7) {
        return `Dù mức thôi thúc cao (${metrics.urge}/10), bạn vẫn giữ nhịp hoàn hảo. Vỏ não thùy trán đang lấy lại quyền kiểm soát.`;
      }
      return `Ngày tuyệt vời! Hoàn thành tất cả việc giữ nhịp với mức thôi thúc an toàn (${metrics.urge}/10). Thụ thể dopamine đang phục hồi.`;
    }
    if (metrics.screenTime < 120 && metrics.screenTime > 0) {
      return `Thời gian màn hình thấp (${metrics.screenTime} phút). Sự ngắt kết nối này giúp hệ thần kinh tự tái cân bằng.`;
    }
    if (metrics.sleep >= 8) {
      return `Giấc ngủ chất lượng (${metrics.sleep}/10) là liều thuốc phục hồi tự nhiên. Hãy giữ nhịp tốt hơn ngày mai.`;
    }
    return "Việc dành vài phút tự quan sát và ghi nhận tín hiệu đã là một bước tiến quan trọng.";
  };

  const heroStatus = getHeroStatus();
  const mainCTA = getMainCTA();

  return (
    <div className="pd-page pd-detail-workspace">
      {/* 1. Top navigation */}
      <DayNavigation
        currentDay={currentDayNum}
        maxDay={userProgress?.currentDay || 1}
        onPrev={() => navigate(`/phac-do/chi-tiet?day=${currentDayNum - 1}`)}
        onNext={() => navigate(`/phac-do/chi-tiet?day=${currentDayNum + 1}`)}
        onBack={() => navigate('/phac-do')}
        weekNumber={dayDetail?.weekNumber || 1}
        phaseNumber={dayDetail?.phaseNumber || 1}
      />

      {/* Monthly review banner */}
      {isReviewDue && (
        <div className="pd-review-due-banner-clean">
          <div className="pd-review-banner-text">
            <h4>📅 Đã đến kỳ Đánh Giá Định Kỳ</h4>
            <p>Hãy đánh giá mức độ phù hợp để tiếp tục hoặc đổi phác đồ.</p>
          </div>
          <button className="pd-btn-review-banner" onClick={() => setShowReviewModal(true)}>
            📝 Đánh giá ngay
          </button>
        </div>
      )}

      {/* 2. Hero Summary Card */}
      <div className="pd-hero-summary">
        <div className="pd-hero-summary-top">
          <div className="pd-hero-summary-left">
            <div className="pd-hero-summary-context">
              <span>Ngày {currentDayNum}</span>
              <span className="pd-hero-dot">·</span>
              <span>Tuần {dayDetail?.weekNumber || 1}</span>
              <span className="pd-hero-dot">·</span>
              <span>Chặng {dayDetail?.phaseNumber || 1}</span>
            </div>
            <h2 className="pd-hero-summary-title">
              {dayDetail?.dayLabel || `Ngày ${currentDayNum} của lộ trình`}
            </h2>
            {isPastDay && (
              <span className="pd-hero-past-badge">Đang xem ngày cũ</span>
            )}
          </div>
          <span className={`pd-hero-status-badge ${heroStatus.cls}`}>
            {heroStatus.icon} {heroStatus.label}
          </span>
        </div>

        <div className="pd-hero-summary-bottom">
          <div className="pd-hero-summary-progress">
            <div className="pd-hero-progress-info">
              <span>{completedTasks}/{tasks.length} việc hoàn thành</span>
              <span>{taskPct}%</span>
            </div>
            <div className="pd-hero-progress-bar">
              <div className="pd-hero-progress-fill" style={{ width: `${taskPct}%` }} />
            </div>
          </div>

          <div className="pd-hero-summary-actions">
            {!isPastDay && !isEditing && dayDetail?.loggedData && (
              <button className="pd-btn-secondary-clean" onClick={() => setIsEditing(true)}>
                <Edit3 size={14} />
                <span>Sửa</span>
              </button>
            )}
            {mainCTA && (
              <button className="pd-btn-primary" onClick={mainCTA.action}>
                {mainCTA.icon}
                <span>{mainCTA.label}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Workspace Body — 2 columns */}
      <div className="pd-workspace-grid">

        {/* Main Work Area (70%) */}
        <div className="pd-workspace-main">

          {/* Section A: Tasks */}
          <TodayTasksCard
            tasks={tasks}
            onToggleTask={!isPastDay ? handleToggleTask : () => showToastMessage('Không thể sửa việc giữ nhịp của ngày cũ.', 'info')}
            dayNumber={currentDayNum}
          />

          {/* Section B: Metrics */}
          <MetricsTracker
            metrics={metrics}
            onMetricChange={handleMetric}
            isEditable={!isPastDay}
            isEditing={isEditing}
            getMetricStyle={getMetricStyle}
            getMoodEmoji={getMoodEmoji}
          />

          {/* Section C: Journal */}
          <JournalCard
            journal={journal}
            onJournalChange={setJournal}
            isEditable={true}
            isEditing={isEditing || isPastDay}
          />

          {/* Bottom action (mobile fallback) */}
          <div className="pd-action-bar-clean">
            {isPastDay && (
              <span className="pd-action-bar-hint">Đang xem ngày cũ · chỉ sửa được Quan sát</span>
            )}
            {mainCTA && (
              <button className="pd-btn-primary pd-btn-full-mobile" onClick={mainCTA.action}>
                {mainCTA.icon}
                <span>{mainCTA.label}</span>
              </button>
            )}
          </div>

        </div>

        {/* Sidebar (30%) */}
        <div className="pd-workspace-sidebar">
          <div className="pd-sidebar-sticky">

            {/* A. Tiến độ ngắn hạn */}
            <div className="pd-side-card pd-sidebar-progress-card">
              <div className="pd-sidebar-stat-row">
                <div className="pd-sidebar-stat">
                  <span className="pd-sidebar-stat-val">{userProgress?.streakCount || 0}🔥</span>
                  <span className="pd-sidebar-stat-lbl">Streak</span>
                </div>
                <div className="pd-sidebar-stat">
                  <span className="pd-sidebar-stat-val">{currentDayNum}/{totalDays}</span>
                  <span className="pd-sidebar-stat-lbl">Ngày</span>
                </div>
                <div className="pd-sidebar-stat">
                  <span className="pd-sidebar-stat-val">{taskPct}%</span>
                  <span className="pd-sidebar-stat-lbl">Task hôm nay</span>
                </div>
              </div>
            </div>

            {/* B. Bối cảnh hành trình */}
            <div className="pd-side-card info-phase-card">
              <h4 className="pd-side-card-title">Bối cảnh hành trình</h4>
              <span className="pd-info-phase-badge">Chặng {dayDetail?.phaseNumber || 1}</span>
              <p className="pd-info-phase-desc">
                <strong>{dayDetail?.phaseLabel || 'Detox'}</strong>: {dayDetail?.weekLabel || 'Ổn định thói quen cơ bản'}
              </p>
              <div className="pd-info-phase-week">
                Tuần {dayDetail?.weekNumber || 1} · Ngày {currentDayNum} / {totalDays}
              </div>
            </div>

            {/* C. Phản hồi hôm nay (Insight - moved from main col) */}
            <div className="pd-side-card pd-sidebar-insight-card">
              <h4 className="pd-side-card-title">💡 Phản hồi hôm nay</h4>
              <p className="pd-sidebar-insight-text">{getRuleBasedInsight()}</p>
            </div>

          </div>
        </div>

      </div>

      {/* Modals */}
      {showAdvanceModal && (
        <div className="pd-modal-overlay">
          <div className="pd-modal-card">
            <div className="pd-modal-header">
              <h3 className="pd-modal-title">Khép lại ngày hôm nay</h3>
            </div>

            <div className="pd-modal-body">
              {completedTasks < 4 ? (
                <div className="pd-modal-warning">
                  <div className="pd-modal-warning-text">
                    <strong>Chú ý:</strong> Bạn mới hoàn thành <strong>{completedTasks}/4</strong> việc giữ nhịp tối thiểu.
                    <br /><br />
                    Nếu khép lại ngay, chuỗi streak sẽ bị reset về 0!
                  </div>
                </div>
              ) : (
                <div className="pd-modal-success-msg">
                  <div className="pd-modal-success-text">
                    Chúc mừng bạn đã giữ nhịp tốt!
                    <br /><br />
                    Chuyển sang ngày <strong>{currentDayNum + 1}</strong>?
                  </div>
                </div>
              )}

              {advanceError && (
                <div className="pd-modal-error-alert">
                  <span className="pd-modal-error-text">{advanceError}</span>
                </div>
              )}
            </div>

            <div className="pd-modal-footer">
              <button
                className="pd-modal-btn pd-modal-btn-cancel"
                onClick={() => setShowAdvanceModal(false)}
                disabled={isAdvancing}
              >
                Hủy
              </button>
              <button
                className="pd-modal-btn pd-modal-btn-confirm"
                onClick={confirmAdvanceDay}
                disabled={isAdvancing}
              >
                {isAdvancing ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="pd-modal-overlay">
          <form className="pd-modal-card" style={{ maxWidth: '560px' }} onSubmit={handleReviewSubmit}>
            <div className="pd-modal-header" style={{ borderBottom: '1px solid rgba(13, 122, 110, 0.1)', paddingBottom: '1rem' }}>
              <h3 className="pd-modal-title">Đánh Giá Định Kỳ Hàng Tháng</h3>
            </div>

            <div className="pd-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1rem 0' }}>
              {reviewError && (
                <div className="pd-modal-error-alert" style={{ marginBottom: '1rem' }}>
                  <span className="pd-modal-error-text">{reviewError}</span>
                </div>
              )}

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>
                  1. Phác đồ hiện tại phù hợp với bạn?
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, suitabilityRating: num }))}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        border: reviewForm.suitabilityRating === num ? '2px solid #0d7a6e' : '1px solid #ddd',
                        background: reviewForm.suitabilityRating === num ? '#e6f4f2' : '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {num} ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>
                  2. Tự tin hoàn thành lộ trình?
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, completionConfidence: num }))}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        border: reviewForm.completionConfidence === num ? '2px solid #0d7a6e' : '1px solid #ddd',
                        background: reviewForm.completionConfidence === num ? '#e6f4f2' : '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>
                  3. Mức độ thử thách?
                </label>
                <select
                  value={reviewForm.difficultyLevel}
                  onChange={e => setReviewForm(prev => ({ ...prev, difficultyLevel: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value={1}>Dễ dàng</option>
                  <option value={2}>Hơi nhẹ</option>
                  <option value={3}>Vừa sức</option>
                  <option value={4}>Thử thách</option>
                  <option value={5}>Rất khó</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>
                  4. Hành động tiếp theo?
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="nextAction"
                      value="KEEP"
                      checked={reviewForm.nextAction === 'KEEP'}
                      onChange={e => setReviewForm(prev => ({ ...prev, nextAction: e.target.value }))}
                    />
                    <span>Tiếp tục phác đồ hiện tại ({userProgress?.protocolName || '120 ngày'})</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="nextAction"
                      value="SWITCH_PROTOCOL"
                      checked={reviewForm.nextAction === 'SWITCH_PROTOCOL'}
                      onChange={e => setReviewForm(prev => ({ ...prev, nextAction: e.target.value }))}
                    />
                    <span>Chuyển phác đồ khác</span>
                  </label>
                </div>
              </div>

              {reviewForm.nextAction === 'SWITCH_PROTOCOL' && (
                <div style={{ marginBottom: '1.2rem', padding: '0.8rem', background: '#f8f9fa', borderRadius: '6px' }}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>
                    Chọn phác đồ mới:
                  </label>
                  <select
                    value={reviewForm.switchProtocolId}
                    onChange={e => setReviewForm(prev => ({ ...prev, switchProtocolId: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    <option value="">-- Chọn --</option>
                    {protocolsList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.durationDays} ngày)
                      </option>
                    ))}
                  </select>
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: '#666' }}>
                    💡 Tiến trình sẽ reset về ngày 1 của phác đồ mới.
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>
                  5. Nhận xét khác
                </label>
                <textarea
                  value={reviewForm.userNotes}
                  onChange={e => setReviewForm(prev => ({ ...prev, userNotes: e.target.value }))}
                  placeholder="Cảm nhận, góp ý..."
                  style={{ width: '100%', height: '80px', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="pd-modal-footer" style={{ borderTop: '1px solid rgba(13, 122, 110, 0.1)', paddingTop: '1rem' }}>
              <button
                type="button"
                className="pd-modal-btn pd-modal-btn-cancel"
                onClick={() => setShowReviewModal(false)}
                disabled={isSubmittingReview}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="pd-modal-btn pd-modal-btn-confirm"
                style={{ background: '#0d9488', color: '#fff' }}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
