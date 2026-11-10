import { useAuth } from '../../context/AuthContext';

export default function AuthGuard({ roleRequired, children, onNavigate }) {
  const { customer, seller } = useAuth();

  // Yêu cầu quyền Người bán (shop hoặc admin)
  if (roleRequired === 'seller') {
    if (!seller || (seller.role !== 'shop' && seller.role !== 'admin')) {
      return (
        <div className="seller-login-page">
          <div className="seller-login-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Yêu Cầu Quyền Người Bán
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              Bạn chưa đăng nhập vào Kênh Người Bán hoặc tài khoản Khách hàng không có quyền truy cập khu vực này.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => onNavigate('seller-login')}
              >
                Đến Cổng Người Bán
              </button>
              <button
                className="btn btn-outline"
                onClick={() => onNavigate('home')}
              >
                Về Trang Khách Hàng
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Yêu cầu đăng nhập Khách hàng
  if (roleRequired === 'customer') {
    if (!customer) {
      return (
        <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
          <div style={{ maxWidth: '420px', margin: '0 auto', background: '#fff', padding: '36px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ fontSize: '44px', marginBottom: '14px' }}>👤</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Yêu Cầu Đăng Nhập</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Vui lòng đăng nhập tài khoản Khách hàng để thực hiện chức năng này.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onNavigate('login')}>
              Đăng Nhập Ngay
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
}
