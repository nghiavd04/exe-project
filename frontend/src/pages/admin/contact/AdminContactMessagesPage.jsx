import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronRight, ChevronLeft, Mail, MessageSquare, 
  Trash2, Eye, Send, FileText, CheckCircle2, AlertCircle, HelpCircle, Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';
import AdminSendNotificationModal from './AdminSendNotificationModal';
import './AdminContactMessagesPage.css';

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [isReadFilter, setIsReadFilter] = useState(''); // '', 'unread', 'read_unreplied', 'replied'
  
  // Selected Message for Details / Reply Modal
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [notesText, setNotesText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Modal State for Delete Confirmation
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    messageId: null,
    senderName: ''
  });

  const filterTabs = [
    { label: 'Tất cả', value: '' },
    { label: 'Chưa đọc', value: 'unread' },
    { label: 'Đã đọc & Chưa trả lời', value: 'read_unreplied' },
    { label: 'Đã phản hồi', value: 'replied' }
  ];

  useEffect(() => {
    fetchMessages();
  }, [page, isReadFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      let isRead = undefined;
      let isReplied = undefined;
      
      if (isReadFilter === 'unread') {
        isRead = false;
      } else if (isReadFilter === 'read_unreplied') {
        isRead = true;
        isReplied = false;
      } else if (isReadFilter === 'replied') {
        isReplied = true;
      }

      const params = {
        page,
        size: pageSize,
        search: search || undefined,
        isRead,
        isReplied
      };

      const response = await adminApi.getContactMessages(params);
      if (response.data.success) {
        setMessages(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching contact messages:', err);
      toast.error('Không thể tải danh sách lời nhắn liên hệ', { id: 'fetch-contact-messages-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(0);
      fetchMessages();
    }
  };

  const handleOpenDetailModal = async (msg) => {
    setSelectedMessage(msg);
    setReplyText(msg.replyMessage || '');
    setNotesText(msg.notes || '');

    // Nếu tin nhắn chưa đọc, thực hiện gọi API để đánh dấu đã đọc
    if (!msg.isRead) {
      try {
        await adminApi.markContactMessageRead(msg.id);
        // Cập nhật danh sách tại local ngay lập tức
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
        // Cập nhật state tin nhắn đang mở
        setSelectedMessage(prev => prev ? { ...prev, isRead: true } : null);
      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    }
  };

  const handleCloseDetailModal = () => {
    setSelectedMessage(null);
    setReplyText('');
    setNotesText('');
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Nội dung phản hồi không được để trống');
      return;
    }

    try {
      setIsSubmittingReply(true);
      const payload = {
        replyMessage: replyText,
        notes: notesText || undefined
      };
      const response = await adminApi.replyContactMessage(selectedMessage.id, payload);
      if (response.data.success) {
        toast.success('Đã gửi phản hồi thành công và tạo thông báo cho khách hàng!');
        handleCloseDetailModal();
        fetchMessages();
      } else {
        toast.error(response.data.message || 'Lỗi khi gửi phản hồi');
      }
    } catch (err) {
      console.error('Error replying contact message:', err);
      toast.error(err.response?.data?.message || 'Không thể gửi phản hồi.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const triggerDeleteMessage = (msg, e) => {
    e.stopPropagation();
    setDeleteModalConfig({
      isOpen: true,
      messageId: msg.id,
      senderName: msg.name
    });
  };

  const handleConfirmDelete = async () => {
    const loadingToast = toast.loading('Đang xóa lời nhắn...');
    try {
      const response = await adminApi.deleteContactMessage(deleteModalConfig.messageId);
      if (response.data.success) {
        toast.success('Xóa lời nhắn thành công!', { id: loadingToast });
        fetchMessages();
      } else {
        toast.error(response.data.message || 'Lỗi khi xóa lời nhắn', { id: loadingToast });
      }
    } catch (err) {
      console.error('Error deleting contact message:', err);
      toast.error('Không thể kết nối để xóa lời nhắn.', { id: loadingToast });
    }
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Helper render badge trạng thái chi tiết
  const renderStatusBadge = (msg) => {
    if (msg.replyMessage) {
      return (
        <span className="active-status-badge active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={13} />
          <span>Đã phản hồi</span>
        </span>
      );
    } else if (msg.isRead) {
      return (
        <span className="active-status-badge read-unreplied" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <HelpCircle size={13} />
          <span>Đã đọc</span>
        </span>
      );
    } else {
      return (
        <span className="active-status-badge locked" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={13} />
          <span>Chưa đọc</span>
        </span>
      );
    }
  };

  return (
    <div className="admin-page">
      <div className="account-breadcrumb">
        <Link to="/admin">ADMIN</Link>
        <ChevronRight size={14} style={{ opacity: 0.5 }} />
        <span>QUẢN LÝ LỜI NHẮN</span>
      </div>

      <header className="account-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Lời nhắn liên hệ</h1>
          <p>Xem, quản lý và gửi phản hồi thông báo trực tiếp cho các tin nhắn hỗ trợ từ khách hàng.</p>
        </div>
        <button
          onClick={() => setIsNotificationModalOpen(true)}
          className="btn-add-admin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--teal)',
            color: '#fff',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--teal-dark)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--teal)'}
        >
          <Bell size={18} /> Gửi thông báo nhắm mục tiêu
        </button>
      </header>

      {/* Tabs UI */}
      <div className="tabs-container">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setIsReadFilter(tab.value); setPage(0); }}
            className={`tab-btn ${isReadFilter === tab.value ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="account-filters-bar">
        {/* Search */}
        <div className="search-wrapper-relative">
          <Search className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên, email hoặc nội dung lời nhắn... (Nhấn Enter)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="search-input-field"
          />
        </div>
      </div>

      {/* Messages Table */}
      <div className="table-wrapper-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>STT</th>
              <th>Khách hàng</th>
              <th>Nội dung lời nhắn</th>
              <th>Trạng thái</th>
              <th>Ngày gửi</th>
              <th style={{ textAlign: 'right', width: '120px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  <td><div className="skeleton" style={{ height: '20px', width: '20px' }}></div></td>
                  <td>
                    <div className="skeleton" style={{ height: '16px', width: '120px', marginBottom: '0.4rem' }}></div>
                    <div className="skeleton" style={{ height: '14px', width: '160px' }}></div>
                  </td>
                  <td><div className="skeleton" style={{ height: '16px', width: '250px' }}></div></td>
                  <td><div className="skeleton" style={{ height: '24px', width: '90px', borderRadius: '20px' }}></div></td>
                  <td><div className="skeleton" style={{ height: '16px', width: '100px' }}></div></td>
                  <td style={{ textAlign: 'right' }}><div className="skeleton" style={{ height: '32px', width: '70px', marginLeft: 'auto' }}></div></td>
                </tr>
              ))
            ) : (!messages || messages.length === 0) ? (
              <tr>
                <td colSpan={6} style={{ padding: '5rem 1rem', textAlign: 'center', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
                  Không tìm thấy lời nhắn nào.
                </td>
              </tr>
            ) : messages.map((msg, index) => (
              <tr key={msg.id} className="contact-row" onClick={() => handleOpenDetailModal(msg)}>
                <td style={{ color: 'var(--muted)' }}>{page * pageSize + index + 1}</td>
                <td>
                  <div className="user-info-text">
                    <div className="user-name" style={{ fontWeight: '600', color: 'var(--text)' }}>{msg.name}</div>
                    <div className="user-email" style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> {msg.email}
                    </div>
                  </div>
                </td>
                <td title={msg.message}>
                  <div style={{ fontWeight: msg.isRead ? 'normal' : '600' }}>
                    {truncateText(msg.message, 70)}
                  </div>
                </td>
                <td>
                  {renderStatusBadge(msg)}
                  {msg.replyMessage && msg.repliedByName && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '4px', fontWeight: '500' }}>
                      Bởi: {msg.repliedByName}
                    </div>
                  )}
                </td>
                <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  {new Date(msg.createdAt).toLocaleDateString('vi-VN')} {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                  <div className="action-buttons-flex" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenDetailModal(msg)}
                      className="action-btn-icon view"
                      title="Xem chi tiết & Phản hồi"
                    >
                      <Eye size={18} />
                    </button>
                    {!msg.replyMessage && (
                      <button
                        onClick={(e) => triggerDeleteMessage(msg, e)}
                        className="action-btn-icon delete"
                        title="Xóa lời nhắn"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="pagination-btn"
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`pagination-btn ${page === i ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="pagination-btn"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* DETAIL & REPLY MODAL */}
      {selectedMessage && (
        <div className="detail-modal-overlay" onClick={handleCloseDetailModal}>
          <div className="detail-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-section">
              <h2>Chi tiết Lời nhắn liên hệ</h2>
              <button className="btn-close-modal" onClick={handleCloseDetailModal}>&times;</button>
            </div>

            <div className="modal-body-section">
              {/* Sender info */}
              <div className="sender-meta-box">
                <div className="meta-row">
                  <span className="meta-label">Người gửi:</span>
                  <span className="meta-val">{selectedMessage.name}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Email:</span>
                  <span className="meta-val">{selectedMessage.email}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Thời gian gửi:</span>
                  <span className="meta-val">
                    {new Date(selectedMessage.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                {selectedMessage.replyMessage && (
                  <div className="meta-row">
                    <span className="meta-label">Người phản hồi:</span>
                    <span className="meta-val" style={{ color: 'var(--teal-dark)', fontWeight: '600' }}>
                      {selectedMessage.repliedByName || 'Quản trị viên'}
                    </span>
                  </div>
                )}
              </div>

              {/* Original message content */}
              <div className="message-content-box">
                <h4>Nội dung tin nhắn khách hàng gửi:</h4>
                <div className="content-text-p">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSubmitReply} className="reply-form-section">
                <div className="form-group-field">
                  <label htmlFor="replyText">
                    <Send size={16} /> Phản hồi gửi cho khách hàng:
                  </label>
                  <textarea
                    id="replyText"
                    rows="4"
                    placeholder="Nhập nội dung phản hồi chính thức tại đây..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={!!selectedMessage.replyMessage}
                    required
                  ></textarea>
                </div>

                <div className="form-group-field">
                  <label htmlFor="notesText">
                    <FileText size={16} /> Ghi chú nội bộ (Chỉ lưu nội bộ Admin xem):
                  </label>
                  <textarea
                    id="notesText"
                    rows="2"
                    placeholder="Ghi chú thêm về lời nhắn này nếu có (ví dụ: đã giải quyết qua điện thoại)..."
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    disabled={!!selectedMessage.replyMessage}
                  ></textarea>
                </div>

                <div className="modal-footer-actions">
                  {selectedMessage.replyMessage ? (
                    <button 
                      type="button" 
                      onClick={handleCloseDetailModal}
                      className="btn-modal-primary"
                    >
                      Đóng
                    </button>
                  ) : (
                    <>
                      <button 
                        type="button" 
                        onClick={handleCloseDetailModal}
                        className="btn-modal-secondary"
                      >
                        Hủy bỏ
                      </button>
                      <button 
                        type="submit" 
                        className="btn-modal-primary"
                        disabled={isSubmittingReply || !replyText.trim()}
                      >
                        {isSubmittingReply ? 'Đang gửi phản hồi...' : 'Gửi phản hồi & Lưu'}
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={deleteModalConfig.isOpen}
        title="Xác nhận xóa lời nhắn"
        message={`Bạn có chắc chắn muốn xóa lời nhắn của khách hàng "${deleteModalConfig.senderName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa lời nhắn"
        cancelText="Hủy bỏ"
        onClose={() => setDeleteModalConfig({ ...deleteModalConfig, isOpen: false })}
        onConfirm={handleConfirmDelete}
      />
      <AdminSendNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </div>
  );
}
