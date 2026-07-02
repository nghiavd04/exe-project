import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Inbox, Loader2, Lock } from 'lucide-react';
import './AppState.css';

const VARIANT_CONFIG = {
  loading: {
    icon: Loader2,
    title: 'Đang tải dữ liệu',
    description: 'Vui lòng chờ trong giây lát.',
  },
  empty: {
    icon: Inbox,
    title: 'Chưa có dữ liệu',
    description: 'Hiện chưa có nội dung phù hợp để hiển thị.',
  },
  error: {
    icon: AlertCircle,
    title: 'Đã xảy ra sự cố',
    description: 'Vui lòng thử lại sau hoặc quay lại sau ít phút.',
  },
  paywall: {
    icon: Lock,
    title: 'Nội dung dành cho thành viên',
    description: 'Hãy nâng cấp gói dịch vụ để mở khóa đầy đủ nội dung và tính năng này.',
  },
};

export default function AppState({
  variant = 'empty',
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  secondaryLabel,
  secondaryTo,
  secondaryAction,
  compact = false,
  className = '',
  children,
}) {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.empty;
  const Icon = config.icon;

  return (
    <section
      className={[
        'app-state',
        `app-state--${variant}`,
        compact ? 'app-state--compact' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="app-state__inner">
        <div className="app-state__icon-wrap">
          <Icon className={`app-state__icon ${variant === 'loading' ? 'is-spinning' : ''}`} size={compact ? 26 : 34} />
        </div>

        <div className="app-state__content">
          <h2>{title || config.title}</h2>
          <p>{description || config.description}</p>
          {children}
        </div>

        {(actionLabel || secondaryLabel) && (
          <div className="app-state__actions">
            {actionLabel && actionTo && (
              <Link to={actionTo} className="ui-btn ui-btn--primary">
                {actionLabel}
              </Link>
            )}
            {actionLabel && !actionTo && onAction && (
              <button type="button" className="ui-btn ui-btn--primary" onClick={onAction}>
                {actionLabel}
              </button>
            )}
            {secondaryLabel && secondaryTo && (
              <Link to={secondaryTo} className="ui-btn ui-btn--ghost">
                {secondaryLabel}
              </Link>
            )}
            {secondaryLabel && !secondaryTo && secondaryAction && (
              <button type="button" className="ui-btn ui-btn--ghost" onClick={secondaryAction}>
                {secondaryLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
