import React, { useState, useEffect } from 'react';
import { X, CreditCard, Tag, Clock, Shield, ChevronDown } from 'lucide-react';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import './SubscriptionPlanModal.css';

export default function SubscriptionPlanModal({ isOpen, onClose, onSuccess, plan }) {
  const [form, setForm] = useState({
    name: '',
    price: '',
    durationDays: '',
    description: '',
    tier: 'BASIC',
    isActive: true
  });
  const [features, setFeatures] = useState([{ name: '', included: true }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchTiers();
      if (plan) {
        setForm({
          name: plan.name,
          price: plan.price,
          durationDays: plan.durationDays,
          description: plan.description || '',
          tier: plan.tier || 'BASIC',
          isActive: plan.isActive
        });
        try {
          const parsed = plan.features ? JSON.parse(plan.features) : [];
          setFeatures(parsed.length > 0 ? parsed : [{ name: '', included: true }]);
        } catch (e) {
          setFeatures([{ name: '', included: true }]);
        }
      } else {
        setForm({ name: '', price: '', durationDays: '', description: '', tier: 'BASIC', isActive: true });
        setFeatures([{ name: '', included: true }]);
      }
      setErrors({});
    }
  }, [plan, isOpen]);

  const fetchTiers = async () => {
    try {
      const response = await adminApi.getArticleTiers();
      if (response.data.success) {
        const isEditingFree = plan && plan.tier === 'FREE';
        const filtered = response.data.data.filter(t => t.value !== 'FREE' || isEditingFree);
        setTiers(filtered);
      }
    } catch (error) {
      console.error('Error fetching tiers:', error);
    }
  };

  const handleAddFeature = () => {
    setFeatures([...features, { name: '', included: true }]);
  };

  const handleRemoveFeature = (index) => {
    const updated = features.filter((_, idx) => idx !== index);
    setFeatures(updated.length > 0 ? updated : [{ name: '', included: true }]);
  };

  const handleFeatureChange = (index, field, value) => {
    const updated = features.map((feat, idx) => {
      if (idx === index) {
        return { ...feat, [field]: value };
      }
      return feat;
    });
    setFeatures(updated);
  };

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Tên gói không được để trống';
    if (!form.price && form.price !== 0) errs.price = 'Giá không được để trống';
    else if (form.price < 0) errs.price = 'Giá không được âm';
    if (!form.durationDays) errs.durationDays = 'Thời hạn không được để trống';
    else if (form.durationDays < 1) errs.durationDays = 'Thời hạn ít nhất 1 ngày';
    if (!form.tier) errs.tier = 'Cấp độ gói không được để trống';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const filteredFeatures = features.filter(f => f.name.trim() !== '');
      const submitForm = {
        ...form,
        features: JSON.stringify(filteredFeatures)
      };

      if (plan) {
        await adminApi.updateSubscriptionPlan(plan.id, submitForm);
        toast.success('Cập nhật gói thành công');
      } else {
        await adminApi.createSubscriptionPlan(submitForm);
        toast.success('Tạo gói dịch vụ mới thành công');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plan-modal-overlay">
      <div className="plan-modal-card">
        <div className="plan-modal-header">
          <h3>
            <CreditCard size={24} /> {plan ? 'Chỉnh sửa gói' : 'Tạo gói dịch vụ mới'}
          </h3>
          <button onClick={onClose} className="btn-close-modal-icon">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="plan-modal-form">
          <div className="modal-field-group">
            <label className="modal-label-teal">Tên gói dịch vụ</label>
            <div className="input-with-icon-wrapper">
              <Tag className="modal-input-icon" size={18} />
              <input
                type="text"
                placeholder="Ví dụ: Premium Monthly"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`modal-input-styled has-icon ${errors.name ? 'error' : ''}`}
              />
            </div>
            {errors.name && <p className="modal-error-msg">{errors.name}</p>}
          </div>

          <div className="modal-field-group">
            <label className="modal-label-teal">Hạng thành viên (Tier)</label>
            <div className="input-with-icon-wrapper">
              <Shield className="modal-input-icon" size={18} />
              <select
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value })}
                className={`modal-input-styled has-icon ${errors.tier ? 'error' : ''}`}
                style={{ appearance: 'none' }}
              >
                {tiers.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown size={18} className="modal-input-icon" style={{ left: 'auto', right: '12px', pointerEvents: 'none' }} />
            </div>
            {errors.tier && <p className="modal-error-msg">{errors.tier}</p>}
          </div>

          <div className="modal-grid-2">
            <div>
              <label className="modal-label-teal">Giá (VND)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={`modal-input-styled ${errors.price ? 'error' : ''}`}
              />
              {errors.price && <p className="modal-error-msg">{errors.price}</p>}
            </div>
            <div>
              <label className="modal-label-teal">Thời hạn (Ngày)</label>
              <div className="input-with-icon-wrapper">
                <Clock className="modal-input-icon" size={18} />
                <input
                  type="number"
                  min="1"
                  placeholder="30"
                  value={form.durationDays}
                  onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                  className={`modal-input-styled has-icon ${errors.durationDays ? 'error' : ''}`}
                />
              </div>
              {errors.durationDays && <p className="modal-error-msg">{errors.durationDays}</p>}
            </div>
          </div>

          <div className="modal-field-group">
            <label className="modal-label-teal">Mô tả ngắn</label>
            <textarea
              placeholder="Mô tả tóm tắt về gói này..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="modal-textarea-styled"
              rows={2}
            />
          </div>

          <div className="modal-field-group">
            <label className="modal-label-teal">Danh sách tính năng & quyền lợi</label>
            <div className="modal-features-list-editor" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={feature.included}
                    onChange={(e) => handleFeatureChange(idx, 'included', e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--teal)' }}
                  />
                  <input
                    type="text"
                    placeholder="Tên quyền lợi (ví dụ: AI Coach 24/7)"
                    value={feature.name}
                    onChange={(e) => handleFeatureChange(idx, 'name', e.target.value)}
                    className="modal-input-styled"
                    style={{ flex: 1, padding: '8px 12px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddFeature}
              className="btn-modal-secondary"
              style={{ alignSelf: 'flex-start', marginTop: '8px', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              + Thêm tính năng mới
            </button>
          </div>

          <div className="modal-checkbox-row">
            <input 
              type="checkbox" 
              id="isActive" 
              checked={form.isActive} 
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="modal-checkbox-input"
            />
            <label htmlFor="isActive" className="modal-checkbox-label">Kích hoạt gói này ngay lập tức</label>
          </div>

          <div className="modal-actions-footer">
            <button type="button" onClick={onClose} className="btn-modal-cancel">Hủy</button>
            <button type="submit" disabled={loading} className="btn-modal-submit-teal">
              {loading ? 'Đang xử lý...' : plan ? 'Cập nhật gói' : 'Tạo gói mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
