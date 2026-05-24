import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../apis/authApi';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Full Info
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

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

  // Clear errors when switching steps
  useEffect(() => {
    setServerError('');
    setErrors({});
  }, [step]);

  const validateEmail = () => {
    if (!form.email) return 'Email is required';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) return 'Invalid email format';
    return null;
  };

  const validateInfo = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(data)) return; // Chỉ nhận số

    const pasteData = data.substring(0, 6).split('');
    const newOtp = [...otp];
    
    pasteData.forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    
    setOtp(newOtp);

    // Focus vào ô cuối cùng hoặc ô tiếp theo sau dữ liệu dán
    const nextIndex = Math.min(pasteData.length, 5);
    otpInputs.current[nextIndex].focus();
  };

  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    if (!agreeTerms) {
      setErrors({ agreeTerms: 'Bạn cần đồng ý với điều khoản sử dụng và chính sách bảo mật.' });
      return;
    }
    const emailErr = validateEmail();
    if (emailErr) { setErrors({ email: emailErr }); return; }

    setLoading(true);
    try {
      await authApi.sendCode(form.email);
      toast.success('Mã xác thực đã được gửi đến email của bạn!');
      setStep(2);
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể gửi mã. Vui lòng thử lại.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const codeStr = otp.join('');
    if (codeStr.length !== 6) {
      toast.error('Vui lòng nhập đầy đủ mã 6 số');
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyCode(form.email, codeStr);
      toast.success('Xác thực email thành công!');
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || 'Mã xác thực không chính xác hoặc đã hết hạn.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateInfo();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await authApi.register(form.email, form.password, form.fullName);
      navigate('/dang-nhap?registered=true');
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg auth-bg-register"></div>

      <div className="auth-card">
        <Link to="/" className="auth-back-btn" title="Về trang chủ">
          <ArrowLeft size={22} />
        </Link>
        
        <Link to="/" className="auth-brand" style={{textDecoration: 'none'}}>
          <span className="auth-brand-name" style={{ fontSize: '2.5rem' }}>EXE<span style={{ color: 'var(--accent)' }}>Project.</span></span>
        </Link>

        <h1 className="auth-title">
          {step === 1 && 'Bắt đầu đăng ký'}
          {step === 2 && 'Xác thực Email'}
          {step === 3 && 'Thông tin cuối cùng'}
        </h1>
        <p className="auth-subtitle">
          {step === 1 && 'Nhập email của bạn để nhận mã xác nhận'}
          {step === 2 && (
            <span>
              Mã xác thực đã được gửi tới <b style={{ color: 'var(--primary)' }}>{form.email}</b>
            </span>
          )}
          {step === 3 && 'Vui lòng điền họ tên và mật khẩu của bạn'}
        </p>

        {serverError && (
          <div className="auth-error-banner">
            <CheckCircle2 size={16} />
            {serverError}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendCode} noValidate>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Địa chỉ Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  style={{ paddingLeft: '40px' }}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group checkbox-group" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '16px', marginBottom: '20px' }}>
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  setErrors({ ...errors, agreeTerms: '' });
                }}
                style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: 'var(--teal)' }}
              />
              <label htmlFor="agreeTerms" style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.4', cursor: 'pointer', userSelect: 'none' }}>
                Tôi đồng ý với các <Link to="/dieu-khoan-dich-vu?tab=terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)', fontWeight: '700', textDecoration: 'underline' }}>Điều khoản sử dụng</Link> và <Link to="/dieu-khoan-dich-vu?tab=privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)', fontWeight: '700', textDecoration: 'underline' }}>Chính sách bảo mật</Link> của Dopaless.
              </label>
            </div>
            {errors.agreeTerms && <span className="field-error" style={{ display: 'block', marginTop: '-12px', marginBottom: '16px' }}>{errors.agreeTerms}</span>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <span className="loading-dots">
                  <span></span><span></span><span></span>
                </span>
              ) : (
                'Tiếp tục'
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} noValidate>
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  className={`otp-input ${digit ? 'has-value' : ''}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handlePaste}
                  onFocus={(e) => e.target.select()}
                  disabled={loading}
                />
              ))}
            </div>

            <div className="resend-section">
              {canResend ? (
                <button type="button" className="resend-link" onClick={handleSendCode} disabled={loading}>
                  Gửi lại mã xác thực
                </button>
              ) : (
                <span>Gửi lại mã sau <b>{timer}s</b></span>
              )}
            </div>
            
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '-10px', marginBottom: '20px' }}>
              Không nhận được mã? Hãy kiểm tra cả <b>thư rác (Spam)</b>
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                className="auth-btn" 
                style={{ background: '#f1f5f9', color: '#64748b', flex: 1 }} 
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Quay lại
              </button>
              <button type="submit" className="auth-btn" style={{ flex: 2 }} disabled={loading}>
                {loading ? (
                  <span className="loading-dots">
                    <span></span><span></span><span></span>
                  </span>
                ) : (
                  'Xác thực'
                )}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">Họ và tên</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Mật khẩu</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <span className="loading-dots">
                  <span></span><span></span><span></span>
                </span>
              ) : (
                'Hoàn tất đăng ký'
              )}
            </button>
          </form>
        )}

        <p className="auth-footer">
          Đã có tài khoản?{' '}
          <Link to="/dang-nhap" className="auth-link">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}
