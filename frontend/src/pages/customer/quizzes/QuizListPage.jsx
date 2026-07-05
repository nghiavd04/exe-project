import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizApi } from '../../../apis/customerApi';
import defaultQuizImg from '../../../assets/dopamine-bg.png';
import AppState from '../../../components/AppState';
import { PageSection, PageHeader } from '../../../components/PageSection';
import Pagination from '../../../components/Pagination';
import Seo, { buildUrl } from '../../../components/Seo';
import './QuizListPage.css';

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchQuizzes();
  }, [page]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(false);
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
      setError(true);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-list-page">
      <Seo
        title="Bài test dopamine và thói quen số miễn phí"
        description="Làm bài test dopamine và các bài trắc nghiệm hành vi để hiểu mức độ lệ thuộc thói quen số, khả năng tập trung và hướng cải thiện phù hợp."
        canonicalPath="/trac-nghiem"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Bài test Dopaless',
          url: buildUrl('/trac-nghiem'),
          description: 'Danh sách bài test dopamine, tâm lý hành vi và thói quen số.',
        }}
      />
      <header className="quiz-hero">
        <PageHeader
          align="center"
          className="quiz-hero-content"
          eyebrow="INSIGHT QUIZ"
          title={<>Thấu hiểu <span>bản thân</span> qua từng câu hỏi</>}
          description="Làm các bài test tâm lý và hành vi để nhận được những nhận xét chuyên sâu giúp bạn cải thiện chất lượng cuộc sống."
        />
      </header>

      <PageSection className="quiz-grid-section" width="wide">
        {loading ? (
          <AppState
            variant="loading"
            compact
            title="Đang tải danh sách bài test"
            description="Chúng tôi đang chuẩn bị các bài kiểm tra tốt nhất cho bạn."
          />
        ) : error ? (
          <AppState
            variant="error"
            title="Không thể tải danh sách bài test"
            description="Đã xảy ra sự cố khi kết nối dữ liệu từ máy chủ. Vui lòng kiểm tra lại đường truyền."
            actionLabel="Thử lại"
            onAction={fetchQuizzes}
          />
        ) : quizzes.length > 0 ? (
          <>
            <div className="quiz-grid">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="quiz-card">
                  <div className="quiz-card-banner">
                    <img 
                      src={quiz.imageUrl || defaultQuizImg} 
                      alt={quiz.title} 
                      className="quiz-card-img" 
                      onError={(e) => { e.target.src = defaultQuizImg; }}
                    />
                    <div className="quiz-card-badge">Tâm lý</div>
                  </div>
                  <div className="quiz-card-content">
                    <div className="quiz-card-body">
                      <h3>{quiz.title}</h3>
                      <p>{quiz.description || 'Không có mô tả cho bài test này.'}</p>
                    </div>
                    <div className="quiz-card-footer">
                      <Link to={`/trac-nghiem/${quiz.id}/bat-dau`} className="btn-start">Bắt đầu test</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        ) : (
          <AppState
            variant="empty"
            title="Chưa có bài test nào được công khai"
            description="Hiện chưa có bài trắc nghiệm tâm lý nào được đăng tải. Vui lòng quay lại sau ít phút."
          />
        )}
      </PageSection>
    </div>
  );
};

export default QuizListPage;

