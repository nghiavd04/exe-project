import React from 'react';
import UploadScreenTime from '../../../../components/UploadScreenTime';

export default function MetricsTracker({
  metrics,
  onMetricChange,
  isEditable,
  isEditing,
  getMetricStyle,
  getMoodEmoji
}) {
  const hasScreenData = metrics.screenTime > 0;

  return (
    <div className="pd-tracking-block">
      <div className="pd-section-head">
        <h2 className="pd-section-title">
          <span>Tín hiệu hôm nay</span>
        </h2>
      </div>

      {/* Nhóm 1: Dữ liệu thực tế */}
      <div className="pd-metrics-group">
        <h3 className="pd-metrics-group-title">📱 Dữ liệu thực tế</h3>

        <div className="pd-tracking-grid pd-tracking-grid-single">
          <div className="pd-metric-card screen-time pd-metric-card-full">
            <div className="pd-metric-top">
              <span className="pd-metric-label">Thời gian màn hình</span>
              <span className="pd-metric-icon">📱</span>
            </div>

            {!hasScreenData && isEditable && isEditing ? (
              <div className="pd-screen-time-empty">
                <p>Chưa có dữ liệu thời gian màn hình.</p>
                <p className="pd-screen-time-empty-hint">Kéo thanh trượt hoặc upload ảnh chụp màn hình để ghi nhận.</p>
              </div>
            ) : null}

            <input
              type="range"
              min="0"
              max="480"
              value={metrics.screenTime}
              className="pd-metric-input"
              style={getMetricStyle('screenTime', metrics.screenTime)}
              onChange={e => onMetricChange('screenTime', e.target.value)}
              disabled={!isEditable || !isEditing}
            />
            <div className="pd-metric-val-row">
              <span
                className="pd-metric-val"
                style={{ color: getMetricStyle('screenTime', metrics.screenTime)['--clr-active'] }}
              >
                {metrics.screenTime} phút
              </span>
              <span className="pd-metric-max">Mục tiêu: &lt;120 phút</span>
            </div>
            {isEditable && isEditing && (
              <UploadScreenTime
                onSuccess={(mins) => onMetricChange('screenTime', mins)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Nhóm 2: Tự đánh giá */}
      <div className="pd-metrics-group">
        <h3 className="pd-metrics-group-title">🧠 Tự đánh giá hôm nay</h3>

        <div className="pd-tracking-grid">
          {/* Mood */}
          <div className="pd-metric-card">
            <div className="pd-metric-top">
              <span className="pd-metric-label">Tâm trạng ({getMoodEmoji(metrics.mood)})</span>
              <span className="pd-metric-icon">😊</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.mood}
              className="pd-metric-input"
              style={getMetricStyle('mood', metrics.mood)}
              onChange={e => onMetricChange('mood', e.target.value)}
              disabled={!isEditable || !isEditing}
            />
            <div className="pd-metric-val-row">
              <span
                className="pd-metric-val"
                style={{ color: getMetricStyle('mood', metrics.mood)['--clr-active'] }}
              >
                {metrics.mood}/10
              </span>
              <span className="pd-metric-max">1: Tệ → 10: Tốt</span>
            </div>
          </div>

          {/* Sleep */}
          <div className="pd-metric-card">
            <div className="pd-metric-top">
              <span className="pd-metric-label">Chất lượng ngủ</span>
              <span className="pd-metric-icon">🌙</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.sleep}
              className="pd-metric-input"
              style={getMetricStyle('sleep', metrics.sleep)}
              onChange={e => onMetricChange('sleep', e.target.value)}
              disabled={!isEditable || !isEditing}
            />
            <div className="pd-metric-val-row">
              <span
                className="pd-metric-val"
                style={{ color: getMetricStyle('sleep', metrics.sleep)['--clr-active'] }}
              >
                {metrics.sleep}/10
              </span>
              <span className="pd-metric-max">1: Mệt → 10: Ngon giấc</span>
            </div>
          </div>

          {/* Urge */}
          <div className="pd-metric-card">
            <div className="pd-metric-top">
              <span className="pd-metric-label">Thôi thúc sử dụng</span>
              <span className="pd-metric-icon">⚡</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.urge}
              className="pd-metric-input"
              style={getMetricStyle('urge', metrics.urge)}
              onChange={e => onMetricChange('urge', e.target.value)}
              disabled={!isEditable || !isEditing}
            />
            <div className="pd-metric-val-row">
              <span
                className="pd-metric-val"
                style={{ color: getMetricStyle('urge', metrics.urge)['--clr-active'] }}
              >
                {metrics.urge}/10
              </span>
              <span className="pd-metric-max">1: Tự chủ → 10: Bứt rứt</span>
            </div>
          </div>

          {/* Focus */}
          <div className="pd-metric-card">
            <div className="pd-metric-top">
              <span className="pd-metric-label">Mức tập trung</span>
              <span className="pd-metric-icon">🎯</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.focus}
              className="pd-metric-input"
              style={getMetricStyle('focus', metrics.focus)}
              onChange={e => onMetricChange('focus', e.target.value)}
              disabled={!isEditable || !isEditing}
            />
            <div className="pd-metric-val-row">
              <span
                className="pd-metric-val"
                style={{ color: getMetricStyle('focus', metrics.focus)['--clr-active'] }}
              >
                {metrics.focus}/10
              </span>
              <span className="pd-metric-max">1: Xao nhãng → 10: Cao</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
