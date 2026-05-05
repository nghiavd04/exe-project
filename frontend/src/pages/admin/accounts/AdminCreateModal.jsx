import React, { useState } from 'react';
import { X, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import './AdminCreateModal.css';

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
    <div className="modal-overlay-blur">
      <div className="modal-content-card">
        <div className="modal-header-teal">
          <h3>
            <ShieldCheck size={24} /> Thêm Quản trị viên
          </h3>
          <button onClick={onClose} className="modal-close-icon-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="form-group-field">
            <label className="field-label-teal">Họ và tên</label>
            <div className="input-icon-wrapper">
              <User className="input-icon-left" size={18} />
              <input
                type="text"
                placeholder="Nhập họ tên"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className={`modal-input-field ${errors.fullName ? 'error' : ''}`}
              />
            </div>
            {errors.fullName && <p className="error-text-small">{errors.fullName}</p>}
          </div>

          <div className="form-group-field">
            <label className="field-label-teal">Email</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon-left" size={18} />
              <input
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`modal-input-field ${errors.email ? 'error' : ''}`}
              />
            </div>
            {errors.email && <p className="error-text-small">{errors.email}</p>}
          </div>

          <div className="form-group-field last">
            <label className="field-label-teal">Mật khẩu</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`modal-input-field ${errors.password ? 'error' : ''}`}
              />
            </div>
            {errors.password && <p className="error-text-small">{errors.password}</p>}
          </div>

          <div className="modal-footer-btns">
            <button
              type="button"
              onClick={onClose}
              className="btn-modal-secondary"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-modal-primary-teal"
            >
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
