import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizApi } from '../../../apis/customerApi';
import toast from 'react-hot-toast';
import './QuizRunnerPage.css';

const QuizRunnerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [overallResult, setOverallResult] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchQuizDetail();
  }, [id]);

  const fetchQuizDetail = async () => {
    try {
      setLoading(true);
      const response = await quizApi.getQuizDetail(id);
      if (response.data.success) {
        setQuiz(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      setSubmitting(true);
      const response = await quizApi.startQuiz(id);
      if (response.data.success) {
        const data = response.data.data;
        setAttemptId(data.attemptId);
        setQuestions(data.questions);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      const msg = error?.response?.data?.message || 'Không thể bắt đầu bài test. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerSelect = (questionId, value, type) => {
    if (type === 'MULTIPLE_CHOICE') {
      setAnswers(prev => {
        const currentAnswers = prev[questionId] || [];
        if (currentAnswers.includes(value)) {
          return { ...prev, [questionId]: currentAnswers.filter(id => id !== value) };
        } else {
          return { ...prev, [questionId]: [...currentAnswers, value] };
        }
      });
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
    }
  };

  const handleSubmitAnswer = async () => {
    const currentQuestion = questions[currentIndex];
    const value = answers[currentQuestion.id];

    if (value === undefined || value === '') {
      toast.error('Vui lòng chọn hoặc nhập câu trả lời.');
      return;
    }

    try {
      setSubmitting(true);
      const selectedIds = currentQuestion.type === 'MULTIPLE_CHOICE'
        ? (answers[currentQuestion.id] || [])
        : [answers[currentQuestion.id]];

      const payload = {
        questionId: currentQuestion.id,
        selectedAnswerIds: selectedIds
      };

      const response = await quizApi.submitAnswer(attemptId, payload);
      if (response.data.success) {
        const fbText = response.data.data.feedbackText;
        if (fbText) {
          setFeedback(fbText);
        } else {
          handleNext();
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    try {
      setSubmitting(true);
      const response = await quizApi.finishQuiz(attemptId);
      if (response.data.success) {
        setOverallResult(response.data.data);
        setCurrentIndex(-2); // Show result
      }
    } catch (error) {
      console.error('Error finishing quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) return <div className="quiz-runner-loading">Đang tải bài test...</div>;

  // ── INTRO VIEW ──
  if (currentIndex === -1) {
    return (
      <div className="quiz-runner-page intro">
        <div className="intro-container">
          <h1>{quiz.title}</h1>
          <p>{quiz.description}</p>
          <div className="quiz-meta-info">
            <div className="meta-item">
              <span>Số câu hỏi:</span>
              <strong>{quiz.questions?.length || 0} câu</strong>
            </div>
          </div>
          <button className="btn-begin" onClick={handleStartQuiz} disabled={submitting}>
            {submitting ? 'Đang khởi tạo...' : 'Bắt đầu làm bài'}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULT VIEW ──
  if (currentIndex === -2) {
    const score = overallResult?.totalScore ?? 0;
    const maxPossibleScore = questions.reduce((total, q) => {
      const maxAnswer = Math.max(...(q.answers?.map(a => parseInt(a.value || '0', 10)) || [0]));
      return total + maxAnswer;
    }, 0);
    const percent = maxPossibleScore > 0 ? Math.round((score / maxPossibleScore) * 100) : 0;

    return (
      <div className="quiz-result-page">
        <div className="result-wave-bg">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="#f0f4ff" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,138.7C960,117,1056,107,1152,122.7C1248,139,1344,181,1392,202.7L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path></svg>
        </div>

        <div className="result-content-card">
          {/* Completion Badge */}
          <div className="result-badge-row">
            <div className="result-badge">
              <span className="result-badge-icon">✓</span>
              <span>Hoàn thành bài test</span>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="result-title">Cảm ơn bạn đã chia sẻ!</h1>
          <p className="result-subtitle">Câu trả lời của bạn đã được ghi lại. Dưới đây là những gì chúng tôi nhận thấy.</p>

          {/* Assessment result (main content, no score number) */}
          {overallResult?.assessmentResult && (
            <div className="result-assessment-card">
              <div className="result-assessment-icon">🌿</div>
              <div className="result-assessment-text" dangerouslySetInnerHTML={{ __html: overallResult.assessmentResult }} />
            </div>
          )}

          {/* Overall assessment (secondary) */}
          {overallResult?.overallAssessment && (
            <div className="result-overall-section">
              <h3 className="result-section-label">Lời nhắn từ chúng tôi</h3>
              <div className="result-overall-text" dangerouslySetInnerHTML={{ __html: overallResult.overallAssessment }} />
            </div>
          )}

          {/* Gentle note, no alarming numbers */}
          <div className="result-gentle-note">
            <span>💙</span>
            <p>Đây là bài test tự nhận thức, không phải chẩn đoán y tế. Nếu bạn cảm thấy lo lắng, hãy trao đổi với chuyên gia tâm lý.</p>
          </div>

          {/* Actions */}
          <div className="result-actions">
            <Link to="/quizzes" className="btn-result-primary">Khám phá thêm bài test</Link>
            <Link to="/" className="btn-result-secondary">Về trang chủ</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── QUESTION VIEW ──
  const currentQuestion = questions[currentIndex];
  return (
    <div className="quiz-runner-page playing">
      <header className="quiz-runner-header">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
        <div className="quiz-status-bar">
          <span className="question-count">Câu hỏi {currentIndex + 1} / {questions.length}</span>
        </div>
      </header>

      <main className="question-container">
        <div className="question-header-info">
          <h2 className="question-text">{currentQuestion.content}</h2>
        </div>

        <div className="options-container">
          {currentQuestion.type === 'SINGLE_CHOICE' ? (
            currentQuestion.answers.map(answer => (
              <label key={answer.id} className={`option-label ${answers[currentQuestion.id] === answer.id ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={`q-${currentQuestion.id}`}
                  value={answer.id}
                  checked={answers[currentQuestion.id] === answer.id}
                  onChange={() => handleAnswerSelect(currentQuestion.id, answer.id, 'SINGLE_CHOICE')}
                />
                <div className="custom-indicator radio"></div>
                <span className="option-text">{answer.content}</span>
              </label>
            ))
          ) : (
            currentQuestion.answers.map(answer => (
              <label key={answer.id} className={`option-label checkbox-label ${(answers[currentQuestion.id] || []).includes(answer.id) ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  name={`q-${currentQuestion.id}`}
                  value={answer.id}
                  checked={(answers[currentQuestion.id] || []).includes(answer.id)}
                  onChange={() => handleAnswerSelect(currentQuestion.id, answer.id, 'MULTIPLE_CHOICE')}
                />
                <div className="custom-indicator checkbox"></div>
                <span className="option-text">{answer.content}</span>
              </label>
            ))
          )}
        </div>

        <button
          className="btn-submit-answer"
          onClick={handleSubmitAnswer}
          disabled={submitting}
        >
          {currentIndex === questions.length - 1 ? 'Hoàn thành' : 'Tiếp tục'}
        </button>
      </main>

      {feedback && (
        <div className="feedback-overlay">
          <div className="feedback-modal">
            <div className="feedback-icon">💡</div>
            <h3>Nhận xét nhanh</h3>
            <div className="feedback-content" dangerouslySetInnerHTML={{ __html: feedback }}></div>
            <button className="btn-next" onClick={handleNext}>Tiếp tục &rarr;</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizRunnerPage;
