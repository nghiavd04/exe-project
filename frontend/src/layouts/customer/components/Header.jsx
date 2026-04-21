import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const navLinks = [
    { to: '/', label: 'Trang Chủ' },
    { to: '/gioi-thieu', label: 'Giới Thiệu' },
    { to: '/quizzes', label: 'Bài Test' },
    { to: '/articles', label: 'Tin Tức' },
    { to: '/lien-he', label: 'Liên Hệ' },
];

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        } else {
            setUser(null);
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setDropdownOpen(false);
        navigate('/');
    };

    // Close mobile menu on route change
    const handleNavClick = () => setMenuOpen(false);

    return (
        <nav id="navbar" className={isScrolled ? 'scrolled' : ''}>
            <Link to="/" className="nav-logo">
                <span className="logo-text" style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: '"Outfit", sans-serif', color: 'var(--teal-dark)', letterSpacing: '-0.5px' }}>DOPA<span style={{ color: 'var(--accent)' }}>LESS</span></span>
            </Link>

            <ul className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
                {navLinks.map(({ to, label }) => (
                    <li key={to}>
                        <NavLink
                            to={to}
                            end={to === '/'}
                            onClick={handleNavClick}
                            className={({ isActive }) => isActive ? 'nav-link-active' : ''}
                        >
                            {label}
                        </NavLink>
                    </li>
                ))}
            </ul>

            <div className="nav-right">
                {user ? (
                    <div className="nav-profile">
                        <div 
                            className="nav-profile-trigger" 
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <div className="nav-avatar">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="nav-user-name" style={{ display: 'none' }}>{user.fullName}</span>
                            <span className="nav-user-name-desktop">{user.fullName}</span>
                            <svg className={`nav-dropdown-icon ${dropdownOpen ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </div>
                        {dropdownOpen && (
                            <div className="nav-dropdown-menu">
                                <Link to="#" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>Hồ sơ cá nhân</Link>
                                <button className="nav-dropdown-item nav-logout" onClick={handleLogout}>Đăng xuất</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="btn-nav" style={{ background: 'transparent', color: 'var(--teal-dark)', boxShadow: 'none', border: '1px solid transparent' }}>
                            Đăng nhập
                        </Link>
                        <Link to="/register" className="btn-nav">
                            Đăng ký
                        </Link>
                    </>
                )}

                <button
                    className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>
        </nav>
    );
}
