import { useEffect, useState } from 'react';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { useAuth } from '../../../hooks/AuthContext';
import { contactApi } from '../../../apis/customerApi';
import { Link } from 'react-router-dom';
import Seo, { buildUrl } from '../../../components/Seo';
import './ContactPage.css';

export default function ContactPage() {
    useScrollReveal();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        document.title = 'Liên Hệ – Dopaless';
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, name: user.fullName || '' }));
        } else {
            setFormData(prev => ({ ...prev, name: '', message: '' }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        if (!formData.message.trim()) return;

        try {
            setIsLoading(true);
            setErrorMessage('');
            const response = await contactApi.submitContact({
                message: formData.message
            });
            if (response.data.success) {
                setIsSubmitted(true);
                setFormData(prev => ({ ...prev, message: '' }));
                setTimeout(() => {
                    setIsSubmitted(false);
                }, 3000);
            } else {
                setErrorMessage(response.data.message || 'Có lỗi xảy ra khi gửi tin nhắn.');
            }
        } catch (err) {
            console.error('Error sending contact message:', err);
            setErrorMessage(err.response?.data?.message || 'Không thể gửi tin nhắn liên hệ. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="contact-page">
            <Seo
                title="Liên hệ Dopaless - Hỗ trợ và tư vấn"
                description="Liên hệ Dopaless để được hỗ trợ về bài test dopamine, tài khoản, gói dịch vụ và các nội dung liên quan đến sức khỏe số."
                canonicalPath="/lien-he"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'ContactPage',
                    name: 'Liên hệ Dopaless',
                    url: buildUrl('/lien-he'),
                    contactPoint: {
                        '@type': 'ContactPoint',
                        email: 'tcoc24500@gmail.com',
                        telephone: '+84333086210',
                        contactType: 'customer support',
                        areaServed: 'VN',
                        availableLanguage: ['vi'],
                    },
                }}
            />
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
                        Dù bạn có thắc mắc về các bài test, bài viết, hay cần hỗ trợ kỹ thuật, hãy gửi lời nhắn trực tiếp cho chúng tôi qua form dưới đây.
                    </p>
                </div>
            </section>

            {/* ── INFO & FORM SECTION ── */}
            <section className="contact-main-section">
                <div className="contact-container">

                    {/* LEFT: Info Cards */}
                    <div className="contact-info reveal reveal-delay-1">
                        <h2>Thông tin liên lạc</h2>
                        <p className="info-desc">Bạn có thể liên hệ trực tiếp với chúng tôi qua các kênh dưới đây hoặc gửi tin nhắn hỗ trợ trực tiếp bên cạnh.</p>

                        <div className="info-cards">
                            <div className="info-card">
                                <div className="info-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="info-text">
                                    <h3>Email</h3>
                                    <p>
                                        <a href="mailto:tcoc24500@gmail.com" style={{ color: 'var(--teal)', textDecoration: 'none' }}>
                                            tcoc24500@gmail.com
                                        </a>
                                    </p>
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
                                    <p>Khu Công Nghệ Cao Hòa Lạc, CT03, Hòa Lạc</p>
                                    <p>Hà Nội, Việt Nam, Hanoi, Vietnam</p>
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
                                    <p>033 308 6210</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="social-links mt-4">
                            <p>Theo dõi chúng tôi:</p>
                            <div className="social-icons">
                                <a 
                                    href="https://www.facebook.com/profile.php?id=61590101353841" 
                                    className="social-icon" 
                                    aria-label="Facebook"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
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
                                <p>Lời nhắn của bạn đã được chuyển tới Admin Dopaless. Chúng tôi sẽ phản hồi sớm nhất qua hòm thư thông báo của bạn.</p>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-head">
                                    <h2>Gửi lời nhắn</h2>
                                </div>

                                {!user && (
                                    <div className="login-alert-banner">
                                        ⚠️ Bạn cần <Link to="/dang-nhap" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'underline' }}>Đăng nhập</Link> để gửi tin nhắn liên hệ.
                                    </div>
                                )}

                                {errorMessage && (
                                    <div className="error-message">
                                        {errorMessage}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="name">Họ và tên</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Tên của bạn..."
                                        value={formData.name}
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Nội dung</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        placeholder={user ? "Nhập nội dung bạn muốn gửi..." : "Đăng nhập để nhập nội dung..."}
                                        rows="6"
                                        value={formData.message}
                                        onChange={handleChange}
                                        disabled={!user}
                                        required
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn-submit"
                                    disabled={!user || !formData.message.trim() || isLoading}
                                >
                                    {isLoading ? 'Đang gửi thông điệp...' : 'Gửi thông điệp'}
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
