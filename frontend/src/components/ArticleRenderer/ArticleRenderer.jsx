import React from 'react';
import 'react-quill-new/dist/quill.snow.css';
import './ArticleRenderer.css';

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
              {article.categoryDisplayName || article.category}
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
          dangerouslySetInnerHTML={{ 
            __html: article.content 
              ? article.content.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ') 
              : '<p>Chưa có nội dung...</p>' 
          }}
        ></div>
      </div>
    </article>
  );
};

export default ArticleRenderer;
