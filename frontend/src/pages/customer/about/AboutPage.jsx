import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import './AboutPage.css';

export default function AboutPage() {
    useScrollReveal();

    useEffect(() => {
        document.title = 'Giới Thiệu – Hành trình Dopaless';
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="about-page">
            {/* ── HERO BANNER ── */}
            <section className="about-hero">
                <div className="about-hero-content reveal">
                    <div className="hero-badge" style={{ justifyContent: 'center', margin: '0 auto 1.5rem', width: 'fit-content' }}>
                        <span className="hero-badge-dot" />
                        Câu chuyện Dopaless
                    </div>
                    <h1>
                        Hành trình tìm lại<br />
                        <span>Sự Tập Trung</span>
                    </h1>
                    <p>
                        Dopaless ra đời với sứ mệnh đồng hành cùng người trẻ Việt trong kỷ nguyên số, giúp
                        bạn thấu hiểu cơ chế Dopamine để làm chủ cuộc sống và tái kết nối với bản thân.
                    </p>
                </div>
            </section>

            {/* ── MISSION & VISION ── */}
            <section className="mission-vision-section">
                <div className="mv-container">
                    <div className="mv-card reveal">
                        <div className="mv-icon-wrapper">
                            {/* Target Icon */}
                            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2>Sứ mệnh của chúng tôi</h2>
                        <p>
                            Giúp <strong>người trẻ Việt Nam</strong> làm chủ Dopamine và giành
                            lại khả năng tập trung sâu. Chúng tôi tin rằng kiến thức khoa học là chìa khóa
                            để giải phóng tiềm năng con người khỏi sự lệ thuộc vào các kích thích kỹ thuật số.
                        </p>
                    </div>

                    <div className="mv-card reveal reveal-delay-1">
                        <div className="mv-icon-wrapper accent">
                            {/* Eye Icon */}
                            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h2>Tầm nhìn</h2>
                        <p>
                            Xây dựng một cộng đồng người trẻ sống <strong>tỉnh thức</strong>, có mối quan hệ lành
                            mạnh với công nghệ. Nơi mà công cụ kỹ thuật số phục vụ mục đích phát triển thay vì là
                            nguồn cơn của sự xao nhãng và lo âu.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── WHY CHOOSE US ── */}
            <section className="why-us-section">
                <div className="section-head reveal">
                    <span className="section-label">Giá trị cốt lõi</span>
                    <h2 className="section-title">Tại sao chọn Dopaless?</h2>
                    <p className="section-sub">Những giá trị cốt lõi giúp chúng tôi khác biệt trong hành trình đồng hành cùng bạn.</p>
                </div>

                <div className="steps-grid">
                    <div className="step-card reveal">
                        <div className="step-num" style={{ background: 'linear-gradient(135deg, var(--teal), var(--teal-light))' }}>🧪</div>
                        <h3>Kiến thức khoa học</h3>
                        <p>
                            Nội dung được cố vấn bởi các chuyên gia tâm lý và thần kinh học, đảm bảo tính chính xác và thực tiễn.
                        </p>
                    </div>

                    <div className="step-card reveal reveal-delay-1">
                        <div className="step-num" style={{ background: 'linear-gradient(135deg, var(--accent), #fb923c)' }}>🤝</div>
                        <h3>Cộng đồng hỗ trợ</h3>
                        <p>
                            Kết nối với những người cùng chí hướng, chia sẻ hành trình "detox" và cùng nhau tiến bộ mỗi ngày.
                        </p>
                    </div>

                    <div className="step-card reveal reveal-delay-2">
                        <div className="step-num" style={{ background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))' }}>🛠️</div>
                        <h3>Công cụ thực tế</h3>
                        <p>
                            Các bài test, lộ trình cá nhân hóa và bài tập thực hành giúp bạn thay đổi thói quen một cách bền vững.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── TEAM SECTION ── */}
            <section className="team-section">
                <div className="section-head reveal">
                    <span className="section-label">Con người Dopaless</span>
                    <h2 className="section-title">Đội ngũ của chúng tôi</h2>
                    <p className="section-sub">Những chuyên gia và những người trẻ tâm huyết phát triển cộng đồng Dopaless.</p>
                </div>

                <div className="team-grid">
                    {/* Team Member 1 */}
                    <div className="team-member reveal">
                        <div className="member-avatar">
                            <img src="https://ui-avatars.com/api/?name=Minh+Phan&background=0D080D&color=fff&size=200&font-size=0.33" alt="Minh Phan" />
                        </div>
                        <h4>Minh Phan</h4>
                        <p>Founder & CEO</p>
                    </div>

                    {/* Team Member 2 */}
                    <div className="team-member reveal reveal-delay-1">
                        <div className="member-avatar">
                            <img src="https://ui-avatars.com/api/?name=Linh+Nguyen&background=e6f5f4&color=0d7a6e&size=200&font-size=0.33" alt="Linh Nguyễn" />
                        </div>
                        <h4>Linh Nguyễn</h4>
                        <p>Content Strategy</p>
                    </div>

                    {/* Team Member 3 */}
                    <div className="team-member reveal reveal-delay-2">
                        <div className="member-avatar">
                            <img src="https://ui-avatars.com/api/?name=Hoang+Anh&background=0d7a6e&color=fff&size=200&font-size=0.33" alt="TS. Hoàng Anh" />
                        </div>
                        <h4>TS. Hoàng Anh</h4>
                        <p>Cố vấn Tâm lý</p>
                    </div>

                    {/* Team Member 4 */}
                    <div className="team-member reveal reveal-delay-3">
                        <div className="member-avatar">
                            <img src="https://ui-avatars.com/api/?name=Trang+Tran&background=f97316&color=fff&size=200&font-size=0.33" alt="Trang Trần" />
                        </div>
                        <h4>Trang Trần</h4>
                        <p>Community</p>
                    </div>
                </div>
            </section>

            {/* ── CTA SECTION ── */}
            <section className="about-cta-banner reveal">
                <p className="section-label">⚡ Thử thách bản thân</p>
                <h2 className="section-title">Sẵn sàng để làm chủ sự tập trung?</h2>
                <p className="section-sub">Bắt đầu hành trình của bạn ngay hôm nay với bài kiểm tra mức độ phụ thuộc Dopamine hoàn toàn miễn phí.</p>
                <div className="cta-buttons">
                    <Link to="/quizzes" className="about-banner-cta">Làm bài test ngay — miễn phí →</Link>
                </div>
            </section>
        </main>
    );
}
