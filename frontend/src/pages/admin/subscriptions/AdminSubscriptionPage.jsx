import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, MoreVertical, 
  CreditCard, Calendar, CheckCircle2, XCircle, ChevronRight, Users, ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';
import SubscriptionPlanModal from './SubscriptionPlanModal';
import './AdminSubscriptionPage.css';

export default function AdminSubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  // Modal for delete confirmation
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchPlans();
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [page, pageSize]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: pageSize,
        search: search || undefined
      };
      const response = await adminApi.getSubscriptionPlans(params);
      if (response.data.success) {
        setPlans(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
      }
    } catch (err) {
      toast.error('Không thể tải danh sách gói dịch vụ', { id: 'fetch-subscription-plans-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (plan) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa gói',
      message: `Bạn có chắc chắn muốn xóa gói "${plan.name}"? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await adminApi.deleteSubscriptionPlan(plan.id);
          toast.success('Đã xóa gói dịch vụ');
          fetchPlans();
        } catch (err) {
          toast.error('Lỗi khi xóa gói dịch vụ');
        }
      }
    });
    setActiveMenuId(null);
  };

  const handleToggleStatus = async (plan) => {
    try {
      await adminApi.toggleSubscriptionPlanStatus(plan.id);
      toast.success(`Đã ${plan.isActive ? 'ngừng kích hoạt' : 'kích hoạt'} gói`);
      fetchPlans();
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
    setActiveMenuId(null);
  };


  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="admin-page">
      <div className="subscription-breadcrumb">
        <Link to="/admin">ADMIN</Link>
        <ChevronRight size={14} style={{ opacity: 0.5 }} />
        <span>QUẢN LÝ GÓI DỊCH VỤ</span>
      </div>

      <header className="subscription-header">
        <div>
          <h1>Gói Dịch Vụ</h1>
          <p>Quản lý các gói đăng ký premium của hệ thống.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="btn-create-subscription"
        >
          <Plus size={20} /> Tạo gói mới
        </button>
      </header>

      {/* Filters & Search */}
      <div className="subscription-filters-row">
        <div className="search-subscription-wrapper">
          <Search className="search-subscription-icon" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm gói dịch vụ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setPage(0)}
            className="search-subscription-input"
          />
        </div>
      </div>

      <div className="subscription-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>ID</th>
              <th>Tên gói</th>
              <th>Cấp độ</th>
              <th>Giá</th>
              <th>Thời hạn</th>
              <th>Người đăng ký</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="8" style={{ padding: '1.25rem' }}>
                    <div className="skeleton" style={{ height: '40px', width: '100%', borderRadius: '8px' }}></div>
                  </td>
                </tr>
              ))
            ) : (!plans || plans.length === 0) ? (
              <tr>
                <td colSpan="8" style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>
                  <CreditCard size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                  <p>Chưa có gói dịch vụ nào được tạo.</p>
                </td>
              </tr>
            ) : plans.map((plan, index) => (
              <tr key={plan.id}>
                <td style={{ color: 'var(--muted)' }}>{page * pageSize + index + 1}</td>
                <td className="plan-name-cell" title={plan.name}>
                  {plan.name}
                </td>
                <td>
                  <div style={{ 
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    color: plan.tier === 'VIP' ? '#0ea5e9' : (plan.tier === 'PREMIUM' ? '#f59e0b' : '#64748b'),
                    letterSpacing: '0.02em'
                  }}>
                    {plan.tierDisplayName || plan.tier}
                  </div>
                </td>
                <td className="plan-price-text">
                  {formatPrice(plan.price)}
                </td>
                <td>
                  <div className="plan-duration-flex">
                    <Calendar size={14} /> {plan.durationDays} ngày
                  </div>
                </td>
                <td>
                  <div className="plan-subscribers-flex">
                    <Users size={14} /> {plan.subscriberCount || 0}
                  </div>
                </td>
                <td>
                  <span className={`status-pill-badge ${plan.isActive ? 'active' : 'inactive'}`}>
                    {plan.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {plan.isActive ? 'Đang kích hoạt' : 'Ngừng hoạt động'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="actions-relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === plan.id ? null : plan.id); }}
                      className="btn-more-actions"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {activeMenuId === plan.id && (
                      <div className="actions-dropdown-menu" style={{
                        [plans && plans.length - index <= 2 && plans.length > 3 ? 'bottom' : 'top']: '100%'
                      }}>
                        <button 
                          onClick={() => !plan.isActive && handleEdit(plan)} 
                          disabled={plan.isActive}
                          className="action-menu-item"
                          title={plan.isActive ? "Cần ngừng kích hoạt để chỉnh sửa" : ""}
                        >
                          <Edit2 size={16} /> Chỉnh sửa
                        </button>
                        <button onClick={() => handleToggleStatus(plan)} className="action-menu-item">
                          {plan.isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                          {plan.isActive ? 'Ngừng kích hoạt' : 'Kích hoạt'}
                        </button>
                        <button 
                          onClick={() => !plan.isActive && handleDelete(plan)} 
                          disabled={plan.isActive}
                          className="action-menu-item danger"
                          title={plan.isActive ? "Cần ngừng kích hoạt để xóa" : ""}
                        >
                          <Trash2 size={16} /> Xóa gói
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SubscriptionPlanModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPlans}
        plan={selectedPlan}
      />

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type="danger"
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-subscription-container">
          <button 
            disabled={page === 0 || loading}
            onClick={() => setPage(p => p - 1)}
            className="pagination-btn-sub"
          >
            <ChevronLeft size={20} />
          </button>

          {(() => {
            const pages = [];
            const maxVisible = 5;
            let start = Math.max(0, page - 2);
            let end = Math.min(totalPages - 1, start + maxVisible - 1);
            
            if (end - start < maxVisible - 1) {
              start = Math.max(0, end - maxVisible + 1);
            }

            if (start > 0) {
              pages.push(
                <button key={0} onClick={() => setPage(0)} className={`pagination-btn-sub ${page === 0 ? 'active' : ''}`}>1</button>
              );
              if (start > 1) pages.push(<span key="sp1" style={{ color: 'var(--muted)', padding: '0 0.5rem' }}>...</span>);
            }

            for (let i = start; i <= end; i++) {
              pages.push(
                <button 
                  key={i} 
                  onClick={() => setPage(i)}
                  className={`pagination-btn-sub ${page === i ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              );
            }

            if (end < totalPages - 1) {
              if (end < totalPages - 2) pages.push(<span key="sp2" style={{ color: 'var(--muted)', padding: '0 0.5rem' }}>...</span>);
              pages.push(
                <button key={totalPages - 1} onClick={() => setPage(totalPages - 1)} className={`pagination-btn-sub ${page === totalPages - 1 ? 'active' : ''}`}>
                  {totalPages}
                </button>
              );
            }

            return pages;
          })()}

          <button 
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage(p => p + 1)}
            className="pagination-btn-sub"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
