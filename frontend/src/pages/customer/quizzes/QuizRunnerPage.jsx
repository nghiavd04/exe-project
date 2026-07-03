import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizApi, programApi } from '../../../apis/customerApi';
import { useAuth } from '../../../hooks/AuthContext';
import Modal from '../../../components/Modal';
import toast from 'react-hot-toast';
import defaultQuizImg from '../../../assets/dopamine-bg.png';
import './QuizRunnerPage.css';

const QuizRunnerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const questionRef = useRef(null);
  const { userWeight } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [overallResult, setOverallResult] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Local state: track all selections
  const [answers, setAnswers] = useState({});         // { questionId: id | [ids] }
  const [animDir, setAnimDir] = useState('forward');  // for slide animation

  useEffect(() => { fetchQuizDetail(); }, [id]);

  const fetchQuizDetail = async () => {
    try {
      setLoading(true);
      const res = await quizApi.getQuizDetail(id);
      if (res.data.success) setQuiz(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      setSubmitting(true);
      const res = await quizApi.startQuiz(id);
      if (res.data.success) {
        const data = res.data.data;
        setAttemptId(data.attemptId);
        setQuestions(data.questions);
        setCurrentIndex(0);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không thể bắt đầu bài test.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle answer selection (local only, no API call)
  const handleAnswerSelect = (questionId, answerId, type) => {
    if (type === 'MULTIPLE_CHOICE') {
      setAnswers(prev => {
        const cur = prev[questionId] || [];
        return {
          ...prev,
          [questionId]: cur.includes(answerId)
            ? cur.filter(x => x !== answerId)
            : [...cur, answerId]
        };
      });
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    }
  };

  // Move to next question locally
  const handleNext = () => {
    const q = questions[currentIndex];
    const val = answers[q.id];

    if (!val || (Array.isArray(val) && val.length === 0)) {
      toast.error('Vui lòng chọn câu trả lời trước khi tiếp tục.');
      return;
    }

    if (currentIndex < questions.length - 1) {
      goTo(currentIndex + 1, 'forward');
    }
  };

  const goTo = (index, direction = 'forward') => {
    setAnimDir(direction);
    setCurrentIndex(index);

    requestAnimationFrame(() => {
      const el = questionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();

      if (rect.top < 0 || rect.top > 80) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const handlePrev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1, 'backward');
  };

  const handleFinishQuiz = async () => {
    const q = questions[currentIndex];
    const val = answers[q.id];

    if (!val || (Array.isArray(val) && val.length === 0)) {
      toast.error('Vui lòng chọn câu trả lời trước khi hoàn thành.');
      return;
    }

    try {
      setSubmitting(true);
      // Gửi lần lượt toàn bộ đáp án của các câu hỏi lên server
      for (const question of questions) {
        const answerVal = answers[question.id];
        if (answerVal) {
          const selectedIds = question.type === 'MULTIPLE_CHOICE' ? answerVal : [answerVal];
          await quizApi.submitAnswer(attemptId, {
            questionId: question.id,
            selectedAnswerIds: selectedIds,
          });
        }
      }
      // Sau khi gửi xong toàn bộ, kết thúc bài test
      const res = await quizApi.finishQuiz(attemptId);
      if (res.data.success) {
        setOverallResult(res.data.data);
        setCurrentIndex(-2);
      }
    } catch (err) {
      toast.error('Không thể hoàn thành bài test. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const saveProtocolSelection = async (recommendation) => {
    const res = await programApi.selectProtocol(recommendation.protocolId);
    if (res.data.success) {
      toast.success(`Đã lựa chọn ${recommendation.name}!`);
    }
    return res;
  };

  const handleRecommendationClick = async (recommendation) => {
    if (userWeight < 1) {
      setSelectedRecommendation(recommendation);
      setShowSubscriptionModal(true);
      return;
    }

    try {
      setSubmitting(true);
      await saveProtocolSelection(recommendation);
      navigate('/phac-do');
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || 'Có lỗi xảy ra khi lưu lựa chọn phác đồ.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpgradeFromModal = async () => {
    if (!selectedRecommendation) return;

    try {
      setSubmitting(true);
      await saveProtocolSelection(selectedRecommendation);
      setShowSubscriptionModal(false);
      navigate('/goi-dich-vu');
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || 'Có lỗi xảy ra khi lưu lựa chọn phác đồ.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const closeSubscriptionModal = () => {
    if (submitting) return;
    setShowSubscriptionModal(false);
    setSelectedRecommendation(null);
  };

  const recommendationGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
    marginTop: '1rem',
    alignItems: 'stretch'
  };

  const subscriptionMessage = selectedRecommendation
    ? `${selectedRecommendation.name} là phác đồ cá nhân hóa yêu cầu gói thành viên từ BASIC trở lên để có thể bắt đầu sử dụng.`
    : 'Phác đồ cá nhân hóa yêu cầu gói thành viên từ BASIC trở lên để có thể bắt đầu sử dụng.';

  // ─────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="qr-loading">
        <div className="qr-spinner" />
        <p>Đang tải bài test...</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // INTRO VIEW
  // ─────────────────────────────────────────────
  if (currentIndex === -1) {
    return (
      <div className="qr-page qr-intro">
        <div className="qr-intro-card">
          <div className="qr-intro-body">
            <div className="qr-intro-badge">Bài trắc nghiệm tâm lý</div>
            <h1 className="qr-intro-title">{quiz.title}</h1>
            <p className="qr-intro-desc">{quiz.description}</p>

            <div className="qr-intro-meta">
              <div className="qr-meta-item">
                <span className="qr-meta-icon">📋</span>
                <span><strong>{quiz.questions?.length || 0}</strong> câu hỏi</span>
              </div>
              <div className="qr-meta-item">
                <span className="qr-meta-icon">⏱</span>
                <span>Không giới hạn thời gian</span>
              </div>
              <div className="qr-meta-item">
                <span className="qr-meta-icon">🔒</span>
                <span>Kết quả bảo mật</span>
              </div>
            </div>

            <div className="qr-intro-note">
              <span>💡</span>
              <p>Hãy trả lời thành thật nhất có thể. Không có câu trả lời đúng hay sai.</p>
            </div>

            <button className="qr-btn-start" onClick={handleStartQuiz} disabled={submitting}>
              {submitting ? (
                <><span className="qr-btn-spinner" /> Đang khởi tạo...</>
              ) : (
                <>Bắt đầu làm bài <span>→</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // RESULT VIEW
  // ─────────────────────────────────────────────
  if (currentIndex === -2) {
    return (
      <div className="quiz-result-page">
        <div className="result-wave-bg">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#f0f4ff" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,138.7C960,117,1056,107,1152,122.7C1248,139,1344,181,1392,202.7L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
          </svg>
        </div>
        <div className="result-content-card">
          <div className="result-badge-row">
            <div className="result-badge">
              <span className="result-badge-icon">✓</span>
              <span>Hoàn thành bài test</span>
            </div>
          </div>
          <h1 className="result-title">Cảm ơn bạn đã chia sẻ!</h1>
          <p className="result-subtitle">Câu trả lời của bạn đã được ghi lại. Dưới đây là những gì chúng tôi nhận thấy.</p>

          {overallResult?.assessmentResult && (
            <div className="result-assessment-card">
              <div className="result-assessment-icon">🌿</div>
              <div className="result-assessment-text" dangerouslySetInnerHTML={{ __html: overallResult.assessmentResult }} />
            </div>
          )}

          {overallResult?.overallAssessment && (
            <div className="result-overall-section">
              <h3 className="result-section-label">Lời nhắn từ chúng tôi</h3>
              <div className="result-overall-text" dangerouslySetInnerHTML={{ __html: overallResult.overallAssessment }} />
            </div>
          )}

          {overallResult?.recommendations && overallResult.recommendations.length > 0 && (
            <div className="result-recommendations-section" style={{ marginTop: '2.5rem', marginBottom: '2rem' }}>
              <h3 className="result-section-label" style={{ fontSize: '1.25rem', color: '#0d7a6e', marginBottom: '1.2rem', fontWeight: '700', textAlign: 'center' }}>
                🎯 Phác đồ Đề xuất dành cho bạn
              </h3>
              <div style={recommendationGridStyle}>
                {overallResult.recommendations.map((rec, idx) => {
                  const isTop = idx === 0;
                  return (
                    <div
                      key={rec.protocolId}
                      className={`recommendation-card ${isTop ? 'top-recommendation' : ''}`}
                      style={{
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: isTop ? '2.5px solid #14b8a6' : '1px solid rgba(0,0,0,0.08)',
                        background: isTop ? 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)' : '#fff',
                        position: 'relative',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        textAlign: 'left'
                      }}
                    >
                      {isTop && (
                        <div style={{
                          position: 'absolute',
                          top: '-12px',
                          left: '20px',
                          background: 'linear-gradient(135deg, #0d7a6e 0%, #14b8a6 100%)',
                          color: '#fff',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          boxShadow: 'var(--shadow-sm)'
                        }}>
                          Được đề xuất nhiều nhất
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' }}>
                            {rec.name}
                          </h4>
                          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                            Thời gian: {rec.durationDays} ngày
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0d7a6e' }}>
                            {Math.round(rec.matchScore)}%
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                            Độ tương thích
                          </span>
                        </div>
                      </div>

                      <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.95rem', color: '#334155', lineHeight: '1.5' }}>
                        {rec.description}
                      </p>

                      {rec.reasonText && (
                        <div style={{
                          background: 'rgba(13, 122, 110, 0.05)',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: '#0d7a6e',
                          marginBottom: '1rem',
                          borderLeft: '3px solid #0d7a6e'
                        }}>
                          <strong>Lý do phù hợp:</strong> {rec.reasonText}
                        </div>
                      )}

                      <button
                        onClick={() => handleRecommendationClick(rec)}
                        disabled={submitting}
                        style={{
                          width: '100%',
                          background: isTop ? 'linear-gradient(135deg, #0d7a6e 0%, #14b8a6 100%)' : '#fff',
                          color: isTop ? '#fff' : '#0d7a6e',
                          border: isTop ? 'none' : '1.5px solid #0d7a6e',
                          padding: '0.65rem',
                          borderRadius: '8px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isTop ? '0 4px 12px rgba(13, 122, 110, 0.2)' : 'none'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          if (!isTop) {
                            e.currentTarget.style.background = '#0d7a6e';
                            e.currentTarget.style.color = '#fff';
                          }
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'none';
                          if (!isTop) {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.color = '#0d7a6e';
                          }
                        }}
                      >
                        {userWeight < 1
                          ? (isTop ? '🚀 Chọn phác đồ & mở khóa BASIC+' : 'Chọn phác đồ này')
                          : (isTop ? '🚀 Bắt đầu phác đồ' : 'Chọn phác đồ này')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="result-gentle-note">
            <span>💙</span>
            <p>Đây là bài test tự nhận thức, không phải chẩn đoán y tế. Nếu bạn cảm thấy lo lắng, hãy trao đổi với chuyên gia tâm lý.</p>
          </div>

          <div className="result-actions">
            <Link to="/trac-nghiem" className="btn-result-primary">Khám phá thêm bài test</Link>
            <Link to="/" className="btn-result-secondary">Về trang chủ</Link>
          </div>
        </div>

        <Modal
          isOpen={showSubscriptionModal}
          onClose={closeSubscriptionModal}
          title="Cần gói BASIC trở lên"
          size="sm"
        >
          <div className="quiz-protocol-upgrade-modal">
            <div className="quiz-protocol-upgrade-badge">Mở khóa phác đồ cá nhân hóa</div>
            <p className="quiz-protocol-upgrade-text">{subscriptionMessage}</p>
            {selectedRecommendation && (
              <div className="quiz-protocol-upgrade-summary">
                <strong>{selectedRecommendation.name}</strong>
                <span>Thời lượng: {selectedRecommendation.durationDays} ngày</span>
              </div>
            )}
            <div className="quiz-protocol-upgrade-actions">
              <button
                type="button"
                className="quiz-protocol-upgrade-secondary"
                onClick={closeSubscriptionModal}
                disabled={submitting}
              >
                Để sau
              </button>
              <button
                type="button"
                className="quiz-protocol-upgrade-primary"
                onClick={handleUpgradeFromModal}
                disabled={submitting}
              >
                {submitting ? 'Đang xử lý...' : 'Đăng ký gói BASIC+'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // QUESTION VIEW
  // ─────────────────────────────────────────────
  const q = questions[currentIndex];
  const selectedVal = answers[q.id];
  const isLast = currentIndex === questions.length - 1;
  const canGoNext = selectedVal !== undefined && selectedVal !== '' && !(Array.isArray(selectedVal) && selectedVal.length === 0);

  return (
    <div className="qr-page qr-playing">
      {/* ── Sticky Header ── */}
      <header className="qr-header" ref={questionRef}>
        <div className="qr-progress-track">
          <div
            className="qr-progress-fill"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
        <div className="qr-header-inner">
          <span className="qr-header-label">
            {currentIndex + 1} / {questions.length}
          </span>
          {/* Dot navigation */}
          <div className="qr-dots">
            {questions.map((qq, i) => {
              const hasAnswer = answers[qq.id] !== undefined && answers[qq.id] !== '' && !(Array.isArray(answers[qq.id]) && answers[qq.id].length === 0);
              return (
                <button
                  key={qq.id}
                  className={`qr-dot ${i === currentIndex ? 'active' : ''} ${hasAnswer ? 'done' : ''}`}
                  onClick={() => goTo(i, i > currentIndex ? 'forward' : 'backward')}
                  title={`Câu ${i + 1}`}
                />
              );
            })}
          </div>
          <span className="qr-header-label" style={{ opacity: 0 }}>
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </header>

      {/* ── Question Card ── */}
      <main className="qr-main">
        <div className={`qr-question-card ${animDir}`} key={currentIndex}>
          {/* Question meta */}
          <div className="qr-question-meta">
            <span className="qr-question-badge">Câu {currentIndex + 1}</span>
            <span className={`qr-type-badge ${q.type === 'SINGLE_CHOICE' ? 'single' : 'multi'}`}>
              {q.type === 'SINGLE_CHOICE' ? '◉ Chọn một' : '☑ Chọn nhiều'}
            </span>
          </div>

          <h2 className="qr-question-text">{q.content}</h2>

          {/* Answers */}
          <div className="qr-answers">
            {q.answers.map((a, aIdx) => {
              const isSelected = q.type === 'MULTIPLE_CHOICE'
                ? (selectedVal || []).includes(a.id)
                : selectedVal === a.id;

              return (
                <label
                  key={a.id}
                  className={`qr-option ${isSelected ? 'selected' : ''}`}
                  style={{ animationDelay: `${aIdx * 0.06}s` }}
                >
                  <input
                    type={q.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                    name={`q-${q.id}`}
                    checked={isSelected}
                    onChange={() => handleAnswerSelect(q.id, a.id, q.type)}
                  />
                  <div className={`qr-indicator ${q.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'} ${isSelected ? 'checked' : ''}`}>
                    {isSelected && (q.type === 'SINGLE_CHOICE' ? <span className="dot" /> : <span className="check">✓</span>)}
                  </div>
                  <span className="qr-option-text">{a.content}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ── Navigation Buttons ── */}
        <div className="qr-nav">
          <button
            className="qr-btn-prev"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            ← Câu trước
          </button>

          <button
            className={`qr-btn-next ${isLast && canGoNext ? 'finish' : ''}`}
            onClick={isLast ? handleFinishQuiz : handleNext}
            disabled={submitting || !canGoNext}
          >
            {submitting ? (
              <><span className="qr-btn-spinner" /> Đang xử lý...</>
            ) : isLast ? (
              '✅ Hoàn thành & Xem kết quả'
            ) : (
              'Câu tiếp theo →'
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default QuizRunnerPage;
