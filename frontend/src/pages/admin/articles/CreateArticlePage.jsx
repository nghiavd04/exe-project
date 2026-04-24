import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft,
  Image as ImageIcon, 
  Bold, 
  Italic, 
  Underline, 
  List as ListIcon, 
  ListOrdered, 
  Quote, 
  AlignLeft, 
  Sigma, 
  Table as TableIcon, 
  Link as LinkIcon, 
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

const QUILL_STYLE = `
  .article-quill-editor .ql-container {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    font-family: inherit;
    font-size: 1.1rem;
    background: #fff;
  }
  .article-quill-editor .ql-toolbar {
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    background: #f8fafc;
    border-color: #edf2f7 !important;
  }
  .article-quill-editor .ql-container {
    border-color: #edf2f7 !important;
  }
  .article-quill-editor .ql-editor {
    min-height: 450px;
    line-height: 1.8;
    color: #2d3748;
  }
  .article-quill-editor .ql-editor.ql-blank::before {
    color: #a0aec0;
    font-style: normal;
  }
`;

export default function CreateArticlePage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false); // New: track if data is initially loaded

  // Modals for guards
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Article State
  const [articleData, setArticleData] = useState({
    title: '',
    content: '',
    category: 'EDUCATION',
    thumbnailUrl: '',
    thumbnailPublicId: '',
    premium: false,
    status: 'DRAFT'
  });

  const categories = [
    { value: 'EDUCATION', label: 'Giáo dục' },
    { value: 'SCIENCE', label: 'Khoa học' },
    { value: 'TECHNOLOGY', label: 'Công nghệ' },
    { value: 'HEALTH', label: 'Sức khỏe' },
    { value: 'PSYCHOLOGY', label: 'Tâm lý học' }
  ];

  useEffect(() => {
    if (isEdit) {
      fetchArticleDetail();
    } else {
      // Load draft from localStorage if creating new
      const savedDraft = localStorage.getItem('ARTICLE_CREATE_DRAFT');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setArticleData(prev => ({ ...prev, ...parsed }));
          setTimeout(() => setInitialLoaded(true), 500); // Wait for Quill to render
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
          premium: article.isPremium,
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
        premium: articleData.premium
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={48} color="#1a1a4b" />
        <p style={{ color: 'var(--muted)', fontWeight: '600' }}>Đang tải thông tin bài viết...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <style>{QUILL_STYLE}</style>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/admin/articles')}
            style={{ 
              background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: '10px', 
              padding: '0.5rem', cursor: 'pointer', color: '#1a1a4b' 
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#1a1a4b' }}>{isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài nghiên cứu mới'}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              <span>ADMIN</span>
              <ChevronRight size={14} />
              <span>KHO LƯU TRỮ</span>
              <ChevronRight size={14} />
              <span style={{ color: '#4361ee', fontWeight: '600' }}>{isEdit ? 'CẬP NHẬT' : 'TẠO MỚI'}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => toast('Tính năng xem trước đang phát triển')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', 
              borderRadius: '12px', border: '1px solid #edf2f7', background: 'white', 
              fontWeight: '700', color: '#4a5568', cursor: 'pointer' 
            }}
          >
            <Eye size={18} /> Xem thử
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting || (isEdit && articleData.status === 'PUBLISHED')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.75rem 1.25rem', 
              borderRadius: '12px', 
              border: 'none', 
              background: '#1a1a4b', 
              fontWeight: '700', 
              color: 'white',
              cursor: (submitting || (isEdit && articleData.status === 'PUBLISHED')) ? 'not-allowed' : 'pointer',
              opacity: (submitting || (isEdit && articleData.status === 'PUBLISHED')) ? 0.7 : 1
            }}
          >
            <Send size={18} /> {submitting ? 'Đang lưu...' : (isEdit && articleData.status === 'PUBLISHED') ? 'Đã xuất bản (Khóa)' : isEdit ? 'Lưu thay đổi' : 'Lưu bản nháp'}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Main Editor */}
        <div style={{ flex: 1, background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          {/* Image Upload Area */}
          <div 
            onClick={() => !uploadingImage && fileInputRef.current?.click()}
            style={{ 
              width: '100%', 
              height: '300px', 
              background: articleData.thumbnailUrl ? `url(${articleData.thumbnailUrl}) center/cover` : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
              borderRadius: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: articleData.thumbnailUrl ? 'none' : '2px dashed #e2e8f0',
              marginBottom: '2.5rem',
              cursor: uploadingImage ? 'not-allowed' : 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {!articleData.thumbnailUrl && !uploadingImage && (
              <>
                <div style={{ background: 'white', padding: '1.25rem', borderRadius: '50%', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '1rem' }}>
                  <ImageIcon size={36} color="#1a1a4b" />
                </div>
                <p style={{ margin: 0, fontWeight: '800', color: '#1a1a4b' }}>Tải lên ảnh bìa bài viết</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>Tỷ lệ 21:9 được khuyến nghị</p>
              </>
            )}
            {uploadingImage && (
              <div style={{ textAlign: 'center' }}>
                <Loader2 className="animate-spin" size={32} color="#1a1a4b" />
                <p style={{ marginTop: '0.5rem', fontWeight: '600', color: '#1a1a4b' }}>Đang tải ảnh...</p>
              </div>
            )}
            {articleData.thumbnailUrl && !uploadingImage && (
              <div style={{ position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(255,255,255,0.95)', padding: '0.5rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.8rem', color: '#1a1a4b', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Upload size={16} /> Thay đổi ảnh
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
          </div>

          {/* Title */}
          <textarea 
            placeholder="Tiêu đề bài nghiên cứu của bạn..." 
            value={articleData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            style={{ 
              width: '100%', 
              border: 'none', 
              outline: 'none', 
              fontSize: '2.5rem', 
              fontWeight: '900', 
              color: '#1a1a4b',
              marginBottom: '1rem',
              resize: 'none',
              fontFamily: '"Outfit", sans-serif',
              lineHeight: '1.2',
              whiteSpace: 'pre-wrap'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
          <div style={{ width: '80px', height: '6px', background: '#4361ee', marginBottom: '2.5rem', borderRadius: '3px' }}></div>

          {/* Toolbar (Removed manual toolbar) */}

          {/* Content Area - React Quill */}
          <div className="article-quill-editor" style={{ marginTop: '1rem' }}>
            <ReactQuill 
              theme="snow"
              value={articleData.content}
              onChange={(content) => handleFieldChange('content', content)}
              modules={modules}
              formats={formats}
              placeholder="Bắt đầu viết nội dung nghiên cứu tại đây..."
              style={{ height: '500px', marginBottom: '50px' }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: '340px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Settings Card */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f0f4ff', color: '#1a1a4b', padding: '0.5rem', borderRadius: '10px' }}>
                <Info size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Cấu hình bài viết</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '0.5rem' }}>Chuyên mục</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={articleData.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    style={{ 
                      width: '100%', padding: '0.85rem 1.25rem', borderRadius: '12px', 
                      border: '1px solid #edf2f7', outline: 'none', background: '#f8fafc',
                      appearance: 'none', fontWeight: '600', color: '#1a1a4b', cursor: 'pointer'
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#718096' }} />
                </div>
              </div>

              {/* Premium Toggle */}
              <div 
                onClick={() => handleFieldChange('premium', !articleData.premium)}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '1rem', borderRadius: '16px', 
                  background: articleData.premium ? '#fff9db' : '#f8fafc',
                  border: articleData.premium ? '1px solid #fcc419' : '1px solid #edf2f7',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: articleData.premium ? '#fcc419' : '#e2e8f0', color: 'white', padding: '0.4rem', borderRadius: '8px' }}>
                    <Star size={16} fill={articleData.premium ? "white" : "none"} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#1a1a4b' }}>Nội dung Premium</p>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#718096' }}>Chỉ dành cho hội viên</p>
                  </div>
                </div>
                <div style={{ 
                  width: '40px', height: '22px', background: articleData.premium ? '#1a1a4b' : '#cbd5e0', 
                  borderRadius: '11px', position: 'relative', transition: '0.3s'
                }}>
                  <div style={{ 
                    width: '16px', height: '16px', background: 'white', borderRadius: '50%', 
                    position: 'absolute', top: '3px', left: articleData.premium ? '21px' : '3px',
                    transition: '0.3s'
                  }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <section style={{ background: '#1a1a4b', padding: '1.75rem', borderRadius: '24px', color: 'white', boxShadow: '0 10px 30px rgba(26, 26, 75, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '10px' }}>
                <Target size={20} color="#4361ee" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Mẹo viết bài</h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', opacity: 0.9 }}>
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
    </div>
  );
}

function ToolbarButton({ icon }) {
  return (
    <button style={{ 
      background: 'none', border: 'none', padding: '0.5rem', borderRadius: '8px', 
      cursor: 'pointer', color: '#4a5568', display: 'flex', alignItems: 'center', 
      justifyContent: 'center' 
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'white'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
    >
      {icon}
    </button>
  );
}

function ChevronRight({ size }) {
  return <ChevronLeft size={size} style={{ transform: 'rotate(180deg)', opacity: 0.5 }} />;
}
