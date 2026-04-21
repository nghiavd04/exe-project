import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizApi } from '../../../apis/customerApi';
import './QuizListPage.css';

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchQuizzes();
  }, [page]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const params = {
        page
      };
      const response = await quizApi.getQuizzes(params);
      if (response.data.success) {
        setQuizzes(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-list-page">
      <header className="quiz-hero">
        <div className="quiz-hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            INSIGHT QUIZ
          </div>
          <h1>Thấu hiểu <span>bản thân</span> qua từng câu hỏi</h1>
          <p>Làm các bài test tâm lý và hành vi để nhận được những nhận xét chuyên sâu giúp bạn cải thiện chất lượng cuộc sống.</p>
        </div>
      </header>

      <section className="quiz-grid-section">
        {loading ? (
          <div className="global-loading-container">
            Đang tải danh sách bài test
            <span className="loading-dots">
              <span></span><span></span><span></span>
            </span>
          </div>
        ) : quizzes.length > 0 ? (
          <div className="quiz-grid">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-card-header">
                  <div className="quiz-icon">🧠</div>
                </div>
                <div className="quiz-card-body">
                  <h3>{quiz.title}</h3>
                  <p>{quiz.description || 'Không có mô tả cho bài test này.'}</p>
                </div>
                <div className="quiz-card-footer">
                  <Link to={`/quizzes/${quiz.id}/start`} className="btn-start">Bắt đầu test</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-quizzes">Hiện chưa có bài test nào được công khai.</div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(page - 1)}
              className="page-btn"
            >
              &larr;
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`page-btn ${page === i ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={page === totalPages - 1} 
              onClick={() => setPage(page + 1)}
              className="page-btn"
            >
              &rarr;
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default QuizListPage;
