import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import './PageSection.css';

export function PageSection({ children, className = '', width = 'default' }) {
  return (
    <section className={['page-section', `page-section--${width}`, className].filter(Boolean).join(' ')}>
      {children}
    </section>
  );
}

export function SectionCard({ children, className = '' }) {
  return <div className={['section-card', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="page-header__breadcrumbs">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.to ? (
            <Link to={item.to} className="breadcrumb-link">
              {item.label}
            </Link>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
          {idx < items.length - 1 && (
            <ChevronRight size={14} className="breadcrumb-separator" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions, align = 'left', className = '', breadcrumbs }) {
  return (
    <div className="page-header-wrapper">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <header className={['page-header', `page-header--${align}`, className].filter(Boolean).join(' ')}>
        <div className="page-header__body">
          {eyebrow && <div className="page-header__eyebrow">{eyebrow}</div>}
          {title && <h1>{title}</h1>}
          {description && <p>{description}</p>}
        </div>
        {actions ? <div className="page-header__actions">{actions}</div> : null}
      </header>
    </div>
  );
}

