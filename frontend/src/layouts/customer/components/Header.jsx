import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/AuthContext';
import { notificationApi } from '../../../apis/customerApi';
import { Bell, Check } from 'lucide-react';
import './Header.css';

const navLinks = [
    { to: '/', label: 'Trang Chủ' },
    { to: '/gioi-thieu', label: 'Giới Thiệu' },
    { to: '/trac-nghiem', label: 'Bài Test' },
    { to: '/phac-do', label: 'Phác Đồ' },
    { to: '/goi-dich-vu', label: 'Gói Dịch Vụ' },
    { to: '/bai-viet', label: 'Tin Tức' },
    { to: '/lien-he', label: 'Liên Hệ' },
];

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
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
        const handleClickOutside = (e) => {
            if (!e.target.closest('.nav-profile')) {
                setDropdownOpen(false);
            }
            if (!e.target.closest('.nav-notifications')) {
                setNotifOpen(false);
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await notificationApi.getNotifications();
            if (res.data.success) {
                setNotifications(res.data.data);
            }
            const countRes = await notificationApi.getUnreadCount();
            if (countRes.data.success) {
                setUnreadCount(countRes.data.data.count);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 20000); // Tự động cập nhật mỗi 20s
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    const handleMarkAllRead = async (e) => {
        e.stopPropagation();
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    const handleMarkRead = async (notif) => {
        if (notif.isRead) return;
        try {
            await notificationApi.markAsRead(notif.id);
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        setNotifOpen(false);
        navigate('/');
    };

    const handleNavClick = () => setMenuOpen(false);

    const getCallName = (name) => {
        if (!name) return 'User';
        const parts = name.trim().split(' ');
        return parts[parts.length - 1];
    };

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
                {user && (
                    <div className="nav-notifications">
                        <button 
                            className={`nav-notif-trigger ${notifOpen ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen); setDropdownOpen(false); }}
                            aria-label="Notifications"
                        >
                            <Bell size={22} />
                            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                        </button>
                        {notifOpen && (
                            <div className="notif-dropdown">
                                <div className="notif-header">
                                    <h3>Thông báo</h3>
                                    {unreadCount > 0 && (
                                        <button onClick={handleMarkAllRead} className="btn-mark-all-read">
                                            Đọc tất cả
                                        </button>
                                    )}
                                </div>
                                <div className="notif-list">
                                    {notifications.length === 0 ? (
                                        <div className="notif-empty">Không có thông báo mới.</div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div 
                                                key={notif.id} 
                                                className={`notif-item ${notif.isRead ? 'read' : 'unread'}`}
                                                onClick={() => handleMarkRead(notif)}
                                            >
                                                <div className="notif-item-header">
                                                    <span className="notif-item-title">{notif.title}</span>
                                                    {!notif.isRead && <span className="notif-dot" />}
                                                </div>
                                                <p className="notif-item-content">{notif.content}</p>
                                                <span className="notif-item-time">
                                                    {new Date(notif.createdAt).toLocaleDateString('vi-VN')} {new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {user ? (
                    <div className="nav-profile">
                        <div 
                            className="nav-profile-trigger" 
                            onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                        >
                            <div className="nav-avatar">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
                                )}
                            </div>
                            <span className="nav-user-name" style={{ display: 'none' }}>{user.fullName}</span>
                            <span className="nav-user-name-desktop" title={user.fullName}>
                                {getCallName(user.fullName)}
                            </span>
                            <svg className={`nav-dropdown-icon ${dropdownOpen ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </div>
                        {dropdownOpen && (
                            <div className="nav-dropdown-menu">
                                <Link to="/ho-so" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>Hồ sơ cá nhân</Link>
                                <button className="nav-dropdown-item nav-logout" onClick={handleLogout}>Đăng xuất</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link to="/dang-nhap" className="btn-nav" style={{ background: 'transparent', color: 'var(--teal-dark)', boxShadow: 'none', border: '1px solid transparent' }}>
                            Đăng nhập
                        </Link>
                        <Link to="/dang-ky" className="btn-nav">
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
