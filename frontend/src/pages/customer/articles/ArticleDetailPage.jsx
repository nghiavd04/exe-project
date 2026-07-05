import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { articleApi } from '../../../apis/customerApi';
import AppState from '../../../components/AppState';
import ArticleRenderer from '../../../components/ArticleRenderer/ArticleRenderer';
import { PageSection } from '../../../components/PageSection';
import Seo from '../../../components/Seo';
import { buildUrl, makeDescription, stripHtml } from '../../../components/Seo/seoUtils';
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

  if (loading) {
    return (
      <PageSection className="article-detail-state" width="narrow">
        <AppState
          variant="loading"
          title="Đang tải nội dung bài viết"
          description="Chúng tôi đang chuẩn bị nội dung để bạn có trải nghiệm đọc tốt nhất."
        />
      </PageSection>
    );
  }

  if (error === 'SUBSCRIPTION_REQUIRED') {
    return (
      <PageSection className="article-detail-state" width="narrow">
        <AppState
          variant="paywall"
          title="Bài viết này dành cho thành viên"
          description="Nâng cấp gói dịch vụ để đọc trọn vẹn nội dung chuyên sâu và những bài viết độc quyền khác."
          actionLabel="Xem các gói dịch vụ"
          actionTo="/goi-dich-vu"
          secondaryLabel="Quay lại danh sách bài viết"
          secondaryTo="/bai-viet"
        />
      </PageSection>
    );
  }

  if (error === 'NOT_FOUND' || !article) {
    return (
      <PageSection className="article-detail-state" width="narrow">
        <AppState
          variant="error"
          title="Không tìm thấy bài viết"
          description="Bài viết bạn đang tìm kiếm có thể đã bị gỡ bỏ, đổi liên kết hoặc chưa sẵn sàng hiển thị."
          actionLabel="Quay lại bài viết"
          actionTo="/bai-viet"
        />
      </PageSection>
    );
  }

  return (
    <div className="article-detail-page-wrapper">
      <Seo
        title={article.title}
        description={makeDescription(article.summary || article.description || article.content, `${article.title} - bài viết chuyên sâu từ Dopaless.`)}
        canonicalPath={`/bai-viet/${article.slug}`}
        image={article.thumbnailUrl}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: makeDescription(article.summary || article.description || article.content, article.title),
          image: article.thumbnailUrl ? [article.thumbnailUrl] : [buildUrl('/og-image.svg')],
          datePublished: article.publishedAt,
          dateModified: article.updatedAt || article.publishedAt,
          author: {
            '@type': 'Organization',
            name: article.authorName || 'Dopaless',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Dopaless',
            logo: {
              '@type': 'ImageObject',
              url: buildUrl('/favicon.svg'),
            },
          },
          mainEntityOfPage: buildUrl(`/bai-viet/${article.slug}`),
          articleSection: article.categoryDisplayName || article.category,
          wordCount: stripHtml(article.content || '').split(/\s+/).filter(Boolean).length,
        }}
      />
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
