import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, ArrowRight } from 'lucide-react';
import { useProgram } from './ProgramLayout';

export default function ProgramRoadmapPage() {
  const navigate = useNavigate();
  const {
    programMetadata,
    userProgress,
    isEnrolled,
    handleEnroll,
    showToastMessage
  } = useProgram();

  const [expandedMonth, setExpandedMonth] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(null);

  const toggleMonth = (mNum) => {
    setExpandedMonth(expandedMonth === mNum ? null : mNum);
    setExpandedWeek(null);
  };

  const toggleWeek = (wKey) => {
    setExpandedWeek(expandedWeek === wKey ? null : wKey);
  };

  const currentDayVal = userProgress?.currentDay || 1;
  const currentWeekVal = Math.ceil(currentDayVal / 7);
  const progressPct = Math.round(((userProgress?.currentDay || 0) / 120) * 100);

  return (
    <div className="pd-page">
      <div className="pd-roadmap-hero">
        <div className="pd-roadmap-hero-inner">
          <div className="pd-roadmap-hero-left">
            <div className="pd-roadmap-hero-badge">🗺️ LỘ TRÌNH TỔNG QUAN</div>
            <h1 className="pd-roadmap-hero-title">Lộ Trình Hỗ Trợ 120 Ngày</h1>
            <p className="pd-roadmap-hero-desc">
              Chương trình tự cân bằng cuộc sống và kiến tạo thói quen lành mạnh, dựa trên cơ sở khoa học hành vi và trị liệu nhận thức. Hãy thực hiện từng bước để đạt được sự tự chủ hoàn hảo.
            </p>
            {!isEnrolled ? (
              <button className="pd-roadmap-hero-cta" onClick={handleEnroll}>
                🚀 Bắt đầu lộ trình ngay
              </button>
            ) : (
              <button 
                className="pd-roadmap-hero-cta" 
                onClick={() => {
                  navigate('/phac-do/chi-tiet');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Vào phác đồ chi tiết Ngày {currentDayVal} →
              </button>
            )}
          </div>
          <div className="pd-roadmap-hero-right-badge">
            <div className="pd-badge-icon">🎯</div>
            <div className="pd-badge-label">Mục tiêu</div>
            <div className="pd-badge-val">Tái Cân Bằng</div>
          </div>
        </div>
      </div>

      <div className="pd-content">
        <div className="pd-main">
          <div className="pd-roadmap-view">
            <div className="pd-roadmap-intro">
              <h2>Lộ Trình Hỗ Trợ 120 Ngày Tự Cân Bằng &amp; Tái Thiết Lập Thói Quen</h2>
              <p>
                Chương trình được phát triển dựa trên các nghiên cứu khoa học hành vi và trị liệu tâm lý (CBT, ACT, Chánh niệm). 
                Lộ trình được thiết kế dưới dạng phân cấp theo Tháng, Tuần và Ngày. Hãy nhấn vào từng mục để xem chi tiết.
              </p>
            </div>

            <div className="pd-roadmap-timeline">
              {(programMetadata?.phases || []).map((phase) => {
                const isMonthExpanded = expandedMonth === phase.num;
                return (
                  <div key={phase.num} className={`pd-roadmap-month-card phase-${phase.num} ${isMonthExpanded ? 'expanded' : ''}`}>
                    <div className="pd-roadmap-month-header" onClick={() => toggleMonth(phase.num)}>
                      <div className="pd-roadmap-month-info">
                        <span className="pd-roadmap-month-icon">{phase.icon}</span>
                        <div>
                          <span className="pd-roadmap-month-badge">{phase.range}</span>
                          <h3>Tháng {phase.num}: {phase.label}</h3>
                        </div>
                      </div>
                      <div className="pd-roadmap-month-toggle">
                        {isMonthExpanded ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
                      </div>
                    </div>

                    {isMonthExpanded && (
                      <div className="pd-roadmap-month-body">
                        <div className="pd-roadmap-month-meta">
                          <div className="pd-roadmap-meta-focus">
                            <strong>🎯 Trọng tâm:</strong> {phase.focus}
                          </div>
                          <div className="pd-roadmap-meta-science">
                            <strong>🧬 Cơ sở khoa học:</strong> {phase.science}
                          </div>
                        </div>

                        <div className="pd-roadmap-weeks-list">
                          {(phase.weeks || []).map((week) => {
                            const weekKey = `m${phase.num}-w${week.num}`;
                            const isWeekExpanded = expandedWeek === weekKey;
                            const isWeekLocked = !isEnrolled || week.num > currentWeekVal;

                            return (
                              <div key={week.num} className={`pd-roadmap-week-item ${isWeekExpanded ? 'expanded' : ''} ${isWeekLocked ? 'locked' : ''}`}>
                                <div 
                                  className="pd-roadmap-week-header" 
                                  onClick={() => {
                                    if (isWeekLocked) {
                                      if (!isEnrolled) {
                                        showToastMessage('Vui lòng đăng ký bắt đầu lộ trình trước.', 'lock');
                                      } else {
                                        showToastMessage('Nội dung tuần này hiện đang khóa. Bạn cần hoàn thành các tuần trước để tiếp tục lộ trình.', 'lock');
                                      }
                                      return;
                                    }
                                    toggleWeek(weekKey);
                                  }}
                                >
                                  <span className="pd-roadmap-week-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    Tuần {week.num}: {week.label} <span className="pd-roadmap-week-range">({week.range})</span>
                                    {isWeekLocked && <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center' }}>🔒</span>}
                                  </span>
                                  <div className="pd-roadmap-week-toggle">
                                    {isWeekLocked ? null : (isWeekExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />)}
                                  </div>
                                </div>

                                {isWeekExpanded && !isWeekLocked && (
                                  <div className="pd-roadmap-week-body">
                                    {phase.num === 1 ? (
                                      <div className="pd-roadmap-days-list">
                                        {(week.days || []).map((day) => {
                                          const isDayLocked = !isEnrolled || day.num > currentDayVal;

                                          return (
                                            <div key={day.num} className={`pd-roadmap-day-item ${isDayLocked ? 'locked' : ''}`}>
                                              <div 
                                                className="pd-roadmap-day-header" 
                                                onClick={() => {
                                                  if (isDayLocked) {
                                                    showToastMessage('Ngày này hiện đang khóa. Hãy hoàn thành các ngày trước.', 'lock');
                                                    return;
                                                  }
                                                  navigate(`/phac-do/chi-tiet?day=${day.num}`);
                                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                              >
                                                <span className="pd-roadmap-day-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                  Ngày {day.num} — {day.label}
                                                  {isDayLocked && <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center' }}>🔒</span>}
                                                </span>
                                                <div className="pd-roadmap-day-toggle">
                                                  {isDayLocked ? null : <ArrowRight size={16} style={{ color: 'var(--teal)' }} />}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="pd-roadmap-week-details">
                                        <p className="pd-roadmap-week-desc">{week.description}</p>
                                        
                                        <div className="pd-roadmap-day-section">
                                          <div className="pd-roadmap-day-section-title">📋 Nhiệm vụ trong tuần:</div>
                                          <ul className="pd-roadmap-day-tasks">
                                            {(week.tasks || []).map((task, i) => (
                                              <li key={i}>
                                                <span className="pd-roadmap-dot">•</span> {task}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>

                                        <div className="pd-roadmap-day-section">
                                          <div className="pd-roadmap-day-section-title">📊 Chỉ số tracking tuần:</div>
                                          <div className="pd-roadmap-day-metrics">
                                            {(week.metrics || []).map((metric, i) => (
                                              <span key={i} className="pd-roadmap-metric-tag">{metric}</span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pd-sidebar">
          <div className="pd-roadmap-progress-card">
            <div className="pd-roadmap-progress-header">
              <span className="pd-roadmap-progress-icon">🎯</span>
              <div>
                <span className="pd-roadmap-progress-title">Tiến Trình Tổng</span>
                <span className="pd-roadmap-progress-sub">Chương trình 120 Ngày</span>
              </div>
            </div>
            <div className="pd-roadmap-progress-body">
              <div className="pd-roadmap-progress-number">Ngày {userProgress?.currentDay || 0} / 120</div>
              <div className="pd-roadmap-progress-bar-wrap">
                <div className="pd-roadmap-progress-bar-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="pd-roadmap-progress-footer">
                <span>Tiến trình hoàn thành</span>
                <span style={{ color: 'var(--teal)' }}>{progressPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
