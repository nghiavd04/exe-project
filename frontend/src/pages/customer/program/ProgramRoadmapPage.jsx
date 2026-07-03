import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, ArrowRight, Calendar, Award, Flame, Play, BookOpen, Clock, Lock, CheckCircle } from 'lucide-react';
import { useProgram } from './ProgramLayout';

const getBehavioralGuideline = (dayNum) => {
  const guidelines = [
    "Hôm nay, bạn tập quan sát các phản xạ vô thức thay vì vội vã mở màn hình điện thoại.",
    "Tạo khoảng cách giữa kích thích và phản hồi bằng một nhịp thở chậm rãi.",
    "Trân trọng những hoạt động tay chân thực tế trong không gian vật lý xung quanh bạn.",
    "Lắng nghe tín hiệu từ cơ thể khi cơn thôi thúc sử dụng thiết bị bắt đầu xuất hiện.",
    "Hôm nay, hãy để tâm trí có những khoảng lặng tự nhiên không có màn hình.",
    "Chấp nhận cảm giác bứt rứt như một tín hiệu hệ thần kinh đang tự điều chỉnh.",
    "Nuôi dưỡng sự chú tâm vào bữa ăn và những người giao tiếp trực tiếp trước mặt bạn.",
    "Dành thời gian đi dạo ngoài trời mà không mang theo bất kỳ thiết bị điện tử nào.",
    "Bắt đầu ngày mới bằng việc uống nước và giãn cơ thay vì kiểm tra thông báo.",
    "Quan sát những khoảnh khắc thèm muốn lướt web vô thức mà không phán xét chúng."
  ];
  return guidelines[(dayNum - 1) % guidelines.length];
};

const getProtocolGoal = (code) => {
  if (code?.includes('MILD')) return "Cân bằng thời gian màn hình, giảm thói quen sử dụng điện thoại thụ động.";
  if (code?.includes('MODERATE')) return "Kiểm soát thời gian sử dụng, thiết lập thói quen ngoại tuyến lành mạnh.";
  if (code?.includes('SEVERE')) return "Khôi phục nhịp sinh hoạt, cải thiện giấc ngủ và hiệu suất công việc.";
  if (code?.includes('INTENSIVE')) return "Detox dopamine toàn diện, tăng cường kiểm soát xung động số.";
  return "Tái tạo thụ thể dopamine, ổn định nhịp sống và tự chủ hành vi.";
};

const WEEKLY_SCREEN = [
  { day: 'T2', val: 210, max: 300 },
  { day: 'T3', val: 185, max: 300 },
  { day: 'T4', val: 160, max: 300 },
  { day: 'T5', val: 140, max: 300 },
  { day: 'T6', val: 125, max: 300 },
  { day: 'T7', val: 95, max: 300 },
  { day: 'CN', val: 80, max: 300, today: true },
];

export default function ProgramRoadmapPage() {
  const navigate = useNavigate();
  const {
    programMetadata,
    userProgress,
    isEnrolled,
    handleEnroll,
    showToastMessage,
    analytics
  } = useProgram();

  const currentDayVal = userProgress?.currentDay || 1;
  const totalDays = userProgress?.durationDays || 120;
  const progressPct = Math.round(((userProgress?.currentDay || 0) / totalDays) * 100);
  const currentWeekVal = Math.ceil(currentDayVal / 7);

  // Find the active phase number based on current day
  const currentPhaseNum = (programMetadata?.phases || []).find(phase => 
    (phase.weeks || []).some(w => 
      w.days ? w.days.some(d => d.num === currentDayVal) : (w.num === currentWeekVal)
    )
  )?.num || 1;

  const [selectedPhaseNum, setSelectedPhaseNum] = useState(currentPhaseNum);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'today' | 'uncompleted'

  // Accordion state for weeks
  const [expandedWeeks, setExpandedWeeks] = useState({
    [currentWeekVal]: true // Expand today's week by default
  });

  const toggleWeek = (weekNum) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  // Update selected phase once metadata loads
  useEffect(() => {
    if (currentPhaseNum) {
      setSelectedPhaseNum(currentPhaseNum);
    }
  }, [currentPhaseNum]);

  // Find today's day details from metadata
  let todayDay = null;
  if (programMetadata?.phases) {
    for (const phase of programMetadata.phases) {
      if (phase.weeks) {
        for (const week of phase.weeks) {
          if (week.days) {
            const found = week.days.find(d => d.num === currentDayVal);
            if (found) {
              todayDay = found;
              break;
            }
          }
        }
      }
      if (todayDay) break;
    }
  }

  const handleDayClick = (dayNum, isLocked) => {
    if (isLocked) {
      showToastMessage('Ngày này hiện đang khóa. Hãy hoàn thành các ngày trước.', 'lock');
      return;
    }
    navigate(`/phac-do/chi-tiet?day=${dayNum}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isEnrolled) {
    return (
      <div className="pd-page pd-not-enrolled-page">
        <div className="pd-clean-hero">
          <span className="pd-hero-icon-large">🌱</span>
          <h1 className="pd-clean-hero-title">Bắt đầu Lộ trình Phục hồi của bạn</h1>
          <p className="pd-clean-hero-desc">
            Kích hoạt phác đồ được thiết kế riêng dựa trên khoa học hành vi để từng bước tái tạo thụ thể dopamine, ổn định nhịp sống và thiết lập sự tự chủ lành mạnh.
          </p>
          <button className="pd-btn-primary-large" onClick={handleEnroll}>
            🚀 Kích hoạt lộ trình ngay hôm nay
          </button>
        </div>
      </div>
    );
  }

  // Selected phase details
  const selectedPhase = (programMetadata?.phases || []).find(p => p.num === selectedPhaseNum);

  // Filter weeks to render based on tab
  const weeksToRender = (selectedPhase?.weeks || []).filter(week => {
    if (activeTab === 'all') return true;
    if (activeTab === 'uncompleted') {
      if (week.days && week.days.length > 0) {
        return week.days.some(d => d.num >= currentDayVal);
      }
      return week.num >= currentWeekVal;
    }
    return true;
  });

  // Display status string based on progress status
  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Đang thực hiện';
      case 'PAUSED': return 'Tạm dừng';
      case 'COMPLETED': return 'Hoàn thành';
      default: return 'Đang thực hiện';
    }
  };

  return (
    <div className="pd-page pd-dashboard-layout">
      
      {/* TẦNG 1: HEADER TÓM TẮT PHÁC ĐỒ (MINI DASHBOARD) */}
      <div className="pd-mini-dashboard-header">
        <div className="pd-mini-dashboard-top">
          <div className="pd-mini-dashboard-title-area">
            <h1 className="pd-mini-dashboard-protocol-name">
              {userProgress?.protocolName || 'Phác đồ hồi phục dopamine'}
            </h1>
            <p className="pd-mini-dashboard-goal">
              🎯 <strong>Mục tiêu:</strong> {getProtocolGoal(userProgress?.protocolCode)}
            </p>
          </div>
          <span className={`pd-mini-dashboard-status-badge ${userProgress?.status?.toLowerCase() || 'active'}`}>
            {getStatusLabel(userProgress?.status)}
          </span>
        </div>

        <div className="pd-mini-dashboard-bottom">
          <div className="pd-mini-dashboard-progress-box">
            <div className="pd-mini-dashboard-progress-text">
              <span>Tiến độ tổng quan</span>
              <span>{currentDayVal} / {totalDays} Ngày ({progressPct}%)</span>
            </div>
            <div className="pd-mini-dashboard-progress-bar">
              <div 
                className="pd-mini-dashboard-progress-fill" 
                style={{ width: `${Math.min(progressPct, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="pd-mini-dashboard-actions">
            <div className="pd-mini-dashboard-streak">
              <Flame size={16} fill="currentColor" />
              <span>{userProgress?.streakCount || 0} ngày giữ nhịp liên tục</span>
            </div>
            <button 
              className="pd-btn-continue-today"
              onClick={() => {
                navigate('/phac-do/chi-tiet');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <Play size={14} fill="currentColor" />
              <span>Tiếp tục hôm nay</span>
            </button>
          </div>
        </div>
      </div>

      {/* TẦNG 2: THÂN TRANG - LAYOUT 2 CỘT */}
      <div className="pd-roadmap-grid">
        
        {/* CỘT TRÁI (70%): Khu bài tập theo ngày */}
        <div className="pd-roadmap-main-col">
          
          {/* Phase selector */}
          <h3 className="pd-section-subtitle-dashboard" style={{ marginBottom: '1rem' }}>Bản đồ lộ trình</h3>
          <div className="pd-phases-row-timeline">
            {(programMetadata?.phases || []).map((phase) => {
              const isActive = phase.num === currentPhaseNum;
              const isCompleted = phase.num < currentPhaseNum;
              const isSelected = phase.num === selectedPhaseNum;

              let statusLabel = "Sắp tới";
              let statusClass = "upcoming";
              if (isActive) {
                statusLabel = "Đang đi";
                statusClass = "active";
              } else if (isCompleted) {
                statusLabel = "Đã qua";
                statusClass = "completed";
              }

              return (
                <div 
                  key={phase.num} 
                  className={`pd-phase-timeline-node ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => setSelectedPhaseNum(phase.num)}
                >
                  <div className="pd-node-circle">
                    {isCompleted ? '✓' : phase.num}
                  </div>
                  <div className="pd-node-info">
                    <span className="pd-node-title">Chặng {phase.num}</span>
                    <span className="pd-node-label">{phase.label}</span>
                    <span className={`pd-node-badge ${statusClass}`}>{statusLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Phase Info Details */}
          {selectedPhase && (
            <div className="pd-phase-detail-section-roadmap" style={{ borderTop: 'none', paddingTop: 0, marginBottom: '1.5rem' }}>
              <div className="pd-phase-focus-science-box" style={{ marginTop: 0 }}>
                <div className="pd-focus-col">
                  <strong>🎯 Trọng tâm chặng:</strong>
                  <p>{selectedPhase.focus || 'Nhận diện ranh giới và xây dựng phản xạ mới.'}</p>
                </div>
                <div className="pd-science-col">
                  <strong>🧬 Cơ sở khoa học:</strong>
                  <p>{selectedPhase.science || 'Tái thiết lập dopamine baseline thông qua kiểm soát kích thích.'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bộ lọc Tabs */}
          <div className="pd-roadmap-tabs">
            <button 
              className={`pd-roadmap-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Tất cả các ngày
            </button>
            <button 
              className={`pd-roadmap-tab-btn ${activeTab === 'today' ? 'active' : ''}`}
              onClick={() => setActiveTab('today')}
            >
              Nhiệm vụ hôm nay
            </button>
            <button 
              className={`pd-roadmap-tab-btn ${activeTab === 'uncompleted' ? 'active' : ''}`}
              onClick={() => setActiveTab('uncompleted')}
            >
              Chưa hoàn thành
            </button>
          </div>

          {/* Danh sách bài tập / Daily plan */}
          <div className="pd-weeks-timeline-legacy">
            {activeTab === 'today' ? (
              // Tab Hôm nay: Chỉ hiện duy nhất card ngày hôm nay
              todayDay ? (
                <div 
                  className="pd-day-card-modern is-today"
                  onClick={() => handleDayClick(todayDay.num, false)}
                >
                  <div className="pd-today-pulse-indicator"></div>
                  <div className="pd-day-card-row">
                    <div className="pd-day-card-left">
                      <span className="pd-day-card-badge">Ngày {todayDay.num}</span>
                    </div>
                    <div className="pd-day-card-center">
                      <h4 className="pd-day-card-title">{todayDay.label}</h4>
                      <p className="pd-day-card-goal-text">
                        🎯 <strong>Trọng tâm:</strong> {getBehavioralGuideline(todayDay.num)}
                      </p>
                      {todayDay.tasks && todayDay.tasks.length > 0 && (
                        <ul className="pd-day-card-tasks-list">
                          {todayDay.tasks.map((task, i) => (
                            <li key={i} className="pd-day-card-task-item">
                              <CheckCircle size={13} style={{ color: 'var(--brand-color)' }} />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="pd-day-card-right">
                      <span className="pd-day-card-duration">
                        <Clock size={12} />
                        <span>{(todayDay.tasks?.length || 2) * 10} phút</span>
                      </span>
                      <span className="pd-day-card-status-chip today">Đang thực hành</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pd-roadmap-empty-state">
                  <p>🎉 Bạn đã xuất sắc hoàn thành toàn bộ phác đồ của mình!</p>
                </div>
              )
            ) : (
              // Tabs Tất cả / Chưa hoàn thành
              weeksToRender.length > 0 ? (
                weeksToRender.map((week) => {
                  const isWeekLocked = week.num > currentWeekVal;
                  const isExpanded = !!expandedWeeks[week.num];

                  // Filter days of this week
                  const daysToRender = (week.days || []).filter(day => {
                    if (activeTab === 'all') return true;
                    return day.num >= currentDayVal;
                  });

                  if (activeTab === 'uncompleted' && week.days && week.days.length > 0 && daysToRender.length === 0) {
                    return null;
                  }

                  return (
                    <div key={week.num} className={`pd-week-timeline-item-legacy ${isWeekLocked ? 'locked' : ''}`}>
                      <div 
                        className="pd-week-timeline-header-legacy"
                        onClick={() => !isWeekLocked && toggleWeek(week.num)}
                        style={{ cursor: isWeekLocked ? 'not-allowed' : 'pointer' }}
                      >
                        <span className="pd-week-timeline-title-legacy">
                          Tuần {week.num}: {week.label} <span className="pd-week-range-legacy">(Ngày {(week.num - 1) * 7 + 1} - {week.num * 7})</span>
                        </span>
                        <div className="pd-week-header-right">
                          {isWeekLocked ? (
                            <Lock size={14} className="pd-lock-icon" />
                          ) : (
                            <ChevronDown 
                              size={18} 
                              style={{ 
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s' 
                              }} 
                            />
                          )}
                        </div>
                      </div>

                      {!isWeekLocked && isExpanded && (
                        <div className="pd-week-timeline-content-legacy">
                          {daysToRender.length > 0 ? (
                            <div className="pd-days-list-legacy">
                              {daysToRender.map((day) => {
                                const isDayLocked = day.num > currentDayVal;
                                const isDayCompleted = day.num < currentDayVal;
                                const isDayToday = day.num === currentDayVal;

                                let statusText = "Chưa mở";
                                let statusClass = "locked";
                                if (isDayToday) {
                                  statusText = "Thực hành";
                                  statusClass = "today";
                                } else if (isDayCompleted) {
                                  statusText = "Đã xong";
                                  statusClass = "completed";
                                }

                                return (
                                  <div 
                                    key={day.num} 
                                    className={`pd-day-card-modern ${isDayToday ? 'is-today' : ''} ${isDayCompleted ? 'is-completed' : ''} ${isDayLocked ? 'is-locked' : ''}`}
                                    onClick={() => handleDayClick(day.num, isDayLocked)}
                                  >
                                    {isDayToday && <div className="pd-today-pulse-indicator"></div>}
                                    <div className="pd-day-card-row">
                                      <div className="pd-day-card-left">
                                        <span className="pd-day-card-badge">Ngày {day.num}</span>
                                      </div>
                                      <div className="pd-day-card-center">
                                        <h4 className="pd-day-card-title">
                                          {day.label}
                                          {isDayCompleted && <CheckCircle size={14} className="pd-text-success" style={{ marginLeft: '6px', display: 'inline' }} />}
                                        </h4>
                                        
                                        {!isDayLocked && (
                                          <p className="pd-day-card-goal-text">
                                            🎯 <strong>Trọng tâm:</strong> {getBehavioralGuideline(day.num)}
                                          </p>
                                        )}
                                        {isDayLocked && (
                                          <p className="pd-day-card-goal-text">
                                            Hoàn thành nhiệm vụ ngày trước để mở khóa bài tập này.
                                          </p>
                                        )}

                                        {isDayToday && day.tasks && day.tasks.length > 0 && (
                                          <ul className="pd-day-card-tasks-list">
                                            {day.tasks.map((task, i) => (
                                              <li key={i} className="pd-day-card-task-item">
                                                <CheckCircle size={12} style={{ color: 'var(--brand-color)' }} />
                                                <span>{task}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                      <div className="pd-day-card-right">
                                        <span className="pd-day-card-duration">
                                          <Clock size={12} />
                                          <span>{(day.tasks?.length || 2) * 10} phút</span>
                                        </span>
                                        <span className={`pd-day-card-status-chip ${statusClass}`}>{statusText}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="pd-weekly-tasks-summary">
                              <p className="pd-weekly-tasks-desc">{week.description || 'Hoàn thành các nhiệm vụ tuần để tiếp tục lộ trình.'}</p>
                              {week.tasks && week.tasks.length > 0 && (
                                <div className="pd-weekly-tasks-box">
                                  <div className="pd-weekly-box-title">📋 Việc giữ nhịp tuần:</div>
                                  <ul className="pd-weekly-tasks-list">
                                    {week.tasks.map((task, i) => (
                                      <li key={i}>{task}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="pd-roadmap-empty-state">
                  <p>Không tìm thấy ngày nào phù hợp với bộ lọc này.</p>
                </div>
              )
            )}
          </div>

        </div>

        {/* CỘT PHẢI (30%): Khu tracking & Gợi ý (Sticky Sidebar) */}
        <div className="pd-roadmap-sidebar-col">
          <div className="pd-roadmap-sidebar-sticky">
            
            {/* Khối 1: Tracking Tiến trình tổng quát */}
            <div className="pd-tracking-panel-card">
              <h4 className="pd-tracking-panel-card-title">Tiến trình hồi phục</h4>
              <div className="pd-tracking-panel-stats">
                
                <div className="pd-tracking-panel-stat-item">
                  <span className="pd-tracking-panel-stat-val">
                    {userProgress?.streakCount || 0}🔥
                  </span>
                  <span className="pd-tracking-panel-stat-lbl">Chuỗi Streak</span>
                </div>

                <div className="pd-tracking-panel-stat-item">
                  <span className="pd-tracking-panel-stat-val">
                    {currentDayVal - 1} / {totalDays}
                  </span>
                  <span className="pd-tracking-panel-stat-lbl">Ngày Đã Làm</span>
                </div>

                <div className="pd-tracking-panel-stat-item full-width">
                  <div className="pd-tracking-panel-progress-lbl-row">
                    <span>Tỷ lệ hoàn thành</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="pd-mini-dashboard-progress-bar">
                    <div 
                      className="pd-mini-dashboard-progress-fill" 
                      style={{ width: `${Math.min(progressPct, 100)}%` }}
                    ></div>
                  </div>
                </div>

              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--neutral-border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div><strong>Nhiệm vụ đã xong:</strong> {analytics?.totalCompletedTasks || 0} bài tập</div>
                <div><strong>Mức độ tuân thủ:</strong> {(userProgress?.streakCount || 0) >= 3 ? 'Xuất sắc ⚡' : 'Đang cố gắng 🌱'}</div>
                <div><strong>Cập nhật cuối:</strong> {userProgress?.lastCheckedInAt ? new Date(userProgress.lastCheckedInAt).toLocaleDateString('vi-VN') : 'Hôm nay'}</div>
              </div>
            </div>

            {/* Khối 2: Tín hiệu tuần qua (Biểu đồ screen time) */}
            <div className="pd-tracking-panel-card">
              <h4 className="pd-tracking-panel-card-title">Thời gian màn hình</h4>
              <p className="pd-signals-desc" style={{ marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
                Xu hướng sử dụng thiết bị tuần qua
              </p>
              <div className="pd-bar-chart-clean" style={{ height: '100px', marginTop: 0 }}>
                {WEEKLY_SCREEN.map((d, i) => {
                  const heightPct = (d.val / d.max) * 100;
                  return (
                    <div key={i} className="pd-bar-col-clean">
                      <span className="pd-bar-val-clean" style={{ fontSize: '0.55rem' }}>{d.val}m</span>
                      <div
                        className={`pd-bar-clean ${d.today ? 'today' : ''}`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="pd-bar-day-clean" style={{ fontSize: '0.6rem' }}>{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Khối 3: Gợi ý đồng hành */}
            <div className="pd-tracking-panel-card">
              <h4 className="pd-tracking-panel-card-title">Gợi ý đồng hành</h4>
              <p className="pd-resources-desc" style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
                Audio thiền định và tài liệu tâm lý hỗ trợ
              </p>
              
              <div className="pd-resources-list-horizontal">
                <div 
                  className="pd-resource-item-horizontal"
                  onClick={() => navigate('/phac-do/tai-nguyen')}
                  style={{ padding: '0.4rem', border: '1px solid var(--neutral-border)', borderRadius: '8px', background: '#f8fafc' }}
                >
                  <div className="pd-resource-icon-wrap" style={{ width: '24px', height: '24px' }}>
                    <Play size={10} fill="currentColor" />
                  </div>
                  <div className="pd-resource-text-wrap">
                    <span className="pd-resource-title-item" style={{ fontSize: '0.78rem' }}>Thiền 5 phút trước ngủ</span>
                    <span className="pd-resource-meta-item" style={{ fontSize: '0.62rem' }}>Audio • 5 phút</span>
                  </div>
                </div>

                <div 
                  className="pd-resource-item-horizontal"
                  onClick={() => navigate('/phac-do/tai-nguyen')}
                  style={{ padding: '0.4rem', border: '1px solid var(--neutral-border)', borderRadius: '8px', background: '#f8fafc' }}
                >
                  <div className="pd-resource-icon-wrap" style={{ width: '24px', height: '24px' }}>
                    <BookOpen size={10} />
                  </div>
                  <div className="pd-resource-text-wrap">
                    <span className="pd-resource-title-item" style={{ fontSize: '0.78rem' }}>Nhận diện kích hoạt (trigger)</span>
                    <span className="pd-resource-meta-item" style={{ fontSize: '0.62rem' }}>Bài viết • 4 phút</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Khối 4: Khuyến nghị ngắn */}
            <div className="pd-tracking-panel-card" style={{ background: '#f0fdfa', borderColor: 'rgba(13, 148, 136, 0.2)' }}>
              <h4 className="pd-tracking-panel-card-title" style={{ color: 'var(--brand-color-dark)', borderBottom: '1px solid rgba(13, 148, 136, 0.1)' }}>
                Khuyến khuyến nghị hôm nay
              </h4>
              <div className="pd-recommendations-list">
                <p className="pd-recommendation-item" style={{ background: '#ffffff', borderLeftColor: 'var(--brand-color)' }}>
                  <strong>Thực hành chú tâm:</strong> Tránh lướt điện thoại trong bữa tối và giao tiếp trực tiếp.
                </p>
                <p className="pd-recommendation-item" style={{ background: '#ffffff', borderLeftColor: 'var(--brand-color)' }}>
                  <strong>Mẹo giữ nhịp:</strong> Sạc điện thoại ngoài phòng ngủ để giảm thôi thúc lướt sáng sớm.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
