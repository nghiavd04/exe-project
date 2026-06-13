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
  ChevronRight,
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { Link, useNavigate, useParams, useBlocker } from 'react-router-dom';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';
import QuizRenderer from '../../../components/QuizRenderer/QuizRenderer';
import './CreateQuizPage.css';

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
    assessmentRules: [
      { id: Date.now(), minScore: 0, maxScore: 0, resultText: '' }
    ],
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
          { id: Date.now() + 1, content: '', value: '0', orderIndex: 0 },
          { id: Date.now() + 2, content: '', value: '1', orderIndex: 1 }
        ]
      }
    ]
  });

  const draftRestoredRef = useRef(false);

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
          if (!draftRestoredRef.current) {
            toast.success('Đã khôi phục bản nháp chưa lưu');
            draftRestoredRef.current = true;
          }
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
          assessmentRules: quiz.assessmentRules?.length > 0 ? quiz.assessmentRules.map(r => ({ ...r, id: r.id || Date.now() + Math.random() })) : [{ id: Date.now(), minScore: 0, maxScore: 0, resultText: '' }],
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
              orderIndex: a.orderIndex
            }))
          }))
        });
        setTimeout(() => setInitialLoaded(true), 500);
      }
    } catch (error) {
      console.error('Error fetching quiz detail:', error);
      toast.error('Không thể tải thông tin bài test.', { id: 'fetch-quiz-detail-error' });
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

  const handleAddRule = () => {
    setQuizData(prev => ({
      ...prev,
      assessmentRules: [...prev.assessmentRules, { id: Date.now(), minScore: 0, maxScore: 0, resultText: '' }]
    }));
    setIsDirty(true);
  };

  const handleRemoveRule = (rId) => {
    setQuizData(prev => ({
      ...prev,
      assessmentRules: prev.assessmentRules.filter(r => r.id !== rId)
    }));
    setIsDirty(true);
  };

  const handleRuleChange = (rId, field, value) => {
    if (!initialLoaded) return;
    setQuizData(prev => ({
      ...prev,
      assessmentRules: prev.assessmentRules.map(r => r.id === rId ? { ...r, [field]: value } : r)
    }));
    setIsDirty(true);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      content: '',
      type: 'SINGLE_CHOICE',
      orderIndex: quizData.questions.length,
      answers: [
        { id: Date.now() + 1, content: '', value: '0', orderIndex: 0 },
        { id: Date.now() + 2, content: '', value: '1', orderIndex: 1 }
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
            value: '0',
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

  const validateAssessmentRules = (rules) => {
    for (let i = 0; i < rules.length; i++) {
      const min = parseInt(rules[i].minScore, 10);
      const max = parseInt(rules[i].maxScore, 10);
      if (isNaN(min) || isNaN(max)) {
        toast.error(`Quy tắc ${i + 1}: Vui lòng nhập điểm hợp lệ.`);
        return false;
      }
      if (min > max) {
        toast.error(`Quy tắc ${i + 1}: "Điểm tối thiểu" (${min}) không được lớn hơn "Điểm tối đa" (${max}).`);
        return false;
      }
      for (let j = i + 1; j < rules.length; j++) {
        const min2 = parseInt(rules[j].minScore, 10);
        const max2 = parseInt(rules[j].maxScore, 10);
        if (min <= max2 && max >= min2) {
          toast.error(`Quy tắc ${i + 1} (${min}–${max}) và Quy tắc ${j + 1} (${min2}–${max2}) bị chồng lấp nhau.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!quizData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài test.');
      return;
    }
    const emptyQuestion = quizData.questions.find(q => !q.content.trim());
    if (emptyQuestion) {
      toast.error('Vui lòng nhập nội dung cho tất cả các câu hỏi.');
      return;
    }
    if (!validateAssessmentRules(quizData.assessmentRules)) return;
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
        assessmentRules: quizData.assessmentRules.map(r => ({
          minScore: parseInt(r.minScore) || 0,
          maxScore: parseInt(r.maxScore) || 0,
          resultText: r.resultText
        })),
        imageUrl: quizData.imageUrl,
        imagePublicId: quizData.imagePublicId,
        questions: quizData.questions.map((q, qIdx) => ({
          content: q.content,
          type: q.type,
          orderIndex: qIdx,
          answers: q.answers.map((a, aIdx) => ({
            content: a.content,
            value: a.value || (aIdx + 1).toString(),
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
        localStorage.removeItem('QUIZ_CREATE_DRAFT');
      }
      setIsDirty(false);
      setTimeout(() => navigate('/admin/quizzes'), 100);
    } catch (error) {
      console.error('Error saving quiz:', error);
      const msg = error?.response?.data?.message || '';
      if (msg.includes('foreign key constraint fails')) {
        toast.error('Dữ liệu này đã có người tham gia làm bài, không thể xóa trực tiếp. Hệ thống đã tự động chuyển sang chế độ lưu trữ dữ liệu cũ.');
      } else {
        toast.error(msg || 'Có lỗi xảy ra khi lưu bài test. Vui lòng kiểm tra lại kết nối.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-full">
        <Loader2 className="animate-spin" size={48} color="#1a1a4b" />
        <p>Đang tải thông tin bài test...</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Breadcrumbs */}
      <div className="create-quiz-breadcrumb">
        <Link to="/admin">ADMIN</Link>
        <ChevronRight size={14} style={{ opacity: 0.5 }} />
        <Link to="/admin/quizzes">QUẢN LÝ QUIZZES</Link>
        <ChevronRight size={14} style={{ opacity: 0.5 }} />
        <span>{isEdit ? 'CHỈNH SỬA QUIZ' : 'TẠO QUIZ MỚI'}</span>
      </div>

      {/* Header */}
      <header className="create-quiz-header">
        <div className="header-left-flex">
          <button 
            onClick={() => navigate('/admin/quizzes')}
            className="btn-back-square"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="header-text-info">
            <h1>{isEdit ? 'Chỉnh sửa câu hỏi' : 'Trình tạo câu hỏi trắc nghiệm'}</h1>
            <p>Xây dựng bài kiểm tra tự nhận thức và phản hồi hữu ích</p>
          </div>
        </div>
        <div className="header-actions-right">
          <button 
            onClick={() => setShowPreviewModal(true)}
            className="btn-preview-outline"
          >
            <Eye size={18} /> Xem trước
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting || (isEdit && quizData.status === 'PUBLISHED')}
            className="btn-save-primary"
          >
            <Send size={18} /> {submitting ? 'Đang lưu...' : (isEdit && quizData.status === 'PUBLISHED') ? 'Đã xuất bản (Khóa)' : isEdit ? 'Lưu thay đổi' : 'Lưu bản nháp'}
          </button>
        </div>
      </header>

      <div className="create-quiz-main-layout">
        {/* Main Content */}
        <div className="create-quiz-content-area">
          
          {/* Basic Info Section */}
          <section className="quiz-edit-section">
            <div className="section-title-wrapper">
              <div className="section-icon-box">
                <Info size={20} />
              </div>
              <h3>Thông tin cơ bản</h3>
            </div>

            <div className="form-field-group">
              <div>
                <label className="field-label-bold">Tiêu đề bài trắc nghiệm</label>
                <textarea 
                  value={quizData.title}
                  onChange={(e) => handleQuizInfoChange('title', e.target.value)}
                  placeholder="Nhập tiêu đề hấp dẫn..." 
                  className="quiz-textarea-styled"
                />
              </div>
              <div>
                <label className="field-label-bold">Mô tả ngắn</label>
                <textarea 
                  value={quizData.description}
                  onChange={(e) => handleQuizInfoChange('description', e.target.value)}
                  placeholder="Mô tả mục đích của bài test này..." 
                  className="quiz-textarea-styled"
                  style={{ minHeight: '80px' }}
                />
              </div>
              <div>
                <label className="field-label-bold">Nhận xét tổng thể (Sau khi hoàn thành)</label>
                <textarea 
                  value={quizData.overallAssessment}
                  onChange={(e) => handleQuizInfoChange('overallAssessment', e.target.value)}
                  placeholder="Lời khuyên hoặc thông tin hữu ích sau khi user làm xong toàn bộ bài test..." 
                  className="quiz-textarea-styled"
                  style={{ minHeight: '100px' }}
                />
              </div>
            </div>
          </section>


          {/* Assessment Rules Section */}
          <section className="quiz-edit-section">
            <div className="section-title-wrapper">
              <div className="section-icon-box" style={{ background: 'rgba(255,107,107,0.1)', color: '#ff6b6b' }}>
                <Target size={20} />
              </div>
              <h3>Quy tắc kết quả (Dựa trên điểm số)</h3>
            </div>
            <p style={{fontSize: '0.85rem', color: '#718096', marginBottom: '1rem'}}>
              Hệ thống sẽ cộng dồn điểm từ các đáp án người dùng chọn. Hãy cấu hình các khoảng điểm và kết quả tương ứng.
            </p>
            
            <div className="answers-stack">
              {quizData.assessmentRules.map((rule, idx) => (
                <div key={rule.id} className="answer-item-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Từ điểm:</span>
                      <input 
                        type="number" 
                        min="0"
                        value={rule.minScore ?? ''}
                        onChange={(e) => handleRuleChange(rule.id, 'minScore', e.target.value)}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10);
                          handleRuleChange(rule.id, 'minScore', isNaN(val) || val < 0 ? '0' : val.toString());
                        }}
                        onKeyDown={(e) => {
                          if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                          if (e.key === 'Enter') e.target.blur();
                        }}
                        className="answer-input-compact score-input-compact"
                        placeholder="0"
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Đến điểm:</span>
                      <input 
                        type="number" 
                        min="0"
                        value={rule.maxScore ?? ''}
                        onChange={(e) => handleRuleChange(rule.id, 'maxScore', e.target.value)}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10);
                          handleRuleChange(rule.id, 'maxScore', isNaN(val) || val < 0 ? '0' : val.toString());
                        }}
                        onKeyDown={(e) => {
                          if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                          if (e.key === 'Enter') e.target.blur();
                        }}
                        className="answer-input-compact score-input-compact"
                        placeholder="0"
                      />
                    </div>
                    <button 
                      onClick={() => handleRemoveRule(rule.id)}
                      style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', marginLeft: 'auto' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div>
                    <textarea 
                      value={rule.resultText}
                      onChange={(e) => handleRuleChange(rule.id, 'resultText', e.target.value)}
                      placeholder="Kết luận chi tiết cho khoảng điểm này (Ví dụ: Bạn đang có dấu hiệu quá tải Dopamine)..."
                      className="quiz-textarea-styled"
                      style={{ minHeight: '60px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={handleAddRule}
              className="btn-add-question-dashed"
              style={{ marginTop: '1rem', background: 'transparent', borderColor: '#ff6b6b', color: '#ff6b6b' }}
            >
              <Plus size={18} /> Thêm quy tắc đánh giá
            </button>
          </section>

          {/* Questions Section */}
          <section className="questions-stack">
            <div className="section-title-wrapper" style={{ marginBottom: '0' }}>
              <div className="section-icon-box">
                 <HelpCircle size={20} />
              </div>
              <h3>Câu hỏi ({quizData.questions.length})</h3>
            </div>

            {quizData.questions.map((q, idx) => (
              <div key={q.id} className="question-card-item">
                <div className="question-card-header">
                  <span className="question-number-badge">Câu hỏi {idx + 1}</span>
                  <div className="question-actions-group">
                    {/* Question Type Selector */}
                    <div className="type-toggle-switch">
                      <button
                        onClick={() => handleQuestionChange(q.id, 'type', 'SINGLE_CHOICE')}
                        className={`type-toggle-btn ${q.type === 'SINGLE_CHOICE' ? 'active' : ''}`}
                      >
                        Chọn 1
                      </button>
                      <button
                        onClick={() => handleQuestionChange(q.id, 'type', 'MULTIPLE_CHOICE')}
                        className={`type-toggle-btn ${q.type === 'MULTIPLE_CHOICE' ? 'active' : ''}`}
                      >
                        Chọn nhiều
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="btn-trash-icon"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="field-label-bold">Nội dung câu hỏi</label>
                  <textarea 
                    value={q.content}
                    onChange={(e) => handleQuestionChange(q.id, 'content', e.target.value)}
                    placeholder="Ví dụ: Bạn dành bao nhiêu thời gian sử dụng mạng xã hội mỗi ngày?"
                    className="quiz-textarea-styled"
                    style={{ minHeight: '80px' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                   <label className="field-label-bold" style={{ marginBottom: '1rem' }}>Các lựa chọn</label>
                   <div className="answers-stack">
                      {q.answers.map((answer, aIdx) => (
                        <div key={answer.id} className="answer-item-card">
                          <div className="answer-row-top">
                            <div className="answer-idx-circle">{aIdx + 1}</div>
                            <textarea 
                              value={answer.content}
                              onChange={(e) => handleAnswerChange(q.id, answer.id, 'content', e.target.value)}
                              placeholder="Nội dung đáp án..."
                              className="answer-input-compact"
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#718096' }}>Điểm:</span>
                              <input 
                                type="number" 
                                min="0"
                                value={answer.value ?? ''}
                                onChange={(e) => handleAnswerChange(q.id, answer.id, 'value', e.target.value)}
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  handleAnswerChange(q.id, answer.id, 'value', isNaN(val) || val < 0 ? '0' : val.toString());
                                }}
                                onKeyDown={(e) => {
                                  if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                                  if (e.key === 'Enter') e.target.blur();
                                }}
                                className="answer-input-compact score-input-compact"
                                placeholder="0"
                              />
                            </div>
                            <button 
                              onClick={() => handleRemoveAnswer(q.id, answer.id)}
                              style={{ background: 'none', border: 'none', color: '#cbd5e0', cursor: 'pointer' }}
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                   </div>
                   <button 
                    onClick={() => handleAddAnswer(q.id)}
                    className="btn-add-answer-link"
                  >
                    <Plus size={16} /> Thêm lựa chọn
                  </button>
                </div>
              </div>
            ))}

            <button 
              onClick={handleAddQuestion}
              className="btn-add-question-dashed"
            >
              <Plus size={18} /> Thêm câu hỏi mới
            </button>
          </section>

        </div>

        {/* Right Sidebar */}
        <div className="create-quiz-sidebar">
          
          {/* Cover Image Upload */}
          <section className="sidebar-card-white">
            <div 
              onClick={handleImageClick}
              className={`image-upload-dropzone ${uploadingImage ? 'uploading' : ''}`}
            >
              {uploadingImage ? (
                <Loader2 className="animate-spin" size={24} color="#1a1a4b" />
              ) : quizData.imageUrl ? (
                <>
                  <img 
                    src={quizData.imageUrl}
                    alt="Quiz Cover" 
                    className="image-preview-full"
                  />
                  <div className="image-upload-overlay">
                    <Upload size={16} color="#1a1a4b" />
                  </div>
                </>
              ) : (
                <div className="empty-image-placeholder">
                  <ImageIcon size={24} color="#cbd5e0" />
                  <span>Tải ảnh lên</span>
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
          <section className="sidebar-help-card-dark">
            <h4>Hướng dẫn nhanh</h4>
            <ul>
              <li>Bạn có thể thêm nhiều đáp án cho mỗi câu hỏi.</li>
              <li>Bài quiz sẽ được tự động tính điểm theo từng lựa chọn.</li>
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
        <div className="detail-modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="detail-modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="detail-modal-header-info">
                <h2>Xem trước bài test</h2>
                <p>Chế độ xem trước nội dung và phản hồi</p>
              </div>
              <button className="detail-modal-close-btn" onClick={() => setShowPreviewModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="detail-modal-main-card">
               <QuizRenderer quiz={quizData} isPreview={true} />
            </div>
            
            
          </div>
        </div>
      )}
    </div>
  );
}
