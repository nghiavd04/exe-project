import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Xác nhận", cancelText = "Hủy", type = "danger" }) => {
  if (!isOpen) return null;

  const getThemeColor = () => {
    switch (type) {
      case 'danger': return '#e53e3e';
      case 'warning': return '#d69e2e';
      case 'success': return '#48bb78';
      default: return 'var(--teal-dark)';
    }
  };

  const themeColor = getThemeColor();

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-card">
        <div className="confirm-modal-body">
          <button 
            onClick={onClose}
            className="btn-close-confirm"
          >
            <X size={20} />
          </button>
          
          <div className="confirm-modal-content">
            <div 
              className="confirm-modal-icon-box"
              style={{ background: `${themeColor}15`, color: themeColor }}
            >
              <AlertTriangle size={32} />
            </div>
            <h2>{title}</h2>
            <p>{message}</p>
          </div>
        </div>

        <div className="confirm-modal-footer">
          <button 
            onClick={onClose}
            className="btn-confirm-cancel"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="btn-confirm-action"
            style={{ 
              background: themeColor, 
              boxShadow: `0 4px 12px ${themeColor}30`
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
