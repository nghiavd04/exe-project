import React, { useState } from 'react';
import { X, Send, Mail } from 'lucide-react';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './AdminSendEmailModal.css';

export default function AdminSendEmailModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetPlanTier, setTargetPlanTier] = useState('FREE');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setTitle('');
    setContent('');
    setTargetPlanTier('FREE');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.replace(/<[^>]*>?/gm, '').trim()) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và nội dung email');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        content: content,
        targetEmail: null,
        targetPlanTier: targetPlanTier,
        sendEmail: true,
        type: 'EMAIL_ONLY'
      };

      const response = await adminApi.sendNotification(payload);
      if (response.data && response.data.success) {
        toast.success('Gửi email thành công!');
        if (onSuccess) onSuccess();
        handleClose();
      }
    } catch (err) {
      console.error('Error sending email:', err);
      toast.error(err.response?.data?.message || 'Không thể gửi email. Lỗi hệ thống.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="email-modal-overlay" onClick={handleClose}>
      <div className="email-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="email-modal-header">
          <h3>
            <Mail size={18} />
            Soạn thư mới
          </h3>
          <button className="email-modal-close" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit}>
          <div className="email-modal-body">
            
            {/* Sender (Read-only representation of email compose) */}
            <div className="email-form-row">
              <span className="email-form-label">Từ:</span>
              <span className="email-form-value">hệ thống Dopaless &lt;support@dopaless.com&gt;</span>
            </div>

            {/* Recipient Group Selection */}
            <div className="email-form-row email-form-row-interactive">
              <span className="email-form-label">Tới (Gói dịch vụ):</span>
              <select
                id="email-target-plan"
                className="email-select"
                value={targetPlanTier}
                onChange={e => setTargetPlanTier(e.target.value)}
                disabled={submitting}
              >
                <option value="FREE">Thành viên Miễn phí (FREE)</option>
                <option value="BASIC">Thành viên Gói Basic</option>
                <option value="PREMIUM">Thành viên Gói Premium</option>
                <option value="ELITE">Thành viên Gói Elite</option>
              </select>
            </div>

            {/* Subject */}
            <div className="email-form-row email-form-row-interactive">
              <span className="email-form-label">Tiêu đề:</span>
              <input
                id="email-subject"
                type="text"
                className="email-input"
                placeholder="Nhập tiêu đề thư..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            {/* Rich Editor Content */}
            <div className="email-quill-wrapper">
              <ReactQuill
                id="email-content"
                theme="snow"
                value={content}
                onChange={setContent}
                placeholder="Nhập nội dung thư của bạn..."
                readOnly={submitting}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['link', 'color']
                  ]
                }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="email-modal-footer">
            <button
              type="button"
              className="email-btn email-btn-cancel"
              onClick={handleClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="email-btn email-btn-submit"
              disabled={submitting || !title.trim() || !content.replace(/<[^>]*>?/gm, '').trim()}
            >
              {submitting ? (
                'Đang gửi...'
              ) : (
                <>
                  Gửi <Send size={14} style={{ marginLeft: '4px' }} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
