import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

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

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'white',
        width: '100%',
        maxWidth: '450px',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <div style={{ padding: '1.5rem', position: 'relative' }}>
          <button 
            onClick={onClose}
            style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
          >
            <X size={20} />
          </button>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center',
            marginTop: '0.5rem'
          }}>
            <div style={{ 
              background: `${getThemeColor()}15`, 
              color: getThemeColor(), 
              padding: '1rem', 
              borderRadius: '20px',
              marginBottom: '1.25rem'
            }}>
              <AlertTriangle size={32} />
            </div>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.5rem', fontWeight: '800', color: 'var(--teal-dark)' }}>{title}</h2>
            <p style={{ margin: 0, color: 'var(--muted)', lineHeight: '1.6', fontSize: '1.05rem' }}>{message}</p>
          </div>
        </div>

        <div style={{ 
          padding: '1.5rem', 
          background: '#f8fafc', 
          display: 'flex', 
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button 
            onClick={onClose}
            style={{ 
              flex: 1,
              padding: '0.85rem', 
              borderRadius: '14px', 
              border: '1px solid #e2e8f0', 
              background: 'white', 
              color: 'var(--muted)', 
              fontWeight: '700', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            style={{ 
              flex: 1,
              padding: '0.85rem', 
              borderRadius: '14px', 
              border: 'none', 
              background: getThemeColor(), 
              color: 'white', 
              fontWeight: '700', 
              cursor: 'pointer',
              boxShadow: `0 4px 12px ${getThemeColor()}30`,
              transition: 'all 0.2s'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
