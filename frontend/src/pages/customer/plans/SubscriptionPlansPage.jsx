import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionApi } from '../../../apis/customerApi';
import { useAuth } from '../../../hooks/AuthContext';
import { Check, X, Shield, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './SubscriptionPlansPage.css';

export default function SubscriptionPlansPage() {
  const { user, userTier, updateUser } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('MOMO');
  const [submitting, setSubmitting] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState({});

  const tierWeights = { FREE: 0, BASIC: 1, PREMIUM: 2, ELITE: 3 };

  useEffect(() => {
    document.title = 'Gói dịch vụ thành viên – Dopaless';
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await subscriptionApi.getActivePlans();
      if (res.data.success) {
        // Sort plans by tier order
        const sorted = (res.data.data || []).sort(
          (a, b) => (tierWeights[a.tier] ?? 99) - (tierWeights[b.tier] ?? 99)
        );
        setPlans(sorted);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Không thể tải danh sách gói dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đăng ký gói dịch vụ');
      navigate('/dang-nhap');
      return;
    }
    
    // Check if user already has this plan or higher
    if (userTier === plan.tier) {
      toast.success('Bạn đang sử dụng gói dịch vụ này');
      return;
    }

    if ((tierWeights[userTier] || 0) > (tierWeights[plan.tier] || 0)) {
      toast.error('Bạn đã đăng ký sử dụng gói cao hơn gói này');
      return;
    }

    setSelectedPlan(plan);
  };

  const handleConfirmMockPayment = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const res = await subscriptionApi.subscribeToPlan(selectedPlan.id, paymentMethod);
      if (res.data.success) {
        toast.success(res.data.data || 'Đăng ký thành viên thành công!');
        
        // Update user state in frontend
        const updatedUser = { ...user, subscriptionTier: selectedPlan.tier };
        updateUser(updatedUser);
        
        setSelectedPlan(null);
        navigate('/ho-so');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.response?.data?.message || 'Gặp lỗi trong quá trình xử lý đăng ký');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return '0đ';
    return price >= 1000 ? `${price / 1000}K` : `${price}đ`;
  };

  if (loading) {
    return (
      <div className="plans-page-loading">
        <div className="plans-loader"></div>
        <p>Đang tải danh sách các gói dịch vụ...</p>
      </div>
    );
  }

  return (
    <div className="plans-page-container">
      {/* Background decorations */}
      <div className="plans-bg-glow glow-1"></div>
      <div className="plans-bg-glow glow-2"></div>

      <header className="plans-hero-header">
        <div className="plans-hero-badge">
          <Sparkles size={14} className="badge-spark" /> GÓI THÀNH VIÊN DOPALESS
        </div>
        <h1>Chọn gói thành viên <span>phù hợp nhất</span></h1>
        <p>
          Bắt đầu hành trình nâng cao hiệu suất, thanh lọc dopamine và tái thiết lập thói quen sống lành mạnh cùng đội ngũ chuyên gia.
        </p>
      </header>

      <section className="plans-cards-grid">
        {plans.map((plan) => {
          let featuresList = [];
          try {
            featuresList = plan.features ? JSON.parse(plan.features) : [];
          } catch (e) {
            console.error('Failed to parse features', e);
          }

          const isCurrentTier = userTier === plan.tier;
          const isHigherTier = (tierWeights[userTier] || 0) > (tierWeights[plan.tier] || 0);
          const isPopular = plan.tier === 'PREMIUM';

          return (
            <div 
              key={plan.id} 
              className={`plan-pricing-card ${isPopular ? 'popular' : ''} ${plan.tier.toLowerCase()}-card`}
            >
              {isPopular && <div className="popular-ribbon">PHỔ BIẾN NHẤT</div>}
              
              <div className="plan-card-header">
                <span className="plan-tier-label">{plan.tier}</span>
                <div className="plan-price-row">
                  <span className="price-number">{formatPrice(plan.price)}</span>
                  <span className="price-period">
                    {plan.price === 0 ? '/ mãi mãi' : plan.durationDays === 30 ? '/ tháng' : `/ ${plan.durationDays} ngày`}
                  </span>
                </div>
                <p className="plan-card-desc">{plan.description}</p>
              </div>

              <div className="plan-card-divider"></div>

              {(() => {
                const isExpanded = !!expandedPlans[plan.id];
                const maxInitial = 5;
                const hasMany = featuresList.length > maxInitial;
                const visibleFeatures = isExpanded ? featuresList : featuresList.slice(0, maxInitial);

                return (
                  <>
                    <ul className="plan-features-list">
                      {visibleFeatures.map((feat, idx) => (
                        <li key={idx} className={feat.included ? 'included' : 'excluded'}>
                          {feat.included ? (
                            <Check size={16} className="feature-icon check" />
                          ) : (
                            <X size={16} className="feature-icon cross" />
                          )}
                          <span>{feat.name}</span>
                        </li>
                      ))}
                    </ul>
                    {hasMany && (
                      <button
                        onClick={() => setExpandedPlans(prev => ({ ...prev, [plan.id]: !prev[plan.id] }))}
                        className="btn-toggle-features"
                      >
                        {isExpanded ? 'Ẩn bớt' : 'Xem thêm'}
                      </button>
                    )}
                  </>
                );
              })()}

              <div className="plan-card-footer">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentTier || isHigherTier}
                  className={`btn-select-plan ${isPopular ? 'popular-btn' : ''} ${isCurrentTier ? 'active-btn' : ''}`}
                >
                  {isCurrentTier ? 'Gói hiện tại' : isHigherTier ? 'Đã sở hữu gói cao hơn' : plan.price === 0 ? 'Bắt đầu miễn phí' : 'Mua ngay'}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Mock Checkout Modal */}
      {selectedPlan && (
        <div className="plans-modal-overlay" onClick={() => setSelectedPlan(null)}>
          <div className="plans-modal-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="plans-modal-header">
              <h3>Đăng ký nâng cấp tài khoản</h3>
              <button className="plans-modal-close" onClick={() => setSelectedPlan(null)}>
                <X size={24} />
              </button>
            </div>

            <div className="plans-modal-body">
              <div className="checkout-summary-box">
                <div className="summary-row">
                  <span>Gói đăng ký:</span>
                  <strong>{selectedPlan.name}</strong>
                </div>
                <div className="summary-row">
                  <span>Thời hạn:</span>
                  <span>{selectedPlan.durationDays} ngày</span>
                </div>
                <div className="summary-row total">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="price-total">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedPlan.price)}</span>
                </div>
              </div>

              <div className="payment-methods-select">
                <label className="checkout-label">Phương thức thanh toán (Giả lập)</label>
                <div className="methods-grid">
                  <div 
                    className={`method-option ${paymentMethod === 'MOMO' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('MOMO')}
                  >
                    <div className="method-bullet"></div>
                    <span>Ví MoMo</span>
                  </div>
                  <div 
                    className={`method-option ${paymentMethod === 'VNPAY' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('VNPAY')}
                  >
                    <div className="method-bullet"></div>
                    <span>VNPAY QR</span>
                  </div>
                  <div 
                    className={`method-option ${paymentMethod === 'BANK_TRANSFER' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  >
                    <div className="method-bullet"></div>
                    <span>Chuyển khoản</span>
                  </div>
                </div>
              </div>

              <div className="checkout-warning-note">
                <Shield size={16} />
                <span>Đây là phiên bản chạy thử nghiệm. Thanh toán sẽ được xử lý giả lập và kích hoạt tài khoản ngay tức thì.</span>
              </div>
            </div>

            <div className="plans-modal-footer">
              <button 
                className="btn-checkout-cancel" 
                onClick={() => setSelectedPlan(null)}
                disabled={submitting}
              >
                Hủy bỏ
              </button>
              <button 
                className="btn-checkout-submit" 
                onClick={handleConfirmMockPayment}
                disabled={submitting}
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận & kích hoạt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
