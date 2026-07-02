import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { articleApi } from '../../../apis/customerApi';
import AppState from '../../../components/AppState';
import { PageSection, PageHeader } from '../../../components/PageSection';
import FilterChips from '../../../components/FilterChips';
import Pagination from '../../../components/Pagination';
import './ArticleListPage.css';

const ArticleListPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [apiCategories, setApiCategories] = useState([]);

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
    ...apiCategories.map((cat) => ({ id: cat.value, label: cat.label })),
  ];

  useEffect(() => {
    fetchArticles();
  }, [category, page]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(false);
      const params = {
        page,
        category: category === 'ALL' ? undefined : category,
      };
      const response = await articleApi.getArticles(params);
      if (response.data.success) {
        setArticles(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError(true);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (catId) => {
    setCategory(catId);
    setPage(0);
  };

  const truncateTitle = (text, maxChars = 45) => {
    if (!text || text.length <= maxChars) return text;
    const trimmed = text.slice(0, maxChars);
    const lastSpace = trimmed.lastIndexOf(' ');
    return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed) + '...';
  };

  return (
    <div className="article-list-page">
      <header className="article-hero">
        <PageHeader
          align="center"
          className="article-hero-content"
          eyebrow="Kiến thức & cảm hứng"
          title={<>Khám phá kho tàng <span>tri thức</span> mới</>}
          description="Tìm hiểu các kiến thức chuyên sâu về tâm lý, hành vi và cách tối ưu hóa dopamine cho cuộc sống hạnh phúc hơn."
        />
      </header>

      <PageSection className="filter-section" width="wide">
        <FilterChips
          items={displayCategories}
          activeId={category}
          onChange={handleCategoryChange}
        />
      </PageSection>

      <PageSection className="articles-grid-section" width="wide">
        {loading ? (
          <AppState 
            variant="loading" 
            compact 
            title="Đang tải bài viết" 
            description="Chúng tôi đang cập nhật danh sách bài viết mới nhất cho bạn." 
          />
        ) : error ? (
          <AppState
            variant="error"
            title="Không thể tải danh sách bài viết"
            description="Đã xảy ra sự cố khi tải dữ liệu từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại."
            actionLabel="Thử lại"
            onAction={fetchArticles}
          />
        ) : articles.length > 0 ? (
          <>
            <div className="articles-grid">
              {articles.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/bai-viet/${article.slug}`}
                  className="article-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <article>
                    <div className="article-img-wrapper">
                      <img src={article.thumbnailUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600'} alt={article.title} />
                      {article.categoryDisplayName && <span className="article-category-badge">{article.categoryDisplayName}</span>}
                    </div>
                    <div className="article-content">
                      <div className="article-meta">
                        <span>{new Date(article.publishedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <h2 title={article.title}>{truncateTitle(article.title)}</h2>
                      <div className="read-more-link">
                        Đọc chi tiết
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </article>
                </Link>
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
            title="Chưa có bài viết trong danh mục này"
            description="Hãy thử chọn một danh mục khác hoặc quay lại sau để xem những nội dung mới nhất."
            actionLabel="Xem tất cả bài viết"
            onAction={() => handleCategoryChange('ALL')}
          />
        )}
      </PageSection>
    </div>
  );
};

export default ArticleListPage;

