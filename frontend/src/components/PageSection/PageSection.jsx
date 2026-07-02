import React from 'react';
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

export function PageHeader({ eyebrow, title, description, actions, align = 'left', className = '' }) {
  return (
    <header className={['page-header', `page-header--${align}`, className].filter(Boolean).join(' ')}>
      <div className="page-header__body">
        {eyebrow && <div className="page-header__eyebrow">{eyebrow}</div>}
        {title && <h1>{title}</h1>}
        {description && <p>{description}</p>}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}
