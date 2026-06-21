import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, User, Share2, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-quill-new/dist/quill.snow.css';
import './ArticleRenderer.css';

// Giải mã tất cả HTML Entities bằng cơ chế native của trình duyệt (DOMParser)
// Hỗ trợ fallback cho các môi trường chạy thử nghiệm (tests) không có DOM
const decodeHtml = (html) => {
  if (!html) return '';
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.documentElement.textContent || '';
};

const ArticleRenderer = ({ article, isPreview = false }) => {
  if (!article) return null;

  const publishedDate = article.publishedAt 
    ? new Date(article.publishedAt) 
    : new Date(); // Fallback for preview

  const wordCount = article.content ? article.content.replace(/<[^>]+>/g, '').split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  let htmlContent = article.content || '<p>Chưa có nội dung...</p>';
  const toc = [];
  let headingIndex = 0;

  htmlContent = htmlContent.replace(/<(h[23])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, text) => {
    const id = `heading-${headingIndex++}`;
    const cleanText = decodeHtml(text.replace(/<[^>]+>/g, ''));
    toc.push({ id, text: cleanText, level: tag.toLowerCase() === 'h2' ? 2 : 3 });
    return `<${tag} id="${id}"${attrs}>${text}</${tag}>`;
  });
  htmlContent = htmlContent.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép đường dẫn bài viết!');
  };

  return (
    <article className={`article-renderer ${isPreview ? 'is-preview' : ''}`}>
      <header className="article-header">
        <div className="header-container">
          {!isPreview && (
            <Link to="/bai-viet" className="back-link-mock">
              &larr; Quay lại danh sách
            </Link>
          )}
          <h1>{article.title || 'Tiêu đề bài viết'}</h1>
          <div className="article-meta">
            <div className="meta-left">
              <span className="date">
                {publishedDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="reading-time">
                <Clock size={16} /> Đọc trong {readingTime} phút
              </span>
              {article.viewCount !== undefined && (
                <span className="view-count">
                  <Eye size={16} /> {article.viewCount} lượt xem
                </span>
              )}
            </div>
            <span className="article-category-label">
              {article.categoryDisplayName || article.category}
            </span>
          </div>
          {article.sourceUrl && article.sourceUrl.replace(/<[^>]+>/g, '').trim() !== '' && (
            <div className="article-source-url">
              <strong>Nguồn bài viết:</strong>
              <div 
                className="ql-editor" 
                style={{ padding: 0, marginTop: '0.5rem', minHeight: 'auto' }}
                dangerouslySetInnerHTML={{ __html: article.sourceUrl }}
              ></div>
            </div>
          )}
        </div>
      </header>

      <div className="article-banner">
        <img 
          src={article.thumbnailUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200'} 
          alt={article.title} 
        />
      </div>

      <div className="article-body-container">
        {toc.length > 0 && (
          <div className="article-toc">
            <h3>Nội dung chính</h3>
            <ul>
              {toc.map(item => (
                <li key={item.id} className={`toc-level-${item.level}`}>
                  <a href={`#${item.id}`} onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}>{item.text}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div 
          className="article-content ql-editor" 
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        ></div>

        <div className="article-social-share">
          <h4>Chia sẻ bài viết này</h4>
          <div className="share-buttons">
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-share facebook"
            >
              <Share2 size={18} /> Chia sẻ lên Facebook
            </a>
            <button onClick={handleCopyLink} className="btn-share copy-link">
              <LinkIcon size={18} /> Sao chép liên kết
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleRenderer;
