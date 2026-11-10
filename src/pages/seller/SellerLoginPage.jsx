import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SellerLoginPage({ onLoginSuccess, onNavigateStore }) {
  const { loginSeller } = useAuth();
  const [email, setEmail] = useState('shop@comichub.vn');
  const [password, setPassword] = useState('shop123456');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await loginSeller(email, password);
    setLoading(false);
    if (res?.success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <div className="seller-login-page">
      <div className="seller-login-card">
        <div className="seller-login-logo">
          <div style={{ fontSize: '48px' }}>🏪</div>
          <h2>ComicHub Kênh Người Bán</h2>
          <span className="seller-login-badge">Shopee Seller Centre Edition</span>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '8px' }}>
            Cổng quản trị dành riêng cho Chủ shop & Nhà xuất bản
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Người bán (*)</label>
            <input
              type="email"
              className="form-control"
              placeholder="shop@comichub.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu (*)</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd', fontSize: '12.5px', color: '#0369a1', margin: '14px 0' }}>
            ℹ️ <strong>Tài khoản mẫu:</strong><br />
            - Shop: <code>shop@comichub.vn</code> / <code>shop123456</code><br />
            - Admin: <code>admin@comichub.vn</code> / <code>admin123456</code>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px', background: '#0284c7' }}
            disabled={loading}
          >
            {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP KÊNH NGƯỜI BÁN'}
          </button>
        </form>

        <div style={{ marginTop: '28px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <button
            style={{ color: '#0284c7', fontSize: '13.5px', fontWeight: 600 }}
            onClick={onNavigateStore}
          >
            ← Quay lại Gian hàng Mua sách của Khách
          </button>
        </div>
      </div>
    </div>
  );
}
