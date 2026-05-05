import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, MoreVertical, 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  HelpCircle, BarChart3, Clock, Archive, RotateCcw,
  Eye, Calendar, X, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';
import QuizRenderer from '../../../components/QuizRenderer/QuizRenderer';
import './QuizListPage.css';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({ totalQuizzes: 0, attemptsThisMonth: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

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
  }, [page, status, sortBy, sortOrder]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await adminApi.getQuizStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching quiz stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setListLoading(true);
      const params = {
        page,
        status: status || undefined,
        search: search || undefined,
        sort: `${sortBy},${sortOrder}`
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
      setListLoading(false);
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

  const handleViewDetail = async (quiz) => {
    try {
      setShowDetailModal(true);
      setDetailLoading(true);
      setActiveMenuId(null);
      
      const response = await adminApi.getQuizDetail(quiz.id);
      if (response.data.success) {
        setSelectedQuiz(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching quiz detail:', err);
      toast.error('Không thể tải chi tiết bài test');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
    setPage(0);
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
      <div className="quiz-breadcrumb">
        <Link to="/admin">ADMIN</Link>
        <ChevronRight size={14} style={{ opacity: 0.5 }} />
        <span>QUẢN LÝ QUIZZES</span>
      </div>
      <header className="quiz-header">
        <div>
          <h1>Quản lý Quizzes</h1>
          <p>Xem và quản lý tất cả các bài kiểm tra trong hệ thống.</p>
        </div>
        <Link to="/admin/quizzes/create" style={{ textDecoration: 'none' }}>
          <button className="btn-create-quiz">
            <Plus size={20} /> Tạo Quiz Mới
          </button>
        </Link>
      </header>

      {/* Stats Widgets */}
      <div className="quiz-stats-grid">
        <div className="quiz-stat-card">
          <div className="stat-icon-box teal"><HelpCircle size={24} /></div>
          <div className="stat-info">
            <p>Tổng số Quizzes</p>
            {statsLoading ? (
              <div className="skeleton" style={{ height: '1.5rem', width: '60px', marginTop: '0.25rem' }}></div>
            ) : (
              <h3>{stats.totalQuizzes}</h3>
            )}
          </div>
        </div>
        <div className="quiz-stat-card">
          <div className="stat-icon-box blue"><BarChart3 size={24} /></div>
          <div className="stat-info">
            <p>Lượt làm tháng này</p>
            {statsLoading ? (
              <div className="skeleton" style={{ height: '1.5rem', width: '80px', marginTop: '0.25rem' }}></div>
            ) : (
              <h3>{stats.attemptsThisMonth}</h3>
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="quiz-filters-bar">
        <div className="status-tabs-wrapper">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatus(tab.value); setPage(0); }}
              className={`status-tab-btn ${status === tab.value ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="search-box-relative">
          <Search className="search-icon-quiz" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="search-input-quiz"
          />
        </div>
      </div>

      {/* Quiz Table */}
      <div className="quiz-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>STT</th>
              <th>Tên bài test</th>
              <th>Trạng thái</th>
              <th onClick={() => handleSort('attemptCount')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Lượt làm
                  {sortBy === 'attemptCount' && (sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />)}
                </div>
              </th>
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Ngày tạo
                  {sortBy === 'id' && (sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />)}
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {listLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  <td><div className="skeleton" style={{ height: '20px', width: '20px' }}></div></td>
                  <td>
                    <div className="skeleton" style={{ height: '20px', width: '250px', marginBottom: '0.5rem' }}></div>
                  </td>
                  <td><div className="skeleton" style={{ height: '24px', width: '100px', borderRadius: '20px' }}></div></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '80px' }}></div></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '100px' }}></div></td>
                  <td style={{ textAlign: 'right' }}><div className="skeleton" style={{ height: '32px', width: '120px', marginLeft: 'auto' }}></div></td>
                </tr>
              ))
            ) : quizzes.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Không tìm thấy bài test nào.</td>
              </tr>
            ) : quizzes.map((quiz, index) => (
              <tr key={quiz.id}>
                <td style={{ color: 'var(--muted)' }}>{page * pageSize + index + 1}</td>
                <td className="quiz-title-cell" title={quiz.title}>
                  {quiz.title}
                </td>
                <td>
                  <span className={`status-label-badge ${quiz.status === 'PUBLISHED' ? 'published' : quiz.status === 'ARCHIVED' ? 'archived' : 'draft'}`}>
                    {quiz.statusDisplayName || quiz.status}
                  </span>
                </td>
                <td>
                   <div className="attempt-count-flex">
                      <BarChart3 size={14} color="var(--muted)" />
                      {quiz.attemptCount.toLocaleString()}
                   </div>
                </td>
                <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  {new Date(quiz.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="actions-cell-flex">
                    {/* Edit Button */}
                    {quiz.status !== 'PUBLISHED' ? (
                      <Link 
                        to={`/admin/quizzes/edit/${quiz.id}`}
                        title="Chỉnh sửa"
                        className="btn-icon-action"
                      >
                        <Edit2 size={18} />
                      </Link>
                    ) : (
                      <div 
                        title="Không thể sửa bài đã xuất bản. Hãy lưu trữ để sửa."
                        className="btn-icon-action disabled"
                      >
                        <Edit2 size={18} />
                      </div>
                    )}

                    {/* Delete Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(quiz); }}
                      title={quiz.status === 'DRAFT' ? "Xóa" : "Không thể xóa bài đã xuất bản/lưu trữ"}
                      className={`btn-icon-action ${quiz.status === 'DRAFT' ? 'delete' : 'disabled'}`}
                    >
                      <Trash2 size={18} />
                    </button>

                    {/* Status Menu (3 dots) */}
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === quiz.id ? null : quiz.id); }}
                        title="Tùy chọn trạng thái"
                        className={`btn-icon-action ${activeMenuId === quiz.id ? 'active' : ''}`}
                      >
                        <MoreVertical size={20} />
                      </button>

                      {activeMenuId === quiz.id && (
                        <div className="dropdown-menu-quiz" style={{
                          ...(index >= quizzes.length - 3 && quizzes.length > 3 
                            ? { bottom: '100%', marginBottom: '0.5rem' } 
                            : { top: '100%', marginTop: '0.5rem' }
                          )
                        }}>
                          {quiz.status === 'DRAFT' && (
                            <button 
                              onClick={() => handlePublish(quiz.id)}
                              className="dropdown-item-quiz publish"
                            >
                              <Plus size={16} /> Xuất bản bài test
                            </button>
                          )}
                          {quiz.status === 'PUBLISHED' && (
                            <button 
                              onClick={() => handleArchive(quiz.id)}
                              className="dropdown-item-quiz archive"
                            >
                              <Archive size={16} /> Lưu trữ bài test
                            </button>
                          )}
                          {quiz.status === 'ARCHIVED' && (
                            <button 
                              onClick={() => handleUnarchive(quiz.id)}
                              className="dropdown-item-quiz restore"
                            >
                              <RotateCcw size={16} /> Khôi phục bài test
                            </button>
                          )}
                          <div style={{ height: '1px', background: '#edf2f7' }}></div>
                          <button 
                            onClick={() => handleViewDetail(quiz)}
                            className="dropdown-item-quiz view"
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
          <div className="pagination-quiz-controls">
            <button 
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="pagination-btn-quiz"
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
                  <button key={0} onClick={() => setPage(0)} className={`pagination-btn-quiz ${page === 0 ? 'active' : ''}`}>1</button>
                );
                if (start > 1) pages.push(<span key="sp1" style={{ color: 'var(--muted)', padding: '0 0.5rem' }}>...</span>);
              }

              for (let i = start; i <= end; i++) {
                pages.push(
                  <button 
                    key={i} 
                    onClick={() => setPage(i)}
                    className={`pagination-btn-quiz ${page === i ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                );
              }

              if (end < totalPages - 1) {
                if (end < totalPages - 2) pages.push(<span key="sp2" style={{ color: 'var(--muted)', padding: '0 0.5rem' }}>...</span>);
                pages.push(
                  <button key={totalPages - 1} onClick={() => setPage(totalPages - 1)} className={`pagination-btn-quiz ${page === totalPages - 1 ? 'active' : ''}`}>
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}

            <button 
              disabled={page === totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="pagination-btn-quiz"
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

      {/* View Detail Modal */}
      {showDetailModal && (
        <div className="detail-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="detail-modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="detail-modal-header-info">
                <h2>Chi tiết bài test</h2>
                <p>Chế độ xem nhanh nội dung câu hỏi và phản hồi</p>
              </div>
              <button className="detail-modal-close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="detail-modal-main-card">
              {detailLoading ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                  <Loader2 className="animate-spin" size={40} color="#1a1a4b" />
                  <p style={{ color: 'var(--muted)', fontWeight: '600' }}>Đang tải nội dung...</p>
                </div>
              ) : (
                <QuizRenderer quiz={selectedQuiz} isPreview={true} />
              )}
            </div>
            
            <p className="detail-modal-footer-hint">
              Nhấn ra ngoài hoặc nút [X] để đóng
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
