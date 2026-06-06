import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { subscriptionApi } from '../../../apis/customerApi';
import { useAuth } from '../../../hooks/AuthContext';
import { CheckCircle2, ArrowRight, Sparkles, Loader2, ShieldAlert, Check } from 'lucide-react';

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
          // Toast removed as requested by the user
        } else {
          setSyncError(true);
        }
      } else {
        setSyncError(true);
      }
    } catch (error) {
      console.error('Error syncing payment:', error);
      setSyncError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getFeaturesForTier = (tier) => {
    switch (tier) {
      case 'BASIC':
        return [
          'Mở khóa các bài test trắc nghiệm cơ bản',
          'Theo dõi tiến trình với Nhật ký hàng ngày',
          'Tham gia lộ trình thiết lập thói quen cơ bản'
        ];
      case 'PREMIUM':
        return [
          'Mở khóa toàn bộ Phác đồ Dopamine nâng cao',
          'Truy cập kho tài nguyên đa phương tiện đặc quyền',
          'Thống kê & phân tích tiến trình tuần chuyên sâu',
          'Được ưu tiên hỗ trợ trực tiếp từ ban quản trị'
        ];
      case 'ELITE':
        return [
          'Đặc quyền Thượng Hạng cao cấp nhất hệ thống',
          'Truy cập trọn đời tất cả chức năng Dopaless',
          'Hỗ trợ cá nhân hóa phác đồ điều trị 1-1 chuyên biệt',
          'Tải tài liệu hướng dẫn độc quyền (PDF & Video)'
        ];
      default:
        return [
          'Truy cập các tính năng cơ bản của tài khoản',
          'Theo dõi tiến trình dopamine hàng ngày'
        ];
    }
  };

  const getTierName = (tier) => {
    switch (tier) {
      case 'FREE': return 'MIỄN PHÍ';
      case 'BASIC': return 'CƠ BẢN';
      case 'PREMIUM': return 'CAO CẤP';
      case 'ELITE': return 'THƯỢNG HẠNG';
      default: return tier || '';
    }
  };

  const isElite = planTier === 'ELITE';
  const isPremium = planTier === 'PREMIUM';
  const isBasic = planTier === 'BASIC';

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
        maxWidth: '520px',
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
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '24px',
              fontWeight: '800',
              color: 'var(--teal-dark)',
              marginBottom: '12px'
            }}>
              Đang xác thực thanh toán
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6' }}>
              Vui lòng không tắt hoặc tải lại trình duyệt. Chúng tôi đang đồng bộ trạng thái giao dịch với PayOS...
            </p>
          </div>
        ) : syncError ? (
          <div>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              border: '2px solid rgba(249, 115, 22, 0.15)'
            }}>
              <ShieldAlert size={40} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '26px',
              fontWeight: '850',
              color: 'var(--text)',
              marginBottom: '12px'
            }}>
              Xác thực thất bại
            </h2>
            <p style={{
              color: 'var(--muted)',
              fontSize: '15px',
              lineHeight: '1.6',
              marginBottom: '32px'
            }}>
              Không thể tìm thấy hoặc đồng bộ thông tin đơn hàng này trên hệ thống. Nếu tài khoản của bạn đã bị trừ tiền, xin vui lòng liên hệ bộ phận hỗ trợ để kiểm tra thủ công.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/goi-dich-vu" className="btn-secondary" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '15px',
                borderRadius: '12px',
                background: 'var(--teal-pale)',
                color: 'var(--teal-dark)',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '15px',
                border: '1px solid rgba(13, 122, 110, 0.15)',
                transition: 'all 0.2s'
              }}>
                Quay lại gói dịch vụ
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Animated Success Icon Container */}
            <div className="success-icon-container" style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              backgroundColor: '#e6fdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              border: '2px solid rgba(16, 185, 129, 0.2)',
              position: 'relative'
            }}>
              <CheckCircle2 size={44} className="animate-check" style={{ color: '#10b981' }} />
              <Sparkles size={18} className="animate-float" style={{
                color: 'var(--accent)',
                position: 'absolute',
                top: '-2px',
                right: '-2px'
              }} />
            </div>

            {/* Gradient Title */}
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '28px',
              fontWeight: '850',
              lineHeight: '1.2',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, var(--teal-dark) 0%, var(--teal-light) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Thanh Toán Thành Công!
            </h2>
            <p style={{
              color: 'var(--muted)',
              fontSize: '15px',
              lineHeight: '1.5',
              marginBottom: '32px',
              fontWeight: '300'
            }}>
              Cảm ơn bạn đã đồng hành cùng Dopaless. Gói thành viên của bạn đã chính thức được kích hoạt.
            </p>

            {/* Transaction Receipt Box */}
            <div style={{
              background: 'rgba(13, 122, 110, 0.03)',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '32px',
              border: '1px solid rgba(13, 122, 110, 0.08)',
              textAlign: 'left'
            }}>
              <div className="receipt-item">
                <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Mã đơn hàng</span>
                <span style={{ color: 'var(--text)', fontWeight: '700', fontSize: '14px' }}>#{orderCode}</span>
              </div>
              <div className="receipt-item">
                <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Gói dịch vụ</span>
                <span style={{
                  color: isElite ? 'var(--accent)' : isPremium ? 'var(--teal)' : 'var(--text)',
                  fontWeight: '800',
                  fontSize: '14px'
                }}>
                  {getTierName(planTier)}
                </span>
              </div>
              <div className="receipt-item">
                <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Số tiền thanh toán</span>
                <span style={{ color: '#10b981', fontWeight: '800', fontSize: '15px' }}>{formatPrice(amount)}</span>
              </div>
            </div>


            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => navigate('/phac-do')} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: isElite 
                    ? 'linear-gradient(135deg, var(--accent) 0%, #ea580c 100%)'
                    : 'linear-gradient(135deg, var(--teal) 0%, var(--teal-light) 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '15px',
                  boxShadow: isElite 
                    ? '0 6px 18px rgba(249, 115, 22, 0.25)'
                    : '0 6px 18px rgba(13, 122, 110, 0.25)',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit'
                }}
                className="btn-primary-success"
              >
                Bắt đầu trải nghiệm phác đồ <ArrowRight size={18} />
              </button>
              <Link 
                to="/" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                className="btn-secondary-success"
              >
                Quay lại Trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0.96); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounceCheck {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes spinLoader {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes floating {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(8deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-check {
          animation: bounceCheck 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-float {
          animation: floating 3s ease-in-out infinite;
        }
        .success-icon-container {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.2);
          animation: pulseGlow 2.5s infinite;
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.2); }
          70% { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .receipt-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px dashed rgba(13, 122, 110, 0.1);
        }
        .receipt-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .btn-primary-success:hover {
          transform: translateY(-2px);
          opacity: 0.95;
          box-shadow: 0 8px 24px rgba(13, 122, 110, 0.3);
        }
        .btn-secondary-success:hover {
          background: rgba(13, 122, 110, 0.04);
          color: var(--teal-dark);
          border-color: var(--teal);
        }
        .btn-secondary:hover {
          background: var(--teal);
          color: #fff !important;
          border-color: var(--teal);
        }
      `}</style>
    </div>
  );
}
