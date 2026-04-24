import React, { useState, useEffect } from 'react';
import {
  Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  User, Shield, Mail, CreditCard, UserX, UserCheck, MoreVertical, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';
import AdminCreateModal from './AdminCreateModal';

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

  const tabs = [
    { label: 'Khách hàng (Customer)', value: 'CUSTOMER' },
    { label: 'Quản trị viên (Admin)', value: 'ADMIN' },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => { }
  });

  useEffect(() => {
    fetchUsers();
  }, [page, role, isActive]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: pageSize,
        search: search || undefined,
        role: role,
        isActive: isActive !== '' ? isActive : undefined
      };
      const response = await adminApi.getUsers(params);
      if (response.data.success) {
        setUsers(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(0);
      fetchUsers();
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
        try {
          const loadingToast = toast.loading('Đang xử lý...');
          await adminApi.toggleUserStatus(user.id);
          toast.success(`Đã ${action} thành công!`, { id: loadingToast });
          fetchUsers();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Lỗi khi thực hiện');
        }
      }
    });
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>
        <Link to="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>ADMIN</Link>
        <ChevronRight size={14} style={{ opacity: 0.5 }} />
        <span style={{ color: 'var(--teal-dark)' }}>QUẢN LÝ TÀI KHOẢN</span>
      </div>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: 'var(--teal-dark)' }}>Quản lý Tài khoản</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Quản lý người dùng và phân quyền trong hệ thống.</p>
        </div>

        {role === 'ADMIN' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
              background: 'var(--teal-dark)', color: 'white', fontWeight: '700',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(45, 106, 79, 0.2)'
            }}
          >
            <ShieldCheck size={20} /> Thêm Admin
          </button>
        )}
      </header>

      {/* Tabs UI */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #edf2f7' }}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setRole(tab.value); setPage(0); }}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: role === tab.value ? '3px solid var(--teal-dark)' : '3px solid transparent',
              color: role === tab.value ? 'var(--teal-dark)' : 'var(--muted)',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-1px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div style={{
        background: 'white', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={18} />
          <input
            type="text"
            placeholder={`Tìm theo tên hoặc email ${role.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            style={{
              width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '10px',
              border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem'
            }}
          />
        </div>

        {/* Status Filter */}
        <select
          value={isActive}
          onChange={(e) => { setIsActive(e.target.value); setPage(0); }}
          style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: 'var(--teal-dark)', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Đã bị khóa</option>
        </select>
      </div>

      {/* Users Table */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'visible' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600', width: '60px' }}>STT</th>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Người dùng</th>
              {role === 'CUSTOMER' && <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Gói dịch vụ</th>}
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Trạng thái</th>
              <th style={{ padding: '1.25rem', textAlign: 'right', color: 'var(--muted)', fontWeight: '600' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '1.25rem' }}><div className="skeleton" style={{ height: '20px', width: '20px' }}></div></td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="skeleton" style={{ height: '40px', width: '40px', borderRadius: '50%' }}></div>
                      <div>
                        <div className="skeleton" style={{ height: '16px', width: '150px', marginBottom: '0.4rem' }}></div>
                        <div className="skeleton" style={{ height: '14px', width: '100px' }}></div>
                      </div>
                    </div>
                  </td>
                  {role === 'CUSTOMER' && <td style={{ padding: '1.25rem' }}><div className="skeleton" style={{ height: '20px', width: '100px' }}></div></td>}
                  <td style={{ padding: '1.25rem' }}><div className="skeleton" style={{ height: '24px', width: '100px', borderRadius: '20px' }}></div></td>
                  <td style={{ padding: '1.25rem' }}><div className="skeleton" style={{ height: '32px', width: '32px', marginLeft: 'auto' }}></div></td>
                </tr>
              ))
            ) : (!users || users.length === 0) ? (
              <tr>
                <td colSpan={role === 'CUSTOMER' ? 5 : 4} style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                  Không tìm thấy {role.toLowerCase()} nào.
                </td>
              </tr>
            ) : users.map((user, index) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.2s' }}>
                <td style={{ padding: '1.25rem', color: 'var(--muted)' }}>{page * pageSize + index + 1}</td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px', background: 'var(--teal-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                      border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User size={20} color="var(--teal-dark)" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--teal-dark)', fontSize: '0.95rem' }}>{user.fullName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={12} /> {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                {role === 'CUSTOMER' && (
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{
                      fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem',
                      color: user.subscriptionPlan === 'FREE' ? 'var(--muted)' : 'var(--accent)',
                      background: user.subscriptionPlan === 'FREE' ? '#f1f5f9' : '#fff9db',
                      padding: '0.35rem 0.75rem', borderRadius: '8px', width: 'fit-content'
                    }}>
                      <CreditCard size={14} />
                      {user.subscriptionPlan}
                    </div>
                  </td>
                )}
                <td style={{ padding: '1.25rem' }}>
                  <span style={{
                    padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700',
                    background: user.isActive ? '#e6fffa' : '#fff5f5',
                    color: user.isActive ? '#319795' : '#e53e3e',
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                  }}>
                    {user.isActive ? <UserCheck size={14} /> : <UserX size={14} />}
                    {user.isActive ? 'Đang hoạt động' : 'Đã bị khóa'}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === user.id ? null : user.id); }}
                      style={{
                        padding: '0.5rem', color: 'var(--muted)', background: 'none', border: 'none',
                        cursor: 'pointer', borderRadius: '8px',
                        backgroundColor: activeMenuId === user.id ? '#f1f5f9' : 'transparent'
                      }}
                    >
                      <MoreVertical size={20} />
                    </button>

                    {activeMenuId === user.id && (
                      <div style={{
                        position: 'absolute', right: 0,
                        [users && users.length - index <= 2 && users.length > 3 ? 'bottom' : 'top']: '100%',
                        marginTop: users.length - index <= 2 && users.length > 3 ? '0' : '0.5rem',
                        marginBottom: users.length - index <= 2 && users.length > 3 ? '0.5rem' : '0',
                        background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        border: '1px solid #edf2f7', zIndex: 100, width: '180px', overflow: 'hidden'
                      }}>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          style={{
                            width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                            border: 'none', background: 'none', cursor: 'pointer',
                            color: user.isActive ? '#e53e3e' : '#319795', fontSize: '0.9rem', textAlign: 'left'
                          }}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '2rem' }}>
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              style={paginationBtnStyle(false, page === 0)}
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                style={paginationBtnStyle(page === i)}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage(page + 1)}
              style={paginationBtnStyle(false, page === totalPages - 1)}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
      />
      <AdminCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}

const paginationBtnStyle = (isActive, disabled) => ({
  minWidth: '40px', height: '40px', padding: '0 0.5rem', borderRadius: '10px',
  border: isActive ? 'none' : '1px solid #e2e8f0',
  background: isActive ? 'var(--teal-dark)' : 'white',
  color: isActive ? 'white' : disabled ? '#cbd5e0' : 'var(--teal-dark)',
  fontWeight: '700', fontSize: '0.9rem', cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s', boxShadow: isActive ? '0 4px 12px rgba(45, 106, 79, 0.2)' : 'none',
  display: 'flex', justifyContent: 'center', alignItems: 'center'
});
