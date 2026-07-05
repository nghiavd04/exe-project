import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionApi } from '../../../apis/customerApi';
import { useAuth } from '../../../hooks/AuthContext';
import { Check, X, Shield, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Seo from '../../../components/Seo';
import { buildUrl } from '../../../components/Seo/seoUtils';
import './SubscriptionPlansPage.css';

export default function SubscriptionPlansPage() {
  const { user, userTier, updateUser } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('PAYOS');
  const [submitting, setSubmitting] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState({});
  const [upgradePreview, setUpgradePreview] = useState(null);
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);

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
      toast.error('Không thể tải danh sách gói dịch vụ', { id: 'fetch-plans-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
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

    const isUpgrade = userTier && userTier !== 'FREE' && (tierWeights[plan.tier] || 0) > (tierWeights[userTier] || 0);
    if (isUpgrade) {
      try {
        setLoadingUpgrade(true);
        setUpgradePreview(null);
        const res = await subscriptionApi.getUpgradePreview(plan.id);
        if (res.data.success) {
          setUpgradePreview(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching upgrade preview:', error);
        toast.error('Không thể tính toán chi phí nâng cấp');
      } finally {
        setLoadingUpgrade(false);
      }
    } else {
      setUpgradePreview(null);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const res = await subscriptionApi.createPayOSPayment(selectedPlan.id);
      if (res.data.success && res.data.data.checkoutUrl) {
        toast.success('Đang chuyển hướng đến cổng thanh toán PayOS...');
        window.location.href = res.data.data.checkoutUrl;
      } else {
        throw new Error('Không nhận được liên kết thanh toán từ PayOS');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.response?.data?.message || error.message || 'Gặp lỗi trong quá trình xử lý thanh toán');
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
      <Seo
        title="Gói dịch vụ Dopaless - Lộ trình cải thiện tập trung"
        description="Chọn gói thành viên Dopaless để mở khóa bài viết chuyên sâu, lộ trình cá nhân hóa và công cụ hỗ trợ cải thiện thói quen số."
        canonicalPath="/goi-dich-vu"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Gói thành viên Dopaless',
          url: buildUrl('/goi-dich-vu'),
          description: 'Các gói thành viên hỗ trợ học kiến thức dopamine, theo dõi tiến trình và cải thiện sự tập trung.',
          brand: {
            '@type': 'Brand',
            name: 'Dopaless',
          },
        }}
      />
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
          const isUpgradeOption = !isCurrentTier && !isHigherTier && userTier && userTier !== 'FREE';
          const isPopular = plan.tier === 'PREMIUM';

          return (
            <div 
              key={plan.id} 
              className={`plan-pricing-card ${isPopular ? 'popular' : ''} ${plan.tier.toLowerCase()}-card ${isCurrentTier ? 'current-active-plan' : ''}`}
            >
              {isCurrentTier && <div className="current-plan-badge">Gói đang sử dụng</div>}
              {isPopular && !isCurrentTier && <div className="popular-ribbon">PHỔ BIẾN NHẤT</div>}
              
              <div className="plan-card-header">
                <span className="plan-tier-label">
                  {plan.tier === 'FREE' ? 'MIỄN PHÍ' : plan.tier === 'BASIC' ? 'CƠ BẢN' : plan.tier === 'PREMIUM' ? 'CAO CẤP' : plan.tier === 'ELITE' ? 'THƯỢNG HẠNG' : plan.tier}
                </span>
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
                  className={`btn-select-plan ${isPopular ? 'popular-btn' : ''} ${isCurrentTier ? 'active-btn' : ''} ${isUpgradeOption ? 'upgrade-btn' : ''}`}
                >
                  {isCurrentTier 
                    ? 'Đang sử dụng' 
                    : isHigherTier 
                      ? 'Đã sở hữu gói cao hơn' 
                      : isUpgradeOption 
                        ? 'Nâng cấp ngay' 
                        : plan.price === 0 
                          ? 'Bắt đầu miễn phí' 
                          : 'Mua ngay'}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Mock Checkout Modal */}
      {selectedPlan && (
        <div className="plans-modal-overlay" onClick={() => { setSelectedPlan(null); setUpgradePreview(null); }}>
          <div className="plans-modal-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="plans-modal-header">
              <h3>{upgradePreview ? 'Nâng cấp tài khoản thành viên' : 'Đăng ký gói thành viên'}</h3>
              <button className="plans-modal-close" onClick={() => { setSelectedPlan(null); setUpgradePreview(null); }}>
                <X size={24} />
              </button>
            </div>

            <div className="plans-modal-body">
              {loadingUpgrade ? (
                <div className="upgrade-loading-spinner-box">
                  <div className="plans-loader"></div>
                  <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
                    Đang tính toán chi phí nâng cấp tối ưu...
                  </p>
                </div>
              ) : upgradePreview && upgradePreview.upgrade ? (
                <div className="checkout-summary-box">
                  <div className="summary-row">
                    <span>Gói nâng cấp mục tiêu:</span>
                    <strong>{selectedPlan.name}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Thời hạn mới:</span>
                    <span>{selectedPlan.durationDays} ngày</span>
                  </div>
                  <div className="summary-row current-plan-info">
                    <span>Gói hiện tại:</span>
                    <span>{upgradePreview.currentPlanName} (Còn {upgradePreview.remainingDays} ngày)</span>
                  </div>
                  <div className="summary-row discount">
                    <span>Khấu trừ gói cũ:</span>
                    <span className="discount-amount">
                      -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(upgradePreview.remainingValue)}
                    </span>
                  </div>
                  <div className="summary-row total">
                    <span>Số tiền cần trả thêm:</span>
                    <span className="price-total">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(upgradePreview.upgradeAmount)}
                    </span>
                  </div>
                </div>
              ) : (
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
              )}

              <div className="payment-methods-select">
                <label className="checkout-label">Phương thức thanh toán</label>
                <div className="methods-grid">
                  <div 
                    className="method-option active"
                    style={{ cursor: 'default' }}
                  >
                    <div className="method-bullet"></div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      Cổng thanh toán PayOS (VietQR)
                      <span style={{ backgroundColor: '#4f46e5', color: '#fff', fontSize: '9px', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Mặc định</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="checkout-warning-note">
                <Shield size={16} />
                <span>Hệ thống chuyển hướng bạn tới cổng thanh toán an toàn PayOS để quét mã QR VietQR (môi trường Sandbox).</span>
              </div>
            </div>

            <div className="plans-modal-footer">
              <button 
                className="btn-checkout-cancel" 
                onClick={() => { setSelectedPlan(null); setUpgradePreview(null); }}
                disabled={submitting}
              >
                Hủy bỏ
              </button>
              <button 
                className="btn-checkout-submit" 
                onClick={handleConfirmPayment}
                disabled={submitting || loadingUpgrade}
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
