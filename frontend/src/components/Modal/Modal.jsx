import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

export default function Modal({ isOpen, onClose, title, children, size = 'md', className = '' }) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Focus Trap logic
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modalElement = modalRef.current;
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modalElement.querySelectorAll(focusableSelectors);

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleFocusTrap = (e) => {
      if (e.key !== 'Tab') return;

      const currentElements = modalElement.querySelectorAll(focusableSelectors);
      if (currentElements.length === 0) return;

      const firstEl = currentElements[0];
      const lastEl = currentElements[currentElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    modalElement.addEventListener('keydown', handleFocusTrap);
    return () => {
      modalElement.removeEventListener('keydown', handleFocusTrap);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="ui-modal-overlay" onClick={onClose}>
      <div 
        ref={modalRef}
        className={['ui-modal', `ui-modal--${size}`, className].filter(Boolean).join(' ')}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "ui-modal-title" : undefined}
      >
        <button 
          type="button"
          className="ui-modal-close-btn" 
          onClick={onClose}
          aria-label="Đóng cửa sổ"
        >
          <X size={20} />
        </button>
        
        {title && (
          <div className="ui-modal-header">
            <h2 id="ui-modal-title" className="ui-modal-title-text">{title}</h2>
          </div>
        )}
        
        <div className="ui-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
