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
      toast.error('Không thể tải danh sách gói dịch vụ');
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>
        <Link to="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>ADMIN</Link>
        <ChevronRight size={14} style={{ opacity: 0.5 }} />
        <span style={{ color: 'var(--teal-dark)' }}>QUẢN LÝ GÓI DỊCH VỤ</span>
      </div>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: 'var(--teal-dark)' }}>Gói Dịch Vụ</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Quản lý các gói đăng ký premium của hệ thống.</p>
        </div>
        <button 
          onClick={handleCreate}
          style={{
            padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
            background: 'var(--teal-dark)', color: 'white', fontWeight: '700',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(45, 106, 79, 0.2)'
          }}
        >
          <Plus size={20} /> Tạo gói mới
        </button>
      </header>

      {/* Filters & Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm gói dịch vụ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setPage(0)}
            style={{ 
              width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', 
              border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem',
              transition: 'all 0.2s'
            }}
          />
        </div>

      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'visible' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600', width: '60px' }}>ID</th>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Tên gói</th>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Giá</th>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Thời hạn</th>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Người đăng ký</th>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Trạng thái</th>
              <th style={{ padding: '1.25rem', textAlign: 'right', color: 'var(--muted)', fontWeight: '600' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td colSpan="6" style={{ padding: '1.25rem' }}>
                    <div className="skeleton" style={{ height: '40px', width: '100%', borderRadius: '8px' }}></div>
                  </td>
                </tr>
              ))
            ) : (!plans || plans.length === 0) ? (
              <tr>
                <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>
                  <CreditCard size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                  <p>Chưa có gói dịch vụ nào được tạo.</p>
                </td>
              </tr>
            ) : plans.map((plan, index) => (
              <tr key={plan.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.2s' }}>
                <td style={{ padding: '1.25rem', color: 'var(--muted)' }}>#{plan.id}</td>
                <td style={{ padding: '1.25rem' }}>
                  <div 
                    style={{ 
                      fontWeight: '700', color: 'var(--teal-dark)',
                      maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }} 
                    title={plan.name}
                  >
                    {plan.name}
                  </div>
                </td>
                <td style={{ padding: '1.25rem', fontWeight: '700', color: 'var(--accent)' }}>
                  {formatPrice(plan.price)}
                </td>
                <td style={{ padding: '1.25rem', color: 'var(--muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} /> {plan.durationDays} ngày
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--teal-dark)', fontWeight: '600' }}>
                    <Users size={14} /> {plan.subscriberCount || 0}
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                    background: plan.isActive ? '#e6fffa' : '#f7fafc',
                    color: plan.isActive ? '#319795' : '#718096',
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                  }}>
                    {plan.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {plan.isActive ? 'Đang kích hoạt' : 'Ngừng hoạt động'}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === plan.id ? null : plan.id); }}
                      style={{ padding: '0.5rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <MoreVertical size={20} />
                    </button>

                    {activeMenuId === plan.id && (
                      <div style={{
                        position: 'absolute', right: 0, 
                        [plans && plans.length - index <= 2 && plans.length > 3 ? 'bottom' : 'top']: '100%',
                        zIndex: 100, width: '180px', background: 'white', borderRadius: '12px', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #edf2f7', overflow: 'hidden'
                      }}>
                        <button 
                          onClick={() => !plan.isActive && handleEdit(plan)} 
                          style={{ ...menuItemStyle, opacity: plan.isActive ? 0.5 : 1, cursor: plan.isActive ? 'not-allowed' : 'pointer' }}
                          title={plan.isActive ? "Cần ngừng kích hoạt để chỉnh sửa" : ""}
                        >
                          <Edit2 size={16} /> Chỉnh sửa
                        </button>
                        <button onClick={() => handleToggleStatus(plan)} style={menuItemStyle}>
                          {plan.isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                          {plan.isActive ? 'Ngừng kích hoạt' : 'Kích hoạt'}
                        </button>
                        <button 
                          onClick={() => !plan.isActive && handleDelete(plan)} 
                          style={{ 
                            ...menuItemStyle, 
                            color: '#e53e3e', 
                            opacity: plan.isActive ? 0.5 : 1, 
                            cursor: plan.isActive ? 'not-allowed' : 'pointer' 
                          }}
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          <button 
            disabled={page === 0 || loading}
            onClick={() => setPage(p => p - 1)}
            style={{ ...paginationButtonStyle(false, page === 0 || loading) }}
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
                <button key={0} onClick={() => setPage(0)} style={paginationButtonStyle(page === 0)}>1</button>
              );
              if (start > 1) pages.push(<span key="sp1" style={{ color: 'var(--muted)', padding: '0 0.5rem' }}>...</span>);
            }

            for (let i = start; i <= end; i++) {
              pages.push(
                <button 
                  key={i} 
                  onClick={() => setPage(i)}
                  style={paginationButtonStyle(page === i)}
                >
                  {i + 1}
                </button>
              );
            }

            if (end < totalPages - 1) {
              if (end < totalPages - 2) pages.push(<span key="sp2" style={{ color: 'var(--muted)', padding: '0 0.5rem' }}>...</span>);
              pages.push(
                <button key={totalPages - 1} onClick={() => setPage(totalPages - 1)} style={paginationButtonStyle(page === totalPages - 1)}>
                  {totalPages}
                </button>
              );
            }

            return pages;
          })()}

          <button 
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage(p => p + 1)}
            style={{ ...paginationButtonStyle(false, page >= totalPages - 1 || loading) }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

const paginationButtonStyle = (isActive, disabled) => ({
  minWidth: '40px', height: '40px', borderRadius: '10px', background: isActive ? 'var(--teal-dark)' : 'white',
  border: isActive ? 'none' : '1px solid #edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: isActive ? 'white' : disabled ? '#cbd5e0' : 'var(--teal-dark)', cursor: disabled ? 'not-allowed' : 'pointer', 
  transition: 'all 0.2s', fontWeight: '700', boxShadow: isActive ? '0 4px 12px rgba(45, 106, 79, 0.2)' : 'none'
});

const menuItemStyle = {
  width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', 
  border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'left'
};
