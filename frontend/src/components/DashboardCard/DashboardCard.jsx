import React from 'react';
import './DashboardCard.css';

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  trendType = 'up',
  onClick,
  className = ''
}) {
  const CardWrapper = onClick ? 'button' : 'div';
  const buttonProps = onClick ? { type: 'button', onClick } : {};

  return (
    <CardWrapper
      className={[
        'ui-card ui-dashboard-card',
        onClick ? 'ui-dashboard-card--interactive' : '',
        className
      ].filter(Boolean).join(' ')}
      {...buttonProps}
    >
      <div className="ui-dashboard-card__header">
        <span className="ui-dashboard-card__title">{title}</span>
        {Icon && (
          <div className="ui-dashboard-card__icon-wrap">
            <Icon size={20} />
          </div>
        )}
      </div>
      
      <div className="ui-dashboard-card__body">
        <span className="ui-dashboard-card__value">{value}</span>
        
        {(trend || subtitle) && (
          <div className="ui-dashboard-card__meta">
            {trend && (
              <span className={`ui-dashboard-card__trend ui-dashboard-card__trend--${trendType}`}>
                {trend}
              </span>
            )}
            {subtitle && <span className="ui-dashboard-card__subtitle">{subtitle}</span>}
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
