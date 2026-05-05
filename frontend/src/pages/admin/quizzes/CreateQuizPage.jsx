import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  Send, 
  Info, 
  ChevronDown, 
  FileUp, 
  Copy, 
  Trash2, 
  Plus,
  HelpCircle,
  Clock,
  Target,
  Image as ImageIcon,
  ArrowLeft,
  ChevronLeft,
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { Link, useNavigate, useParams, useBlocker } from 'react-router-dom';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';
import QuizRenderer from '../../../components/QuizRenderer/QuizRenderer';

export default function CreateQuizPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Quiz State
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    overallAssessment: '',
    imageUrl: 'https://images.unsplash.com/photo-1510070112810-d4e9a46d9e91?q=80&w=2069&auto=format&fit=crop',
    imagePublicId: '',
    status: 'DRAFT',
    questions: [
      {
        id: Date.now(),
        content: '',
        type: 'SINGLE_CHOICE',
        orderIndex: 0,
        answers: [
          { id: Date.now() + 1, content: '', value: '1', feedbackText: '', orderIndex: 0 },
          { id: Date.now() + 2, content: '', value: '2', feedbackText: '', orderIndex: 1 }
        ]
      }
    ]
  });

  useEffect(() => {
    if (isEdit) {
      fetchQuizDetail();
    } else {
      // Load draft from localStorage if creating new
      const savedDraft = localStorage.getItem('QUIZ_CREATE_DRAFT');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setQuizData(prev => ({ ...prev, ...parsed }));
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

  // Auto-save draft for NEW quizzes
  useEffect(() => {
    if (!isEdit && isDirty) {
      const timer = setTimeout(() => {
        localStorage.setItem('QUIZ_CREATE_DRAFT', JSON.stringify(quizData));
      }, 3000); // Save after 3s of inactivity
      return () => clearTimeout(timer);
    }
  }, [quizData, isDirty, isEdit]);

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

  const fetchQuizDetail = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getQuizDetail(id);
      if (response.data.success) {
        const quiz = response.data.data;
        setQuizData({
          title: quiz.title,
          description: quiz.description,
          overallAssessment: quiz.overallAssessment,
          imageUrl: quiz.imageUrl,
          imagePublicId: quiz.imagePublicId,
          status: quiz.status,
          questions: quiz.questions.map(q => ({
            id: q.id,
            content: q.content,
            type: q.type,
            orderIndex: q.orderIndex,
            answers: q.answers.map(a => ({
              id: a.id,
              content: a.content,
              value: a.value,
              feedbackText: a.feedbackText,
              orderIndex: a.orderIndex
            }))
          }))
        });
        setTimeout(() => setInitialLoaded(true), 500);
      }
    } catch (error) {
      console.error('Error fetching quiz detail:', error);
      toast.error('Không thể tải thông tin bài test.');
      setInitialLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizInfoChange = (field, value) => {
    if (!initialLoaded) return;
    setQuizData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh (JPG, PNG,...)');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await adminApi.uploadImage(formData);
      // Cloudinary response usually has url and public_id
      const { url, public_id } = response.data;
      
      setQuizData(prev => ({
        ...prev,
        imageUrl: url,
        imagePublicId: public_id
      }));
      setIsDirty(true);
      toast.success('Tải ảnh lên thành công!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      content: '',
      type: 'SINGLE_CHOICE',
      orderIndex: quizData.questions.length,
      answers: [
        { id: Date.now() + 1, content: '', value: '1', feedbackText: '', orderIndex: 0 },
        { id: Date.now() + 2, content: '', value: '2', feedbackText: '', orderIndex: 1 }
      ]
    };
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setIsDirty(true);
  };

  const handleRemoveQuestion = (qId) => {
    if (quizData.questions.length <= 1) {
      toast.error('Bài test phải có ít nhất một câu hỏi.');
      return;
    }
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== qId)
    }));
    setIsDirty(true);
  };

  const handleQuestionChange = (qId, field, value) => {
    if (!initialLoaded) return;
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === qId ? { ...q, [field]: value } : q)
    }));
    setIsDirty(true);
  };

  const handleAddAnswer = (qId) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          const newAnswer = {
            id: Date.now(),
            content: '',
            value: (q.answers.length + 1).toString(),
            feedbackText: '',
            orderIndex: q.answers.length
          };
          return { ...q, answers: [...q.answers, newAnswer] };
        }
        return q;
      })
    }));
    setIsDirty(true);
  };

  const handleRemoveAnswer = (qId, aId) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          if (q.answers.length <= 1) {
            toast.error('Câu hỏi phải có ít nhất một đáp án.');
            return q;
          }
          return { ...q, answers: q.answers.filter(a => a.id !== aId) };
        }
        return q;
      })
    }));
    setIsDirty(true);
  };

  const handleAnswerChange = (qId, aId, field, value) => {
    if (!initialLoaded) return;
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          return {
            ...q,
            answers: q.answers.map(a => a.id === aId ? { ...a, [field]: value } : a)
          };
        }
        return q;
      })
    }));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!quizData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài test.');
      return;
    }

    const emptyQuestion = quizData.questions.find(q => !q.content.trim());
    if (emptyQuestion) {
      toast.error('Vui lòng nhập nội dung cho tất cả các câu hỏi.');
      return;
    }

    setShowSaveModal(true);
  };

  const executeSubmit = async () => {
    setShowSaveModal(false);
    try {
      setSubmitting(true);
      // Clean data for API (remove internal IDs used for keys)
      const payload = {
        title: quizData.title,
        description: quizData.description,
        overallAssessment: quizData.overallAssessment,
        imageUrl: quizData.imageUrl,
        imagePublicId: quizData.imagePublicId,
        questions: quizData.questions.map((q, qIdx) => ({
          content: q.content,
          type: q.type,
          orderIndex: qIdx,
          answers: q.answers.map((a, aIdx) => ({
            content: a.content,
            value: a.value || (aIdx + 1).toString(),
            feedbackText: a.feedbackText,
            orderIndex: aIdx
          }))
        }))
      };

      if (isEdit) {
        await adminApi.updateQuiz(id, payload);
        toast.success('Cập nhật Quiz thành công!');
      } else {
        await adminApi.createQuiz(payload);
        toast.success('Đã tạo Quiz thành công dưới dạng bản nháp!');
        localStorage.removeItem('QUIZ_CREATE_DRAFT'); // Clear draft on success
      }
      setIsDirty(false); // Reset dirty flag
      setTimeout(() => navigate('/admin/quizzes'), 100);
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu Quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={48} color="#1a1a4b" />
        <p style={{ color: 'var(--muted)', fontWeight: '600' }}>Đang tải thông tin bài test...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem', fontWeight: '600' }}>
        <Link to="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>ADMIN</Link>
        <ChevronLeft size={14} style={{ transform: 'rotate(180deg)', opacity: 0.5 }} />
        <Link to="/admin/quizzes" style={{ color: 'inherit', textDecoration: 'none' }}>QUẢN LÝ QUIZZES</Link>
        <ChevronLeft size={14} style={{ transform: 'rotate(180deg)', opacity: 0.5 }} />
        <span style={{ color: '#1a1a4b' }}>{isEdit ? 'CHỈNH SỬA QUIZ' : 'TẠO QUIZ MỚI'}</span>
      </div>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/admin/quizzes')}
            style={{ 
              background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: '10px', 
              padding: '0.5rem', cursor: 'pointer', color: '#1a1a4b' 
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#1a1a4b' }}>{isEdit ? 'Chỉnh sửa câu hỏi' : 'Trình tạo câu hỏi trắc nghiệm'}</h1>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>Xây dựng bài kiểm tra tự nhận thức và phản hồi hữu ích</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setShowPreviewModal(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.75rem 1.25rem', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              background: 'white', 
              fontWeight: '700', 
              color: '#1a1a4b',
              cursor: 'pointer'
            }}
          >
            <Eye size={18} /> Xem trước
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting || (isEdit && quizData.status === 'PUBLISHED')}
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
              cursor: (submitting || (isEdit && quizData.status === 'PUBLISHED')) ? 'not-allowed' : 'pointer',
              opacity: (submitting || (isEdit && quizData.status === 'PUBLISHED')) ? 0.7 : 1
            }}
          >
            <Send size={18} /> {submitting ? 'Đang lưu...' : (isEdit && quizData.status === 'PUBLISHED') ? 'Đã xuất bản (Khóa)' : isEdit ? 'Lưu thay đổi' : 'Lưu bản nháp'}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Basic Info Section */}
          <section style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f0f4ff', color: '#1a1a4b', padding: '0.5rem', borderRadius: '10px' }}>
                <Info size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Thông tin cơ bản</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '0.5rem' }}>Tiêu đề bài trắc nghiệm</label>
                <textarea 
                  value={quizData.title}
                  onChange={(e) => handleQuizInfoChange('title', e.target.value)}
                  placeholder="Nhập tiêu đề hấp dẫn..." 
                  style={{ width: '100%', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid #edf2f7', outline: 'none', background: '#f8fafc', minHeight: '45px', resize: 'vertical', whiteSpace: 'pre-wrap' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '0.5rem' }}>Mô tả ngắn</label>
                <textarea 
                  value={quizData.description}
                  onChange={(e) => handleQuizInfoChange('description', e.target.value)}
                  placeholder="Mô tả mục đích của bài test này..." 
                  style={{ width: '100%', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid #edf2f7', outline: 'none', background: '#f8fafc', minHeight: '80px', resize: 'vertical', whiteSpace: 'pre-wrap' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '0.5rem' }}>Nhận xét tổng thể (Sau khi hoàn thành)</label>
                <textarea 
                  value={quizData.overallAssessment}
                  onChange={(e) => handleQuizInfoChange('overallAssessment', e.target.value)}
                  placeholder="Lời khuyên hoặc thông tin hữu ích sau khi user làm xong toàn bộ bài test..." 
                  style={{ width: '100%', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid #edf2f7', outline: 'none', background: '#f8fafc', minHeight: '100px', resize: 'vertical', whiteSpace: 'pre-wrap' }}
                />
              </div>
            </div>
          </section>

          {/* Questions Section */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#f0f4ff', color: '#1a1a4b', padding: '0.5rem', borderRadius: '10px' }}>
                   <HelpCircle size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Câu hỏi ({quizData.questions.length})</h3>
              </div>
            </div>

            {quizData.questions.map((q, idx) => (
              <div key={q.id} style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #edf2f7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ background: '#f0f4ff', color: '#4361ee', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Câu hỏi {idx + 1}</span>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Question Type Selector */}
                    <div style={{ display: 'flex', background: '#f8fafc', padding: '0.25rem', borderRadius: '10px', border: '1px solid #edf2f7' }}>
                      <button
                        onClick={() => handleQuestionChange(q.id, 'type', 'SINGLE_CHOICE')}
                        style={{
                          padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', fontSize: '0.75rem', fontWeight: '700',
                          background: q.type === 'SINGLE_CHOICE' ? 'white' : 'transparent',
                          color: q.type === 'SINGLE_CHOICE' ? '#1a1a4b' : 'var(--muted)',
                          boxShadow: q.type === 'SINGLE_CHOICE' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        Chọn 1
                      </button>
                      <button
                        onClick={() => handleQuestionChange(q.id, 'type', 'MULTIPLE_CHOICE')}
                        style={{
                          padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', fontSize: '0.75rem', fontWeight: '700',
                          background: q.type === 'MULTIPLE_CHOICE' ? 'white' : 'transparent',
                          color: q.type === 'MULTIPLE_CHOICE' ? '#1a1a4b' : 'var(--muted)',
                          boxShadow: q.type === 'MULTIPLE_CHOICE' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        Chọn nhiều
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveQuestion(q.id)}
                      style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '0.5rem' }}>Nội dung câu hỏi</label>
                  <textarea 
                    value={q.content}
                    onChange={(e) => handleQuestionChange(q.id, 'content', e.target.value)}
                    placeholder="Ví dụ: Bạn dành bao nhiêu thời gian sử dụng mạng xã hội mỗi ngày?"
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #edf2f7', outline: 'none', background: '#f8fafc', minHeight: '80px', resize: 'vertical', whiteSpace: 'pre-wrap' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '1rem' }}>Các lựa chọn và Feedback riêng</label>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {q.answers.map((answer, aIdx) => (
                        <div key={answer.id} style={{ 
                          padding: '1.25rem', 
                          borderRadius: '16px', 
                          border: '1px solid #edf2f7', 
                          background: '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem'
                        }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              background: '#1a1a4b', 
                              color: 'white', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              flexShrink: 0
                            }}>{aIdx + 1}</div>
                            <textarea 
                              value={answer.content}
                              onChange={(e) => handleAnswerChange(q.id, answer.id, 'content', e.target.value)}
                              placeholder="Nội dung đáp án..."
                              style={{ 
                                flex: 1, 
                                padding: '0.75rem 1rem', 
                                borderRadius: '10px', 
                                border: '1px solid #edf2f7', 
                                background: '#f8fafc',
                                outline: 'none',
                                minHeight: '45px',
                                resize: 'vertical',
                                whiteSpace: 'pre-wrap'
                              }} 
                            />
                            <button 
                              onClick={() => handleRemoveAnswer(q.id, answer.id)}
                              style={{ background: 'none', border: 'none', color: '#cbd5e0', cursor: 'pointer' }}
                            >
                              <X size={18} />
                            </button>
                          </div>
                          <div style={{ marginLeft: '40px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#718096', marginBottom: '0.4rem' }}>Nhận xét/Thông tin hữu ích cho lựa chọn này (Feedback)</label>
                            <textarea 
                              value={answer.feedbackText}
                              onChange={(e) => handleAnswerChange(q.id, answer.id, 'feedbackText', e.target.value)}
                              placeholder="Nếu chọn đáp án này, hệ thống sẽ hiện thông tin gì cho user? (Để trống nếu không muốn hiện feedback)"
                              style={{ 
                                width: '100%', 
                                padding: '0.75rem', 
                                borderRadius: '10px', 
                                border: '1px dashed #cbd5e0', 
                                outline: 'none', 
                                background: 'white', 
                                minHeight: '60px', 
                                fontSize: '0.85rem',
                                resize: 'vertical',
                                whiteSpace: 'pre-wrap'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                   </div>
                   <button 
                    onClick={() => handleAddAnswer(q.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a1a4b', fontWeight: '700', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginTop: '1rem' }}
                  >
                    <Plus size={16} /> Thêm lựa chọn
                  </button>
                </div>
              </div>
            ))}

            <button 
              onClick={handleAddQuestion}
              style={{ 
                width: '100%', 
                padding: '1.25rem', 
                background: '#f0f4ff', 
                color: '#1a1a4b', 
                border: '1px dashed #4361ee', 
                borderRadius: '16px', 
                fontWeight: '700', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.75rem',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              <Plus size={18} /> Thêm câu hỏi mới
            </button>
          </section>

        </div>

        {/* Right Sidebar */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Cover Image Upload */}
          <section style={{ background: 'white', padding: '1rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div 
              onClick={handleImageClick}
              style={{ 
                width: '100%', 
                height: '140px', 
                background: '#f1f5f9', 
                borderRadius: '14px', 
                position: 'relative', 
                overflow: 'hidden', 
                cursor: uploadingImage ? 'not-allowed' : 'pointer',
                border: '2px dashed #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {uploadingImage ? (
                <Loader2 className="animate-spin" size={24} color="#1a1a4b" />
              ) : quizData.imageUrl ? (
                <>
                  <img 
                    src={quizData.imageUrl}
                    alt="Quiz Cover" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', padding: '0.4rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <Upload size={16} color="#1a1a4b" />
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <ImageIcon size={24} color="#cbd5e0" />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Tải ảnh lên</span>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                accept="image/*"
              />
            </div>
            <div style={{ padding: '0.75rem 0.25rem' }}>
              <h5 style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', color: '#1a1a4b' }}>Ảnh đại diện bài thi</h5>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.65rem', color: 'var(--muted)', lineHeight: '1.4' }}>Dán URL hoặc click vào khung để tải ảnh trực tiếp.</p>
              <input 
                type="text" 
                value={quizData.imageUrl}
                onChange={(e) => handleQuizInfoChange('imageUrl', e.target.value)}
                placeholder="Dán URL ảnh vào đây..."
                style={{ width: '100%', marginTop: '0.75rem', padding: '0.5rem', fontSize: '0.7rem', borderRadius: '8px', border: '1px solid #edf2f7', outline: 'none' }}
              />
            </div>
          </section>

          {/* Help Card */}
          <section style={{ background: '#1a1a4b', padding: '1.5rem', borderRadius: '20px', color: 'white' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', marginBottom: '0.75rem' }}>Hướng dẫn nhanh</h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.9 }}>
              <li>Quiz này không tính điểm, dùng để phản hồi thông tin.</li>
              <li>Bạn có thể thêm nhiều đáp án cho mỗi câu hỏi.</li>
              <li>Mỗi đáp án nên có feedback hữu ích để giúp user tự nhận thức hành vi.</li>
              <li>Sau khi lưu bản nháp, hãy vào danh sách để "Xuất bản" Quiz.</li>
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
        message={isEdit ? "Bạn có chắc chắn muốn lưu các thay đổi cho Quiz này?" : "Hệ thống sẽ tạo một bản nháp cho Quiz này. Bạn có muốn tiếp tục?"}
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
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Xem trước bài test</h2>
                <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Chế độ xem trước nội dung và phản hồi</p>
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
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <QuizRenderer quiz={quizData} isPreview={true} />
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
