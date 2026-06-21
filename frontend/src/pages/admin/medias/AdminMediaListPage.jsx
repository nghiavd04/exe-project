import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, MoreVertical, 
  ChevronLeft, ChevronRight, PlayCircle, Music, Film, CheckCircle2, 
  XCircle, CloudUpload, Trash
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';
import './AdminMediaListPage.css';

export default function AdminMediaListPage() {
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Form States
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMediaType, setFormMediaType] = useState('AUDIO');
  const [formTargetTier, setFormTargetTier] = useState('PREMIUM');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [formPublicId, setFormPublicId] = useState('');
  const [formDayNumber, setFormDayNumber] = useState('');
  
  // Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Confirm Modal for Deletion
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchMedias();
  }, [page, filterType, filterTier]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchMedias = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        search: search || undefined,
        type: filterType || undefined,
        tier: filterTier || undefined
      };
      const response = await adminApi.getMedias(params);
      if (response.data.success) {
        setMedias(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
        setPageSize(response.data.data.size || 10);
      }
    } catch (err) {
      toast.error('Không thể tải danh sách tài nguyên đa phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      setPage(0);
      fetchMedias();
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedMedia(null);
    setFormTitle('');
    setFormDescription('');
    setFormMediaType('AUDIO');
    setFormTargetTier('PREMIUM');
    setFormMediaUrl('');
    setFormPublicId('');
    setFormDayNumber('');
    setUploadProgress(0);
    setUploading(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (media) => {
    setSelectedMedia(media);
    setFormTitle(media.title || '');
    setFormDescription(media.description || '');
    setFormMediaType(media.mediaType || 'AUDIO');
    setFormTargetTier(media.targetTier || 'PREMIUM');
    setFormMediaUrl(media.mediaUrl || '');
    setFormPublicId(media.publicId || '');
    setFormDayNumber(media.dayNumber !== null ? String(media.dayNumber) : '');
    setUploadProgress(100);
    setUploading(false);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteMedia = (media) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa tài nguyên',
      message: `Bạn có chắc chắn muốn xóa tài nguyên "${media.title}"? Thao tác này sẽ tự động giải phóng tệp tin trên Cloudinary.`,
      onConfirm: async () => {
        try {
          await adminApi.deleteMedia(media.id);
          toast.success('Đã xóa tài nguyên thành công');
          fetchMedias();
        } catch (err) {
          toast.error('Gặp lỗi khi xóa tài nguyên');
        }
      }
    });
    setActiveMenuId(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm định định dạng file ở client
    if (formMediaType === 'AUDIO' && !file.type.startsWith('audio/')) {
      toast.error('Vui lòng chọn tệp tin âm thanh (MP3, WAV, M4A...)');
      return;
    }
    if (formMediaType === 'VIDEO' && !file.type.startsWith('video/')) {
      toast.error('Vui lòng chọn tệp tin video (MP4, MOV...)');
      return;
    }

    // Giới hạn kích thước file ở client (Audio: 25MB, Video: 100MB)
    const limit = formMediaType === 'AUDIO' ? 25 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > limit) {
      toast.error(`Kích thước file vượt quá giới hạn cho phép (${formMediaType === 'AUDIO' ? '25MB' : '100MB'})`);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setUploadProgress(0);
      
      const res = await adminApi.uploadMediaFile(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      if (res.data.success) {
        const secureUrl = res.data.data.secure_url;
        const pubId = res.data.data.public_id;
        setFormMediaUrl(secureUrl);
        setFormPublicId(pubId);
        toast.success('Upload tệp tin lên Cloudinary thành công!');
      } else {
        toast.error('Không thể upload tệp tin');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi upload tệp tin');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleClearUploadedFile = () => {
    setFormMediaUrl('');
    setFormPublicId('');
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    if (!formMediaUrl.trim()) {
      toast.error(formTargetTier === 'BASIC' ? 'Vui lòng nhập đường dẫn Youtube URL' : 'Vui lòng upload tệp tin âm thanh/video');
      return;
    }

    const payload = {
      title: formTitle,
      description: formDescription,
      mediaType: formMediaType,
      targetTier: formTargetTier,
      mediaUrl: formMediaUrl,
      publicId: formTargetTier === 'BASIC' ? null : formPublicId,
      dayNumber: formDayNumber.trim() ? parseInt(formDayNumber, 10) : null
    };

    try {
      if (selectedMedia) {
        await adminApi.updateMedia(selectedMedia.id, payload);
        toast.success('Cập nhật tài nguyên thành công');
      } else {
        await adminApi.createMedia(payload);
        toast.success('Tạo mới tài nguyên thành công');
      }
      setIsModalOpen(false);
      fetchMedias();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể lưu tài nguyên');
    }
  };

  // Remove client side filtering since it's done on server

  return (
    <div className="admin-page">
      <div className="media-breadcrumb">
        <Link to="/admin">QUẢN TRỊ</Link>
        <ChevronRight size={14} style={{ opacity: 0.5 }} />
        <span>QUẢN LÝ TÀI NGUYÊN AUDIO/VIDEO</span>
      </div>

      <header className="media-header">
        <div>
          <h1>Thư Viện Audio/Video</h1>
          <p>Quản lý các bài thiền, podcast và video chánh niệm cho các gói dịch vụ.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="btn-create-media"
        >
          <Plus size={20} /> Thêm tài nguyên mới
        </button>
      </header>

      {/* Filters & Search */}
      <div className="media-filters-row">
        <div className="search-media-wrapper">
          <Search className="search-media-icon" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tiêu đề, mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKey}
            className="search-media-input"
          />
        </div>

        <div className="filter-select-wrapper">
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(0); }} className="filter-select">
            <option value="">Tất cả loại file</option>
            <option value="AUDIO">AUDIO (Thiền/Nhạc)</option>
            <option value="VIDEO">VIDEO (Phim ngắn/Hướng dẫn)</option>
            <option value="PODCAST">PODCAST (Audio chia sẻ)</option>
          </select>

          <select value={filterTier} onChange={(e) => { setFilterTier(e.target.value); setPage(0); }} className="filter-select">
            <option value="">Tất cả các gói</option>
            <option value="BASIC">BASIC (Cơ bản - Youtube)</option>
            <option value="PREMIUM">PREMIUM (Cao cấp - Cloudinary)</option>
            <option value="ELITE">ELITE (Thượng hạng - Cloudinary)</option>
          </select>
        </div>
      </div>

      {/* List Card */}
      <div className="media-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>STT</th>
              <th>Tiêu đề tài nguyên</th>
              <th>Loại file</th>
              <th>Gói giới hạn</th>
              <th>Ngày phác đồ</th>
              <th>Ngày tạo</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="7" style={{ padding: '1.25rem' }}>
                    <div className="skeleton" style={{ height: '40px', width: '100%', borderRadius: '8px' }}></div>
                  </td>
                </tr>
              ))
            ) : medias.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>
                  <Music size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                  <p>Không tìm thấy tài nguyên đa phương tiện nào.</p>
                </td>
              </tr>
            ) : medias.map((item, index) => (
              <tr key={item.id}>
                <td style={{ color: 'var(--muted)' }}>{page * pageSize + index + 1}</td>
                <td>
                  <div className="media-title-cell">
                    <span className="media-icon-wrapper">
                      {item.mediaType === 'AUDIO' ? <Music size={16} /> : item.mediaType === 'VIDEO' ? <Film size={16} /> : <PlayCircle size={16} />}
                    </span>
                    <div>
                      <div className="media-cell-name" title={item.title}>{item.title}</div>
                      <div className="media-cell-desc" title={item.description}>{item.description}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`media-type-badge ${item.mediaType?.toLowerCase()}`}>
                    {item.mediaType}
                  </span>
                </td>
                <td>
                  <span className={`media-tier-badge ${item.targetTier?.toLowerCase()}`}>
                    {item.targetTier === 'BASIC' ? 'BASIC (Youtube)' : item.targetTier === 'PREMIUM' ? 'PREMIUM (Upload)' : 'ELITE (Upload)'}
                  </span>
                </td>
                <td style={{ fontWeight: 'bold', color: 'var(--teal)' }}>
                  {item.dayNumber !== null ? `Ngày ${item.dayNumber}` : 'Chung'}
                </td>
                <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="actions-relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === item.id ? null : item.id); }}
                      className="btn-more-actions"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {activeMenuId === item.id && (
                      <div className="actions-dropdown-menu" style={{
                        [medias.length - index <= 2 && medias.length > 2 ? 'bottom' : 'top']: '100%'
                      }}>
                        <button onClick={() => handleOpenEditModal(item)} className="action-menu-item">
                          <Edit2 size={16} /> Sửa thông tin
                        </button>
                        <button onClick={() => handleDeleteMedia(item)} className="action-menu-item danger">
                          <Trash2 size={16} /> Xóa tài nguyên
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container" style={{ padding: '1.5rem', background: 'white', borderRadius: '0 0 16px 16px', borderTop: '1px solid #f1f5f9' }}>
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

      {/* Form Dialog Modal */}
      {isModalOpen && (
        <div className="plans-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="plans-modal-card modal-large animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="plans-modal-header">
              <h3>{selectedMedia ? 'Chỉnh sửa tài nguyên' : 'Thêm tài nguyên hỗ trợ mới'}</h3>
              <button className="plans-modal-close" onClick={() => setIsModalOpen(false)}>
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="media-form-body">
              <div className="form-group-row">
                <div className="form-group">
                  <label className="checkout-label">Tiêu đề tài nguyên</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Thiền định giảm căng thẳng buổi sáng"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="media-form-input"
                    required
                  />
                </div>
                
                <div className="form-group" style={{ maxWidth: '120px' }}>
                  <label className="checkout-label">Ngày phác đồ</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="120"
                    placeholder="Chung"
                    value={formDayNumber}
                    onChange={(e) => setFormDayNumber(e.target.value)}
                    className="media-form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkout-label">Mô tả chi tiết</label>
                <textarea 
                  placeholder="Nhập mô tả ngắn gọn giúp người dùng hiểu nội dung tài nguyên..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="media-form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="checkout-label">Loại tài nguyên</label>
                  <select 
                    value={formMediaType} 
                    onChange={(e) => setFormMediaType(e.target.value)} 
                    className="media-form-select"
                  >
                    <option value="AUDIO">AUDIO (Thiền/Nhạc)</option>
                    <option value="VIDEO">VIDEO (Bài học/Hướng dẫn)</option>
                    <option value="PODCAST">PODCAST (Audio chia sẻ)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkout-label">Áp dụng cho gói dịch vụ</label>
                  <select 
                    value={formTargetTier} 
                    onChange={(e) => {
                      const selectedTier = e.target.value;
                      setFormTargetTier(selectedTier);
                      // Reset URL if switching tier to basic
                      if (selectedTier === 'BASIC') {
                        setFormMediaUrl('');
                        setFormPublicId('');
                        setUploadProgress(0);
                      }
                    }} 
                    className="media-form-select"
                  >
                    <option value="BASIC">BASIC (Link Youtube)</option>
                    <option value="PREMIUM">PREMIUM (Tải file trực tiếp)</option>
                    <option value="ELITE">ELITE (Tải file trực tiếp)</option>
                  </select>
                </div>
              </div>

              {/* Media URL / Upload Area */}
              <div className="form-group media-upload-section">
                {formTargetTier === 'BASIC' ? (
                  <>
                    <label className="checkout-label">Đường dẫn Youtube URL</label>
                    <input 
                      type="url" 
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formMediaUrl}
                      onChange={(e) => setFormMediaUrl(e.target.value)}
                      className="media-form-input"
                      required
                    />
                  </>
                ) : (
                  <>
                    <label className="checkout-label">Tệp tin đa phương tiện (Upload lên Cloudinary)</label>
                    {formMediaUrl ? (
                      <div className="uploaded-file-preview">
                        <div className="file-info-col">
                          <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                          <div className="file-url-text" title={formMediaUrl}>
                            Tệp tin đã tải lên thành công: <span>{formMediaUrl.split('/').pop()}</span>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={handleClearUploadedFile}
                          className="btn-delete-file"
                          title="Xóa tệp tin"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="drag-drop-box">
                        <input 
                          type="file" 
                          id="media-file-picker" 
                          onChange={handleFileUpload} 
                          className="file-picker-hidden"
                          accept={formMediaType === 'AUDIO' ? 'audio/*' : 'video/*'}
                          disabled={uploading}
                        />
                        <label htmlFor="media-file-picker" className="drag-drop-label">
                          {uploading ? (
                            <div className="uploading-progress-wrapper">
                              <div className="plans-loader"></div>
                              <span style={{ fontWeight: 'bold' }}>Đang upload tệp tin... {uploadProgress}%</span>
                              <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                              </div>
                            </div>
                          ) : (
                            <>
                              <CloudUpload size={40} className="upload-cloud-icon" />
                              <span className="upload-action-text">Kéo thả hoặc Nhấp để chọn tệp tin</span>
                              <span className="upload-limit-text">
                                Hỗ trợ: {formMediaType === 'AUDIO' ? 'MP3, WAV, M4A tối đa 25MB' : 'MP4, MOV tối đa 100MB'}
                              </span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="plans-modal-footer">
                <button 
                  type="button"
                  className="btn-checkout-cancel" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={uploading}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="btn-checkout-submit" 
                  disabled={uploading || (!formMediaUrl)}
                >
                  Xác nhận lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type="danger"
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
      />
    </div>
  );
}
