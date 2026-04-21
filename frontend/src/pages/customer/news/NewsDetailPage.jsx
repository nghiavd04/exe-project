import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { MOCK_NEWS } from './NewsPage';
import './NewsDetailPage.css';

export default function NewsDetailPage() {
    useScrollReveal();
    const { id } = useParams();
    const navigate = useNavigate();

    // Tìm bài viết tương ứng với id từ URL
    const newsItem = MOCK_NEWS.find(news => news.id === parseInt(id));

    useEffect(() => {
        if (newsItem) {
            document.title = `${newsItem.title} – Dopaless`;
        } else {
            // Không tìm thấy bài viết -> Quay về trang tin tức
            navigate('/tin-tuc');
        }
        window.scrollTo(0, 0);
    }, [id, navigate, newsItem]);

    if (!newsItem) return <div style={{ minHeight: '100vh', background: 'var(--bg)' }}></div>;

    // Lấy tối đa 3 bài viết liên quan (cùng danh mục, khác bài hiện tại)
    const relatedNews = MOCK_NEWS
        .filter(news => news.category === newsItem.category && news.id !== newsItem.id)
        .slice(0, 3);

    return (
        <main className="news-detail-page">
            <article className="article-container">
                {/* ── HEADER ── */}
                <header className="article-header reveal">
                    <div className="article-meta">
                        <Link to="/tin-tuc" className="back-link">
                            &larr; Quay lại Blog
                        </Link>
                        <span className="meta-divider">|</span>
                        <span className="category-tag">{newsItem.category}</span>
                    </div>
                    <h1>{newsItem.title}</h1>
                    <div className="author-meta">
                        <div className="author-info">
                            <span className="author-name">Thực hiện bởi Đội ngũ Dopaless</span>
                            <span className="publish-date">{newsItem.date}</span>
                        </div>
                        <span className="read-time">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {newsItem.readTime}
                        </span>
                    </div>
                </header>

                {/* ── HERO IMAGE ── */}
                <div className="article-hero-image reveal reveal-delay-1">
                    <img src={newsItem.image} alt={newsItem.title} />
                </div>

                {/* ── CONTENT ── */}
                <div className="article-content reveal reveal-delay-2">
                    <p className="article-lead">{newsItem.excerpt}</p>

                    <h2>1. Hiểu đúng về vấn đề</h2>
                    <p>
                        Dopamine thường được gọi là "hormone hạnh phúc", nhưng thực chất nó là hormone của
                        "sự khao khát và động lực". Khi bạn lướt mạng xã hội, mỗi thông báo mới, mỗi lượt thích
                        đều kích hoạt não bộ tiết ra một lượng nhỏ dopamine. Điều này tạo ra một vòng lặp phần thưởng
                        khiến bộ não liên tục mong muốn nhiều hơn, dẫn đến sự xao nhãng không kiểm soát.
                    </p>
                    <p>
                        Nguyên nhân sâu xa không nằm ở bản thân công nghệ, mà là cách chúng được thiết kế một cách
                        có chủ đích nhằm chiếm đoạt sự chú ý của bạn. Các nhà thiết kế hiểu rõ tâm lý học hành vi
                        và áp dụng nó vào mọi ngóc ngách của ứng dụng.
                    </p>

                    <blockquote className="article-quote">
                        "Khả năng tập trung sâu chính là siêu năng lực của thế kỷ 21. Những ai làm chủ được nó sẽ làm chủ tương lai."
                    </blockquote>

                    <h2>2. Phương pháp giải quyết và Hành động</h2>
                    <p>
                        Để giành lại quyền kiểm soát, chúng ta không cần phải vứt bỏ hoàn toàn thiết bị công nghệ.
                        Thay vào đó, hãy xây dựng những "vùng an toàn" không có sự hiện diện của màn hình.
                        Bạn có thể bắt đầu bằng việc áp dụng các thói quen nhỏ sau:
                    </p>
                    <ul>
                        <li><strong>Tắt toàn bộ thông báo (Push Notifications):</strong> Chỉ giữ lại thông báo tin nhắn từ người thân hoặc công việc khẩn cấp.</li>
                        <li><strong>Quy định giờ "nói không với màn hình":</strong> Tối thiểu 1 giờ trước khi đi ngủ, thay thế điện thoại bằng sách giấy hoặc trò chuyện.</li>
                        <li><strong>Dọn dẹp lại không gian số:</strong> Xóa các ứng dụng khiến bạn tiêu tốn thời gian vô thức, ẩn các bảng tin (news feed).</li>
                        <li><strong>Quy tắc 20-20-20:</strong> Mỗi 20 phút làm việc với màn hình, hãy nhìn ra xa 20 feet (6 mét) trong vòng 20 giây.</li>
                    </ul>
                    <p>
                        Nhớ rằng, thay đổi không đến sau một đêm. Detox không có nghĩa là loại bỏ hoàn toàn, mà là xây dựng lại một mối quan hệ lành mạnh và bền vững với môi trường số của bạn.
                    </p>

                    {/* CTA BLOCK */}
                    <div className="article-cta">
                        <h3>Sẵn sàng để thay đổi?</h3>
                        <p>Kiểm tra ngay mức độ lệ thuộc của bạn vào các thiết bị số thông qua bài đánh giá sức khỏe tinh thần của chúng tôi.</p>
                        <Link to="/bai-test" className="btn-primary">Làm bài Test ngay</Link>
                    </div>
                </div>

                {/* ── SHARE TAGS ── */}
                <footer className="article-footer reveal">
                    <div className="tags">
                        <span>Tags:</span>
                        <Link to="/tin-tuc">#Dopamine</Link>
                        <Link to="/tin-tuc">#TapTrung</Link>
                        <Link to="/tin-tuc">#TamLyHoc</Link>
                    </div>
                    <div className="share">
                        <span>Chia sẻ:</span>
                        <button className="share-btn" onClick={() => alert("Đã chia sẻ lên Facebook!")}>Facebook</button>
                        <button className="share-btn" onClick={() => alert("Đã chia sẻ lên Twitter!")}>Twitter</button>
                        <button className="share-btn" onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Đã sao chép đường dẫn!"); }}>Copy Link</button>
                    </div>
                </footer>
            </article>

            {/* ── RELATED NEWS ── */}
            {relatedNews.length > 0 && (
                <section className="related-news reveal">
                    <div className="related-container">
                        <h2>Bài viết liên quan</h2>
                        <div className="news-grid">
                            {relatedNews.map((news) => (
                                <article className="news-card" key={news.id}>
                                    <div className="news-img-wrapper">
                                        <img src={news.image} alt={news.title} loading="lazy" />
                                        <span className="news-category-badge">{news.category}</span>
                                    </div>
                                    <div className="news-content">
                                        <div className="news-meta">
                                            <span>{news.date}</span>
                                            <span className="meta-dot">•</span>
                                            <span>{news.readTime}</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.15rem', lineHeight: '1.4', fontFamily: "'Outfit', sans-serif" }}>
                                            <Link to={`/tin-tuc/${news.id}`}>{news.title}</Link>
                                        </h3>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}
