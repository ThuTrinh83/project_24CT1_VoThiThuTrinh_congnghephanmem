import { useAuth } from '../../context/AuthContext';

export default function SellerHeader({ title, subtitle, onLogout }) {
  const { seller } = useAuth();

  return (
    <header className="seller-header">
      <div className="seller-header-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="seller-profile-badge">
        <div className="seller-avatar">
          {seller?.name ? seller.name.charAt(0).toUpperCase() : 'S'}
        </div>
        <div className="seller-info-text">
          <span className="seller-name">{seller?.name || 'Chủ Gian Hàng'}</span>
          <span className="seller-role-tag">
            {seller?.role === 'admin' ? 'Quản Trị Viên' : 'Kênh Người Bán'}
          </span>
        </div>
        <button
          className="btn btn-outline btn-sm"
          style={{ marginLeft: '12px', color: 'var(--accent-sale)' }}
          onClick={onLogout}
          title="Đăng xuất khỏi Kênh Người Bán"
        >
          🚪 Đăng Xuất
        </button>
      </div>
    </header>
  );
}
