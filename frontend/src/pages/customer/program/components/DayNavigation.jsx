import React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DayNavigation({
  currentDay,
  maxDay,
  onPrev,
  onNext,
  onBack,
  weekNumber,
  phaseNumber
}) {
  return (
    <div className="pd-day-nav-container">
      <button onClick={onBack} className="pd-btn-back-clean">
        <ArrowLeft size={16} />
        <span>Lộ trình</span>
      </button>

      <div className="pd-day-nav-controls">
        <button
          onClick={onPrev}
          disabled={currentDay <= 1}
          className="pd-nav-arrow-btn"
          title="Ngày trước"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="pd-day-nav-info">
          <span className="pd-day-nav-title">Ngày {currentDay}</span>
          <span className="pd-day-nav-sub">Tuần {weekNumber} · Chặng {phaseNumber}</span>
        </div>

        <button
          onClick={onNext}
          disabled={currentDay >= maxDay}
          className="pd-nav-arrow-btn"
          title="Ngày sau"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
