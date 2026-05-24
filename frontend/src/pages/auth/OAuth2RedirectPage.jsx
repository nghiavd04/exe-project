import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/AuthContext';
import { toast } from 'react-hot-toast';

export default function OAuth2RedirectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const hasFetched = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode running effects twice in development
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      const fetchProfile = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/v1/customer/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userData = response.data.data;

          login(userData, token);
          navigate('/');
        } catch (err) {
          console.error('Lỗi khi lấy thông tin người dùng:', err);
          toast.error('Không thể hoàn tất đăng nhập Google.');
          navigate('/dang-nhap');
        }
      };

      fetchProfile();
    } else {
      navigate('/dang-nhap?error=' + (error || 'oauth2_failed'));
    }
  }, [navigate, searchParams, login]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{
          width: 56,
          height: 56,
          border: '4px solid rgba(255,255,255,0.2)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>Đang xử lý đăng nhập Google...</p>
      </div>
    </div>
  );
}
