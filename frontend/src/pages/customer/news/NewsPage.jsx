import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import './NewsPage.css';

export const MOCK_NEWS = [
    {
        id: 1,
        title: "Dopamine Detox: Sự thật về việc 'cai nghiện' mạng xã hội",
        excerpt: "Tìm hiểu cơ chế thực sự đằng sau Dopamine và tại sao việc ngắt kết nối lại khó khăn đến vậy.",
        category: "Tâm lý học",
        readTime: "5 phút đọc",
        date: "12 Thg 3, 2026",
        image: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Hiệu ứng cuộn vô tận (Infinite Scroll) phá hủy sự tập trung thế nào?",
        excerpt: "Thiết kế giao diện hiện đại đang lợi dụng tâm lý con người ra sao và cách để phòng tránh.",
        category: "Thói quen số",
        readTime: "7 phút đọc",
        date: "08 Thg 3, 2026",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Từ một người nghiện TikTok đến việc đọc sách 2 giờ mỗi ngày",
        excerpt: "Câu chuyện người thật việc thật về hành trình tìm lại sự tập trung sau thời gian dài mất phương hướng.",
        category: "Câu chuyện",
        readTime: "4 phút đọc",
        date: "05 Thg 3, 2026",
        image: "https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 4,
        title: "5 ứng dụng thay thế Mạng xã hội giúp bạn phát triển bản thân",
        excerpt: "Thay vì lướt feed vô thức, hãy sử dụng điện thoại để học hỏi những điều mới mẻ.",
        category: "Công cụ",
        readTime: "6 phút đọc",
        date: "01 Thg 3, 2026",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 5,
        title: "Hội chứng FOMO: Nỗi sợ bị bỏ lỡ trong kỷ nguyên số",
        excerpt: "Sự lo âu thường trực khi không trực tuyến và cách để duy trì trạng thái JOMO (Joy Of Missing Out).",
        category: "Tâm lý học",
        readTime: "8 phút đọc",
        date: "28 Thg 2, 2026",
        image: "https://images.unsplash.com/photo-1629807530863-70a927e1f414?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 6,
        title: "Quy tắc 20-20-20: Bảo vệ đôi mắt khi làm việc với màn hình",
        excerpt: "Nắm vững nguyên tắc đơn giản để giảm thiểu mỏi mắt và cải thiện năng suất làm việc.",
        category: "Sức khoẻ",
        readTime: "3 phút đọc",
        date: "25 Thg 2, 2026",
        image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 7,
        title: "Phương pháp Pomodoro: Bí quyết làm việc 25 phút hiệu quả",
        excerpt: "Thực hành chia nhỏ thời gian làm việc để tối ưu hóa năng suất và giảm thiểu cạn kiệt năng lượng.",
        category: "Công cụ",
        readTime: "5 phút đọc",
        date: "20 Thg 2, 2026",
        image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 8,
        title: "Thiền định và ảnh hưởng đến não bộ của người trẻ",
        excerpt: "Khoa học chứng minh thiền định có thể thay đổi cấu trúc não bộ và khả năng tập trung ra sao.",
        category: "Sức khoẻ",
        readTime: "9 phút đọc",
        date: "15 Thg 2, 2026",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 9,
        title: "Cách để vượt qua sự mệt mỏi vào buổi chiều",
        excerpt: "Tại sao chúng ta thường buồn ngủ lúc 3 giờ chiều và phương pháp tự nhiên để lấy lại tỉnh táo.",
        category: "Sức khoẻ",
        readTime: "6 phút đọc",
        date: "12 Thg 2, 2026",
        image: "https://images.unsplash.com/photo-1517340135658-b64eb8c830eb?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 10,
        title: "Bí mật của Thói quen vi mô (Micro-habits)",
        excerpt: "Bắt đầu những thay đổi lớn lao bằng những hành động nhỏ bé chỉ tốn 2 phút mỗi ngày.",
        category: "Thói quen số",
        readTime: "7 phút đọc",
        date: "05 Thg 2, 2026",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 11,
        title: "Sức mạnh của việc đọc sách giấy trước khi ngủ",
        excerpt: "Tại sao việc loại bỏ ánh sáng xanh và thay bằng sách giấy giúp bạn ngủ sâu hơn.",
        category: "Tâm lý học",
        readTime: "4 phút đọc",
        date: "01 Thg 2, 2026",
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 12,
        title: "Hành trình bỏ hẳn smartphone trong 30 ngày",
        excerpt: "Ký sự về tháng ngày 'cai nghiện' điện thoại thông minh và những thay đổi kinh ngạc của bản thân.",
        category: "Câu chuyện",
        readTime: "12 phút đọc",
        date: "25 Thg 1, 2026",
        image: "https://images.unsplash.com/photo-1515378960530-7c0da6229674?q=80&w=800&auto=format&fit=crop"
    }
];

const CATEGORIES = ["Tất cả", "Tâm lý học", "Thói quen số", "Câu chuyện", "Công cụ", "Sức khoẻ"];
const ITEMS_PER_PAGE = 6;

export default function NewsPage() {
    useScrollReveal();
    const [activeCategory, setActiveCategory] = useState("Tất cả");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        document.title = 'Tin Tức & Blog – Dopaless';
        window.scrollTo(0, 0);
    }, []);

    // Filter Logic
    const filteredNews = activeCategory === "Tất cả"
        ? MOCK_NEWS
        : MOCK_NEWS.filter(news => news.category === activeCategory);

    // Pagination Logic
    const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentNews = filteredNews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setCurrentPage(1); // Reset page on category change
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll slightly up to grid start when changing page
        const gridSection = document.getElementById('news-grid-section');
        if (gridSection) {
            const offset = 100; // Account for fixed header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = gridSection.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth'
            });
        }
    };

    return (
        <main className="news-page">
            {/* ── HERO HEADER ── */}
            <section className="news-hero">
                <div className="news-hero-content reveal">
                    <span className="hero-badge">
                        <span className="hero-badge-dot" />
                        Góc Nhìn Khách Quan
                    </span>
                    <h1>
                        Blog & <span>Tin Tức</span>
                    </h1>
                    <p>
                        Cập nhật những kiến thức khoa học, thủ thuật và câu chuyện truyền cảm hứng để giúp bạn sống cân bằng hơn trong thế giới số.
                    </p>
                </div>
            </section>

            {/* ── CATEGORIES FILTER ── */}
            <section className="news-filter-section reveal">
                <div className="categories-list">
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── ARTICLES GRID ── */}
            <section id="news-grid-section" className="news-grid-section">
                <div className="news-grid">
                    {currentNews.map((news, index) => (
                        <article
                            className="news-card news-card-animated"
                            style={{ animationDelay: `${index * 0.08}s` }}
                            key={news.id}
                        >
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
                                <h2>
                                    <Link to={`/tin-tuc/${news.id}`}>{news.title}</Link>
                                </h2>
                                <p>{news.excerpt}</p>
                                <Link to={`/tin-tuc/${news.id}`} className="read-more-link">
                                    Đọc tiếp
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                {filteredNews.length === 0 && (
                    <div className="no-news-message news-card-animated">
                        <p>Hiện tại chưa có bài viết nào thuộc danh mục này. Hãy quay lại sau nhé!</p>
                    </div>
                )}

                {/* ── PAGINATION CONTROLS ── */}
                {totalPages > 1 && (
                    <div className="pagination-controls reveal">
                        <button
                            className="page-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            &larr;
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            className="page-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            &rarr;
                        </button>
                    </div>
                )}
            </section>

            {/* ── NEWSLETTER SUBSCRIPTION ── */}
            <section className="newsletter-section reveal">
                <div className="newsletter-container">
                    <div className="newsletter-text">
                        <h2>Đừng bỏ lỡ bài viết mới</h2>
                        <p>Đăng ký nhận bản tin định kỳ để không bỏ lỡ những kiến thức và phương pháp cải thiện sự tập trung.</p>
                    </div>
                    <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Đăng ký thành công!'); }}>
                        <input type="email" placeholder="Nhập email của bạn..." required />
                        <button type="submit" className="subscribe-btn">Đăng ký</button>
                    </form>
                </div>
            </section>
        </main>
    );
}
