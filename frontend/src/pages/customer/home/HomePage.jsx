import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../../components/Seo';
import { buildUrl } from '../../../components/Seo/seoUtils';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import './HomePage.css';

export default function HomePage() {
    const [openFaq, setOpenFaq] = useState(1);

    useScrollReveal();

    useEffect(() => {
        document.title = 'Dopaless – Định nghĩa về Dopamine';
    }, []);

    const toggleFaq = (id) => {
        setOpenFaq((prev) => (prev === id ? null : id));
    };

    return (
        <main>
            <Seo
                title="Dopaless - Kiểm tra dopamine và lấy lại sự tập trung"
                description="Dopaless giúp bạn hiểu cơ chế dopamine, kiểm tra mức độ lệ thuộc thói quen số và bắt đầu lộ trình cải thiện sự tập trung."
                canonicalPath="/"
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: 'Dopaless',
                        url: buildUrl('/'),
                        logo: buildUrl('/favicon.svg'),
                        sameAs: ['https://www.facebook.com/profile.php?id=61590101353841'],
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebSite',
                        name: 'Dopaless',
                        url: buildUrl('/'),
                        inLanguage: 'vi-VN',
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            {
                                '@type': 'Question',
                                name: 'Các bài test dopamine có độ chính xác cao không?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Các bài test của Dopaless giúp người dùng tự đánh giá thói quen số và nhận diện dấu hiệu mất cân bằng dopamine, không thay thế chẩn đoán y tế.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Khi nào nên làm bài test dopamine?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Bạn có thể làm bài test khi cảm thấy khó tập trung, dễ bị phân tâm hoặc thường xuyên dùng mạng xã hội quá mức.',
                                },
                            },
                        ],
                    },
                ]}
            />
            {/* ── HERO ── */}
            <section id="hero">
                <div className="hero-inner">
                    <div className="hero-left">
                        <div className="hero-badge">
                            <span className="hero-badge-dot" />
                            Khoa học thần kinh & sức khoẻ số
                        </div>
                        <h1 className="hero-title">
                            Não bạn đang bị<br />
                            <span>thao túng bởi <br />dopamine.</span>
                        </h1>
                        <p className="hero-desc">
                            Trung bình sinh viên dành hơn{' '}
                            <strong style={{ color: 'var(--accent)', fontWeight: '700' }}>
                                4–6 giờ mỗi ngày
                            </strong>{' '}
                            cho mạng xã hội. Điều đó đang âm thầm phá huỷ khả năng tập trung
                            và động lực của bạn — và bạn có thể chưa nhận ra.
                        </p>
                        <div className="hero-ctas">
                            <a href="#test-section" className="btn-primary">
                                Bắt đầu kiểm tra ngay →
                            </a>
                            <a 
                                href="https://www.facebook.com/profile.php?id=61590101353841" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn-secondary"
                            >
                                Tham gia cộng đồng
                            </a>
                        </div>
                    </div>
                    <div className="hero-image-wrap">
                        <div className="hero-img-card">
                            {/* Dopamine Reward Loop Infographic */}
                            <svg
                                viewBox="0 0 380 380"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ width: '90%', height: '90%' }}
                            >
                                <defs>
                                    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#c8ece9" />
                                        <stop offset="100%" stopColor="#e6f5f4" />
                                    </radialGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                {/* Background circle */}
                                <circle
                                    cx="190"
                                    cy="190"
                                    r="170"
                                    fill="url(#bgGrad)"
                                    opacity="0.6"
                                />
                                {/* Central brain icon */}
                                <text
                                    x="190"
                                    y="205"
                                    textAnchor="middle"
                                    fontSize="52"
                                    style={{ fontFamily: 'serif' }}
                                >
                                    🧠
                                </text>
                                {/* Loop arrows (circular path) */}
                                <g fill="none" strokeWidth="2.5" strokeDasharray="8,4">
                                    <path
                                        d="M190,60 A130,130 0 0,1 320,190"
                                        stroke="#0d7a6e"
                                        opacity="0.5"
                                    >
                                        <animate
                                            attributeName="stroke-dashoffset"
                                            from="0"
                                            to="-48"
                                            dur="2s"
                                            repeatCount="indefinite"
                                        />
                                    </path>
                                    <path
                                        d="M320,190 A130,130 0 0,1 190,320"
                                        stroke="#f97316"
                                        opacity="0.5"
                                    >
                                        <animate
                                            attributeName="stroke-dashoffset"
                                            from="0"
                                            to="-48"
                                            dur="2s"
                                            begin="0.66s"
                                            repeatCount="indefinite"
                                        />
                                    </path>
                                    <path
                                        d="M190,320 A130,130 0 0,1 60,190"
                                        stroke="#0d7a6e"
                                        opacity="0.5"
                                    >
                                        <animate
                                            attributeName="stroke-dashoffset"
                                            from="0"
                                            to="-48"
                                            dur="2s"
                                            begin="1.33s"
                                            repeatCount="indefinite"
                                        />
                                    </path>
                                    <path
                                        d="M60,190 A130,130 0 0,1 190,60"
                                        stroke="#f97316"
                                        opacity="0.5"
                                    >
                                        <animate
                                            attributeName="stroke-dashoffset"
                                            from="0"
                                            to="-48"
                                            dur="2s"
                                            begin="1.0s"
                                            repeatCount="indefinite"
                                        />
                                    </path>
                                </g>
                                {/* Step nodes */}
                                {/* Step 1: Kích thích (top) */}
                                <circle
                                    cx="190"
                                    cy="55"
                                    r="34"
                                    fill="#0d7a6e"
                                    filter="url(#glow)"
                                >
                                    <animate
                                        attributeName="r"
                                        values="34;37;34"
                                        dur="3s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                                <text x="190" y="49" textAnchor="middle" fontSize="16">
                                    📱
                                </text>
                                <text
                                    x="190"
                                    y="67"
                                    textAnchor="middle"
                                    fontSize="9"
                                    fill="white"
                                    fontWeight="bold"
                                    fontFamily="sans-serif"
                                >
                                    Kích thích
                                </text>
                                {/* Step 2: Dopamine spike (right) */}
                                <circle
                                    cx="328"
                                    cy="190"
                                    r="34"
                                    fill="#f97316"
                                    filter="url(#glow)"
                                >
                                    <animate
                                        attributeName="r"
                                        values="34;37;34"
                                        dur="3s"
                                        begin="1s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                                <text x="328" y="183" textAnchor="middle" fontSize="16">
                                    ⚡
                                </text>
                                <text
                                    x="328"
                                    y="201"
                                    textAnchor="middle"
                                    fontSize="9"
                                    fill="white"
                                    fontWeight="bold"
                                    fontFamily="sans-serif"
                                >
                                    Dopamine
                                </text>
                                {/* Step 3: Crash (bottom) */}
                                <circle
                                    cx="190"
                                    cy="327"
                                    r="34"
                                    fill="#0d7a6e"
                                    filter="url(#glow)"
                                >
                                    <animate
                                        attributeName="r"
                                        values="34;37;34"
                                        dur="3s"
                                        begin="2s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                                <text x="190" y="321" textAnchor="middle" fontSize="16">
                                    📉
                                </text>
                                <text
                                    x="190"
                                    y="339"
                                    textAnchor="middle"
                                    fontSize="9"
                                    fill="white"
                                    fontWeight="bold"
                                    fontFamily="sans-serif"
                                >
                                    Sụt giảm
                                </text>
                                {/* Step 4: Craving (left) */}
                                <circle
                                    cx="52"
                                    cy="190"
                                    r="34"
                                    fill="#f97316"
                                    filter="url(#glow)"
                                >
                                    <animate
                                        attributeName="r"
                                        values="34;37;34"
                                        dur="3s"
                                        begin="1.5s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                                <text x="52" y="183" textAnchor="middle" fontSize="16">
                                    🔄
                                </text>
                                <text
                                    x="52"
                                    y="201"
                                    textAnchor="middle"
                                    fontSize="9"
                                    fill="white"
                                    fontWeight="bold"
                                    fontFamily="sans-serif"
                                >
                                    Thèm muốn
                                </text>
                                {/* Center label */}
                                <text
                                    x="190"
                                    y="235"
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#5a7a76"
                                    fontFamily="sans-serif"
                                    fontWeight="600"
                                >
                                    VÒNG LẶP DOPAMINE
                                </text>
                            </svg>
                        </div>
                        <div className="hero-float hero-float-1">
                            <span className="float-icon">😵</span>
                            <span>Mất 4–6h/ngày</span>
                        </div>
                        <div className="hero-float hero-float-2">
                            <span className="float-icon">🔓</span>
                            <span>Thoát vòng lặp</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS STRIP ── */}
            <div className="stats-strip">
                <div className="stat-item reveal">
                    <span className="stat-num">
                        50<span>K+</span>
                    </span>
                    <span className="stat-label">Người đã làm bài test</span>
                </div>
                <div className="stat-item reveal reveal-delay-1">
                    <span className="stat-num">
                        92<span>%</span>
                    </span>
                    <span className="stat-label">Độ chính xác khoa học</span>
                </div>
                <div className="stat-item reveal reveal-delay-2">
                    <span className="stat-num">
                        5<span> phút</span>
                    </span>
                    <span className="stat-label">Hoàn thành bài test</span>
                </div>
                <div className="stat-item reveal reveal-delay-3">
                    <span className="stat-num">
                        100<span>%</span>
                    </span>
                    <span className="stat-label">Hoàn toàn miễn phí</span>
                </div>
            </div>

            {/* ── URGENT TEST CTA BANNER ── */}
            <div
                style={{
                    background: 'linear-gradient(135deg, #fff7ed, #fff)',
                    borderTop: '3px solid var(--accent)',
                    borderBottom: '1px solid rgba(249, 115, 22, 0.15)',
                    padding: '2.5rem 3%',
                    textAlign: 'center',
                }}
                id="test-banner"
            >
                <p
                    style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        color: 'var(--accent)',
                        marginBottom: '0.6rem',
                    }}
                >
                    ⚡ Bài kiểm tra miễn phí
                </p>
                <h2
                    style={{
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
                        fontWeight: 800,
                        color: 'var(--text)',
                        letterSpacing: '-0.5px',
                        marginBottom: '0.8rem',
                    }}
                >
                    Bạn đang lệ thuộc dopamine ở mức độ nào?
                </h2>
                <p
                    style={{
                        color: 'var(--muted)',
                        fontSize: '0.95rem',
                        marginBottom: '1.6rem',
                        maxWidth: '480px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        lineHeight: 1.7,
                    }}
                >
                    Kiểm tra mức độ lệ thuộc dopamine của bạn trong{' '}
                    <strong style={{ color: 'var(--text)' }}>5 phút</strong>. Hoàn toàn
                    miễn phí, dựa trên nghiên cứu khoa học.
                </p>
                <a href="#test-section" className="test-banner-cta">
                    Làm bài test ngay — miễn phí →
                </a>
            </div>

            {/* ── TEST SECTION ── */}
            <section id="test-section">
                <div className="test-inner">
                    <div
                        className="test-img-card reveal"
                        style={{
                            flexDirection: 'column',
                            gap: '1rem',
                            padding: '2rem',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>📱</div>
                        <div
                            style={{
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontFamily: '"Outfit", sans-serif',
                            }}
                        >
                            Bạn có nhận ra mình?
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.6rem',
                                textAlign: 'left',
                                width: '100%',
                                maxWidth: '220px',
                            }}
                        >
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    borderRadius: '8px',
                                    padding: '0.6rem 0.9rem',
                                    fontSize: '0.82rem',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                }}
                            >
                                ✓ Lướt điện thoại khi buồn chán
                            </div>
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    borderRadius: '8px',
                                    padding: '0.6rem 0.9rem',
                                    fontSize: '0.82rem',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                }}
                            >
                                ✓ Mất tập trung sau vài phút
                            </div>
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    borderRadius: '8px',
                                    padding: '0.6rem 0.9rem',
                                    fontSize: '0.82rem',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                }}
                            >
                                ✓ Khó ngủ vì điện thoại
                            </div>
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    borderRadius: '8px',
                                    padding: '0.6rem 0.9rem',
                                    fontSize: '0.82rem',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                }}
                            >
                                ✓ Cảm giác "thiếu gì đó"
                            </div>
                        </div>
                    </div>
                    <div className="test-content reveal reveal-delay-1">
                        <span className="section-label">Bài kiểm tra tâm lý miễn phí</span>
                        <h2>Vì sao bạn không thể ngừng lướt mạng xã hội?</h2>
                        <p>
                            Đây không phải lỗi ý chí — đây là neuroscience. Các ứng dụng được
                            thiết kế chủ đích để khai thác hệ thống dopamine của não bạn. Bài
                            test của chúng tôi giúp bạn hiểu rõ bạn đang ở đâu trong vòng lặp
                            này.
                        </p>
                        <p className="test-note">
                            ⚠️ Lưu ý: Đây không phải chuẩn đoán y tế chính thức, nhưng là bước
                            đầu tiên quan trọng để thấu hiểu bản thân và lấy lại kiểm soát.
                        </p>
                        <p>
                            Bài test hoàn toàn <strong>miễn phí</strong>, đơn giản, chỉ mất
                            <strong> 5 phút</strong> và được xây dựng dựa trên nghiên cứu tâm
                            lý học hành vi.
                        </p>
                        <Link to="/trac-nghiem" className="btn-white">
                            Bắt đầu kiểm tra ngay →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section>
                <div id="how">
                    <div className="section-head">
                        <span className="section-label">Khoa học não bộ</span>
                        <h2 className="section-title">Cách thức hoạt động</h2>
                        <p className="section-sub">
                            Công nghệ hiện đại được thiết kế để khai thác hệ thống phần thưởng
                            của não bộ. Mỗi lần bạn nhận thông báo, não bạn bị "kéo dây"{' '}
                            <strong style={{ color: 'var(--accent)' }}>
                                giống cơ chế máy đánh bạc
                            </strong>
                            .
                        </p>
                    </div>
                    <div className="steps-grid">
                        <div className="step-card reveal">
                            <div className="step-num">1</div>
                            <h3>Kích thích</h3>
                            <p>
                                Một thông báo, một video tự động phát — não bạn ngay lập tức
                                tiết ra tín hiệu dopamine kỳ vọng phần thưởng, giống cú kéo máy
                                slot.
                            </p>
                        </div>
                        <div className="step-card reveal reveal-delay-1">
                            <div className="step-num">2</div>
                            <h3>Hành động</h3>
                            <p>
                                Bạn tương tác, tạo ra một đợt tăng dopamine tức thời nhưng ngắn
                                ngủi. Não ghi nhận: <em>"làm lại đi!"</em>
                            </p>
                        </div>
                        <div className="step-card reveal reveal-delay-2">
                            <div className="step-num">3</div>
                            <h3>Sự sụt giảm</h3>
                            <p>
                                Dopamine rơi xuống dưới mức nền, khiến bạn bồn chồn, trống rỗng
                                và bắt buộc phải tìm kích thích mới để "bù lại". Vòng lặp tiếp
                                tục.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── COMMUNITY / MOVEMENT SECTION ── */}
            <section
                style={{
                    background: 'var(--teal-dark)',
                    padding: '80px 3%',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '-30%',
                        right: '-5%',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: 'rgba(249, 115, 22, 0.08)',
                        pointerEvents: 'none',
                    }}
                />
                <div
                    style={{
                        maxWidth: '1300px',
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '4rem',
                        alignItems: 'center',
                    }}
                >
                    <div className="reveal">
                        <span
                            style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                                color: 'var(--accent)',
                                marginBottom: '0.75rem',
                                display: 'block',
                            }}
                        >
                            🔥 Phong trào
                        </span>
                        <h2
                            style={{
                                fontFamily: '"Outfit", sans-serif',
                                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                                fontWeight: 800,
                                lineHeight: 1.2,
                                color: '#fff',
                                marginBottom: '1rem',
                                letterSpacing: '-0.5px',
                            }}
                        >
                            7-Day Dopamine
                            <br />
                            Reset Challenge
                        </h2>
                        <p
                            style={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                lineHeight: 1.75,
                                fontSize: '0.95rem',
                                marginBottom: '1.4rem',
                                fontWeight: 300,
                            }}
                        >
                            Tham gia thử thách 7 ngày cùng cộng đồng Digital Reset Hà Nội.
                            Không cần ngắt kết nối hoàn toàn — chỉ cần xây dựng lại mối quan
                            hệ lành mạnh hơn với công nghệ.
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                gap: '1rem',
                                flexWrap: 'wrap',
                                marginBottom: '2rem',
                            }}
                        >
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '10px',
                                    padding: '0.7rem 1.2rem',
                                    textAlign: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: '"Outfit", sans-serif',
                                        fontSize: '1.6rem',
                                        fontWeight: 800,
                                        color: '#fff',
                                    }}
                                >
                                    1.200<span style={{ color: 'var(--accent)' }}>+</span>
                                </div>
                                <div
                                    style={{
                                        fontSize: '0.78rem',
                                        color: 'rgba(255, 255, 255, 0.55)',
                                    }}
                                >
                                    đã tham gia
                                </div>
                            </div>
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '10px',
                                    padding: '0.7rem 1.2rem',
                                    textAlign: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: '"Outfit", sans-serif',
                                        fontSize: '1.6rem',
                                        fontWeight: 800,
                                        color: '#fff',
                                    }}
                                >
                                    7
                                </div>
                                <div
                                    style={{
                                        fontSize: '0.78rem',
                                        color: 'rgba(255, 255, 255, 0.55)',
                                    }}
                                >
                                    ngày thử thách
                                </div>
                            </div>
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '10px',
                                    padding: '0.7rem 1.2rem',
                                    textAlign: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: '"Outfit", sans-serif',
                                        fontSize: '1.6rem',
                                        fontWeight: 800,
                                        color: '#fff',
                                    }}
                                >
                                    100<span style={{ color: 'var(--accent)' }}>%</span>
                                </div>
                                <div
                                    style={{
                                        fontSize: '0.78rem',
                                        color: 'rgba(255, 255, 255, 0.55)',
                                    }}
                                >
                                    miễn phí
                                </div>
                            </div>
                        </div>
                        <a href="#" className="btn-challenge">
                            Tham gia thử thách ngay 🔥
                        </a>
                    </div>
                    <div
                        className="reveal reveal-delay-1"
                        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                        <div
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: '16px',
                                padding: '1.4rem 1.6rem',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    color: 'var(--accent)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '0.5rem',
                                }}
                            >
                                📚 Nghiên cứu Stanford
                            </div>
                            <p
                                style={{
                                    fontSize: '0.88rem',
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    lineHeight: 1.7,
                                    fontStyle: 'italic',
                                }}
                            >
                                "Người trẻ sử dụng mạng xã hội hơn 3 giờ/ngày có nguy cơ trầm
                                cảm và lo âu cao hơn đáng kể so với nhóm dưới 1 giờ."
                            </p>
                            <div
                                style={{
                                    fontSize: '0.78rem',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    marginTop: '0.5rem',
                                }}
                            >
                                — Journal of Adolescent Health, 2023
                            </div>
                        </div>
                        <div
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: '16px',
                                padding: '1.4rem 1.6rem',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    color: 'var(--accent)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '0.5rem',
                                }}
                            >
                                🧠 Neuroscience Today
                            </div>
                            <p
                                style={{
                                    fontSize: '0.88rem',
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    lineHeight: 1.7,
                                    fontStyle: 'italic',
                                }}
                            >
                                "Cơ chế phần thưởng ngẫu nhiên (variable reward) trong mạng xã
                                hội hoạt động tương tự cơ chế cuốn hút của máy đánh bạc."
                            </p>
                            <div
                                style={{
                                    fontSize: '0.78rem',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    marginTop: '0.5rem',
                                }}
                            >
                                — BJ Fogg, Behavior Design Lab
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SOCIAL PROOF ── */}
            <section id="social-proof">
                <div className="proof-inner">
                    <div className="section-head">
                        <span className="section-label">Cộng đồng tin tưởng</span>
                        <h2 className="section-title">
                            Đã có 1.200+ người tham gia thử thách 7 ngày
                        </h2>
                        <p className="section-sub">
                            Những người thật, kết quả thật — không phải quảng cáo.
                        </p>
                    </div>

                    <div className="proof-stats">
                        <div className="proof-stat-card reveal">
                            <span className="proof-stat-num">
                                50<span className="accent">K+</span>
                            </span>
                            <span className="proof-stat-label">Bài test đã hoàn thành</span>
                        </div>
                        <div className="proof-stat-card reveal reveal-delay-1">
                            <span className="proof-stat-num">
                                4.<span className="accent">8</span>⭐
                            </span>
                            <span className="proof-stat-label">Đánh giá trung bình</span>
                        </div>
                        <div className="proof-stat-card reveal reveal-delay-2">
                            <span className="proof-stat-num">
                                87<span className="accent">%</span>
                            </span>
                            <span className="proof-stat-label">
                                Cảm thấy tập trung hơn sau 7 ngày
                            </span>
                        </div>
                    </div>

                    <div className="testimonials-grid">
                        <div className="testi-card reveal">
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">
                                "Sau khi làm bài test và đọc các bài viết trên Dopaless, tôi hiểu
                                tại sao mình không thể ngừng lướt điện thoại. Thật khai sáng!"
                            </p>
                            <div className="testi-author">
                                <div className="testi-avatar">LM</div>
                                <div>
                                    <div className="testi-name">Lê Minh Anh</div>
                                    <div className="testi-role">Sinh viên đại học, 21 tuổi</div>
                                </div>
                            </div>
                        </div>
                        <div className="testi-card reveal reveal-delay-1">
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">
                                "Bài test chính xác đến bất ngờ. Tôi đã nhận ra mình đang trong
                                vòng lặp dopamine mà không hề hay biết. Cảm ơn Dopaless!"
                            </p>
                            <div className="testi-author">
                                <div className="testi-avatar">NT</div>
                                <div>
                                    <div className="testi-name">Nguyễn Thị Thu</div>
                                    <div className="testi-role">Giáo viên, 34 tuổi</div>
                                </div>
                            </div>
                        </div>
                        <div className="testi-card reveal reveal-delay-2">
                            <div className="testi-stars">★★★★☆</div>
                            <p className="testi-text">
                                "Nội dung khoa học nhưng dễ hiểu. Tôi đã chia sẻ cho cả gia đình
                                cùng đọc. Mong có thêm nhiều bài viết về chủ đề này!"
                            </p>
                            <div className="testi-author">
                                <div className="testi-avatar">PH</div>
                                <div>
                                    <div className="testi-name">Phạm Hoàng Long</div>
                                    <div className="testi-role">Kỹ sư phần mềm, 28 tuổi</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section>
                <div id="faq">
                    <div className="section-head">
                        <span className="section-label">Giải đáp</span>
                        <h2 className="section-title">Câu Hỏi Thường Gặp</h2>
                    </div>
                    <div className="faq-list">
                        <div className="reveal">
                            <div className={`faq-item ${openFaq === 1 ? 'open' : ''}`}>
                                <button className="faq-q" onClick={() => toggleFaq(1)}>
                                    <span style={{ flex: 1, paddingRight: '1rem' }}>Các bài test có độ chính xác cao không?</span>
                                    <span className="faq-icon">
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                                <div className="faq-a">
                                    Các bài test của chúng tôi được phát triển dựa trên nghiên cứu
                                    của các chuyên gia tâm lý và tâm thần hàng đầu thế giới. Chúng
                                    được tổng hợp từ nhiều nguồn uy tín như tạp chí chuyên ngành và
                                    kết quả nghiên cứu từ các viện danh tiếng.
                                </div>
                            </div>
                        </div>

                        <div className="reveal reveal-delay-1">
                            <div className={`faq-item ${openFaq === 2 ? 'open' : ''}`}>
                                <button className="faq-q" onClick={() => toggleFaq(2)}>
                                    <span style={{ flex: 1, paddingRight: '1rem' }}>Khi nào là lúc phù hợp để test dopamine?</span>
                                    <span className="faq-icon">
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                                <div className="faq-a">
                                    Bất kỳ lúc nào bạn cảm thấy khó tập trung, dễ bị phân tâm, hay
                                    cảm giác "trống rỗng" sau khi dùng mạng xã hội đều là dấu hiệu
                                    tốt để làm bài test.
                                </div>
                            </div>
                        </div>

                        <div className="reveal reveal-delay-2">
                            <div className={`faq-item ${openFaq === 3 ? 'open' : ''}`}>
                                <button className="faq-q" onClick={() => toggleFaq(3)}>
                                    <span style={{ flex: 1, paddingRight: '1rem' }}>Test xong tôi có dấu hiệu mất cân bằng thì nên làm thế nào?</span>
                                    <span className="faq-icon">
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                                <div className="faq-a">
                                    Chúng tôi cung cấp hướng dẫn cụ thể và tài nguyên học tập miễn
                                    phí sau khi bạn hoàn thành bài test. Ngoài ra, chúng tôi khuyên
                                    bạn nên trao đổi với chuyên gia tâm lý nếu tình trạng nghiêm
                                    trọng.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}


