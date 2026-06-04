import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, MoreVertical, 
  CreditCard, Calendar, CheckCircle2, XCircle, ChevronRight, Users, ChevronLeft,
  DollarSign, Mail, User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';
import SubscriptionPlanModal from './SubscriptionPlanModal';
import './AdminSubscriptionPage.css';

export default function AdminSubscriptionPage() {
  const [activeTab, setActiveTab] = useState('payments'); // 'payments' or 'plans'
  
  // Plans Tab States
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plansPage, setPlansPage] = useState(0);
  const [plansTotalPages, setPlansTotalPages] = useState(0);
  const [plansSearch, setPlansSearch] = useState('');

  // Payments Tab States
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsPage, setPaymentsPage] = useState(0);
  const [paymentsTotalPages, setPaymentsTotalPages] = useState(0);
  const [paymentsSearch, setPaymentsSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(''); // '' (All), 'SUCCESS', 'PENDING', 'FAILED'
  const pageSize = 10;

  // Modal for delete confirmation
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Fetch plans when tab is 'plans' or related params change
  useEffect(() => {
    if (activeTab === 'plans') {
      fetchPlans();
    }
  }, [activeTab, plansPage, plansSearch]);

  // Fetch payments when tab is 'payments' or related params change
  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab, paymentsPage, paymentsSearch, paymentStatus]);

  // Handle click outside dropdown menu
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const params = {
        page: plansPage,
        size: pageSize,
        search: plansSearch || undefined
      };
      const response = await adminApi.getSubscriptionPlans(params);
      if (response.data.success) {
        setPlans(response.data.data.content || []);
        setPlansTotalPages(response.data.data.totalPages || 0);
      }
    } catch (err) {
      toast.error('Không thể tải danh sách gói dịch vụ');
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      const params = {
        page: paymentsPage,
        size: pageSize,
        search: paymentsSearch || undefined,
        status: paymentStatus || undefined
      };
      const response = await adminApi.getPayments(params);
      if (response.data.success) {
        setPayments(response.data.data.content || []);
        setPaymentsTotalPages(response.data.data.totalPages || 0);
      }
    } catch (err) {
      toast.error('Không thể tải lịch sử mua gói');
    } finally {
      setPaymentsLoading(false);
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
    if (price === undefined || price === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'SUCCESS': return 'status-pill-badge active';
      case 'PENDING': return 'status-pill-badge warning';
      case 'FAILED': return 'status-pill-badge danger';
      default: return 'status-pill-badge inactive';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'SUCCESS': return 'Thành công';
      case 'PENDING': return 'Đang xử lý';
      case 'FAILED': return 'Thất bại';
      default: return status;
    }
  };

  return (
    <div className="admin-page">
      <div className="subscription-breadcrumb">
        <Link to="/admin">QUẢN TRỊ</Link>
        <ChevronRight size={14} style={{ opacity: 0.5 }} />
        <span>QUẢN LÝ GÓI DỊCH VỤ</span>
      </div>

      <header className="subscription-header">
        <div>
          <h1>Gói Dịch Vụ & Đăng Ký</h1>
          <p>Theo dõi lịch sử giao dịch mua gói và quản lý cấu hình các gói đăng ký.</p>
        </div>
        {activeTab === 'plans' && (
          <button 
            onClick={handleCreate}
            className="btn-create-subscription"
          >
            <Plus size={20} /> Tạo gói mới
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="subscription-tabs">
        <button 
          onClick={() => { setActiveTab('payments'); setPaymentsPage(0); }}
          className={`subscription-tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
        >
          Lịch sử mua gói & Đăng ký
        </button>
        <button 
          onClick={() => { setActiveTab('plans'); setPlansPage(0); }}
          className={`subscription-tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
        >
          Cấu hình gói cước
        </button>
      </div>

      {/* Filters & Search */}
      <div className="subscription-filters-row">
        {activeTab === 'payments' ? (
          <>
            <div className="search-subscription-wrapper">
              <Search className="search-subscription-icon" size={18} />
              <input 
                type="text" 
                placeholder="Tìm theo tên hoặc email khách hàng..."
                value={paymentsSearch}
                onChange={(e) => setPaymentsSearch(e.target.value)}
                className="search-subscription-input"
              />
            </div>
            <select
              value={paymentStatus}
              onChange={(e) => { setPaymentStatus(e.target.value); setPaymentsPage(0); }}
              className="payment-filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </>
        ) : (
          <div className="search-subscription-wrapper">
            <Search className="search-subscription-icon" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm gói dịch vụ..."
              value={plansSearch}
              onChange={(e) => setPlansSearch(e.target.value)}
              className="search-subscription-input"
            />
          </div>
        )}
      </div>

      <div className="subscription-table-card">
        {activeTab === 'payments' ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>STT</th>
                <th>Mã đơn hàng</th>
                <th>Khách hàng</th>
                <th>Gói cước</th>
                <th>Giá trị</th>
                <th>Thời điểm</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {paymentsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="8" style={{ padding: '1.25rem' }}>
                      <div className="skeleton" style={{ height: '40px', width: '100%', borderRadius: '8px' }}></div>
                    </td>
                  </tr>
                ))
              ) : (!payments || payments.length === 0) ? (
                <tr>
                  <td colSpan="8" style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>
                    <CreditCard size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                    <p>Chưa có lịch sử giao dịch mua gói nào.</p>
                  </td>
                </tr>
              ) : payments.map((payment, index) => (
                <tr key={payment.id}>
                  <td style={{ color: 'var(--muted)' }}>{paymentsPage * pageSize + index + 1}</td>
                  <td style={{ fontWeight: '600' }}>#{payment.orderCode}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600' }}>{payment.customerName}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{payment.customerEmail}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      color: payment.planTier === 'BASIC' ? '#0ea5e9' : (payment.planTier === 'PREMIUM' ? '#8b5cf6' : (payment.planTier === 'ELITE' ? '#f59e0b' : '#64748b'))
                    }}>
                      {payment.planName}
                    </span>
                  </td>
                  <td className="plan-price-text">
                    {formatPrice(payment.amount)}
                  </td>
                  <td>
                    {formatDate(payment.paidAt || payment.createdAt)}
                  </td>
                  <td style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {payment.paymentMethod}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(payment.status)}>
                      {payment.status === 'SUCCESS' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {getStatusText(payment.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>STT</th>
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
              {plansLoading ? (
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
                  <td style={{ color: 'var(--muted)' }}>{plansPage * pageSize + index + 1}</td>
                  <td className="plan-name-cell" title={plan.name}>
                    {plan.name}
                  </td>
                  <td>
                    <div style={{ 
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      color: plan.tier === 'BASIC' ? '#0ea5e9' : (plan.tier === 'PREMIUM' ? '#8b5cf6' : (plan.tier === 'ELITE' ? '#f59e0b' : '#64748b')),
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
                            onClick={() => !plan.isActive && plan.tier !== 'FREE' && handleDelete(plan)} 
                            disabled={plan.isActive || plan.tier === 'FREE'}
                            className="action-menu-item danger"
                            title={plan.tier === 'FREE' ? "Không thể xóa gói mặc định (FREE)" : plan.isActive ? "Cần ngừng kích hoạt để xóa" : ""}
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
        )}
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
      {activeTab === 'payments' ? (
        paymentsTotalPages > 1 && (
          <div className="pagination-subscription-container">
            <button 
              disabled={paymentsPage === 0 || paymentsLoading}
              onClick={() => setPaymentsPage(p => p - 1)}
              className="pagination-btn-sub"
            >
              <ChevronLeft size={20} />
            </button>
            {Array.from({ length: paymentsTotalPages }).map((_, i) => (
              <button 
                key={i} 
                onClick={() => setPaymentsPage(i)}
                className={`pagination-btn-sub ${paymentsPage === i ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={paymentsPage >= paymentsTotalPages - 1 || paymentsLoading}
              onClick={() => setPaymentsPage(p => p + 1)}
              className="pagination-btn-sub"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )
      ) : (
        plansTotalPages > 1 && (
          <div className="pagination-subscription-container">
            <button 
              disabled={plansPage === 0 || plansLoading}
              onClick={() => setPlansPage(p => p - 1)}
              className="pagination-btn-sub"
            >
              <ChevronLeft size={20} />
            </button>
            {Array.from({ length: plansTotalPages }).map((_, i) => (
              <button 
                key={i} 
                onClick={() => setPlansPage(i)}
                className={`pagination-btn-sub ${plansPage === i ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={plansPage >= plansTotalPages - 1 || plansLoading}
              onClick={() => setPlansPage(p => p + 1)}
              className="pagination-btn-sub"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )
      )}
    </div>
  );
}
