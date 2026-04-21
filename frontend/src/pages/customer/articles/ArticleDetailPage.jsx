import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articleApi } from '../../../apis/customerApi';
import './ArticleDetailPage.css';

const categoryLabels = {
  'HEALTH': 'Sức khỏe',
  'PSYCHOLOGY': 'Tâm lý',
  'LIFESTYLE': 'Lối sống',
  'EDUCATION': 'Giáo dục'
};

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  useEffect(() => {
    let timer;
    if (article && article.id) {
      // Set timer for 1 minute (60,000 ms)
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
      if (err.response && (err.response.status === 403 || err.response.status === 402)) {
        setError('PREMIUM_REQUIRED');
      } else {
        setError('NOT_FOUND');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="article-detail-loading">Đang tải nội dung...</div>;

  if (error === 'PREMIUM_REQUIRED') {
    return (
      <div className="premium-blocker-page">
        <div className="blocker-container">
          <div className="blocker-icon">👑</div>
          <h1>Nội dung dành cho Hội viên Premium</h1>
          <p>Bài viết này chứa đựng những kiến thức chuyên sâu dành riêng cho gói đăng ký Premium của chúng tôi.</p>
          <div className="blocker-actions">
            <Link to="/subscription" className="btn-upgrade">Nâng cấp ngay</Link>
            <Link to="/articles" className="btn-back">Quay lại danh sách</Link>
          </div>
        </div>
      </div>
    );
  }

  if (error === 'NOT_FOUND' || !article) {
    return <div className="article-not-found">Không tìm thấy bài viết yêu cầu. <Link to="/articles">Quay lại</Link></div>;
  }

  return (
    <article className="article-detail">
      <header className="article-header">
        <div className="header-container">
          <Link to="/articles" className="back-link">&larr; Quay lại danh sách</Link>
          <h1>{article.title}</h1>
          <div className="article-meta">
            <span className="date">Ngày tạo: {new Date(article.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="article-category-label">{categoryLabels[article.category] || article.category}</span>
          </div>
        </div>
      </header>

      <div className="article-banner">
        <img src={article.thumbnailUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200'} alt={article.title} />
      </div>

      <div className="article-body-container">
        <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }}></div>
        
        <footer className="article-footer">
          <div className="share-section">
            <span>Chia sẻ bài viết:</span>
            <div className="share-icons">
              {/* Add social icons here */}
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
};

export default ArticleDetailPage;
