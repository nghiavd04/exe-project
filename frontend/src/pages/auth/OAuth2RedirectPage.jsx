import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuth2RedirectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      navigate('/');
    } else {
      navigate('/login?error=' + (error || 'oauth2_failed'));
    }
  }, [navigate, searchParams]);

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
