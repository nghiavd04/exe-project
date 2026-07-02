import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../Modal';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Xác nhận", cancelText = "Hủy", type = "danger" }) => {
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
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="confirm-modal-content" style={{ marginTop: '1rem' }}>
        <div 
          className="confirm-modal-icon-box"
          style={{ background: `${themeColor}15`, color: themeColor }}
        >
          <AlertTriangle size={32} />
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>

      <div className="confirm-modal-footer" style={{ margin: '2rem -2rem -2rem', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
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
    </Modal>
  );
};

export default ConfirmModal;
