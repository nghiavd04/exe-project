import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronRight, ChevronLeft, Bell, Calendar, Mail, Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../apis/adminApi';
import toast from 'react-hot-toast';
import AdminSendNotificationModal from './contact/AdminSendNotificationModal';
import AdminSendEmailModal from './contact/AdminSendEmailModal';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'MANUAL_BROADCAST' | 'EMAIL_ONLY'

  useEffect(() => {
    fetchNotifications();
  }, [page, filterType]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: pageSize
      };
      if (filterType !== 'ALL') {
        params.type = filterType;
      }

      const response = await adminApi.getSentNotifications(params);
      if (response.data.success) {
        setNotifications(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Không thể tải lịch sử thông báo');
    } finally {
      setLoading(false);
    }
  };

  const getTargetBadge = (notif) => {
    if (notif.type === 'EMAIL_ONLY') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500' }}>
          <Mail size={14} /> Email tới Gói: {notif.targetPlanTier}
        </span>
      );
    }
    if (notif.targetEmail) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500' }}>
          <Mail size={14} /> Tới Email: {notif.targetEmail}
        </span>
      );
    } else if (notif.targetPlanTier) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500' }}>
          <Tag size={14} /> Gói: {notif.targetPlanTier}
        </span>
      );
    } else {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500' }}>
          Tất cả User
        </span>
      );
    }
  };

  return (
    <div className="admin-page">
      <div className="account-breadcrumb">
        <Link to="/admin">ADMIN</Link>
        <ChevronRight size={14} style={{ opacity: 0.5 }} />
        <span>LỊCH SỬ THÔNG BÁO</span>
      </div>

      <header className="account-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Lịch sử thông báo</h1>
          <p>Quản lý các thông báo đã gửi cho khách hàng.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
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
            <Bell size={18} /> Gửi thông báo mới
          </button>

          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="btn-add-admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0284c7',
              color: '#fff',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0369a1'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
          >
            <Mail size={18} /> Soạn Email mới
          </button>
        </div>
      </header>

      {/* Filter Options */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '15px', gap: '8px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-light)' }}>Lọc theo loại:</span>
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(0);
          }}
          style={{
            padding: '0.45rem 1.8rem 0.45rem 0.8rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.88rem',
            color: 'var(--text)',
            backgroundColor: '#fff',
            outline: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          <option value="ALL">📋 Tất cả (Web & Email)</option>
          <option value="MANUAL_BROADCAST">🔔 Thông báo trên Web</option>
          <option value="EMAIL_ONLY">✉️ Thư gửi qua Email</option>
        </select>
      </div>

      {/* Messages Table */}
      <div className="table-wrapper-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>STT</th>
              <th style={{ width: '30%' }}>Tiêu đề</th>
              <th>Nội dung</th>
              <th>Đối tượng nhận</th>
              <th style={{ width: '150px' }}>Ngày gửi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  <td><div className="skeleton" style={{ height: '20px', width: '20px' }}></div></td>
                  <td><div className="skeleton" style={{ height: '16px', width: '80%' }}></div></td>
                  <td><div className="skeleton" style={{ height: '16px', width: '90%' }}></div></td>
                  <td><div className="skeleton" style={{ height: '24px', width: '90px', borderRadius: '4px' }}></div></td>
                  <td><div className="skeleton" style={{ height: '16px', width: '100px' }}></div></td>
                </tr>
              ))
            ) : (!notifications || notifications.length === 0) ? (
              <tr>
                <td colSpan={5} style={{ padding: '5rem 1rem', textAlign: 'center', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  Chưa có thông báo nào được gửi.
                </td>
              </tr>
            ) : notifications.map((notif, index) => (
              <tr key={notif.id} className="contact-row" style={{ cursor: 'default' }}>
                <td style={{ color: 'var(--muted)' }}>{page * pageSize + index + 1}</td>
                <td>
                  <div style={{ fontWeight: '600', color: 'var(--text)' }}>
                    {notif.title}
                  </div>
                </td>
                <td>
                  <div 
                    style={{ color: 'var(--text-light)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}
                    dangerouslySetInnerHTML={{ __html: notif.content }}
                  />
                </td>
                <td>
                  {getTargetBadge(notif)}
                </td>
                <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} />
                    {new Date(notif.createdAt).toLocaleDateString('vi-VN')} {new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
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

      <AdminSendNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => {
          setIsNotificationModalOpen(false);
          fetchNotifications(); // Refresh list after sending
        }}
      />

      <AdminSendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          fetchNotifications(); // Refresh list after sending
        }}
      />
    </div>
  );
}
