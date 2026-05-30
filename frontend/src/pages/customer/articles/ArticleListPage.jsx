import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { articleApi } from '../../../apis/customerApi';
import { useAuth } from '../../../hooks/AuthContext';
import './ArticleListPage.css';

const ArticleListPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);
  const { userTier } = useAuth();
  const navigate = useNavigate();

  const TIER_WEIGHTS = {
    'FREE': 0,
    'BASIC': 1,
    'PREMIUM': 2,
    'ELITE': 3
  };

  const canAccess = (requiredTier) => {
    return (TIER_WEIGHTS[userTier] || 0) >= (TIER_WEIGHTS[requiredTier] || 0);
  };


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await articleApi.getCategories();
      if (response.data.success) {
        setApiCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const displayCategories = [
    { id: 'ALL', label: 'Tất cả' },
    ...apiCategories.map(cat => ({ id: cat.value, label: cat.label }))
  ];

  useEffect(() => {
    fetchArticles();
  }, [category, page]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        category: category === 'ALL' ? undefined : category
      };
      const response = await articleApi.getArticles(params);
      if (response.data.success) {
        setArticles(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (catId) => {
    setCategory(catId);
    setPage(0);
  };

  const handleCardClick = (article) => {
    navigate(`/bai-viet/${article.slug}`);
  };

  return (
    <div className="article-list-page">
      <header className="article-hero">
        <div className="article-hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            KIẾN THỨC & CẢM HỨNG
          </div>
          <h1>Khám phá kho tàng <span>tri thức</span> mới</h1>
          <p>Tìm hiểu các kiến thức chuyên sâu về tâm lý, hành vi và cách tối ưu hóa dopamine cho cuộc sống hạnh phúc hơn.</p>
        </div>
      </header>

      <section className="filter-section">
        <div className="categories-list">
          {displayCategories.map((cat) => (
            <button
              key={cat.id}
              className={`category-btn ${category === cat.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      <section className="articles-grid-section">
        {loading ? (
          <div className="global-loading-container">
            Đang tải bài viết
            <span className="loading-dots">
              <span></span><span></span><span></span>
            </span>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="articles-grid">
              {articles.map((article, index) => (
                <div 
                  key={article.id} 
                  className="article-card" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleCardClick(article)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="article-img-wrapper">
                    <img src={article.thumbnailUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600'} alt={article.title} />
                    {article.categoryDisplayName && <span className="article-category-badge">{article.categoryDisplayName}</span>}

                  </div>
                  <div className="article-content">
                    <div className="article-meta">
                      <span>{new Date(article.publishedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <h2>{article.title}</h2>
                    <div className="read-more-link">
                      Đọc chi tiết
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
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
          </>
        ) : (
          <div className="no-articles">Không có bài viết nào trong danh mục này.</div>
        )}
      </section>

      {showPremiumModal && (
        <div className="premium-modal-overlay" onClick={() => setShowPremiumModal(false)}>
          <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="premium-modal-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <h2>Nội dung giới hạn</h2>
            <p>Bài viết này yêu cầu gói đăng ký thành viên. Hãy nâng cấp tài khoản để khám phá những kiến thức chuyên sâu và độc quyền.</p>
            <div className="premium-modal-actions">
              <Link to="/goi-dich-vu" className="btn-premium-register" onClick={() => setShowPremiumModal(false)}>Đăng ký ngay</Link>
              <button className="btn-modal-close" onClick={() => setShowPremiumModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleListPage;
