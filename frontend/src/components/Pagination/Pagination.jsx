import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './Pagination.css';

export default function Pagination({ page, totalPages, onPageChange, className = '' }) {
  if (totalPages <= 1) return null;

  const maxVisible = 3;
  let start = Math.max(0, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages - 1, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(0, end - maxVisible + 1);
  }

  const pages = [];

  // Always show first page
  if (start > 0) {
    pages.push(
      <button
        key={0}
        type="button"
        onClick={() => onPageChange(0)}
        className={['page-btn', page === 0 ? 'active' : ''].filter(Boolean).join(' ')}
        aria-current={page === 0 ? 'page' : undefined}
      >
        1
      </button>
    );
    if (start > 1) {
      pages.push(
        <span key="ellipsis-start" className="pagination-ellipsis" aria-hidden="true">
          ...
        </span>
      );
    }
  }

  // Show page range
  for (let i = start; i <= end; i++) {
    pages.push(
      <button
        key={i}
        type="button"
        onClick={() => onPageChange(i)}
        className={['page-btn', page === i ? 'active' : ''].filter(Boolean).join(' ')}
        aria-current={page === i ? 'page' : undefined}
      >
        {i + 1}
      </button>
    );
  }

  // Always show last page
  if (end < totalPages - 1) {
    if (end < totalPages - 2) {
      pages.push(
        <span key="ellipsis-end" className="pagination-ellipsis" aria-hidden="true">
          ...
        </span>
      );
    }
    pages.push(
      <button
        key={totalPages - 1}
        type="button"
        onClick={() => onPageChange(totalPages - 1)}
        className={['page-btn', page === totalPages - 1 ? 'active' : ''].filter(Boolean).join(' ')}
        aria-current={page === totalPages - 1 ? 'page' : undefined}
      >
        {totalPages}
      </button>
    );
  }

  return (
    <nav className={['ui-pagination', className].filter(Boolean).join(' ')} aria-label="Phân trang">
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onPageChange(0)}
        className="page-btn page-btn-first"
        aria-label="Trang đầu"
      >
        <ChevronsLeft size={16} />
      </button>

      <button
        type="button"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        className="page-btn page-btn-prev"
        aria-label="Trang trước"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="pagination-pages">
        {pages}
      </div>

      <button
        type="button"
        disabled={page === totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        className="page-btn page-btn-next"
        aria-label="Trang sau"
      >
        <ChevronRight size={16} />
      </button>

      <button
        type="button"
        disabled={page === totalPages - 1}
        onClick={() => onPageChange(totalPages - 1)}
        className="page-btn page-btn-last"
        aria-label="Trang cuối"
      >
        <ChevronsRight size={16} />
      </button>
    </nav>
  );
}
