import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProgram } from './ProgramLayout';

const WEEKLY_SCREEN = [
  { day: 'T2', val: 210, max: 300 },
  { day: 'T3', val: 185, max: 300 },
  { day: 'T4', val: 160, max: 300 },
  { day: 'T5', val: 140, max: 300 },
  { day: 'T6', val: 125, max: 300 },
  { day: 'T7', val: 95, max: 300 },
  { day: 'CN', val: 80, max: 300, today: true },
];

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
    handleEnroll,
    handleToggleTask,
    handleMetric,
    handleSaveLogs,
    analytics,
    handleAdvanceDay,
    loadDayDetail
  } = useProgram();

  const [isEditing, setIsEditing] = useState(false);
  const [searchParams] = useSearchParams();
  const queryDay = searchParams.get('day');
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [advanceError, setAdvanceError] = useState('');

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
        <div className="pd-hero">
          <div className="pd-hero-inner" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div className="pd-hero-left" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="pd-phase-badge" style={{ margin: '0 auto 1rem' }}>
                <span className="pd-phase-dot" />
                Sẵn sàng cho sự thay đổi
              </div>
              <h1 className="pd-hero-title">
                Bắt đầu <span>Lộ trình 120 Ngày</span> của bạn
              </h1>
              <p className="pd-hero-desc">
                Bạn đã đăng ký gói dịch vụ thành công! Hãy nhấn nút dưới đây để kích hoạt và bắt đầu hành trình tái cân bằng dopamine cũng như thiết lập thói quen lành mạnh.
              </p>
              <button 
                className="pd-hero-cta" 
                style={{ marginTop: '2rem', padding: '1rem 2.5rem', fontSize: '1.1rem' }}
                onClick={handleEnroll}
              >
                🚀 Bắt đầu lộ trình ngay hôm nay
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentDayNum = dayDetail?.dayNumber || 1;
  const progressPct = Math.round((currentDayNum / 120) * 100);
  const completedTasks = tasks.filter(t => t.done).length;
  const allDone = tasks.length > 0 && completedTasks === tasks.length;
  const activePhaseData = programMetadata?.phases?.find(p => p.num === dayDetail?.phaseNumber);
  const circumference = 2 * Math.PI * 50;

  const handleNextDayClick = () => {
    setAdvanceError('');
    setShowAdvanceModal(true);
  };

  const confirmAdvanceDay = async () => {
    setIsAdvancing(true);
    setAdvanceError('');
    const res = await handleAdvanceDay();
    if (res && res.success) {
      setShowAdvanceModal(false);
    } else {
      setAdvanceError(res?.message || 'Không thể tiến sang ngày mới.');
    }
    setIsAdvancing(false);
  };

  const getImprovement = (key, isDecrease = false) => {
    if (!analytics || !analytics.dailyLogs || analytics.dailyLogs.length < 2) {
      return { valText: '0%', widthPct: 0, hasData: false };
    }

    const validLogs = analytics.dailyLogs.filter(
      (log) => log[key] !== null && log[key] !== undefined
    );

    if (validLogs.length < 2) {
      return { valText: '0%', widthPct: 0, hasData: false };
    }

    const baseline = validLogs[0][key];
    const current = validLogs[validLogs.length - 1][key];

    if (baseline === 0) {
      if (current === 0) return { valText: '0%', widthPct: 0, hasData: true };
      return {
        valText: isDecrease ? `+${current}ph` : `+${current * 100}%`,
        widthPct: 100,
        hasData: true
      };
    }

    if (isDecrease) {
      const pct = Math.round(((baseline - current) / baseline) * 100);
      if (pct >= 0) {
        return { valText: `-${pct}%`, widthPct: Math.min(100, pct), hasData: true };
      } else {
        return { valText: `+${Math.abs(pct)}%`, widthPct: 0, hasData: true };
      }
    } else {
      const pct = Math.round(((current - baseline) / baseline) * 100);
      if (pct >= 0) {
        return { valText: `+${pct}%`, widthPct: Math.min(100, pct), hasData: true };
      } else {
        return { valText: `-${Math.abs(pct)}%`, widthPct: 0, hasData: true };
      }
    }
  };

  const screenTimeImp = getImprovement('screenTimeMinutes', true);
  const moodImp = getImprovement('moodScore', false);
  const sleepImp = getImprovement('sleepHours', false);
  const focusImp = getImprovement('focusScore', false);

  const getMoodEmoji = (val) => {
    if (val <= 2) return '😢 Rất tệ';
    if (val <= 4) return '😐 Hơi tệ';
    if (val <= 6) return '🙂 Bình thường';
    if (val <= 8) return '😊 Vui vẻ';
    return '🤩 Cực kỳ hứng khởi';
  };

  const getMetricStyle = (type, val) => {
    let status = 'middle'; // 'good' | 'middle' | 'bad'
    let percentage = 0;

    if (type === 'screenTime') {
      percentage = Math.round((val / 480) * 100);
      if (val < 120) status = 'good';
      else if (val <= 240) status = 'middle';
      else status = 'bad';
    } else {
      // mood, sleep, urge, focus all have scale 1 to 10
      percentage = Math.round(((val - 1) / 9) * 100);
      if (type === 'urge') {
        // lower is better
        if (val <= 3) status = 'good';
        else if (val <= 7) status = 'middle';
        else status = 'bad';
      } else {
        // higher is better
        if (val >= 8) status = 'good';
        else if (val >= 5) status = 'middle';
        else status = 'bad';
      }
    }

    // Color definitions
    let clrActive = '#10b981'; // green
    let clrBg = 'rgba(16, 185, 129, 0.15)';
    let clrShadow = 'rgba(16, 185, 129, 0.35)';

    if (status === 'middle') {
      clrActive = '#f59e0b'; // amber/yellow
      clrBg = 'rgba(245, 158, 11, 0.15)';
      clrShadow = 'rgba(245, 158, 11, 0.35)';
    } else if (status === 'bad') {
      clrActive = '#ef4444'; // red
      clrBg = 'rgba(239, 68, 68, 0.15)';
      clrShadow = 'rgba(239, 68, 68, 0.35)';
    }

    return {
      '--val': `${percentage}%`,
      '--clr-active': clrActive,
      '--clr-bg': clrBg,
      '--clr-shadow': clrShadow
    };
  };

  const handlePromptClick = (promptText) => {
    const questionText = promptText.replace('💬 ', '');
    setJournal(prev => {
      const spacing = prev ? '\n\n' : '';
      return `${prev}${spacing}* Hỏi: ${questionText}\n- Trả lời: `;
    });
  };

  return (
    <div className="pd-page">
      <div className="pd-hero">
        <div className="pd-hero-inner">
          <div className="pd-hero-left">
            <div className="pd-phase-badge">
              <span className="pd-phase-dot" />
              Tháng {dayDetail?.phaseNumber || 1} – {dayDetail?.phaseLabel || ''}
            </div>
            <h1 className="pd-hero-title">
              Hành trình <span>Ngày {currentDayNum}</span> của bạn
            </h1>
            <p className="pd-hero-desc">
              {currentDayNum === 1 
                ? 'Não bộ của bạn đang bắt đầu hành trình tự phục hồi tự nhiên.' 
                : `Không gian sống & thói quen của bạn đang cải thiện sau ${currentDayNum} ngày kiên trì.`} Hôm nay có <strong style={{ color: '#fcd34d' }}>{tasks.length} nhiệm vụ</strong> — hoàn thành {completedTasks}/{tasks.length}.
            </p>
            <div className="pd-hero-meta">
              <div className="pd-meta-item">
                <span className="pd-meta-icon">📅</span>
                Tuần {dayDetail?.weekNumber || 1} — {dayDetail?.weekLabel || ''}
              </div>
              <div className="pd-meta-item">
                <span className="pd-meta-icon">🎯</span>
                Còn {120 - currentDayNum} ngày
              </div>
              <div className="pd-meta-item">
                <span className="pd-meta-icon">🔥</span>
                {userProgress?.streakCount || 0} ngày liên tục
              </div>
            </div>
          </div>

          <div className="pd-progress-ring-wrap">
            <svg className="pd-ring-svg" viewBox="0 0 120 120">
              <circle className="pd-ring-bg" cx="60" cy="60" r="50" />
              <circle
                className="pd-ring-fill"
                cx="60" cy="60" r="50"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (circumference * progressPct) / 100}
              />
            </svg>
            <div className="pd-ring-center">
              <span className="pd-ring-day">{progressPct}%</span>
              <span className="pd-ring-total">Ngày {currentDayNum}/120</span>
            </div>
            <div className="pd-ring-label">🧠 Tái Cân Bằng</div>
          </div>
        </div>
      </div>

      <div className="pd-content">
        <div className="pd-main">
          <div className="pd-back-to-roadmap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button 
              onClick={() => {
                navigate('/phac-do');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="pd-btn-back"
            >
              ← Quay lại Lộ Trình 120 Ngày
            </button>

            <div className="pd-day-nav" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="pd-btn-nav-day"
                disabled={currentDayNum <= 1}
                onClick={() => {
                  navigate(`/phac-do/chi-tiet?day=${currentDayNum - 1}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  background: currentDayNum <= 1 ? '#e2e8f0' : 'rgba(13, 122, 110, 0.08)',
                  color: currentDayNum <= 1 ? '#94a3b8' : 'var(--teal)',
                  border: 'none',
                  padding: '0.4rem 1rem',
                  borderRadius: '999px',
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: currentDayNum <= 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (currentDayNum > 1) {
                    e.currentTarget.style.background = 'var(--teal)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentDayNum > 1) {
                    e.currentTarget.style.background = 'rgba(13, 122, 110, 0.08)';
                    e.currentTarget.style.color = 'var(--teal)';
                  }
                }}
              >
                ← Ngày trước
              </button>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', minWidth: '80px', textAlign: 'center' }}>
                Ngày {currentDayNum} / {userProgress?.currentDay || 120}
              </span>
              <button
                className="pd-btn-nav-day"
                disabled={currentDayNum >= (userProgress?.currentDay || 1)}
                onClick={() => {
                  navigate(`/phac-do/chi-tiet?day=${currentDayNum + 1}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  background: currentDayNum >= (userProgress?.currentDay || 1) ? '#e2e8f0' : 'rgba(13, 122, 110, 0.08)',
                  color: currentDayNum >= (userProgress?.currentDay || 1) ? '#94a3b8' : 'var(--teal)',
                  border: 'none',
                  padding: '0.4rem 1rem',
                  borderRadius: '999px',
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: currentDayNum >= (userProgress?.currentDay || 1) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (currentDayNum < (userProgress?.currentDay || 1)) {
                    e.currentTarget.style.background = 'var(--teal)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentDayNum < (userProgress?.currentDay || 1)) {
                    e.currentTarget.style.background = 'rgba(13, 122, 110, 0.08)';
                    e.currentTarget.style.color = 'var(--teal)';
                  }
                }}
              >
                Ngày sau →
              </button>
            </div>
          </div>

          {activePhaseData && (
            <div className="pd-science-note">
              <span className="pd-science-ico">🧬</span>
              <p className="pd-science-text">
                <strong>Tháng {dayDetail?.phaseNumber} — {activePhaseData?.label}:</strong> {activePhaseData?.focus}
                <em style={{ display: 'block', marginTop: '4px', fontSize: '0.78rem' }}>Cơ sở khoa học: {activePhaseData?.science}</em>
              </p>
            </div>
          )}

          {allDone && (
            <div className="pd-completion-banner animate-bounce-subtle">
              <span className="pd-completion-emoji">🎉</span>
              <div className="pd-completion-title">Hoàn thành tuyệt đối ngày hôm nay!</div>
              <div className="pd-completion-sub">Tuyệt vời — não bộ của bạn đang phục hồi tự nhiên và tiết ra dopamine lành mạnh thông qua sự kỷ luật.</div>
            </div>
          )}

          <div className="pd-today-block">
            <div className="pd-section-head">
              <div className="pd-section-title">
                <span className="pd-section-icon">✅</span>
                Nhiệm vụ Ngày {currentDayNum}
              </div>
              <span className="pd-section-link">
                {completedTasks}/{tasks.length} hoàn thành
              </span>
            </div>

            <div className="pd-day-label">Hôm nay — Tuần {dayDetail?.weekNumber || 1}, Ngày {currentDayNum}</div>

            <div className="pd-task-list">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`pd-task-card ${task.done ? 'done' : ''}`}
                  onClick={() => handleToggleTask(task.id, !task.done)}
                >
                  <div className="pd-task-check">{task.done ? '✓' : ''}</div>
                  <div className="pd-task-body">
                    <div className="pd-task-title">{task.title}</div>
                    <div className="pd-task-sub">{task.sub || 'Nhiệm vụ tự rèn luyện thiết lập thói quen.'}</div>
                  </div>
                  <div className={`pd-task-badge ${task.done ? 'done-badge' : ''}`}>
                    {task.done ? 'Đã xong ✓' : task.badge || 'Hàng ngày'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pd-tracking-block">
            <div className="pd-section-head">
              <div className="pd-section-title">
                <span className="pd-section-icon">📊</span>
                Tự Theo Dõi Hôm Nay
              </div>
            </div>

            <div className="pd-tracking-grid">
              <div className="pd-metric-card screen-time">
                <div className="pd-metric-top">
                  <span className="pd-metric-label">Thời gian màn hình</span>
                  <span className="pd-metric-icon">📱</span>
                </div>
                <input
                  type="range" min="0" max="480" value={metrics.screenTime}
                  className="pd-metric-input"
                  style={getMetricStyle('screenTime', metrics.screenTime)}
                  onChange={e => handleMetric('screenTime', e.target.value)}
                  disabled={!isEditing}
                />
                <div className="pd-metric-val-row">
                  <span className="pd-metric-val" style={{ color: getMetricStyle('screenTime', metrics.screenTime)['--clr-active'] }}>
                    {metrics.screenTime} phút
                  </span>
                  <span className="pd-metric-max">Mục tiêu: &lt;120 phút</span>
                </div>
              </div>

              <div className="pd-metric-card">
                <div className="pd-metric-top">
                  <span className="pd-metric-label">Tâm trạng ({getMoodEmoji(metrics.mood)})</span>
                  <span className="pd-metric-icon">😊</span>
                </div>
                <input
                  type="range" min="1" max="10" value={metrics.mood}
                  className="pd-metric-input"
                  style={getMetricStyle('mood', metrics.mood)}
                  onChange={e => handleMetric('mood', e.target.value)}
                  disabled={!isEditing}
                />
                <div className="pd-metric-val-row">
                  <span className="pd-metric-val" style={{ color: getMetricStyle('mood', metrics.mood)['--clr-active'] }}>
                    {metrics.mood}/10
                  </span>
                  <span className="pd-metric-max">1: Tệ nhất → 10: Tốt nhất</span>
                </div>
              </div>

              <div className="pd-metric-card">
                <div className="pd-metric-top">
                  <span className="pd-metric-label">Chất lượng ngủ</span>
                  <span className="pd-metric-icon">🌙</span>
                </div>
                <input
                  type="range" min="1" max="10" value={metrics.sleep}
                  className="pd-metric-input"
                  style={getMetricStyle('sleep', metrics.sleep)}
                  onChange={e => handleMetric('sleep', e.target.value)}
                  disabled={!isEditing}
                />
                <div className="pd-metric-val-row">
                  <span className="pd-metric-val" style={{ color: getMetricStyle('sleep', metrics.sleep)['--clr-active'] }}>
                    {metrics.sleep}/10
                  </span>
                  <span className="pd-metric-max">1: Rất mệt → 10: Ngon giấc</span>
                </div>
              </div>

              <div className="pd-metric-card">
                <div className="pd-metric-top">
                  <span className="pd-metric-label">Mức thôi thúc sử dụng</span>
                  <span className="pd-metric-icon">⚡</span>
                </div>
                <input
                  type="range" min="1" max="10" value={metrics.urge}
                  className="pd-metric-input"
                  style={getMetricStyle('urge', metrics.urge)}
                  onChange={e => handleMetric('urge', e.target.value)}
                  disabled={!isEditing}
                />
                <div className="pd-metric-val-row">
                  <span className="pd-metric-val" style={{ color: getMetricStyle('urge', metrics.urge)['--clr-active'] }}>
                    {metrics.urge}/10
                  </span>
                  <span className="pd-metric-max">1: Tự chủ tốt → 10: Bứt rứt</span>
                </div>
              </div>

              <div className="pd-metric-card" style={{ gridColumn: '1/-1' }}>
                <div className="pd-metric-top">
                  <span className="pd-metric-label">Mức độ tập trung</span>
                  <span className="pd-metric-icon">🎯</span>
                </div>
                <input
                  type="range" min="1" max="10" value={metrics.focus}
                  className="pd-metric-input"
                  style={getMetricStyle('focus', metrics.focus)}
                  onChange={e => handleMetric('focus', e.target.value)}
                  disabled={!isEditing}
                />
                <div className="pd-metric-val-row">
                  <span className="pd-metric-val" style={{ color: getMetricStyle('focus', metrics.focus)['--clr-active'] }}>
                    {metrics.focus}/10
                  </span>
                  <span className="pd-metric-max">1: Xao nhãng → 10: Tập trung cao</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pd-journal-block">
            <div className="pd-section-head">
              <div className="pd-section-title">
                <span className="pd-section-icon">📓</span>
                Nhật Ký Hôm Nay
              </div>
            </div>

            <div className="pd-journal-card">
              <div style={{ marginBottom: '1.2rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Gợi ý viết nhật ký (Nhấp chọn để dùng làm biểu mẫu):</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span 
                    className="pd-journal-prompt-chip" 
                    style={{ opacity: isEditing ? 1 : 0.5, cursor: isEditing ? 'pointer' : 'default' }}
                    onClick={() => isEditing && handlePromptClick('💬 3 điều bạn để ý hôm nay mà không qua màn hình?')}
                  >
                    💡 3 điều nhận thức tự nhiên
                  </span>
                  <span 
                    className="pd-journal-prompt-chip" 
                    style={{ opacity: isEditing ? 1 : 0.5, cursor: isEditing ? 'pointer' : 'default' }}
                    onClick={() => isEditing && handlePromptClick('💬 Cảm xúc nào khó chịu nhất và bạn xử lý ra sao?')}
                  >
                    💡 Đối diện cảm xúc khó chịu
                  </span>
                  <span 
                    className="pd-journal-prompt-chip" 
                    style={{ opacity: isEditing ? 1 : 0.5, cursor: isEditing ? 'pointer' : 'default' }}
                    onClick={() => isEditing && handlePromptClick('💬 Khoảnh khắc nào bạn cảm thấy kiểm soát được nhất?')}
                  >
                    💡 Khoảnh khắc làm chủ bản thân
                  </span>
                </div>
              </div>
              <textarea
                className="pd-journal-textarea"
                placeholder="Viết tự do — không cần hoàn hảo, chỉ cần thành thật... Hãy viết về những thay đổi nhỏ nhất trong nhận thức của bạn hôm nay."
                value={journal}
                onChange={e => setJournal(e.target.value)}
                disabled={!isEditing}
              />
              <div className="pd-journal-footer" style={{ justifyContent: 'flex-end' }}>
                <span className="pd-journal-chars">{journal.length} ký tự</span>
              </div>
            </div>
          </div>

          <div className="pd-save-row">
            {!isEditing ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--teal)', fontWeight: 700 }}>
                  ✓ Đã ghi nhận chỉ số &amp; nhật ký ngày {currentDayNum}
                </span>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    className="pd-btn-secondary-edit"
                    style={{
                      background: 'rgba(13, 122, 110, 0.08)',
                      color: 'var(--teal)',
                      border: '1px solid rgba(13, 122, 110, 0.2)',
                      padding: '0.65rem 1.5rem',
                      borderRadius: '999px',
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'var(--teal)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(13, 122, 110, 0.08)';
                      e.currentTarget.style.color = 'var(--teal)';
                    }}
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Sửa chỉ số &amp; nhật ký
                  </button>
                  {currentDayNum === userProgress?.currentDay && (
                    <button className="pd-btn-primary" onClick={handleNextDayClick}>
                      ⏭️ Sang ngày tiếp theo
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button className="pd-btn-primary" onClick={async () => {
                const success = await handleSaveLogs();
                if (success) {
                  setIsEditing(false);
                }
              }}>
                📊 Lưu chỉ số theo dõi hôm nay
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="pd-sidebar">
          <div className="pd-streak-card">
            <span className="pd-streak-icon">🔥</span>
            <span className="pd-streak-num">{userProgress?.streakCount || 0}</span>
            <span className="pd-streak-label">ngày liên tục</span>
            <div className="pd-streak-sub">Mỗi ngày kiên trì là một viên gạch xây dựng bản thân mới!</div>
          </div>

          <div className="pd-chart-card">
            <div className="pd-chart-title">Thời gian màn hình (phút/ngày)</div>
            <div className="pd-chart-sub">7 ngày qua — xu hướng giảm 📉</div>
            <div className="pd-bar-chart">
              {WEEKLY_SCREEN.map((d, i) => {
                const heightPct = (d.val / d.max) * 100;
                return (
                  <div key={i} className="pd-bar-col">
                    <span className="pd-bar-val">{d.val}</span>
                    <div
                      className={`pd-bar ${d.today ? 'today' : ''}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${d.day}: ${d.val} phút`}
                    />
                    <span className="pd-bar-day">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pd-stats-card">
            <div className="pd-stats-title">📈 Cải Thiện Tổng</div>
            <div className="pd-stat-rows">
              <div className="pd-stat-row">
                <div className="pd-stat-ico teal">📱</div>
                <div className="pd-stat-info">
                  <div className="pd-stat-name">Giảm thời gian màn hình</div>
                  <div className="pd-stat-bar-wrap">
                    <div className="pd-stat-bar-fill" style={{ width: `${screenTimeImp.widthPct}%` }} />
                  </div>
                </div>
                <div className="pd-stat-val" style={{ color: 'var(--teal)' }}>{screenTimeImp.valText}</div>
              </div>

              <div className="pd-stat-row">
                <div className="pd-stat-ico orange">😊</div>
                <div className="pd-stat-info">
                  <div className="pd-stat-name">Tâm trạng cải thiện</div>
                  <div className="pd-stat-bar-wrap">
                    <div className="pd-stat-bar-fill orange" style={{ width: `${moodImp.widthPct}%` }} />
                  </div>
                </div>
                <div className="pd-stat-val" style={{ color: 'var(--accent)' }}>{moodImp.valText}</div>
              </div>

              <div className="pd-stat-row">
                <div className="pd-stat-ico purple">🌙</div>
                <div className="pd-stat-info">
                  <div className="pd-stat-name">Chất lượng ngủ</div>
                  <div className="pd-stat-bar-wrap">
                    <div className="pd-stat-bar-fill" style={{ width: `${sleepImp.widthPct}%` }} />
                  </div>
                </div>
                <div className="pd-stat-val">{sleepImp.valText}</div>
              </div>

              <div className="pd-stat-row">
                <div className="pd-stat-ico green">🎯</div>
                <div className="pd-stat-info">
                  <div className="pd-stat-name">Khả năng tập trung</div>
                  <div className="pd-stat-bar-wrap">
                    <div className="pd-stat-bar-fill" style={{ width: `${focusImp.widthPct}%` }} />
                  </div>
                </div>
                <div className="pd-stat-val">{focusImp.valText}</div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #fff9ec, #fff3e8)',
              border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.4rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text)', marginBottom: '0.8rem' }}>
              🏆 Milestone tiếp theo
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem', lineHeight: 1.5, fontWeight: 300 }}>
              Còn <strong style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>{7 - (currentDayNum % 7)} ngày</strong> nữa đến cột mốc tiếp theo!
            </div>
            <div style={{ background: 'rgba(249,115,22,0.1)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
              <div style={{ width: `${Math.round(((currentDayNum % 7) / 7) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), #fb923c)', borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.4rem', textAlign: 'right' }}>
              Ngày {currentDayNum % 7}/7
            </div>
          </div>

          <div 
            className="pd-roadmap-progress-card media-library-card"
            style={{ 
              marginTop: '1.5rem', 
              cursor: 'pointer', 
              background: 'linear-gradient(135deg, var(--teal-pale), #e0f2fe)',
              borderColor: 'rgba(13, 122, 110, 0.15)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              navigate('/phac-do/tai-nguyen');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="pd-roadmap-progress-header">
              <span className="pd-roadmap-progress-icon" style={{ background: 'var(--teal)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎧</span>
              <div>
                <span className="pd-roadmap-progress-title" style={{ color: 'var(--teal-dark)', fontSize: '0.92rem', fontWeight: 700 }}>Thư viện Thiền & Podcast</span>
                <span className="pd-roadmap-progress-sub">Kho âm thanh chánh niệm & dopamine</span>
              </div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 650 }}>
              <span>Khám phá ngay</span>
              <span style={{ fontSize: '1rem' }}>→</span>
            </div>
          </div>
        </div>
      </div>

      {showAdvanceModal && (
        <div className="pd-modal-overlay">
          <div className="pd-modal-card">
            <div className="pd-modal-header">
              <span className="pd-modal-icon">⏭️</span>
              <h3 className="pd-modal-title">Tiến sang ngày tiếp theo</h3>
            </div>
            
            <div className="pd-modal-body">
              {completedTasks < 4 ? (
                <div className="pd-modal-warning">
                  <span className="pd-modal-warning-icon">⚠️</span>
                  <div className="pd-modal-warning-text">
                    <strong>Chú ý:</strong> Bạn mới hoàn thành <strong>{completedTasks}/4</strong> nhiệm vụ tối thiểu của hôm nay.
                    <br /><br />
                    Nếu tiến sang ngày tiếp theo ngay bây giờ, chuỗi ngày liên tục (streak) của bạn sẽ bị reset về 0!
                  </div>
                </div>
              ) : (
                <div className="pd-modal-success-msg">
                  <span className="pd-modal-success-icon">🎉</span>
                  <div className="pd-modal-success-text">
                    Chúc mừng bạn đã hoàn thành nhiệm vụ và ghi nhận đầy đủ chỉ số ngày hôm nay!
                    <br /><br />
                    Bạn có muốn chuyển sang ngày <strong>{currentDayNum + 1}</strong> để tiếp tục lộ trình không?
                  </div>
                </div>
              )}

              {advanceError && (
                <div className="pd-modal-error-alert">
                  <span className="pd-modal-error-icon">❌</span>
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
                Hủy bỏ
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
    </div>
  );
}
