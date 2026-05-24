import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, MoreVertical, 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  FileText, Eye, Archive, RotateCcw, Crown, Star, X, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';
import ArticleRenderer from '../../../components/ArticleRenderer/ArticleRenderer';
import './ArticleListPage.css';

export default function ArticleListPage() {
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({ totalArticles: 0, viewsThisMonth: 0 });
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
  const [selectedArticle, setSelectedArticle] = useState(null);
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
    fetchArticles();
  }, [page, status, sortBy, sortOrder]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await adminApi.getArticleStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching article stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      setListLoading(true);
      const params = {
        page,
        status: status || undefined,
        search: search || undefined,
        sort: `${sortBy},${sortOrder}`
      };
      const response = await adminApi.getArticles(params);
      if (response.data.success) {
        setArticles(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
        setPageSize(response.data.data.size);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setListLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(0);
      fetchArticles();
    }
  };

  const handlePublish = async (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Công khai bài viết',
      message: 'Người dùng sẽ có thể nhìn thấy bài viết này ngay lập tức. Xác nhận?',
      type: 'warning',
      onConfirm: async () => {
        try {
          const loadingToast = toast.loading('Đang xử lý...');
          await adminApi.publishArticle(id);
          toast.success('Đã công khai bài viết!', { id: loadingToast });
          fetchArticles();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Lỗi khi xuất bản', { id: loadingToast });
        }
      }
    });
  };

  const handleArchive = async (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Lưu trữ bài viết',
      message: 'Bài viết sẽ bị ẩn khỏi trang chủ nhưng vẫn được giữ lại trong hệ thống. Xác nhận?',
      type: 'warning',
      onConfirm: async () => {
        try {
          const loadingToast = toast.loading('Đang lưu trữ...');
          await adminApi.archiveArticle(id);
          toast.success('Đã lưu trữ bài viết!', { id: loadingToast });
          fetchArticles();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Lỗi khi lưu trữ', { id: loadingToast });
        }
      }
    });
  };

  const handleUnarchive = async (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Khôi phục bài viết',
      message: 'Bài viết sẽ quay trở lại trạng thái công khai. Xác nhận?',
      type: 'success',
      onConfirm: async () => {
        try {
          const loadingToast = toast.loading('Đang khôi phục...');
          await adminApi.unarchiveArticle(id);
          toast.success('Đã khôi phục bài viết!', { id: loadingToast });
          fetchArticles();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Lỗi khi khôi phục', { id: loadingToast });
        }
      }
    });
  };

  const handleViewDetail = async (article) => {
    try {
      setShowDetailModal(true);
      setDetailLoading(true);
      setActiveMenuId(null);
      
      const response = await adminApi.getArticleDetail(article.id);
      if (response.data.success) {
        setSelectedArticle(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching article detail:', err);
      toast.error('Không thể tải chi tiết bài viết');
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

  const handleDelete = async (article) => {
    if (article.status !== 'DRAFT') {
      toast.error('Chỉ bản nháp mới có thể xóa. Hãy lưu trữ thay vì xóa bài đang hoạt động.');
      return;
    }
    
    setModalConfig({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa bài viết "${article.title}"? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const loadingToast = toast.loading('Đang xóa...');
          await adminApi.deleteArticle(article.id);
          toast.success('Đã xóa bài viết thành công!', { id: loadingToast });
          fetchArticles();
          fetchStats();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Lỗi khi xóa', { id: loadingToast });
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

  const CATEGORY_LABELS = {
    HEALTH: 'Sức khỏe',
    PSYCHOLOGY: 'Tâm lý học',
    LIFESTYLE: 'Lối sống',
    EDUCATION: 'Giáo dục',
    SCIENCE: 'Khoa học',
    TECHNOLOGY: 'Công nghệ'
  };

  return (
    <div className="admin-page">
      <div className="admin-breadcrumb">
        <Link to="/admin">ADMIN</Link>
        <ChevronRight size={14} style={{ opacity: 0.5 }} />
        <span>QUẢN LÝ BÀI VIẾT</span>
      </div>
      <header className="admin-header">
        <div>
          <h1>Quản lý Bài viết</h1>
          <p>Xem và quản lý tất cả nội dung bài viết trong hệ thống.</p>
        </div>
        <Link to="/admin/articles/create" className="btn-create-new">
          <Plus size={20} /> Viết Bài Mới
        </Link>
      </header>

      {/* Stats Widgets */}
      <div className="article-stats-grid">
        <div className="stat-widget-card">
          <div className="stat-icon-box teal"><FileText size={24} /></div>
          <div>
            <p className="stat-info-p">Tổng số bài viết</p>
            {statsLoading ? (
              <div className="skeleton" style={{ height: '1.5rem', width: '60px', marginTop: '0.25rem' }}></div>
            ) : (
              <h3 className="stat-info-h3">{stats.totalArticles}</h3>
            )}
          </div>
        </div>
        <div className="stat-widget-card">
          <div className="stat-icon-box blue"><Eye size={24} /></div>
          <div>
            <p className="stat-info-p">Tổng lượt xem</p>
            {statsLoading ? (
              <div className="skeleton" style={{ height: '1.5rem', width: '80px', marginTop: '0.25rem' }}></div>
            ) : (
              <h3 className="stat-info-h3">{(stats?.viewsThisMonth || 0).toLocaleString()}</h3>
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="status-tabs">
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
        <div className="search-box-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm bài viết..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {/* Article Table */}
      <div className="article-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>STT</th>
              <th style={{ minWidth: '300px' }}>Tiêu đề bài viết</th>
              <th>Gói truy cập</th>
              <th>Trạng thái</th>
              <th onClick={() => handleSort('viewCount')}>
                <div className="sortable-header">
                  Lượt xem
                  {sortBy === 'viewCount' && (sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />)}
                </div>
              </th>
              <th onClick={() => handleSort('id')}>
                <div className="sortable-header">
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
                    <div className="skeleton" style={{ height: '14px', width: '150px' }}></div>
                  </td>
                  <td><div className="skeleton" style={{ height: '24px', width: '80px', borderRadius: '6px' }}></div></td>
                  <td><div className="skeleton" style={{ height: '24px', width: '100px', borderRadius: '20px' }}></div></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '100px' }}></div></td>
                  <td style={{ textAlign: 'right' }}><div className="skeleton" style={{ height: '32px', width: '120px', marginLeft: 'auto' }}></div></td>
                </tr>
              ))
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Không tìm thấy bài viết nào.</td>
              </tr>
            ) : articles.map((article, index) => (
              <tr key={article.id}>
                <td style={{ color: 'var(--muted)' }}>{page * pageSize + index + 1}</td>
                <td>
                    <div className="article-title-cell" title={article.title}>
                      {article.title}
                    </div>
                    <div className="article-category-hint">Chuyên mục: {CATEGORY_LABELS[article.category] || article.category}</div>
                </td>
                <td>
                  {article.requiredTier === 'PREMIUM' ? (
                    <span className="tier-badge premium">
                      <Crown size={12} /> PREMIUM
                    </span>
                  ) : article.requiredTier === 'VIP' ? (
                    <span className="tier-badge vip">
                      <Star size={12} fill="#0ea5e9" /> VIP
                    </span>
                  ) : (
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Miễn phí</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${article.status === 'PUBLISHED' ? 'published' : article.status === 'ARCHIVED' ? 'archived' : 'draft'}`}>
                    {article.status === 'PUBLISHED' ? 'Đã xuất bản' : article.status === 'ARCHIVED' ? 'Đã lưu trữ' : 'Bản nháp'}
                  </span>
                </td>
                <td>
                   <div className="view-count-cell">
                      <Eye size={14} color="var(--muted)" />
                      {(article.viewCount || 0).toLocaleString()}
                   </div>
                </td>
                <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td>
                  <div className="actions-cell-wrapper">
                    {/* Edit Button */}
                    {article.status !== 'PUBLISHED' ? (
                      <Link 
                        to={`/admin/articles/edit/${article.id}`}
                        title="Chỉnh sửa"
                        className="btn-action-icon"
                      >
                        <Edit2 size={18} />
                      </Link>
                    ) : (
                      <div 
                        title="Không thể sửa bài đã xuất bản. Hãy lưu trữ để sửa."
                        className="btn-action-icon disabled"
                      >
                        <Edit2 size={18} />
                      </div>
                    )}

                    {/* Delete Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(article); }}
                      title={article.status === 'DRAFT' ? "Xóa" : "Không thể xóa bài đã xuất bản/lưu trữ"}
                      className={`btn-action-icon ${article.status === 'DRAFT' ? 'delete' : 'disabled'}`}
                    >
                      <Trash2 size={18} />
                    </button>

                    {/* Status Menu (3 dots) */}
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === article.id ? null : article.id); }}
                        title="Tùy chọn trạng thái"
                        className={`menu-trigger-btn ${activeMenuId === article.id ? 'active' : ''}`}
                      >
                        <MoreVertical size={20} />
                      </button>

                      {activeMenuId === article.id && (
                        <div className="dropdown-menu-container" style={{
                          ...(index >= articles.length - 3 && articles.length > 3 
                            ? { bottom: '100%', marginBottom: '0.5rem' } 
                            : { top: '100%', marginTop: '0.5rem' }
                          )
                        }}>
                          {article.status === 'DRAFT' && (
                            <button onClick={() => handlePublish(article.id)} className="dropdown-menu-item" style={{ color: 'var(--teal-dark)' }}>
                              <Plus size={16} /> Xuất bản bài viết
                            </button>
                          )}
                          {article.status === 'PUBLISHED' && (
                            <button onClick={() => handleArchive(article.id)} className="dropdown-menu-item" style={{ color: '#d69e2e' }}>
                              <Archive size={16} /> Lưu trữ bài viết
                            </button>
                          )}
                          {article.status === 'ARCHIVED' && (
                            <button onClick={() => handleUnarchive(article.id)} className="dropdown-menu-item" style={{ color: '#3182ce' }}>
                              <RotateCcw size={16} /> Khôi phục bài viết
                            </button>
                          )}
                          <div className="dropdown-divider"></div>
                          <button onClick={() => handleViewDetail(article)} className="dropdown-menu-item" style={{ color: 'var(--muted)' }}>
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
          <div className="pagination-container">
            <button 
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="pagination-arrow"
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
                  <button key={0} onClick={() => setPage(0)} className="pagination-btn">1</button>
                );
                if (start > 1) pages.push(<span key="sp1" style={{ color: 'var(--muted)', padding: '0 0.5rem' }}>...</span>);
              }

              for (let i = start; i <= end; i++) {
                pages.push(
                  <button 
                    key={i} 
                    onClick={() => setPage(i)}
                    className={`pagination-btn ${page === i ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                );
              }

              if (end < totalPages - 1) {
                if (end < totalPages - 2) pages.push(<span key="sp2" style={{ color: 'var(--muted)', padding: '0 0.5rem' }}>...</span>);
                pages.push(
                  <button key={totalPages - 1} onClick={() => setPage(totalPages - 1)} className="pagination-btn">
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}

            <button 
              disabled={page === totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="pagination-arrow"
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
      {showDetailModal && selectedArticle && (
        <div className="detail-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="detail-modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="detail-modal-header-info">
                <h2>Chi tiết bài viết</h2>
                <p>Chế độ xem nhanh - Bản chính thức</p>
              </div>
              <button className="detail-modal-close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="detail-modal-main-card">
              {detailLoading ? (
                <div className="detail-modal-loading">
                  <Loader2 className="animate-spin" size={40} color="#1a1a4b" />
                  <p>Đang tải nội dung...</p>
                </div>
              ) : (
                <ArticleRenderer article={selectedArticle} isPreview={true} />
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
