export default function SellerSidebar({ activeTab, onTabChange, onNavigateStore }) {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng Quan Dashboard', icon: '📊' },
    { id: 'products', label: 'Quản Lý Sách & Tồn Kho', icon: '📚' },
    { id: 'orders', label: 'Quản Lý Đơn Hàng', icon: '📦' },
  ];

  return (
    <aside className="seller-sidebar">
      {/* Brand Header */}
      <div className="seller-brand">
        <div className="seller-brand-logo">🏪</div>
        <div className="seller-brand-text">
          <h2>ComicHub Kênh Bán</h2>
          <span>Seller Centre</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="seller-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`seller-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Footer link quay lại gian hàng khách */}
      <div className="seller-sidebar-footer">
        <button className="seller-back-store-btn" onClick={onNavigateStore}>
          🛍️ Đến Gian Hàng Khách
        </button>
      </div>
    </aside>
  );
}
