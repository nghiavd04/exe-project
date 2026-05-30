import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { subscriptionApi } from '../../../apis/customerApi';
import { useAuth } from '../../../hooks/AuthContext';
import { CheckCircle2, ArrowRight, Sparkles, Loader2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(false);
  const [amount, setAmount] = useState(0);
  const [orderCode, setOrderCode] = useState('');
  const [planTier, setPlanTier] = useState('');

  useEffect(() => {
    document.title = 'Thanh toán thành công – Dopaless';
    const code = searchParams.get('orderCode');
    if (code) {
      setOrderCode(code);
      syncPayment(code);
    } else {
      setLoading(false);
      setSyncError(true);
    }
  }, [searchParams]);

  const syncPayment = async (code) => {
    try {
      setLoading(true);
      const res = await subscriptionApi.syncPayOSPayment(code);
      if (res.data.success) {
        const paymentData = res.data.data;
        setAmount(paymentData.amount);
        setPlanTier(paymentData.planTier);

        if (paymentData.status === 'SUCCESS') {
          // Update local storage and context user state
          if (user) {
            const updatedUser = { ...user, subscriptionTier: paymentData.planTier };
            updateUser(updatedUser);
          }
          toast.success('Hệ thống đã xác nhận thanh toán & kích hoạt tài khoản!');
        } else {
          setSyncError(true);
          toast.error('Giao dịch chưa được xác nhận thành công');
        }
      } else {
        setSyncError(true);
      }
    } catch (error) {
      console.error('Error syncing payment:', error);
      setSyncError(true);
      toast.error('Không thể đồng bộ trạng thái giao dịch tự động');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

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
          background: 'rgba(79, 70, 229, 0.25)',
          filter: 'blur(60px)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>

        {loading ? (
          <div style={{ position: 'relative', zIndex: 1, padding: '30px 0' }}>
            <Loader2 size={64} className="animate-spin" style={{ color: '#6366f1', margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Đang xác thực thanh toán</h2>
            <p style={{ color: '#94a3b8', fontSize: '15px' }}>
              Vui lòng không tắt trình duyệt. Chúng tôi đang kết nối với PayOS để kiểm tra trạng thái giao dịch của bạn...
            </p>
          </div>
        ) : syncError ? (
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              border: '2px solid rgba(239, 68, 68, 0.2)'
            }}>
              <ShieldAlert size={40} style={{ color: '#ef4444' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Xác nhận thất bại</h2>
            <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
              Không thể tìm thấy hoặc xác thực thông tin đơn hàng này trên hệ thống. Nếu bạn đã bị trừ tiền, vui lòng liên hệ bộ phận hỗ trợ để được kiểm tra thủ công.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/goi-dich-vu" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                borderRadius: '12px',
                background: '#334155',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '15px',
                transition: 'background 0.2s'
              }}>
                Quay lại gói dịch vụ
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              border: '2px solid rgba(34, 197, 94, 0.2)',
              position: 'relative'
            }}>
              <CheckCircle2 size={40} style={{ color: '#22c55e' }} />
              <Sparkles size={16} style={{ color: '#eab308', position: 'absolute', top: '5px', right: '5px' }} />
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(to right, #818cf8, #e0e7ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Thanh Toán Thành Công!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '32px' }}>
              Cảm ơn bạn đã lựa chọn Dopaless. Gói thành viên của bạn đã được nâng cấp.
            </p>

            <div style={{
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '32px',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>Mã đơn hàng:</span>
                <span style={{ color: '#e2e8f0', fontWeight: '600' }}>#{orderCode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>Cấp độ tài khoản:</span>
                <span style={{ color: '#818cf8', fontWeight: '700' }}>{planTier}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>Tổng số tiền:</span>
                <span style={{ color: '#22c55e', fontWeight: '700' }}>{formatPrice(amount)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => navigate('/ho-so')} style={{
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
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                transition: 'transform 0.1s, opacity 0.2s'
              }}>
                Truy cập hồ sơ của bạn <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
