import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { XCircle, HelpCircle, ArrowLeft } from 'lucide-react';
import { subscriptionApi } from '../../../apis/customerApi';

export default function PaymentCancelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    document.title = 'Thanh toán không thành công – Dopaless';
    const orderCode = searchParams.get('orderCode');
    if (orderCode) {
      setLoading(true);
      subscriptionApi.syncPayOSPayment(orderCode)
        .catch(err => console.error('Error syncing cancelled payment:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  // Countdown auto redirect
  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/goi-dich-vu');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, navigate]);

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '120px 20px 80px',
      backgroundColor: 'var(--bg)',
      color: 'var(--text)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    }}>
      {/* Glow background elements to match SubscriptionPlansPage */}
      <div className="plans-bg-glow glow-1" style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        filter: 'blur(150px)',
        opacity: 0.35,
        pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--teal-pale), transparent)',
        zIndex: 0
      }}></div>
      <div className="plans-bg-glow glow-2" style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        filter: 'blur(150px)',
        opacity: 0.35,
        pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--accent-light), transparent)',
        zIndex: 0
      }}></div>

      <div className="animate-scale-in" style={{
        maxWidth: '480px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(13, 122, 110, 0.12)',
        borderRadius: '24px',
        padding: '45px 40px',
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(13, 122, 110, 0.08)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          {loading ? (
            <div style={{ padding: '30px 0' }}>
              <div className="plans-loader" style={{
                width: '56px',
                height: '56px',
                border: '4px solid var(--teal)',
                borderBottomColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spinLoader 1s linear infinite',
                marginBottom: '24px'
              }}></div>
              <p style={{ color: 'var(--muted)', fontSize: '15px', fontWeight: '500' }}>
                Đang xác thực trạng thái giao dịch...
              </p>
            </div>
          ) : (
            <>
              {/* Animated Warning/Error Icon */}
              <div className="warning-icon-container" style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                border: '2px solid rgba(249, 115, 22, 0.15)',
                position: 'relative'
              }}>
                <XCircle size={42} className="animate-warning-pulse" style={{ color: 'var(--accent)' }} />
              </div>

              {/* Title with Gradient */}
              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '28px',
                fontWeight: '850',
                lineHeight: '1.25',
                marginBottom: '12px',
                background: 'linear-gradient(135deg, var(--accent) 0%, #ea580c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Thanh Toán Chưa Hoàn Tất
              </h2>

              {/* Description */}
              <p style={{
                color: 'var(--muted)',
                fontSize: '14.5px',
                lineHeight: '1.6',
                marginBottom: '28px',
                fontWeight: '300'
              }}>
                Giao dịch của bạn đã bị hủy, hết hạn hoặc không thể thực hiện được. Tài khoản của bạn không bị trừ tiền và trạng thái gói dịch vụ vẫn được giữ nguyên.
              </p>

              {/* Guide/Info Box */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                background: 'rgba(13, 122, 110, 0.03)',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '28px',
                border: '1px solid rgba(13, 122, 110, 0.06)',
                textAlign: 'left'
              }}>
                <HelpCircle size={20} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '13.5px', color: 'var(--muted)', lineHeight: '1.45' }}>
                  Nếu bạn vô tình nhấn hủy, mã QR thanh toán hết hiệu lực (sau 5 phút) hoặc gặp sự cố đường truyền, bạn hoàn toàn có thể quay lại trang Gói dịch vụ để bắt đầu một giao dịch mới.
                </span>
              </div>

              {/* Countdown Bar / Text */}
              <div style={{
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <p style={{ color: 'var(--muted)', fontSize: '13.5px' }}>
                  Tự động chuyển hướng về gói dịch vụ sau{' '}
                  <span style={{ color: 'var(--teal)', fontWeight: '700' }}>{countdown} giây</span>
                </p>
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'var(--teal-pale)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(countdown / 10) * 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--teal)',
                    borderRadius: '2px',
                    transition: 'width 1s linear'
                  }}></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => navigate('/goi-dich-vu')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-light) 100%)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '15px',
                    boxShadow: '0 6px 18px rgba(13, 122, 110, 0.2)',
                    transition: 'all 0.3s ease',
                    fontFamily: 'inherit'
                  }}
                  className="btn-primary-cancel"
                >
                  Thực hiện thanh toán lại
                </button>

                <Link
                  to="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'transparent',
                    color: 'var(--muted)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '15px',
                    border: '1px solid rgba(13, 122, 110, 0.15)',
                    transition: 'all 0.2s'
                  }}
                  className="btn-secondary-cancel"
                >
                  <ArrowLeft size={16} /> Quay về Trang chủ
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0.96); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spinLoader {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes warningPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-warning-pulse {
          animation: warningPulse 2s ease-in-out infinite;
        }
        .warning-icon-container {
          box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.25);
          animation: pulseWarningGlow 2.5s infinite;
        }
        @keyframes pulseWarningGlow {
          0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.25); }
          70% { box-shadow: 0 0 0 12px rgba(249, 115, 22, 0); }
          100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
        }
        .btn-primary-cancel:hover {
          transform: translateY(-2px);
          opacity: 0.95;
          box-shadow: 0 8px 24px rgba(13, 122, 110, 0.3);
        }
        .btn-secondary-cancel:hover {
          background: rgba(13, 122, 110, 0.04);
          color: var(--teal-dark);
          border-color: var(--teal);
        }
      `}</style>
    </div>
  );
}
