import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  AlignCenter,
  AlignRight,
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
import ArticleRenderer from '../../../components/ArticleRenderer/ArticleRenderer';

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
  .article-quill-editor .ql-editor img {
    display: block;
    max-width: 100%;
    margin: 1rem auto;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transition: all 0.2s ease;
  }
  .article-quill-editor .ql-editor img:hover {
    outline: 3px solid #4361ee;
    box-shadow: 0 8px 24px rgba(67, 97, 238, 0.2);
    cursor: pointer;
  }
  /* Optional: Style for captions */
  .article-quill-editor .ql-editor p.ql-align-center {
    margin-top: -0.5rem;
    margin-bottom: 1.5rem;
  }
  .article-quill-editor .ql-editor p.ql-align-center em,
  .article-quill-editor .ql-editor p.ql-align-center i {
    display: block;
    font-size: 0.9rem;
    color: #718096;
    font-style: italic;
    margin-top: -1.2rem;
    margin-bottom: 2rem;
    padding: 0.5rem 1rem;
    border-bottom: 1px dashed #e2e8f0;
  }
`;

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

  const TIER_LABELS = {
    FREE: 'Miễn phí',
    VIP: 'Thành viên VIP',
    PREMIUM: 'Thành viên Premium'
  };

  const [tiers, setTiers] = useState([]);

  const CATEGORY_LABELS = {
    EDUCATION: 'Giáo dục',
    SCIENCE: 'Khoa học',
    TECHNOLOGY: 'Công nghệ',
    HEALTH: 'Sức khỏe',
    PSYCHOLOGY: 'Tâm lý học',
    LIFESTYLE: 'Lối sống'
  };

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, tiersRes] = await Promise.all([
          adminApi.getArticleCategories(),
          adminApi.getArticleTiers()
        ]);

        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data.map(cat => ({
            value: cat,
            label: CATEGORY_LABELS[cat] || cat
          })));
        }

        if (tiersRes.data.success) {
          setTiers(tiersRes.data.data.map(tier => ({
            value: tier,
            label: TIER_LABELS[tier] || tier
          })));
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
            onClick={() => setShowPreviewModal(true)}
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
              <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={handleDeleteThumbnail}
                  title="Xóa ảnh bìa"
                  style={{ 
                    background: 'rgba(255,255,255,0.9)', 
                    border: 'none', 
                    padding: '0.6rem', 
                    borderRadius: '10px', 
                    color: '#ef4444', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(4px)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                >
                  <X size={20} />
                </button>
                <div 
                  style={{ 
                    background: 'rgba(255,255,255,0.9)', 
                    padding: '0.6rem 1.2rem', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    fontWeight: '700', 
                    fontSize: '0.85rem', 
                    color: '#1a1a4b', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(4px)'
                  }}
                >
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
              <div style={{
                position: 'absolute',
                top: imageMenu.top,
                left: imageMenu.left,
                transform: 'translateX(-50%)',
                background: '#1a1a4b',
                padding: '0.4rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                zIndex: 1000,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                animation: 'fadeInUp 0.2s ease-out'
              }}>
                <style>{`
                  @keyframes fadeInUp {
                    from { opacity: 0; transform: translate(-50%, 10px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                  }
                `}</style>
                <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: '700', marginLeft: '0.5rem', opacity: 0.8 }}>ẢNH ĐÃ CĂN GIỮA</span>
                <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }}></div>
                <ImageMenuButton onClick={handleDeleteInlineImage} title="Xóa ảnh" isDelete><X size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: '700', marginLeft: '0.25rem' }}>Xóa</span></ImageMenuButton>
              </div>
            )}
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

              {/* Subscription Tier Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '0.5rem' }}>Gói truy cập</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={articleData.requiredTier}
                    onChange={(e) => handleFieldChange('requiredTier', e.target.value)}
                    style={{ 
                      width: '100%', padding: '0.85rem 1.25rem', borderRadius: '12px', 
                      border: '1px solid #edf2f7', outline: 'none', 
                      background: articleData.requiredTier === 'FREE' ? '#f8fafc' : (articleData.requiredTier === 'VIP' ? '#f0f9ff' : '#fff9db'),
                      appearance: 'none', fontWeight: '600', color: '#1a1a4b', cursor: 'pointer',
                      borderLeft: articleData.requiredTier === 'FREE' ? '1px solid #edf2f7' : (articleData.requiredTier === 'VIP' ? '4px solid #0ea5e9' : '4px solid #fcc419')
                    }}
                  >
                    {tiers.map(tier => (
                      <option key={tier.value} value={tier.value}>{tier.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#718096' }} />
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#718096' }}>
                  {articleData.requiredTier === 'FREE' && "Mọi người đều có thể xem bài viết này."}
                  {articleData.requiredTier === 'VIP' && "Chỉ thành viên gói VIP hoặc Premium mới có thể xem."}
                  {articleData.requiredTier === 'PREMIUM' && "Chỉ thành viên gói Premium mới có thể xem."}
                </p>
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

      {/* Preview Modal */}
      {showPreviewModal && (
        <div 
          onClick={() => setShowPreviewModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem',
            backdropFilter: 'blur(8px)',
            cursor: 'zoom-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '1200px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              cursor: 'default'
            }}
          >
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              color: 'white'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Xem trước bài viết</h2>
                <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Giao diện hiển thị với người dùng (Customer View)</p>
              </div>
              <button 
                onClick={() => setShowPreviewModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  width: '45px',
                  height: '45px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{
              width: '100%',
              background: 'white',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              flex: 1,
              position: 'relative'
            }}>
              <ArticleRenderer article={articleData} isPreview={true} />
            </div>
            
            <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textAlign: 'center' }}>
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
      style={{
        background: 'none',
        border: 'none',
        color: isDelete ? '#ff4d4f' : 'white',
        padding: '0.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
    >
      {children}
    </button>
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
