import React, { useState, useEffect } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import {
  Search,
  User, Mail, CreditCard, UserX, UserCheck, MoreVertical, ShieldCheck, TrendingUp, ChevronRight as CrumbChevron
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import AppState from '../../../components/AppState';
import ConfirmModal from '../../../components/ConfirmModal';
import { PageHeader } from '../../../components/PageSection';
import Pagination from '../../../components/Pagination';
import AdminCreateModal from './AdminCreateModal';
import AdminUserProgressModal from './AdminUserProgressModal';
import './AdminManagerAccountPage.css';

export default function AdminManagerAccountPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [isActive, setIsActive] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProgressUser, setSelectedProgressUser] = useState(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const tabs = [
    { label: 'Khách hàng (Customer)', value: 'CUSTOMER' },
    { label: 'Quản trị viên (Admin)', value: 'ADMIN' },
  ];

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {},
  });

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [page, role, isActive, debouncedSearch]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: pageSize,
        search: debouncedSearch || undefined,
        role,
        isActive: isActive !== '' ? isActive : undefined,
      };
      const response = await adminApi.getUsers(params);
      if (response.data.success) {
        setUsers(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Không thể tải danh sách người dùng', { id: 'fetch-users-error' });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? 'khóa' : 'mở khóa';
    setModalConfig({
      isOpen: true,
      title: `Xác nhận ${action} tài khoản`,
      message: `Bạn có chắc chắn muốn ${action} tài khoản của ${user.fullName} (${user.email})?`,
      type: user.isActive ? 'danger' : 'success',
      onConfirm: async () => {
        const loadingToast = toast.loading('Đang xử lý...');
        try {
          await adminApi.toggleUserStatus(user.id);
          toast.success(`Đã ${action} thành công!`, { id: loadingToast });
          fetchUsers();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Lỗi khi thực hiện', { id: loadingToast });
        }
      },
    });
  };

  return (
    <div className="admin-page">
      <PageHeader
        className="account-header"
        title="Người dùng"
        description="Quản lý người dùng, phân quyền và theo dõi tiến độ trong hệ thống."
        breadcrumbs={[
          { label: 'Tổng quan', to: '/admin' },
          { label: 'Người dùng' }
        ]}
        actions={role === 'ADMIN' ? (
          <button onClick={() => setIsCreateModalOpen(true)} className="ui-btn ui-btn--primary btn-add-admin">
            <ShieldCheck size={20} /> Thêm Admin
          </button>
        ) : null}
      />

      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setRole(tab.value); setPage(0); }}
            className={`tab-btn ${role === tab.value ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="ui-card account-filters-bar">
        <div className="search-wrapper-relative">
          <Search className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={18} />
          <input
            type="text"
            placeholder={`Tìm theo tên hoặc email ${role === 'CUSTOMER' ? 'khách hàng' : 'quản trị viên'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ui-input search-input-field"
          />
        </div>

        <select
          value={isActive}
          onChange={(e) => { setIsActive(e.target.value); setPage(0); }}
          className="ui-select status-select-filter"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Đã bị khóa</option>
        </select>
      </div>

      <div className="ui-card table-wrapper-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>STT</th>
              <th>Người dùng</th>
              {role === 'CUSTOMER' && <th>Gói dịch vụ</th>}
              {role === 'CUSTOMER' && <th>Tiến độ lộ trình</th>}
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  <td><div className="skeleton" style={{ height: '20px', width: '20px' }}></div></td>
                  <td>
                    <div className="user-cell-flex">
                      <div className="skeleton" style={{ height: '40px', width: '40px', borderRadius: '50%' }}></div>
                      <div>
                        <div className="skeleton" style={{ height: '16px', width: '150px', marginBottom: '0.4rem' }}></div>
                        <div className="skeleton" style={{ height: '14px', width: '100px' }}></div>
                      </div>
                    </div>
                  </td>
                  {role === 'CUSTOMER' && <td><div className="skeleton" style={{ height: '20px', width: '100px' }}></div></td>}
                  {role === 'CUSTOMER' && <td><div className="skeleton" style={{ height: '20px', width: '100px' }}></div></td>}
                  <td><div className="skeleton" style={{ height: '24px', width: '100px', borderRadius: '20px' }}></div></td>
                  <td style={{ textAlign: 'right' }}><div className="skeleton" style={{ height: '32px', width: '32px', marginLeft: 'auto' }}></div></td>
                </tr>
              ))
            ) : (!users || users.length === 0) ? (
              <tr>
                <td colSpan={role === 'CUSTOMER' ? 6 : 4} style={{ padding: '2rem' }}>
                  <AppState
                    variant="empty"
                    compact
                    title={`Không tìm thấy ${role.toLowerCase()} nào`}
                    description="Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả khác."
                  />
                </td>
              </tr>
            ) : users.map((user, index) => (
              <tr key={user.id}>
                <td style={{ color: 'var(--muted)' }}>{page * pageSize + index + 1}</td>
                <td>
                  <div className="user-cell-flex">
                    <div className="avatar-container">
                      {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <User size={20} color="var(--teal-dark)" />}
                    </div>
                    <div className="user-info-text">
                      <div className="user-name">{user.fullName}</div>
                      <div className="user-email"><Mail size={12} /> {user.email}</div>
                    </div>
                  </div>
                </td>
                {role === 'CUSTOMER' && (
                  <td>
                    <div className={`plan-badge ${user.subscriptionPlan === 'FREE' ? 'free' : 'paid'}`}>
                      <CreditCard size={14} />
                      {user.subscriptionPlan}
                    </div>
                  </td>
                )}
                {role === 'CUSTOMER' && (
                  <td>
                    {user.currentDay ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--teal)' }}>Ngày {user.currentDay}/120</span>
                        {user.streakCount > 0 && <span style={{ fontSize: '0.72rem', color: '#f97316', fontWeight: 600 }}>🔥 {user.streakCount} ngày liên tục</span>}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Chưa bắt đầu</span>
                    )}
                  </td>
                )}
                <td>
                  <span className={`active-status-badge ${user.isActive ? 'active' : 'locked'}`}>
                    {user.isActive ? <UserCheck size={14} /> : <UserX size={14} />}
                    {user.isActive ? 'Đang hoạt động' : 'Đã bị khóa'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === user.id ? null : user.id); }}
                      className={`action-menu-trigger ${activeMenuId === user.id ? 'active' : ''}`}
                    >
                      <MoreVertical size={20} />
                    </button>

                    {activeMenuId === user.id && (
                      <div className="ui-card action-dropdown-menu" style={{
                        [users && users.length - index <= 2 && users.length > 3 ? 'bottom' : 'top']: '100%',
                        marginTop: users.length - index <= 2 && users.length > 3 ? '0' : '0.5rem',
                        marginBottom: users.length - index <= 2 && users.length > 3 ? '0.5rem' : '0',
                      }}>
                        {role === 'CUSTOMER' && (
                          <button
                            onClick={() => {
                              setSelectedProgressUser(user);
                              setIsProgressModalOpen(true);
                              setActiveMenuId(null);
                            }}
                            className="action-dropdown-btn dropdown-item-teal"
                          >
                            <TrendingUp size={16} /> Xem tiến trình chỉ số
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`action-dropdown-btn ${user.isActive ? 'dropdown-item-danger' : 'dropdown-item-success'}`}
                        >
                          {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          {user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
      />
      <AdminCreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchUsers} />
      <AdminUserProgressModal isOpen={isProgressModalOpen} onClose={() => { setIsProgressModalOpen(false); setSelectedProgressUser(null); }} user={selectedProgressUser} />
    </div>
  );
}
