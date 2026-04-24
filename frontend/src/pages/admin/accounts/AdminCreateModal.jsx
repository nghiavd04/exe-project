import React, { useState } from 'react';
import { X, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';

export default function AdminCreateModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email không đúng định dạng';
    if (!form.password) errs.password = 'Mật khẩu không được để trống';
    else if (form.password.length < 6) errs.password = 'Mật khẩu phải từ 6 ký tự';
    if (!form.fullName) errs.fullName = 'Họ tên không được để trống';
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
      const response = await adminApi.createAdmin(form);
      if (response.data.success) {
        toast.success('Tạo tài khoản Admin thành công!');
        setForm({ email: '', password: '', fullName: '' });
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản');
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
        background: 'white', borderRadius: '16px', width: '100%', maxWidth: '450px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden', animation: 'modalFadeIn 0.3s ease-out'
      }}>
        <div style={{ 
          padding: '1.5rem', borderBottom: '1px solid #edf2f7', display: 'flex', 
          justifyContent: 'space-between', alignItems: 'center', background: 'var(--teal-dark)', color: 'white'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={24} /> Thêm Quản trị viên
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--teal-dark)' }}>Họ và tên</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={18} />
              <input
                type="text"
                placeholder="Nhập họ tên"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px',
                  border: errors.fullName ? '1px solid #e53e3e' : '1px solid #e2e8f0', outline: 'none'
                }}
              />
            </div>
            {errors.fullName && <p style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.fullName}</p>}
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--teal-dark)' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={18} />
              <input
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px',
                  border: errors.email ? '1px solid #e53e3e' : '1px solid #e2e8f0', outline: 'none'
                }}
              />
            </div>
            {errors.email && <p style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email}</p>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--teal-dark)' }}>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px',
                  border: errors.password ? '1px solid #e53e3e' : '1px solid #e2e8f0', outline: 'none'
                }}
              />
            </div>
            {errors.password && <p style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password}</p>}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0',
                background: 'white', color: 'var(--muted)', fontWeight: '700', cursor: 'pointer'
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2, padding: '0.75rem', borderRadius: '10px', border: 'none',
                background: 'var(--teal-dark)', color: 'white', fontWeight: '700', cursor: 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
