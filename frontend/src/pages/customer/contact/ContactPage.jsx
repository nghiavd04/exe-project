import { useEffect, useState } from 'react';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import './ContactPage.css';

export default function ContactPage() {
    useScrollReveal();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        topic: 'general',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        document.title = 'Liên Hệ – Dopaless';
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Giả lập gửi form thành công
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({ name: '', email: '', topic: 'general', message: '' });
        }, 3000);
    };

    return (
        <main className="contact-page">
            {/* ── HERO SECTION ── */}
            <section className="contact-hero">
                <div className="contact-hero-content reveal">
                    <span className="hero-badge" style={{ justifyContent: 'center', margin: '0 auto 1.5rem', width: 'fit-content' }}>
                        <span className="hero-badge-dot" />
                        Kết nối & Hỗ trợ
                    </span>
                    <h1>
                        Chúng tôi luôn sẵn sàng<br /><span>lắng nghe bạn</span>
                    </h1>
                    <p>
                        Dù bạn có thắc mắc về các khóa học, cần hỗ trợ kỹ thuật, hay đơn giản chỉ muốn chia sẻ câu chuyện "detox" của bản thân, đừng ngần ngại nhắn cho Dopaless.
                    </p>
                </div>
            </section>

            {/* ── INFO & FORM SECTION ── */}
            <section className="contact-main-section">
                <div className="contact-container">

                    {/* LEFT: Info Cards */}
                    <div className="contact-info reveal reveal-delay-1">
                        <h2>Thông tin liên lạc</h2>
                        <p className="info-desc">Bạn có thể liên hệ trực tiếp với chúng tôi qua các kênh dưới đây hoặc để lại lời nhắn qua form bên cạnh.</p>

                        <div className="info-cards">
                            <div className="info-card">
                                <div className="info-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="info-text">
                                    <h3>Email</h3>
                                    <p>hello@dopaless.com</p>
                                    <p>support@dopaless.com</p>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="info-text">
                                    <h3>Địa chỉ</h3>
                                    <p>Tòa nhà Innovation Plaza, Quận 1</p>
                                    <p>Thành phố Hồ Chí Minh</p>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div className="info-text">
                                    <h3>Hotline</h3>
                                    <p>+84 987 654 321</p>
                                    <span>Thứ 2 - Thứ 6: 09:00 - 18:00</span>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="social-links mt-4">
                            <p>Theo dõi chúng tôi:</p>
                            <div className="social-icons">
                                <a href="#" className="social-icon" aria-label="Facebook">
                                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                    </svg>
                                </a>
                                <a href="#" className="social-icon" aria-label="Instagram">
                                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                    </svg>
                                </a>
                                <a href="#" className="social-icon" aria-label="Twitter">
                                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                                    </svg>
                                </a>
                                <a href="#" className="social-icon" aria-label="YouTube">
                                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                                    </svg>
                                </a>
                                <a href="#" className="social-icon" aria-label="Zalo">
                                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21.1 12.1a9 9 0 1 0-14 7.6l-3.3 1.1 1.2-3.2a9 9 0 0 0 16.1-5.5Z" />
                                        <text x="50%" y="58%" textAnchor="middle" fontSize="9" fontWeight="800" fill="currentColor" stroke="none">Z</text>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Contact Form */}
                    <div className="contact-form-wrapper reveal reveal-delay-2">
                        {isSubmitted ? (
                            <div className="success-message">
                                <div className="success-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3>Gửi thành công!</h3>
                                <p>Cảm ơn bạn đã liên hệ. Đội ngũ Dopaless sẽ phản hồi lại bạn qua email thông thường trong vòng 24h làm việc.</p>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-head">
                                    <h2>Gửi lời nhắn</h2>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="name">Họ và tên</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Ví dụ: Nguyễn Văn A"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Ví dụ: email@gmail.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="topic">Chủ đề</label>
                                    <div className="select-wrapper">
                                        <select
                                            id="topic"
                                            name="topic"
                                            value={formData.topic}
                                            onChange={handleChange}
                                        >
                                            <option value="general">Thắc mắc chung</option>
                                            <option value="feedback">Góp ý ứng dụng</option>
                                            <option value="story">Chia sẻ câu chuyện</option>
                                            <option value="partnership">Hợp tác & Tài trợ</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Nội dung</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        placeholder="Nhập nội dung bạn muốn gửi..."
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn-submit">
                                    Gửi thông điệp
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
