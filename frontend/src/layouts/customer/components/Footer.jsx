import { Link } from 'react-router-dom';
import './Footer.css';

const resourceLinks = [
    { label: 'Nghiên cứu khoa học', to: '#' },
    { label: 'Blog & Bài viết', to: '/articles' },
    { label: 'Hướng dẫn kỹ thuật số', to: '#' },
    { label: 'Podcast Dopaless', to: '#' },
    { label: '7-Day Reset Guide PDF', to: '#' },
];

const supportLinks = [
    { label: 'Về chúng tôi', to: '/gioi-thieu' },
    { label: 'Tham gia thử thách', to: '#' },
    { label: 'Liên hệ chuyên gia', to: '/lien-he' },
    { label: 'Cộng đồng Discord', to: '#' },
    { label: 'hello@dopaless.com', to: 'mailto:hello@dopaless.com' },
];

const socialLinks = [
    { label: '𝕏', title: 'Twitter', href: '#' },
    { label: '📷', title: 'Instagram', href: '#' },
    { label: 'f', title: 'Facebook', href: '#' },
    { label: '▶', title: 'YouTube', href: '#' },
];

export default function Footer() {
    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        // TODO: Kết nối với API
        alert('Cảm ơn bạn đã đăng ký!');
    };

    return (
        <footer>
            <div className="footer-grid">
                {/* Brand column */}
                <div className="footer-brand">
                    <Link to="/" className="footer-logo-wrapper" style={{ textDecoration: 'none' }}>
                        <span className="footer-brand-name" style={{ fontSize: '2rem', fontFamily: '"Outfit", sans-serif', fontWeight: '800', color: 'var(--white)' }}>DOPA<span style={{ color: 'var(--accent)' }}>MINE</span></span>
                    </Link>
                    <p>
                        Sứ mệnh của chúng tôi: giúp người trẻ Việt Nam hiểu rõ tác động
                        của dopamine và lấy lại quyền kiểm soát cuộc sống số của mình.
                    </p>
                    <p className="footer-disclaimer">
                        ⚕️ Disclaimer: Nội dung trên Dopaless chỉ mang tính giáo dục, không thay thế
                        chẩn đoán hoặc điều trị y tế chuyên nghiệp.
                    </p>
                    <div className="footer-social">
                        {socialLinks.map(({ label, title, href }) => (
                            <a key={title} className="social-btn" href={href} title={title} aria-label={title}>
                                {label}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Resources column */}
                <div className="footer-col">
                    <h4>Tài nguyên</h4>
                    <ul>
                        {resourceLinks.map(({ label, to }) => (
                            <li key={label}>
                                <Link to={to}>{label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Support column */}
                <div className="footer-col">
                    <h4>Liên kết & Hỗ trợ</h4>
                    <ul>
                        {supportLinks.map(({ label, to }) => (
                            <li key={label}>
                                <Link to={to}>{label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Newsletter column */}
                <div className="footer-newsletter">
                    <h4>Nhận kiến thức mỗi tuần</h4>
                    <p>
                        Các bài viết khoa học, mẹo sức khoẻ số và cập nhật từ cộng đồng Digital Reset —
                        mỗi thứ Hai.
                    </p>
                    <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                        <input
                            className="newsletter-input"
                            type="email"
                            placeholder="Email của bạn..."
                            required
                            aria-label="Email đăng ký nhận bản tin"
                        />
                        <button type="submit" className="newsletter-btn">Đăng ký</button>
                    </form>
                    <p className="newsletter-note">Không spam. Huỷ đăng ký bất cứ lúc nào.</p>
                </div>
            </div>

            <div className="footer-bottom">
                <span>© 2024 Dopaless Education. Bảo lưu mọi quyền.</span>
                <div className="footer-bottom-links">
                    <Link to="#">Chính sách bảo mật</Link>
                    <Link to="#">Điều khoản dịch vụ</Link>
                    <Link to="#">Disclaimer y tế</Link>
                </div>
            </div>
        </footer>
    );
}
