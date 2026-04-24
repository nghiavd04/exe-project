import React, { useState, useEffect } from 'react';
import { X, CreditCard, Tag, Clock, AlignLeft } from 'lucide-react';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';

export default function SubscriptionPlanModal({ isOpen, onClose, onSuccess, plan }) {
  const [form, setForm] = useState({
    name: '',
    price: '',
    durationDays: '',
    description: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (plan) {
      setForm({
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
        description: plan.description || '',
        isActive: plan.isActive
      });
    } else {
      setForm({ name: '', price: '', durationDays: '', description: '', isActive: true });
    }
    setErrors({});
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Tên gói không được để trống';
    if (!form.price && form.price !== 0) errs.price = 'Giá không được để trống';
    else if (form.price < 0) errs.price = 'Giá không được âm';
    if (!form.durationDays) errs.durationDays = 'Thời hạn không được để trống';
    else if (form.durationDays < 1) errs.durationDays = 'Thời hạn ít nhất 1 ngày';
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
      if (plan) {
        await adminApi.updateSubscriptionPlan(plan.id, form);
        toast.success('Cập nhật gói thành công');
      } else {
        await adminApi.createSubscriptionPlan(form);
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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '1.5rem', borderBottom: '1px solid #edf2f7', display: 'flex', 
          justifyContent: 'space-between', alignItems: 'center', background: 'var(--teal-dark)', color: 'white'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={24} /> {plan ? 'Chỉnh sửa gói' : 'Tạo gói dịch vụ mới'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Tên gói dịch vụ</label>
            <div style={{ position: 'relative' }}>
              <Tag style={iconStyle} size={18} />
              <input
                type="text"
                placeholder="Ví dụ: Premium Monthly"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ ...inputStyle, paddingLeft: '2.5rem', border: errors.name ? '1px solid #e53e3e' : '1px solid #e2e8f0' }}
              />
            </div>
            {errors.name && <p style={errorStyle}>{errors.name}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Giá (VND)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                style={{ ...inputStyle, border: errors.price ? '1px solid #e53e3e' : '1px solid #e2e8f0' }}
              />
              {errors.price && <p style={errorStyle}>{errors.price}</p>}
            </div>
            <div>
              <label style={labelStyle}>Thời hạn (Ngày)</label>
              <div style={{ position: 'relative' }}>
                <Clock style={iconStyle} size={18} />
                <input
                  type="number"
                  min="1"
                  placeholder="30"
                  value={form.durationDays}
                  onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                  style={{ ...inputStyle, paddingLeft: '2.5rem', border: errors.durationDays ? '1px solid #e53e3e' : '1px solid #e2e8f0' }}
                />
              </div>
              {errors.durationDays && <p style={errorStyle}>{errors.durationDays}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Mô tả</label>
            <div style={{ position: 'relative' }}>
              <AlignLeft style={{ ...iconStyle, top: '12px', transform: 'none' }} size={18} />
              <textarea
                placeholder="Mô tả các quyền lợi của gói..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ ...inputStyle, paddingLeft: '2.5rem', minHeight: '100px', resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="isActive" 
              checked={form.isActive} 
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: 'var(--teal-dark)' }}
            />
            <label htmlFor="isActive" style={{ fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>Kích hoạt gói này ngay lập tức</label>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={onClose} style={btnCancelStyle}>Hủy</button>
            <button type="submit" disabled={loading} style={btnSubmitStyle}>
              {loading ? 'Đang xử lý...' : plan ? 'Cập nhật gói' : 'Tạo gói mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--teal-dark)' };
const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' };
const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' };
const errorStyle = { color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' };
const btnCancelStyle = { flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: 'var(--muted)', fontWeight: '700', cursor: 'pointer' };
const btnSubmitStyle = { flex: 2, padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'var(--teal-dark)', color: 'white', fontWeight: '700', cursor: 'pointer' };
