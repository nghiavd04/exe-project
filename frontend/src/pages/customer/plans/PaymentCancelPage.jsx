import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { XCircle, HelpCircle, ArrowLeft, Clock, RefreshCw } from 'lucide-react';
import { subscriptionApi } from '../../../apis/customerApi';

export default function PaymentCancelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [reason, setReason] = useState('cancel'); // 'cancel' | 'expired' | 'loading'
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    document.title = 'Thanh toán bị hủy – Dopaless';
    const orderCode = searchParams.get('orderCode');
    if (orderCode) {
      setReason('loading');
      subscriptionApi.syncPayOSPayment(orderCode)
        .then(res => {
          if (res.data?.data?.status === 'FAILED') {
            // PayOS cancelled/expired → sync đã chuyển sang FAILED
            // Kiểm tra thêm bằng cách check thời gian (nếu orderCode quá cũ tức là expired)
            setReason('expired');
          } else {
            setReason('cancel');
          }
        })
        .catch(() => setReason('cancel'));
    } else {
      setReason('cancel');
    }
  }, [searchParams]);

  // Countdown tự redirect
  useEffect(() => {
    if (reason === 'loading') return;
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
  }, [reason, navigate]);

  const isExpired = reason === 'expired';
  const isLoading = reason === 'loading';

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0f172a 100%)',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '200px',
          background: isExpired ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          filter: 'blur(60px)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {isLoading ? (
            <div style={{ padding: '30px 0' }}>
              <RefreshCw size={48} style={{ color: '#6366f1', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#94a3b8', fontSize: '15px' }}>Đang kiểm tra trạng thái giao dịch...</p>
            </div>
          ) : (
            <>
              {/* Icon */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: isExpired ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                border: `2px solid ${isExpired ? 'rgba(245, 158, 11, 0.25)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                {isExpired
                  ? <Clock size={40} style={{ color: '#f59e0b' }} />
                  : <XCircle size={40} style={{ color: '#ef4444' }} />}
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: '28px',
                fontWeight: '800',
                marginBottom: '12px',
                background: isExpired
                  ? 'linear-gradient(to right, #fde68a, #fef3c7)'
                  : 'linear-gradient(to right, #fca5a5, #fecaca)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {isExpired ? 'Mã QR Đã Hết Hạn' : 'Đã Hủy Giao Dịch'}
              </h2>

              {/* Description */}
              <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                {isExpired
                  ? 'Mã QR thanh toán đã hết thời gian hiệu lực. Tài khoản của bạn không bị trừ tiền. Vui lòng thực hiện lại giao dịch mới.'
                  : 'Yêu cầu thanh toán của bạn đã được hủy bỏ theo mong muốn. Tài khoản của bạn không bị trừ tiền và trạng thái gói dịch vụ vẫn được giữ nguyên.'}
              </p>

              {/* Info box */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(15, 23, 42, 0.3)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '28px',
                border: '1px solid rgba(255, 255, 255, 0.02)',
                textAlign: 'left'
              }}>
                <HelpCircle size={20} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
                  {isExpired
                    ? 'Mỗi mã QR có giá trị trong vòng 15 phút. Bạn có thể tạo lại giao dịch mới bất cứ lúc nào.'
                    : 'Nếu bạn gặp lỗi trong quá trình quét mã hoặc cổng thanh toán bị gián đoạn, bạn có thể quay lại và thử thanh toán lại bất cứ lúc nào.'}
                </span>
              </div>

              {/* Countdown */}
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                Tự động chuyển hướng sau <span style={{ color: '#818cf8', fontWeight: '700' }}>{countdown}s</span>
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={() => navigate('/goi-dich-vu')} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                  transition: 'transform 0.1s, opacity 0.2s'
                }}>
                  {isExpired ? 'Tạo giao dịch mới' : 'Thử thanh toán lại'}
                </button>

                <Link to="/" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#1e293b',
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background 0.2s, color 0.2s'
                }}>
                  <ArrowLeft size={16} /> Quay về Trang chủ
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

