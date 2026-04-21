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
  const [currentIndex, setCurrentIndex] = useState(-1); // -1: Intro, >=0: Questions, -2: Result
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [overallResult, setOverallResult] = useState(null);
  const [answers, setAnswers] = useState({}); // {questionId: value}

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
      alert('Vui lòng chọn hoặc nhập câu trả lời.');
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
    return (
      <div className="quiz-runner-page result">
        <div className="result-container">
          <div className="result-icon">🎉</div>
          <h1>Hoàn thành bài test!</h1>
          <h3>Nhận xét tổng thể dành cho bạn:</h3>
          <div 
            className="overall-assessment" 
            dangerouslySetInnerHTML={{ __html: overallResult?.overallAssessment || 'Cảm ơn bạn đã tham gia bài test.' }}
          />
          <div className="result-actions">
            <Link to="/quizzes" className="btn-home">Về danh sách Quiz</Link>
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
        <h2 className="question-text">{currentQuestion.content}</h2>

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
