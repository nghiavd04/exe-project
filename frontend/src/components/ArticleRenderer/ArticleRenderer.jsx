import React from 'react';
import './ArticleRenderer.css';

const categoryLabels = {
  'HEALTH': 'Sức khỏe',
  'PSYCHOLOGY': 'Tâm lý học',
  'LIFESTYLE': 'Lối sống',
  'EDUCATION': 'Giáo dục',
  'SCIENCE': 'Khoa học',
  'TECHNOLOGY': 'Công nghệ'
};

const ArticleRenderer = ({ article, isPreview = false }) => {
  if (!article) return null;

  const publishedDate = article.publishedAt 
    ? new Date(article.publishedAt) 
    : new Date(); // Fallback for preview

  return (
    <article className={`article-renderer ${isPreview ? 'is-preview' : ''}`}>
      <header className="article-header">
        <div className="header-container">
          {!isPreview && (
            <button className="back-link-mock" onClick={() => window.history.back()}>
              &larr; Quay lại danh sách
            </button>
          )}
          <h1>{article.title || 'Tiêu đề bài viết'}</h1>
          <div className="article-meta">
            <span className="date">
              Ngày tạo: {publishedDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="article-category-label">
              {categoryLabels[article.category] || article.category}
            </span>
          </div>
        </div>
      </header>

      <div className="article-banner">
        <img 
          src={article.thumbnailUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200'} 
          alt={article.title} 
        />
      </div>

      <div className="article-body-container">
        <div 
          className="article-content ql-editor" 
          dangerouslySetInnerHTML={{ __html: article.content || '<p>Chưa có nội dung...</p>' }}
        ></div>
      </div>
    </article>
  );
};

export default ArticleRenderer;
