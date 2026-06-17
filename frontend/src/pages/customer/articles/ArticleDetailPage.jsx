import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { articleApi } from '../../../apis/customerApi';
import ArticleRenderer from '../../../components/ArticleRenderer/ArticleRenderer';
import './ArticleDetailPage.css';

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
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
        
        // Fetch related articles from same category, fallback to any category if none
        try {
          let relatedRes = await articleApi.getArticles({ category: response.data.data.category, page: 0, size: 4 });
          if (relatedRes.data.success) {
            let related = relatedRes.data.data.content.filter(a => a.slug !== slug);
            
            if (related.length === 0) {
              relatedRes = await articleApi.getArticles({ page: 0, size: 4 });
              if (relatedRes.data.success) {
                related = relatedRes.data.data.content.filter(a => a.slug !== slug);
              }
            }
            setRelatedArticles(related.slice(0, 3));
          }
        } catch (err) {
          console.error('Error fetching related articles:', err);
        }
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



  if (error === 'NOT_FOUND' || !article) {
    return <div className="article-not-found">Không tìm thấy bài viết yêu cầu. <Link to="/bai-viet">Quay lại</Link></div>;
  }

  return (
    <div className="article-detail-page-wrapper">
      <ArticleRenderer article={article} />
      
      {relatedArticles.length > 0 && (
        <div className="related-articles-section">
          <div className="related-articles-container">
            <h3>Bài viết liên quan</h3>
            <div className="related-grid">
              {relatedArticles.map(item => (
                <Link to={`/bai-viet/${item.slug}`} className="related-card" key={item.id}>
                  <img src={item.thumbnailUrl || 'https://via.placeholder.com/300x200'} alt={item.title} />
                  <h4>{item.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetailPage;
