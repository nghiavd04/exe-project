import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './AdminSendNotificationModal.css';

export default function AdminSendNotificationModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('ALL'); // 'ALL' | 'PLAN' | 'USER'
  const [targetPlanTier, setTargetPlanTier] = useState('FREE');
  const [targetEmail, setTargetEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Autocomplete search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (targetType !== 'USER' || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await adminApi.getUsers({
          search: searchTerm,
          role: 'CUSTOMER',
          size: 5
        });
        if (response.data.success) {
          setSearchResults(response.data.data.content || []);
        }
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, targetType]);

  // Reset user search state when target type changes
  useEffect(() => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedUser(null);
    setTargetEmail('');
  }, [targetType]);

  if (!isOpen) return null;

  const handleClose = () => {
    setTitle('');
    setContent('');
    setTargetType('ALL');
    setTargetEmail('');
    setTargetPlanTier('FREE');
    setSearchTerm('');
    setSearchResults([]);
    setSelectedUser(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.replace(/<[^>]*>?/gm, '').trim()) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }

    if (targetType === 'USER' && !targetEmail.trim()) {
      toast.error('Vui lòng tìm kiếm và chọn một thành viên nhận tin');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        content: content,
        targetEmail: targetType === 'USER' ? targetEmail.trim() : null,
        targetPlanTier: targetType === 'PLAN' ? targetPlanTier : null
      };

      const response = await adminApi.sendNotification(payload);
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Gửi thông báo thành công!');
        if (onSuccess) onSuccess();
        handleClose();
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      toast.error(err.response?.data?.message || 'Không thể gửi thông báo. Lỗi hệ thống.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="notification-modal-overlay" onClick={handleClose}>
      <div className="notification-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="notification-modal-header">
          <h3>
            <Bell size={20} style={{ color: 'var(--teal)' }} />
            Tạo thông báo mới
          </h3>
          <button className="notification-modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit}>
          <div className="notification-modal-body">
            {/* Title */}
            <div className="notification-form-group">
              <label htmlFor="notif-title">Tiêu đề thông báo:</label>
              <input
                id="notif-title"
                type="text"
                className="notification-input"
                placeholder="Nhập tiêu đề thông báo..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            {/* Content */}
            <div className="notification-form-group">
              <label htmlFor="notif-content">Nội dung chi tiết:</label>
              <div className="quill-wrapper">
                <ReactQuill
                  id="notif-content"
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  placeholder="Nhập nội dung thông báo gửi tới người dùng..."
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

            {/* Target Type Select */}
            <div className="notification-form-group">
              <label htmlFor="notif-target-type">Đối tượng nhận thông báo:</label>
              <select
                id="notif-target-type"
                className="notification-select"
                value={targetType}
                onChange={e => setTargetType(e.target.value)}
                disabled={submitting}
              >
                <option value="ALL">📢 Tất cả thành viên (Broadcast)</option>
                <option value="PLAN">💎 Theo nhóm gói dịch vụ</option>
                <option value="USER">👤 Gửi đích danh (1 thành viên)</option>
              </select>
            </div>

            {/* Plan Tier Selection */}
            {targetType === 'PLAN' && (
              <div className="notification-form-group">
                <label htmlFor="notif-plan-tier">Chọn gói dịch vụ nhận tin:</label>
                <select
                  id="notif-plan-tier"
                  className="notification-select"
                  value={targetPlanTier}
                  onChange={e => setTargetPlanTier(e.target.value)}
                  disabled={submitting}
                >
                  <option value="FREE">Miễn phí (FREE)</option>
                  <option value="BASIC">Gói thành viên Basic</option>
                  <option value="PREMIUM">Gói thành viên Premium</option>
                  <option value="ELITE">Gói thành viên Elite</option>
                </select>
                <span className="notification-helper-text">
                  Thông báo sẽ hiển thị với tất cả các thành viên đang sở hữu gói được chọn.
                </span>
              </div>
            )}

            {/* Target User Autocomplete Selection */}
            {targetType === 'USER' && (
              <div className="notification-form-group">
                <label>Thành viên nhận thông báo:</label>
                {selectedUser ? (
                  <div className="selected-user-card">
                    <div className="selected-user-info">
                      <div className="selected-user-name">{selectedUser.fullName}</div>
                      <div className="selected-user-email">{selectedUser.email}</div>
                    </div>
                    <button
                      type="button"
                      className="selected-user-remove"
                      onClick={() => {
                        setSelectedUser(null);
                        setTargetEmail('');
                        setSearchTerm('');
                      }}
                      title="Chọn thành viên khác"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="user-search-container">
                    <input
                      type="text"
                      className="notification-input"
                      placeholder="Nhập tên hoặc email để tìm kiếm thành viên..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      disabled={submitting}
                    />
                    {searching && (
                      <div className="user-search-status">Đang tìm kiếm thành viên...</div>
                    )}
                    {!searching && searchTerm.trim() && searchResults.length === 0 && (
                      <div className="user-search-status no-results">Không tìm thấy thành viên phù hợp.</div>
                    )}
                    {searchResults.length > 0 && (
                      <div className="user-search-dropdown">
                        {searchResults.map(u => (
                          <div
                            key={u.id}
                            className="user-search-item"
                            onClick={() => {
                              setSelectedUser(u);
                              setTargetEmail(u.email);
                              setSearchResults([]);
                              setSearchTerm('');
                            }}
                          >
                            <div className="search-item-name">{u.fullName}</div>
                            <div className="search-item-email">{u.email}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <span className="notification-helper-text">
                  Gõ tên hoặc email để lọc thành viên, sau đó nhấp chọn để gửi.
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="notification-modal-footer">
            <button
              type="button"
              className="notification-btn notification-btn-cancel"
              onClick={handleClose}
              disabled={submitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="notification-btn notification-btn-submit"
              disabled={submitting || !title.trim() || !content.replace(/<[^>]*>?/gm, '').trim() || (targetType === 'USER' && !selectedUser)}
            >
              {submitting ? 'Đang gửi...' : 'Gửi thông báo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
