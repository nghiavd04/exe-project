import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { articleApi } from '../../../apis/customerApi';
import ArticleRenderer from '../../../components/ArticleRenderer/ArticleRenderer';
import './ArticleDetailPage.css';

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  useEffect(() => {
    let timer;
    if (article && article.id) {
      timer = setTimeout(async () => {
        try {
          await articleApi.incrementViewCount(article.id);
        } catch (err) {
          console.error('Error incrementing view count:', err);
        }
      }, 60000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [article?.id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await articleApi.getArticleDetail(slug);
      if (response.data.success) {
        setArticle(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      const isLoggedIn = !!localStorage.getItem('token');
      
      if (err.response && (err.response.status === 403 || err.response.status === 402)) {
        if (!isLoggedIn) {
          navigate('/dang-nhap');
        } else {
          setError('SUBSCRIPTION_REQUIRED');
        }
      } else if (err.response && err.response.status === 401) {
        navigate('/dang-nhap');
      } else {
        setError('NOT_FOUND');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="article-detail-loading">Đang tải nội dung...</div>;

  if (error === 'SUBSCRIPTION_REQUIRED') {
    return (
      <div className="premium-blocker-page">
        <div className="blocker-container">
          <div className="blocker-icon">👑</div>
          <h1>Nội dung dành cho Hội viên</h1>
          <p>Bài viết này yêu cầu gói đăng ký thành viên để truy cập. Hãy nâng cấp tài khoản của bạn để xem nội dung này.</p>
          <div className="blocker-actions">
            <Link to="/subscription" className="btn-upgrade">Xem các gói đăng ký</Link>
            <Link to="/bai-viet" className="btn-back">Quay lại danh sách</Link>
          </div>
        </div>
      </div>
    );
  }

  if (error === 'NOT_FOUND' || !article) {
    return <div className="article-not-found">Không tìm thấy bài viết yêu cầu. <Link to="/bai-viet">Quay lại</Link></div>;
  }

  return <ArticleRenderer article={article} />;
};

export default ArticleDetailPage;
