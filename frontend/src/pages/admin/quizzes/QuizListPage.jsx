import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, MoreVertical, 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  HelpCircle, BarChart3, Clock, Archive, RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({ totalQuizzes: 0, attemptsThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeMenuId, setActiveMenuId] = useState(null);

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
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [page, status, sortOrder]);

  const fetchStats = async () => {
    try {
      const response = await adminApi.getQuizStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching quiz stats:', err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        status: status || undefined,
        search: search || undefined,
        sort: `attemptCount,${sortOrder}`
      };
      const response = await adminApi.getQuizzes(params);
      if (response.data.success) {
        setQuizzes(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
        setPageSize(response.data.data.size);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(0);
      fetchQuizzes();
    }
  };

  const handlePublish = async (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Công khai bài test',
      message: 'Người dùng sẽ có thể nhìn thấy bài test này ngay lập tức. Xác nhận?',
      type: 'warning',
      onConfirm: async () => {
        try {
          const loadingToast = toast.loading('Đang xử lý...');
          await adminApi.publishQuiz(id);
          toast.success('Đã công khai bài test!', { id: loadingToast });
          fetchQuizzes();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Lỗi khi xuất bản');
        }
      }
    });
  };

  const handleArchive = async (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Lưu trữ bài test',
      message: 'Bài test sẽ bị ẩn khỏi người dùng nhưng dữ liệu vẫn được giữ lại. Xác nhận?',
      type: 'warning',
      onConfirm: async () => {
        try {
          const loadingToast = toast.loading('Đang lưu trữ...');
          await adminApi.archiveQuiz(id);
          toast.success('Đã lưu trữ bài test!', { id: loadingToast });
          fetchQuizzes();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Lỗi khi lưu trữ');
        }
      }
    });
  };

  const handleUnarchive = async (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Khôi phục bài test',
      message: 'Bài test sẽ quay trở lại trạng thái công khai. Xác nhận?',
      type: 'success',
      onConfirm: async () => {
        try {
          const loadingToast = toast.loading('Đang khôi phục...');
          await adminApi.unarchiveQuiz(id);
          toast.success('Đã khôi phục bài test!', { id: loadingToast });
          fetchQuizzes();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Lỗi khi khôi phục');
        }
      }
    });
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleDelete = async (quiz) => {
    if (quiz.status !== 'DRAFT') {
      toast.error('Chỉ bản nháp mới có thể xóa. Hãy lưu trữ thay vì xóa bài đang hoạt động.');
      return;
    }
    
    setModalConfig({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa bài test "${quiz.title}"? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const loadingToast = toast.loading('Đang xóa...');
          await adminApi.deleteQuiz(quiz.id);
          toast.success('Đã xóa thành công!', { id: loadingToast });
          fetchQuizzes();
          fetchStats();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Lỗi khi xóa');
        }
      }
    });
  };

  const statusTabs = [
    { label: 'Tất cả', value: '' },
    { label: 'Bản nháp', value: 'DRAFT' },
    { label: 'Đã xuất bản', value: 'PUBLISHED' },
    { label: 'Đã lưu trữ', value: 'ARCHIVED' },
  ];

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>
        <Link to="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>ADMIN</Link>
        <ChevronRight size={14} style={{ opacity: 0.5 }} />
        <span style={{ color: 'var(--teal-dark)' }}>QUẢN LÝ QUIZZES</span>
      </div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: 'var(--teal-dark)' }}>Quản lý Quizzes</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Xem và quản lý tất cả các bài kiểm tra trong hệ thống.</p>
        </div>
        <Link to="/admin/quizzes/create" style={{ textDecoration: 'none' }}>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent)', 
            color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', 
            fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(246, 173, 85, 0.3)'
          }}>
            <Plus size={20} /> Tạo Quiz Mới
          </button>
        </Link>
      </header>

      {/* Stats Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#e6fffa', color: '#319795', padding: '0.75rem', borderRadius: '12px' }}><HelpCircle size={24} /></div>
          <div>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>Tổng số Quizzes</p>
            {loading ? (
              <div className="skeleton" style={{ height: '1.5rem', width: '60px', marginTop: '0.25rem' }}></div>
            ) : (
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--teal-dark)' }}>{stats.totalQuizzes}</h3>
            )}
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#ebf8ff', color: '#3182ce', padding: '0.75rem', borderRadius: '12px' }}><BarChart3 size={24} /></div>
          <div>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>Lượt làm tháng này</p>
            {loading ? (
              <div className="skeleton" style={{ height: '1.5rem', width: '80px', marginTop: '0.25rem' }}></div>
            ) : (
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--teal-dark)' }}>{stats.attemptsThisMonth}</h3>
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ 
        background: 'white', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', 
        boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '12px' }}>
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatus(tab.value); setPage(0); }}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: status === tab.value ? 'white' : 'transparent',
                color: status === tab.value ? 'var(--teal-dark)' : 'var(--muted)',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: status === tab.value ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            style={{ 
              width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '10px', 
              border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem'
            }} 
          />
        </div>
      </div>

      {/* Quiz Table */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'visible' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600', width: '60px' }}>STT</th>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Tên bài test</th>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Trạng thái</th>
              <th 
                style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600', cursor: 'pointer' }}
                onClick={toggleSort}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Lượt làm
                  {sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </div>
              </th>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Ngày tạo</th>
              <th style={{ padding: '1.25rem', textAlign: 'right', color: 'var(--muted)', fontWeight: '600' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '1.25rem' }}><div className="skeleton" style={{ height: '20px', width: '20px' }}></div></td>
                  <td style={{ padding: '1.25rem' }}>
                    <div className="skeleton" style={{ height: '20px', width: '250px', marginBottom: '0.5rem' }}></div>
                  </td>
                  <td style={{ padding: '1.25rem' }}><div className="skeleton" style={{ height: '24px', width: '100px', borderRadius: '20px' }}></div></td>
                  <td style={{ padding: '1.25rem' }}><div className="skeleton" style={{ height: '20px', width: '80px' }}></div></td>
                  <td style={{ padding: '1.25rem' }}><div className="skeleton" style={{ height: '20px', width: '100px' }}></div></td>
                  <td style={{ padding: '1.25rem' }}><div className="skeleton" style={{ height: '32px', width: '120px', marginLeft: 'auto' }}></div></td>
                </tr>
              ))
            ) : quizzes.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Không tìm thấy bài test nào.</td>
              </tr>
            ) : quizzes.map((quiz, index) => (
              <tr key={quiz.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                <td style={{ padding: '1.25rem', color: 'var(--muted)' }}>{page * pageSize + index + 1}</td>
                <td style={{ 
                  padding: '1.25rem', fontWeight: '600', color: 'var(--teal-dark)',
                  maxWidth: '350px', 
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word'
                }} title={quiz.title}>
                  {quiz.title}
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600',
                    background: quiz.status === 'PUBLISHED' ? '#e6fffa' : quiz.status === 'ARCHIVED' ? '#f1f5f9' : '#fffaf0',
                    color: quiz.status === 'PUBLISHED' ? '#319795' : quiz.status === 'ARCHIVED' ? '#718096' : '#d69e2e',
                    border: '1px solid transparent'
                  }}>
                    {quiz.status === 'PUBLISHED' ? 'Đã xuất bản' : quiz.status === 'ARCHIVED' ? 'Đã lưu trữ' : 'Bản nháp'}
                  </span>
                </td>
                <td style={{ padding: '1.25rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BarChart3 size={14} color="var(--muted)" />
                      {quiz.attemptCount.toLocaleString()}
                   </div>
                </td>
                <td style={{ padding: '1.25rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
                  {new Date(quiz.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                    {/* Edit Button */}
                    {quiz.status !== 'PUBLISHED' ? (
                      <Link 
                        to={`/admin/quizzes/edit/${quiz.id}`}
                        title="Chỉnh sửa"
                        style={{ padding: '0.5rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                      >
                        <Edit2 size={18} />
                      </Link>
                    ) : (
                      <div 
                        title="Không thể sửa bài đã xuất bản. Hãy lưu trữ để sửa."
                        style={{ padding: '0.5rem', color: '#cbd5e0', cursor: 'not-allowed', display: 'flex' }}
                      >
                        <Edit2 size={18} />
                      </div>
                    )}

                    {/* Delete Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(quiz); }}
                      title={quiz.status === 'DRAFT' ? "Xóa" : "Không thể xóa bài đã xuất bản/lưu trữ"}
                      style={{ 
                        padding: '0.5rem', 
                        color: quiz.status === 'DRAFT' ? '#e53e3e' : '#cbd5e0', 
                        background: 'none', border: 'none', cursor: quiz.status === 'DRAFT' ? 'pointer' : 'not-allowed' 
                      }}
                    >
                      <Trash2 size={18} />
                    </button>

                    {/* Status Menu (3 dots) */}
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === quiz.id ? null : quiz.id); }}
                        title="Tùy chọn trạng thái"
                        style={{ 
                          padding: '0.5rem', color: 'var(--muted)', background: 'none', border: 'none', 
                          cursor: 'pointer', borderRadius: '8px',
                          backgroundColor: activeMenuId === quiz.id ? '#f1f5f9' : 'transparent'
                        }}
                      >
                        <MoreVertical size={20} />
                      </button>

                      {activeMenuId === quiz.id && (
                        <div style={{
                          position: 'absolute', 
                          right: 0, 
                          // Nếu là 3 hàng cuối thì mở ngược lên trên
                          ...(index >= quizzes.length - 3 && quizzes.length > 3 
                            ? { bottom: '100%', marginBottom: '0.5rem' } 
                            : { top: '100%', marginTop: '0.5rem' }
                          ),
                          background: 'white', 
                          borderRadius: '12px', 
                          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                          border: '1px solid #edf2f7', 
                          zIndex: 100, 
                          width: '190px', 
                          overflow: 'hidden',
                          animation: 'fadeIn 0.15s ease-out'
                        }}>
                          {quiz.status === 'DRAFT' && (
                            <button 
                              onClick={() => handlePublish(quiz.id)}
                              style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--teal-dark)', fontSize: '0.9rem', textAlign: 'left' }}
                            >
                              <Plus size={16} /> Xuất bản bài test
                            </button>
                          )}
                          {quiz.status === 'PUBLISHED' && (
                            <button 
                              onClick={() => handleArchive(quiz.id)}
                              style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none', background: 'none', cursor: 'pointer', color: '#d69e2e', fontSize: '0.9rem', textAlign: 'left' }}
                            >
                              <Archive size={16} /> Lưu trữ bài test
                            </button>
                          )}
                          {quiz.status === 'ARCHIVED' && (
                            <button 
                              onClick={() => handleUnarchive(quiz.id)}
                              style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none', background: 'none', cursor: 'pointer', color: '#3182ce', fontSize: '0.9rem', textAlign: 'left' }}
                            >
                              <RotateCcw size={16} /> Khôi phục bài test
                            </button>
                          )}
                          <div style={{ height: '1px', background: '#edf2f7' }}></div>
                          <button 
                            style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'left' }}
                          >
                            <Search size={16} /> Xem chi tiết
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', paddingBottom: '2rem'
          }}>
            <button 
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              style={{ 
                padding: '0.6rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white',
                cursor: page === 0 ? 'not-allowed' : 'pointer', color: page === 0 ? '#cbd5e0' : 'var(--teal-dark)',
                display: 'flex', alignItems: 'center', transition: 'all 0.2s'
              }}
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
                  <button key={0} onClick={() => setPage(0)} style={paginationBtnStyle(page === 0)}>1</button>
                );
                if (start > 1) pages.push(<span key="sp1" style={{ color: 'var(--muted)', padding: '0 0.5rem' }}>...</span>);
              }

              for (let i = start; i <= end; i++) {
                pages.push(
                  <button 
                    key={i} 
                    onClick={() => setPage(i)}
                    style={paginationBtnStyle(page === i)}
                  >
                    {i + 1}
                  </button>
                );
              }

              if (end < totalPages - 1) {
                if (end < totalPages - 2) pages.push(<span key="sp2" style={{ color: 'var(--muted)', padding: '0 0.5rem' }}>...</span>);
                pages.push(
                  <button key={totalPages - 1} onClick={() => setPage(totalPages - 1)} style={paginationBtnStyle(page === totalPages - 1)}>
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}

            <button 
              disabled={page === totalPages - 1}
              onClick={() => setPage(page + 1)}
              style={{ 
                padding: '0.6rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white',
                cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', color: page === totalPages - 1 ? '#cbd5e0' : 'var(--teal-dark)',
                display: 'flex', alignItems: 'center', transition: 'all 0.2s'
              }}
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
    </div>
  );
}

// Helper style for pagination buttons
const paginationBtnStyle = (isActive) => ({
  minWidth: '40px',
  height: '40px',
  padding: '0 0.5rem',
  borderRadius: '10px',
  border: isActive ? 'none' : '1px solid #e2e8f0',
  background: isActive ? 'var(--teal-dark)' : 'white',
  color: isActive ? 'white' : 'var(--teal-dark)',
  fontWeight: '700',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: isActive ? '0 4px 12px rgba(45, 106, 79, 0.2)' : 'none',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});
