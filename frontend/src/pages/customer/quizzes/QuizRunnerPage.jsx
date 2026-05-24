import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizApi } from '../../../apis/customerApi';
import toast from 'react-hot-toast';
import defaultQuizImg from '../../../assets/dopamine-bg.png';
import './QuizRunnerPage.css';

const QuizRunnerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const questionRef = useRef(null);

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [overallResult, setOverallResult] = useState(null);

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
    setTimeout(() => questionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
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

          <div className="result-gentle-note">
            <span>💙</span>
            <p>Đây là bài test tự nhận thức, không phải chẩn đoán y tế. Nếu bạn cảm thấy lo lắng, hãy trao đổi với chuyên gia tâm lý.</p>
          </div>

          <div className="result-actions">
            <Link to="/quizzes" className="btn-result-primary">Khám phá thêm bài test</Link>
            <Link to="/" className="btn-result-secondary">Về trang chủ</Link>
          </div>
        </div>
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
