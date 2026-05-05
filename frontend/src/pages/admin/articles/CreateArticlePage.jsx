import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  ArrowLeft,
  Image as ImageIcon, 
  Eye, 
  Target,
  Send,
  X,
  Upload,
  Loader2,
  ChevronDown,
  Info,
  ChevronLeft,
  Star
} from 'lucide-react';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ConfirmModal from '../../../components/ConfirmModal';
import ArticleRenderer from '../../../components/ArticleRenderer/ArticleRenderer';
import './CreateArticlePage.css';

export default function CreateArticlePage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const quillRef = useRef(null);
  
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        toast.loading('Đang tải ảnh lên...', { id: 'quill-upload' });
        const response = await adminApi.uploadImage(formData);
        const { url } = response.data;

        if (quillRef.current) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection() || { index: quill.getLength() - 1 };
          const imgIndex = range.index;

          // Insert image
          quill.insertEmbed(imgIndex, 'image', url);

          // Insert a newline then a caption placeholder below the image
          const captionIndex = imgIndex + 1;
          const captionText = 'Chú thích ảnh...';
          quill.insertText(captionIndex, '\n', {});
          quill.insertText(captionIndex + 1, captionText, { italic: true, color: '#718096' });
          // formatLine centers the entire paragraph
          quill.formatLine(captionIndex + 1, captionText.length, { align: 'center' });

          // Select the placeholder so user can type immediately to replace
          quill.setSelection(captionIndex + 1, captionText.length);
        }
        toast.success('Tải ảnh lên thành công', { id: 'quill-upload' });
      } catch (error) {
        console.error('Error uploading image to editor:', error);
        toast.error('Không thể tải ảnh lên.', { id: 'quill-upload' });
      }
    };
  }, []);


  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
  }), [imageHandler]);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'align',
    'color', 'background',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const hasMounted = useRef(false); // Guard against StrictMode double-invoke
  const [imageMenu, setImageMenu] = useState(null);

  // Floating Image Menu Handlers
  useEffect(() => {
    if (!initialLoaded || !quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const root = editor.root;

    const handleEditorClick = (e) => {
      if (e.target.tagName === 'IMG') {
        const rect = e.target.getBoundingClientRect();
        const container = root.closest('.article-quill-editor');
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        
        let menuTop = rect.top - containerRect.top - 55;
        // If image is at the very top, show menu below it
        if (menuTop < 0) {
          menuTop = rect.bottom - containerRect.top + 10;
        }

        setImageMenu({
          target: e.target,
          top: menuTop,
          left: rect.left - containerRect.left + rect.width / 2
        });

        // Force selection in Quill to make Delete/Backspace work
        try {
          const blot = editor.constructor.find(e.target);
          if (blot) {
            const index = editor.getIndex(blot);
            editor.setSelection(index, 1);
          }
        } catch (err) {
          console.error("Selection error", err);
        }
      } else {
        setImageMenu(null);
      }
    };

    const handleScroll = () => setImageMenu(null);

    root.addEventListener('click', handleEditorClick);
    root.addEventListener('scroll', handleScroll);
    return () => {
      root.removeEventListener('click', handleEditorClick);
      root.removeEventListener('scroll', handleScroll);
    };
  }, [initialLoaded]);

  const handleDeleteInlineImage = () => {
    if (!imageMenu || !quillRef.current) return;
    const editor = quillRef.current.getEditor();
    try {
      const blot = editor.constructor.find(imageMenu.target);
      if (blot) {
        const index = editor.getIndex(blot);
        editor.deleteText(index, 1);
        toast.success('Đã xóa ảnh');
      }
    } catch (err) {
      console.error("Delete error", err);
    }
    setImageMenu(null);
  };

  // Modals for guards
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Article State
  const [articleData, setArticleData] = useState({
    title: '',
    content: '',
    category: 'EDUCATION',
    thumbnailUrl: '',
    thumbnailPublicId: '',
    requiredTier: 'FREE',
    status: 'DRAFT'
  });

  const [tiers, setTiers] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, tiersRes] = await Promise.all([
          adminApi.getArticleCategories(),
          adminApi.getArticleTiers()
        ]);

        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data);
        }

        if (tiersRes.data.success) {
          setTiers(tiersRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching meta data:', error);
        toast.error('Không thể tải dữ liệu cấu hình.');
      }
    };

    loadData();

    if (hasMounted.current) return;
    hasMounted.current = true;

    if (isEdit) {
      fetchArticleDetail();
    } else {
      // Load draft from localStorage if creating new
      const savedDraft = localStorage.getItem('ARTICLE_CREATE_DRAFT');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setArticleData(prev => ({ ...prev, ...parsed }));
          setTimeout(() => setInitialLoaded(true), 500);
          toast.success('Đã khôi phục bản nháp chưa lưu');
        } catch (e) {
          console.error("Error loading draft", e);
          setInitialLoaded(true);
        }
      } else {
        setInitialLoaded(true);
      }
    }
  }, [id]);

  // Auto-save draft for NEW articles
  useEffect(() => {
    if (!isEdit && isDirty) {
      const timer = setTimeout(() => {
        localStorage.setItem('ARTICLE_CREATE_DRAFT', JSON.stringify(articleData));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [articleData, isDirty, isEdit]);

  // Browser close/reload guard
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Navigation guard (React Router)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowExitModal(true);
    }
  }, [blocker]);

  const fetchArticleDetail = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getArticleDetail(id);
      if (response.data.success) {
        const article = response.data.data;
        setArticleData({
          title: article.title,
          content: article.content,
          category: article.category,
          thumbnailUrl: article.thumbnailUrl,
          thumbnailPublicId: article.thumbnailPublicId,
          requiredTier: article.requiredTier || 'FREE',
          status: article.status
        });
        setTimeout(() => setInitialLoaded(true), 500); // Allow Quill to initialize
      }
    } catch (error) {
      console.error('Error fetching article detail:', error);
      toast.error('Không thể tải thông tin bài viết.');
      setInitialLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    if (!initialLoaded) return; // Prevent initial change from setting dirty
    setArticleData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh.');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await adminApi.uploadImage(formData);
      const { url, public_id } = response.data;
      
      setArticleData(prev => ({
        ...prev,
        thumbnailUrl: url,
        thumbnailPublicId: public_id
      }));
      setIsDirty(true);
      toast.success('Tải ảnh lên thành công!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Không thể tải ảnh lên.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteThumbnail = (e) => {
    e.stopPropagation();
    setArticleData(prev => ({
      ...prev,
      thumbnailUrl: '',
      thumbnailPublicId: ''
    }));
    setIsDirty(true);
    toast.success('Đã xóa ảnh bìa');
  };

  const handleSubmit = async () => {
    if (!articleData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài viết.');
      return;
    }
    if (!articleData.content.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết.');
      return;
    }

    setShowSaveModal(true);
  };

  const executeSubmit = async () => {
    setShowSaveModal(false);
    try {
      setSubmitting(true);
      const payload = {
        title: articleData.title,
        content: articleData.content,
        category: articleData.category,
        thumbnailUrl: articleData.thumbnailUrl,
        thumbnailPublicId: articleData.thumbnailPublicId,
        requiredTier: articleData.requiredTier
      };

      if (isEdit) {
        await adminApi.updateArticle(id, payload);
        toast.success('Cập nhật bài viết thành công!');
      } else {
        await adminApi.createArticle(payload);
        toast.success('Đã tạo bài viết thành công dưới dạng bản nháp!');
        localStorage.removeItem('ARTICLE_CREATE_DRAFT');
      }
      setIsDirty(false);
      // We need a small delay or use a ref to ensure the blocker doesn't catch the navigate
      setTimeout(() => navigate('/admin/articles'), 100);
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <Loader2 className="animate-spin" size={48} color="#1a1a4b" />
        <p>Đang tải thông tin bài viết...</p>
      </div>
    );
  }

  return (
    <div className="article-editor-container">
      {/* Header */}
      <header className="create-article-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/admin/articles')}
            className="btn-back-square"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="header-title-section">
            <h1>{isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài nghiên cứu mới'}</h1>
            <div className="header-breadcrumb">
              <span>ADMIN</span>
              <ChevronRight size={14} />
              <span>KHO LƯU TRỮ</span>
              <ChevronRight size={14} />
              <span className="breadcrumb-active">{isEdit ? 'CẬP NHẬT' : 'TẠO MỚI'}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowPreviewModal(true)}
            className="btn-preview-outline"
          >
            <Eye size={18} /> Xem thử
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting || (isEdit && articleData.status === 'PUBLISHED')}
            className="btn-save-primary"
          >
            <Send size={18} /> {submitting ? 'Đang lưu...' : (isEdit && articleData.status === 'PUBLISHED') ? 'Đã xuất bản (Khóa)' : isEdit ? 'Lưu thay đổi' : 'Lưu bản nháp'}
          </button>
        </div>
      </header>

      <div className="editor-main-layout">
        {/* Main Editor */}
        <div className="editor-content-card">
          {/* Image Upload Area */}
          <div 
            onClick={() => !uploadingImage && fileInputRef.current?.click()}
            className={`thumbnail-upload-area ${!articleData.thumbnailUrl ? 'empty' : ''} ${uploadingImage ? 'uploading' : ''}`}
            style={articleData.thumbnailUrl ? { background: `url(${articleData.thumbnailUrl}) center/cover` } : {}}
          >
            {!articleData.thumbnailUrl && !uploadingImage && (
              <>
                <div className="thumbnail-placeholder-icon">
                  <ImageIcon size={36} color="#1a1a4b" />
                </div>
                <p className="thumbnail-upload-text">Tải lên ảnh bìa bài viết</p>
                <p className="thumbnail-upload-hint">Tỷ lệ 21:9 được khuyến nghị</p>
              </>
            )}
            {uploadingImage && (
              <div style={{ textAlign: 'center' }}>
                <Loader2 className="animate-spin" size={32} color="#1a1a4b" />
                <p style={{ marginTop: '0.5rem', fontWeight: '600', color: '#1a1a4b' }}>Đang tải ảnh...</p>
              </div>
            )}
            {articleData.thumbnailUrl && !uploadingImage && (
              <div className="thumbnail-actions-overlay">
                <button 
                  onClick={handleDeleteThumbnail}
                  title="Xóa ảnh bìa"
                  className="btn-delete-thumbnail"
                >
                  <X size={20} />
                </button>
                <div className="thumbnail-change-badge">
                  <Upload size={16} /> Thay đổi ảnh bìa
                </div>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
          </div>

          {/* Title */}
          <textarea 
            placeholder="Tiêu đề bài nghiên cứu của bạn..." 
            value={articleData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="article-title-textarea"
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
          <div className="title-underline-decoration"></div>

          {/* Content Area - React Quill */}
          <div className="article-quill-editor" style={{ marginTop: '1rem', position: 'relative' }}>
            <ReactQuill 
              ref={quillRef}
              theme="snow"
              value={articleData.content}
              onChange={(content) => handleFieldChange('content', content)}
              modules={modules}
              formats={formats}
              placeholder="Bắt đầu viết nội dung nghiên cứu tại đây..."
              style={{ height: '500px', marginBottom: '50px' }}
            />

            {imageMenu && (
              <div className="image-menu-floating" style={{
                top: imageMenu.top,
                left: imageMenu.left
              }}>
                <span className="image-menu-title">ẢNH ĐÃ CĂN GIỮA</span>
                <div className="image-menu-divider"></div>
                <ImageMenuButton onClick={handleDeleteInlineImage} title="Xóa ảnh" isDelete>
                  <X size={16} /> <span className="btn-img-menu-text">Xóa</span>
                </ImageMenuButton>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="editor-sidebar">
          {/* Settings Card */}
          <div className="sidebar-settings-card">
            <div className="card-title-row">
              <div className="card-icon-box">
                <Info size={20} />
              </div>
              <h3>Cấu hình bài viết</h3>
            </div>

            <div className="settings-group">
              {/* Category */}
              <div>
                <label className="field-label">Chuyên mục</label>
                <div className="select-wrapper">
                  <select 
                    value={articleData.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className="admin-select"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="select-icon-absolute" />
                </div>
              </div>

              {/* Subscription Tier Selection */}
              <div>
                <label className="field-label">Gói truy cập</label>
                <div className="select-wrapper">
                  <select 
                    value={articleData.requiredTier}
                    onChange={(e) => handleFieldChange('requiredTier', e.target.value)}
                    className="admin-select"
                    style={{ 
                      background: articleData.requiredTier === 'FREE' ? '#f8fafc' : (articleData.requiredTier === 'VIP' ? '#f0f9ff' : '#fff9db'),
                      borderLeft: articleData.requiredTier === 'FREE' ? '1px solid #edf2f7' : (articleData.requiredTier === 'VIP' ? '4px solid #0ea5e9' : '4px solid #fcc419')
                    }}
                  >
                    {tiers.map(tier => (
                      <option key={tier.value} value={tier.value}>{tier.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="select-icon-absolute" />
                </div>
                <p className="field-hint">
                  {articleData.requiredTier === 'FREE' && "Mọi người đều có thể xem bài viết này."}
                  {articleData.requiredTier === 'VIP' && "Chỉ thành viên gói VIP hoặc Premium mới có thể xem."}
                  {articleData.requiredTier === 'PREMIUM' && "Chỉ thành viên gói Premium mới có thể xem."}
                </p>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <section className="tips-sidebar-section">
            <div className="tips-header-row">
              <div className="tips-icon-box">
                <Target size={20} color="#4361ee" />
              </div>
              <h3>Mẹo viết bài</h3>
            </div>
            <ul className="tips-list">
              <li>Sử dụng ngôn ngữ khách quan, dựa trên dữ liệu.</li>
              <li>Ảnh bìa đẹp giúp tăng 40% tỷ lệ nhấn vào đọc.</li>
              <li>Phân cấp các đề mục rõ ràng để người đọc dễ theo dõi.</li>
              <li>Hệ thống tự động lưu bản nháp mỗi 3 giây.</li>
            </ul>
          </section>
        </div>
      </div>

      {/* Navigation Guard Modal */}
      <ConfirmModal 
        isOpen={showExitModal}
        title="Rời khỏi trang?"
        message="Bạn có những thay đổi chưa lưu. Nếu rời đi bây giờ, các thay đổi sẽ bị mất."
        type="warning"
        onClose={() => {
          setShowExitModal(false);
          blocker.reset?.();
        }}
        onConfirm={() => {
          setShowExitModal(false);
          blocker.proceed?.();
        }}
      />

      {/* Save Confirmation Modal */}
      <ConfirmModal 
        isOpen={showSaveModal}
        title={isEdit ? "Xác nhận cập nhật" : "Xác nhận tạo mới"}
        message={isEdit ? "Bạn có chắc chắn muốn lưu các thay đổi cho bài viết này?" : "Hệ thống sẽ tạo một bản nháp cho bài viết này. Bạn có muốn tiếp tục?"}
        type="success"
        onClose={() => setShowSaveModal(false)}
        onConfirm={executeSubmit}
      />

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="detail-modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="detail-modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="detail-modal-header-info">
                <h2>Xem trước bài viết</h2>
                <p>Giao diện hiển thị với người dùng (Customer View)</p>
              </div>
              <button className="detail-modal-close-btn" onClick={() => setShowPreviewModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="detail-modal-main-card">
              <ArticleRenderer article={articleData} isPreview={true} />
            </div>
            
            <p className="detail-modal-footer-hint">
              Nhấn ra ngoài hoặc nút [X] để quay lại chỉnh sửa
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


function ImageMenuButton({ children, onClick, title, isDelete }) {
  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className={`btn-img-menu ${isDelete ? 'delete' : ''}`}
      style={!isDelete ? { color: 'white' } : { color: '#ff4d4f' }}
    >
      {children}
    </button>
  );
}

function ChevronRight({ size }) {
  return <ChevronLeft size={size} style={{ transform: 'rotate(180deg)', opacity: 0.5 }} />;
}
