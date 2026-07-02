import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../apis/authApi';
import toast from 'react-hot-toast';
import './auth.css';
import { useAuth } from '../../hooks/AuthContext';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import FormField from '../../components/FormField';
import Modal from '../../components/Modal';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login } = useAuth();

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotTimer, setForgotTimer] = useState(0);
  
  const otpInputs = useRef([]);
  const hasShownToast = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const errorParam = params.get('error');
    if (errorParam) {
      let friendlyError = errorParam;
      if (errorParam.includes('Email already registered with LOCAL provider')) {
        friendlyError = 'Email này đã được đăng ký bằng mật khẩu thông thường. Vui lòng đăng nhập bằng mật khẩu của bạn.';
      } else if (errorParam.includes('Email already registered with GOOGLE provider')) {
        friendlyError = 'Email này đã được đăng ký bằng tài khoản Google. Vui lòng nhấn vào "Tiếp tục với Google" bên dưới.';
      } else if (errorParam === 'oauth2_failed') {
        friendlyError = 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.';
      }
      setServerError(friendlyError);
      window.history.replaceState(null, '', window.location.pathname);
    }

    if (hasShownToast.current) return;
    if (params.get('registered')) {
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      hasShownToast.current = true;
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (forgotTimer > 0) {
      interval = setInterval(() => setForgotTimer(prev => prev - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [forgotTimer]);

  // Auto-hide errors after 5 seconds
  useEffect(() => {
    if (serverError || Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setServerError('');
        setErrors({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [serverError, errors]);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Vui lòng nhập email';
    else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(form.email)) errs.email = 'Định dạng email không hợp lệ';
    }
    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await authApi.login(form.email, form.password);
      const data = res.data.data;
      
      login(data, data.token);
      if (data.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setServerError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authApi.googleLogin();
  };

  // Forgot Password Handlers
  const handleSendForgotCode = async () => {
    if (!forgotEmail) {
      toast.error('Vui lòng nhập email');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      toast.success('Mã xác thực đã được gửi đến email của bạn');
      setForgotStep(2);
      setForgotTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi mã xác thực');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotOtp = () => {
    const code = forgotOtp.join('');
    if (code.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số');
      return;
    }
    setForgotStep(3);
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải từ 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({
        email: forgotEmail,
        code: forgotOtp.join(''),
        newPassword
      });
      toast.success('Đặt lại mật khẩu thành công! Hãy đăng nhập lại.');
      setShowForgotModal(false);
      setForgotStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...forgotOtp];
    newOtp[index] = value.substring(value.length - 1);
    setForgotOtp(newOtp);

    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(data)) return;

    const pasteData = data.substring(0, 6).split('');
    const newOtp = [...forgotOtp];
    pasteData.forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setForgotOtp(newOtp);
    const nextIndex = Math.min(pasteData.length, 5);
    otpInputs.current[nextIndex].focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg"></div>

      <div className="ui-card auth-card">
        {/* Back Button inside card */}
        <Link to="/" className="ui-btn ui-btn--ghost auth-back-btn" title="Về trang chủ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>

        {/* Logo / Brand */}
        <Link to="/" className="auth-brand">
          <span className="auth-brand-name auth-brand-name--large">EXE<span>Project.</span></span>
        </Link>

        <h1 className="auth-title">Chào mừng trở lại</h1>
        <p className="auth-subtitle">Đăng nhập vào tài khoản của bạn</p>

        {serverError && (
          <div className="auth-error-banner">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="email"
            label="Email"
            error={errors.email}
            icon={Mail}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <FormField
            id="password"
            label="Mật khẩu"
            error={errors.password}
            icon={Lock}
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <div className="auth-forgot-link-wrapper">
            <button 
              type="button" 
              className="auth-link auth-link-forgot" 
              onClick={() => {
                setShowForgotModal(true);
                setForgotStep(1);
                setForgotOtp(['','','','','','']);
              }}
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="ui-btn ui-btn--primary auth-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-dots">
                <span></span><span></span><span></span>
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>hoặc đăng nhập bằng</span>
        </div>

        {/* Google Login */}
        <button
          id="google-login-btn"
          className="ui-btn ui-btn--ghost google-btn"
          onClick={handleGoogleLogin}
          type="button"
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Tiếp tục với Google
        </button>

        <p className="auth-disclaimer-text">
          Bằng việc đăng nhập, bạn đồng ý với <Link to="/dieu-khoan-dich-vu?tab=terms" target="_blank" rel="noopener noreferrer" className="auth-link">Điều khoản dịch vụ</Link> và <Link to="/dieu-khoan-dich-vu?tab=privacy" target="_blank" rel="noopener noreferrer" className="auth-link">Chính sách bảo mật</Link> của Dopaless.
        </p>

        <p className="auth-footer">
          Chưa có tài khoản?{' '}
          <Link id="go-to-register" to="/dang-ky" className="auth-link">Đăng ký ngay</Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Quên mật khẩu?"
        size="sm"
      >
        <p className="auth-subtitle" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          {forgotStep === 1 && 'Nhập email của bạn để nhận mã xác thực'}
          {forgotStep === 2 && 'Nhập mã xác thực đã gửi đến email của bạn'}
          {forgotStep === 3 && 'Tạo mật khẩu mới cho tài khoản của bạn'}
        </p>

        <div className="modal-body-content">
          {forgotStep === 1 && (
            <div className="forgot-step-1">
              <FormField
                id="forgotEmail"
                label="Địa chỉ Email"
                icon={Mail}
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <button 
                className="ui-btn ui-btn--primary auth-btn" 
                onClick={handleSendForgotCode}
                disabled={loading}
                style={{ marginTop: '10px' }}
              >
                {loading ? 'Đang gửi...' : 'Tiếp tục'}
              </button>
            </div>
          )}

          {forgotStep === 2 && (
            <div className="forgot-step-2">
              <div className="otp-container">
                {forgotOtp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    className="ui-input otp-modal-field"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    onFocus={(e) => e.target.select()}
                  />
                ))}
              </div>
              
              <div className="resend-section">
                {forgotTimer > 0 ? (
                  <span className="auth-timer-text">Gửi lại mã sau <b>{forgotTimer}s</b></span>
                ) : (
                  <button type="button" className="resend-link" onClick={handleSendForgotCode}>
                    Gửi lại mã xác nhận
                  </button>
                )}
              </div>

              <div className="auth-modal-actions-row">
                <button type="button" className="ui-btn ui-btn--ghost" style={{ flex: 1 }} onClick={() => setForgotStep(1)}>Quay lại</button>
                <button type="button" className="ui-btn ui-btn--primary auth-btn" style={{ flex: 2, marginTop: 0 }} onClick={handleVerifyForgotOtp}>Tiếp tục</button>
              </div>
            </div>
          )}

          {forgotStep === 3 && (
            <div className="forgot-step-3">
              <FormField
                id="newPassword"
                label="Mật khẩu mới"
                icon={Lock}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <FormField
                id="confirmNewPassword"
                label="Xác nhận mật khẩu mới"
                icon={ShieldCheck}
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button 
                className="ui-btn ui-btn--primary auth-btn" 
                onClick={handleResetPassword}
                disabled={loading}
                style={{ marginTop: '10px' }}
              >
                {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}


