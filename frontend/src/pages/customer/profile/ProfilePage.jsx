import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { profileApi, imageApi } from '../../../apis/customerApi';
import { authApi } from '../../../apis/authApi';
import { useAuth } from '../../../hooks/AuthContext';
import { Eye, EyeOff, Edit2, Save, X, Mail, ShieldCheck } from 'lucide-react';
import './ProfilePage.css';

export default function ProfilePage() {
    const { updateUser, logout } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    // Form states
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    // Edit states
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempFullName, setTempFullName] = useState('');

    // Email Change Modal States
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [newEmailForm, setNewEmailForm] = useState('');
    const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
    const [emailStep, setEmailStep] = useState(1); // 1: Input Email, 2: OTP
    const [emailTimer, setEmailTimer] = useState(0);

    const emailOtpInputs = useRef([]);



    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/dang-nhap');
            return;
        }
        fetchProfile();
    }, [token]);

    useEffect(() => {
        let interval;
        if (emailTimer > 0) {
            interval = setInterval(() => {
                setEmailTimer((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [emailTimer]);


    const fetchProfile = async () => {
        try {
            const response = await profileApi.getProfile();
            const data = response.data.data;
            setUser(data);
            setFullName(data.fullName);
            setEmail(data.email);
            setAvatarPreview(data.avatarUrl);
            setLoading(false);
        } catch (error) {
            toast.error('Không thể tải thông tin hồ sơ', { id: 'fetch-profile-error' });
            setLoading(false);
        }
    };

    const handleSaveName = async () => {
        if (!tempFullName.trim()) {
            toast.error('Họ tên không được để trống');
            return;
        }
        setSaving(true);
        try {
            const response = await profileApi.updateProfile({ fullName: tempFullName, email: user.email });
            const updatedUser = response.data.data;
            setUser(updatedUser);
            updateUser(updatedUser);
            setFullName(updatedUser.fullName);
            setIsEditingName(false);
            toast.success('Cập nhật họ tên thành công');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi cập nhật họ tên');
        } finally {
            setSaving(false);
        }
    };

    const handleSendEmailCode = async () => {
        if (!newEmailForm) {
            toast.error('Vui lòng nhập email mới');
            return;
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(newEmailForm)) {
            toast.error('Định dạng email không hợp lệ');
            return;
        }
        if (newEmailForm === user.email) {
            toast.error('Email mới phải khác email hiện tại');
            return;
        }

        setSaving(true);
        try {
            await authApi.sendCode(newEmailForm);
            toast.success('Mã xác thực đã được gửi đến email mới của bạn');
            setEmailStep(2);
            setEmailTimer(60);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi gửi mã xác thực');
        } finally {
            setSaving(false);
        }
    };

    const handleVerifyEmailChange = async () => {
        const code = emailOtp.join('');
        if (code.length !== 6) {
            toast.error('Vui lòng nhập đầy đủ mã 6 số');
            return;
        }

        setSaving(true);
        try {
            await profileApi.updateEmail({ newEmail: newEmailForm, code });
            toast.success('Đổi Email thành công. Hệ thống sẽ đăng xuất sau 3 giây.');
            setShowEmailModal(false);
            setTimeout(handleLogout, 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Mã xác thực không chính xác hoặc đã hết hạn');
        } finally {
            setSaving(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...emailOtp];
        newOtp[index] = value.substring(value.length - 1);
        setEmailOtp(newOtp);

        // Tự động nhảy ô
        if (value && index < 5) {
            emailOtpInputs.current[index + 1].focus();
        }
    };

    const handleEmailOtpPaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').trim();
        if (!/^\d+$/.test(data)) return;

        const pasteData = data.substring(0, 6).split('');
        const newOtp = [...emailOtp];
        
        pasteData.forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        
        setEmailOtp(newOtp);

        const nextIndex = Math.min(pasteData.length, 5);
        emailOtpInputs.current[nextIndex].focus();
    };

    const handleEmailOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !emailOtp[index] && index > 0) {
            emailOtpInputs.current[index - 1].focus();
        }
    };


    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }
        setSaving(true);
        try {
            await profileApi.updatePassword({ oldPassword, newPassword });
            toast.success('Đổi mật khẩu thành công. Hệ thống sẽ đăng xuất sau 5 giây.');
            setTimeout(handleLogout, 5000);

        } catch (error) {
            toast.error(error.response?.data?.message || 'Mật khẩu cũ không chính xác');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadAvatar = async () => {
        if (!avatarFile) return;
        setSaving(true);
        try {
            // 1. Upload to Cloudinary via existing endpoint
            const formData = new FormData();
            formData.append('file', avatarFile);

            const uploadRes = await imageApi.uploadImage(formData);

            const { url, public_id } = uploadRes.data;

            // 2. Update profile with new avatar URL
            const response = await profileApi.updateAvatar(url, public_id);

            const updatedUser = response.data.data;
            setUser(updatedUser);

            // Update global auth state
            updateUser(updatedUser);

            toast.success('Cập nhật ảnh đại diện thành công');
            setAvatarFile(null);
        } catch (error) {
            toast.error('Lỗi khi tải ảnh lên');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout(); // Sử dụng hàm logout chuẩn từ AuthContext
        navigate('/dang-nhap');
    };

    if (loading) return (
        <div className="profile-loading">
            <div className="loader"></div>
            <p>Đang tải thông tin...</p>
        </div>
    );

    return (
        <div className="profile-container">
            <div className="profile-header-bg"></div>
            <div className="profile-content">
                <div className="profile-sidebar">
                    <div className="profile-card user-info-card">
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="profile-avatar-img" />
                                ) : (
                                    <div className="profile-avatar-placeholder">
                                        {user?.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <label htmlFor="avatar-upload" className="avatar-edit-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                    </svg>
                                </label>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    hidden
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            {avatarFile && (
                                <button className="btn-upload-avatar" onClick={handleUploadAvatar} disabled={saving}>
                                    {saving ? 'Đang lưu...' : 'Lưu ảnh mới'}
                                </button>
                            )}
                        </div>
                        <h2 className="user-name" title={user?.fullName}>{user?.fullName}</h2>
                        {user?.subscriptionTier && (
                            <div className={`profile-tier-badge ${user.subscriptionTier.toLowerCase()}-tier`}>
                                {user.subscriptionTier === 'FREE' && 'Gói Miễn Phí'}
                                {user.subscriptionTier === 'BASIC' && 'Hội Viên Basic 💎'}
                                {user.subscriptionTier === 'PREMIUM' && 'Hội Viên Premium ✨'}
                                {user.subscriptionTier === 'ELITE' && 'Hội Viên Elite 👑'}
                            </div>
                        )}
                        <p className="user-email" title={user?.email}>{user?.email}</p>
                    </div>

                    <div className="profile-nav-card">
                        <button
                            className={`nav-item ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Thông tin cá nhân
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Bảo mật
                        </button>
                    </div>
                </div>

                <div className="profile-main">
                    <div className="profile-card form-card">
                        {activeTab === 'info' && (
                            <div className="tab-content">
                                <h3>Thông tin cá nhân</h3>
                                
                                <div className="info-display-group">
                                    <div className="info-item-row">
                                        <div className="info-label">Họ và tên</div>
                                        <div className="info-value-wrapper">
                                            {isEditingName ? (
                                                <div className="inline-edit-box">
                                                    <input
                                                        type="text"
                                                        value={tempFullName}
                                                        onChange={(e) => setTempFullName(e.target.value)}
                                                        className="inline-input"
                                                        autoFocus
                                                    />
                                                    <div className="inline-actions">
                                                        <button className="btn-icon-save" onClick={handleSaveName} disabled={saving}>
                                                            <Save size={18} />
                                                        </button>
                                                        <button className="btn-icon-cancel" onClick={() => setIsEditingName(false)}>
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="info-text-box">
                                                    <span className="info-text" title={user?.fullName}>{user?.fullName}</span>
                                                    <button className="btn-edit-inline" onClick={() => {
                                                        setTempFullName(user.fullName);
                                                        setIsEditingName(true);
                                                    }}>
                                                        <Edit2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="info-item-row">
                                        <div className="info-label">Email</div>
                                        <div className="info-value-wrapper">
                                            <div className="info-text-box">
                                                <span className="info-text" title={user?.email}>{user?.email}</span>
                                                <button className="btn-edit-inline" onClick={() => {
                                                    setNewEmailForm('');
                                                    setEmailOtp(['', '', '', '', '', '']);
                                                    setEmailStep(1);
                                                    setShowEmailModal(true);
                                                }}>
                                                    <Edit2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}


                        {activeTab === 'security' && (
                            <div className="tab-content">
                                <h3>Đổi mật khẩu</h3>
                                <form onSubmit={handleChangePassword}>
                                    <div className="form-group">
                                        <label>Mật khẩu hiện tại</label>
                                        <div className="password-input-wrapper">
                                            <input
                                                type={showOldPassword ? 'text' : 'password'}
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() => setShowOldPassword(!showOldPassword)}
                                                tabIndex="-1"
                                            >
                                                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Mật khẩu mới</label>
                                        <div className="password-input-wrapper">
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Tối thiểu 6 ký tự"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                tabIndex="-1"
                                            >
                                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Xác nhận mật khẩu mới</label>
                                        <div className="password-input-wrapper">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                tabIndex="-1"
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-save" disabled={saving}>
                                        {saving ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Email Change Modal */}
            {showEmailModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-slide-up">
                        <button className="modal-close" onClick={() => setShowEmailModal(false)}>
                            <X size={24} />
                        </button>
                        
                        <div className="modal-header">
                            <div className="modal-icon-circle">
                                <Mail size={24} />
                            </div>
                            <h2>Thay đổi địa chỉ Email</h2>
                            <p>Vui lòng xác thực email mới của bạn</p>
                        </div>

                        <div className="modal-body">
                            {emailStep === 1 ? (
                                <div className="email-step-1">
                                    <div className="form-group">
                                        <label>Địa chỉ Email mới</label>
                                        <input
                                            type="email"
                                            value={newEmailForm}
                                            onChange={(e) => setNewEmailForm(e.target.value)}
                                            placeholder="Nhập email mới của bạn"
                                            className="modal-input"
                                        />
                                    </div>
                                    <button 
                                        className="btn-modal-primary" 
                                        onClick={handleSendEmailCode}
                                        disabled={saving}
                                    >
                                        {saving ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                                    </button>
                                </div>
                            ) : (
                                <div className="email-step-2">
                                    <div className="otp-modal-info">
                                        Mã xác nhận đã được gửi đến <b>{newEmailForm}</b>
                                    </div>
                                    <div className="otp-input-group">
                                        {emailOtp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => (emailOtpInputs.current[index] = el)}
                                                type="text"
                                                maxLength="1"
                                                className={`otp-modal-field otp-field-${index}`}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleEmailOtpKeyDown(index, e)}
                                                onPaste={handleEmailOtpPaste}
                                                onFocus={(e) => e.target.select()}
                                            />
                                        ))}
                                    </div>
                                    
                                    <div className="resend-modal-timer">
                                        {emailTimer > 0 ? (
                                            <span>Gửi lại mã sau <b>{emailTimer}s</b></span>
                                        ) : (
                                            <button className="btn-resend-modal" onClick={handleSendEmailCode}>
                                                Gửi lại mã xác nhận
                                            </button>
                                        )}
                                    </div>

                                    <div className="modal-actions-row">
                                        <button className="btn-modal-secondary" onClick={() => setEmailStep(1)}>
                                            Quay lại
                                        </button>
                                        <button className="btn-modal-primary" onClick={handleVerifyEmailChange} disabled={saving}>
                                            {saving ? 'Đang xác thực...' : 'Xác nhận thay đổi'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

