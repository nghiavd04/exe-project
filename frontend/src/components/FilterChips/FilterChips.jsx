import React from 'react';
import './FilterChips.css';

export default function FilterChips({ items = [], activeId, onChange, className = '' }) {
  if (items.length === 0) return null;

  return (
    <div 
      className={['ui-filter-chips', className].filter(Boolean).join(' ')}
      role="tablist"
      aria-label="Bộ lọc lựa chọn"
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={['filter-chip-btn', isActive ? 'active' : ''].filter(Boolean).join(' ')}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
