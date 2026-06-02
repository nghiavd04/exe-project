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
                            Kết nối với những người cùng chí hướng, chia sẻ hành trình cân bằng cuộc sống và cùng nhau tiến bộ mỗi ngày.
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
                            <img src="https://ui-avatars.com/api/?name=Phung+Dang&background=0d7a6e&color=fff&size=200&font-size=0.33" alt="Phùng Quang Đăng" />
                        </div>
                        <h4>Phùng Quang Đăng</h4>
                        <p>CEO – Nhà sáng lập & Điều hành</p>
                    </div>

                    {/* Team Member 2 */}
                    <div className="team-member reveal reveal-delay-1">
                        <div className="member-avatar">
                            <img src="https://ui-avatars.com/api/?name=Nguyen+Quoc&background=f97316&color=fff&size=200&font-size=0.33" alt="Nguyễn Dư Quốc" />
                        </div>
                        <h4>Nguyễn Dư Quốc</h4>
                        <p>COO – Giám đốc Vận hành</p>
                    </div>

                    {/* Team Member 3 */}
                    <div className="team-member reveal reveal-delay-2">
                        <div className="member-avatar">
                            <img src="https://ui-avatars.com/api/?name=Nguyen+Son&background=1a1a4b&color=fff&size=200&font-size=0.33" alt="Nguyễn Thái Sơn" />
                        </div>
                        <h4>Nguyễn Thái Sơn</h4>
                        <p>CMO – Giám đốc Marketing</p>
                    </div>

                    {/* Team Member 4 */}
                    <div className="team-member reveal">
                        <div className="member-avatar">
                            <img src="https://ui-avatars.com/api/?name=To+Tung&background=e6f5f4&color=0d7a6e&size=200&font-size=0.33" alt="Tô Quốc Tùng" />
                        </div>
                        <h4>Tô Quốc Tùng</h4>
                        <p>CTO – Giám đốc Công nghệ</p>
                    </div>

                    {/* Team Member 5 */}
                    <div className="team-member reveal reveal-delay-1">
                        <div className="member-avatar">
                            <img src="https://ui-avatars.com/api/?name=Le+Toan&background=fed7aa&color=c2410c&size=200&font-size=0.33" alt="Lê Xuân Toàn" />
                        </div>
                        <h4>Lê Xuân Toàn</h4>
                        <p>CDO – Giám đốc Thiết kế</p>
                    </div>

                    {/* Team Member 6 */}
                    <div className="team-member reveal reveal-delay-2">
                        <div className="member-avatar">
                            <img src="https://ui-avatars.com/api/?name=Vu+Nghia&background=ddd6fe&color=6d28d9&size=200&font-size=0.33" alt="Vũ Đức Nghĩa" />
                        </div>
                        <h4>Vũ Đức Nghĩa</h4>
                        <p>CPO – Giám đốc Sản phẩm</p>
                    </div>
                </div>
            </section>

            {/* ── LEGAL CARDS SECTION ── */}
            <section className="about-legal-section">
                <div className="section-head reveal">
                    <span className="section-label">Cam kết pháp lý</span>
                    <h2 className="section-title">Quyền lợi & Bảo mật của bạn</h2>
                    <p className="section-sub">Chúng tôi luôn đặt quyền lợi thông tin cá nhân và sự minh bạch về y khoa của bạn lên hàng đầu.</p>
                </div>

                <div className="legal-cards-container">
                    {/* Card 1: Điều khoản sử dụng */}
                    <div className="legal-summary-card reveal">
                        <div className="legal-card-icon">
                            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3>Điều khoản sử dụng</h3>
                        <p>
                            Quy định rõ ràng về trách nhiệm sử dụng nền tảng. Dopaless đưa ra các <strong>tuyên bố miễn trừ trách nhiệm y khoa</strong> nhằm đảm bảo bạn hiểu rõ các bài test chỉ mang tính chất định hướng và tự nhận thức, không thay thế cho chẩn đoán y tế.
                        </p>
                        <Link to="/dieu-khoan-dich-vu?tab=terms" target="_blank" rel="noopener noreferrer" className="btn-legal-link">
                            Đọc toàn bộ điều khoản <span>→</span>
                        </Link>
                    </div>

                    {/* Card 2: Chính sách bảo mật */}
                    <div className="legal-summary-card reveal reveal-delay-1">
                        <div className="legal-card-icon shield">
                            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3>Chính sách bảo mật</h3>
                        <p>
                            Chúng tôi cam kết <strong>bảo mật tuyệt đối 100% kết quả trắc nghiệm</strong> và dữ liệu lịch sử làm bài kiểm tra cá nhân của bạn. Không mua bán, không tiết lộ cho bất kỳ bên thứ ba nào khi chưa có sự đồng ý của bạn.
                        </p>
                        <Link to="/dieu-khoan-dich-vu?tab=privacy" target="_blank" rel="noopener noreferrer" className="btn-legal-link">
                            Xem chính sách bảo mật <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── CTA SECTION ── */}
            <section className="about-cta-banner reveal">
                <p className="section-label">⚡ Thử thách bản thân</p>
                <h2 className="section-title">Sẵn sàng để làm chủ sự tập trung?</h2>
                <p className="section-sub">Bắt đầu hành trình của bạn ngay hôm nay với bài kiểm tra mức độ phụ thuộc Dopamine hoàn toàn miễn phí.</p>
                <div className="cta-buttons">
                    <Link to="/trac-nghiem" className="about-banner-cta">Làm bài test ngay — miễn phí →</Link>
                </div>
                <div className="about-legal-note" style={{ marginTop: '2.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Bằng việc tham gia, bạn đồng ý với các <Link to="/dieu-khoan-dich-vu?tab=terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal)', fontWeight: '600', textDecoration: 'underline' }}>Điều khoản dịch vụ</Link> và <Link to="/dieu-khoan-dich-vu?tab=privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal)', fontWeight: '600', textDecoration: 'underline' }}>Chính sách bảo mật</Link> của chúng tôi.
                </div>
            </section>
        </main>
    );
}
