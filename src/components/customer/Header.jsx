import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatPrice, getImageUrl } from '../../services/utils';

export default function Header({ onNavigate, onSearch, allProducts = [], onSelectProduct }) {
  const { customer, isCustomerLoggedIn, logoutCustomer } = useAuth();
  const { cartCount } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const categoryMenuRef = useRef(null);

  // Autocomplete tìm kiếm sách
  useEffect(() => {
    if (searchTerm.trim().length > 0 && allProducts.length > 0) {
      const filtered = allProducts.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.author && p.author.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, allProducts]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setShowCategoryMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (onSearch) onSearch(searchTerm);
  };

  const handleSelectSuggestion = (product) => {
    setShowSuggestions(false);
    setSearchTerm('');
    if (onSelectProduct) onSelectProduct(product);
  };

  return (
    <header className="fahasa-header">
      {/* 1. DẢI TOP PROMO BANNER MỎNG TRÊN CÙNG BẮT MẮT */}
      <div className="fahasa-top-promo-bar">
        <span>📖 CHẠM ĐIỀU HAY, KHƠI NGUỒN KHÁM PHÁ - ƯU ĐÃI LÊN ĐẾN 40%</span>
        <button
          className="promo-tag-btn"
          onClick={() => onNavigate('home')}
        >
          MUA NGAY 🔥
        </button>
      </div>

      {/* 2. TOPBAR THÔNG TIN & LỐI VÀO KÊNH NGƯỜI BÁN */}
      <div className="fahasa-topbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>📞 Hotline đặt sách: 1900 6656</span>
            <span>⚡ Giao hàng toàn quốc - Đồng kiểm tra hàng COD</span>
          </div>
          <div>
            <button
              className="seller-channel-link"
              onClick={() => onNavigate('seller-dashboard')}
              title="Truy cập Kênh Người Bán"
              style={{ fontSize: '12px' }}
            >
              🏪 <strong>Kênh Người Bán</strong>
            </button>
          </div>
        </div>
      </div>

      {/* 3. HEADER CHÍNH PHONG CÁCH FAHASA */}
      <div className="fahasa-header-main">
        <div className="container fahasa-header-wrapper">
          {/* Logo ComicHub sắc nét */}
          <div
            className="fahasa-logo"
            onClick={() => onNavigate('home')}
            title="Trang chủ ComicHub.vn"
          >
            📚 ComicHub<span>.vn</span>
          </div>

          {/* Nút Icon Danh Mục 4 ô vuông + mũi tên */}
          <div style={{ position: 'relative' }} ref={categoryMenuRef}>
            <button
              className="fahasa-category-menu-btn"
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            >
              <div className="category-icon-grid">
                <span /><span /><span /><span />
              </div>
              <span>Danh Mục Sách</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>

            {/* Menu Dropdown Danh mục */}
            {showCategoryMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  left: 0,
                  width: '230px',
                  background: '#fff',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid #e2e8f0',
                  padding: '8px 0',
                  zIndex: 1200,
                }}
              >
                {[
                  { name: 'Tất Cả Manga', cat: 'all' },
                  { name: '🔥 Shounen Manga', cat: 1 },
                  { name: '⚔️ Action & Trinh Thám', cat: 2 },
                  { name: '🧙 Fantasy & Isekai', cat: 3 },
                  { name: '📱 Manhwa / Webtoon', cat: 4 },
                  { name: '📖 Light Novel & Sách Chữ', cat: 5 },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 18px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: '#334155',
                      display: 'block',
                    }}
                    onClick={() => {
                      setShowCategoryMenu(false);
                      if (onSearch) onSearch('');
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Thanh tìm kiếm bo tròn gọn gàng có kính lúp nằm gọn bên trong */}
          <div className="fahasa-search-wrapper" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="fahasa-search-box">
              <input
                type="text"
                className="fahasa-search-input"
                placeholder="Tìm kiếm tựa truyện Manga, tác giả, tập mới nhất..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />
              <button type="submit" className="fahasa-search-icon-btn" title="Tìm kiếm">
                🔍
              </button>
            </form>

            {/* Dropdown gợi ý tìm kiếm tức thì */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((book) => (
                  <div
                    key={book.id}
                    className="suggestion-item"
                    onClick={() => handleSelectSuggestion(book)}
                  >
                    <img
                      src={getImageUrl(book.image, book)}
                      alt={book.name}
                      className="suggestion-img"
                    />
                    <div className="suggestion-info">
                      <div className="suggestion-name">{book.name}</div>
                      <div className="suggestion-price">{formatPrice(book.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cụm 3 icon có chữ ở dưới giống hệt Fahasa */}
          <div className="fahasa-nav-actions">
            {/* 1. Thông báo */}
            <div
              className="fahasa-action-item"
              onClick={() => alert('Hiện bạn không có thông báo khuyến mãi mới.')}
            >
              <div className="fahasa-action-icon">🔔</div>
              <span className="fahasa-action-label">Thông Báo</span>
            </div>

            {/* 2. Giỏ hàng có badge */}
            <div
              className="fahasa-action-item"
              onClick={() => onNavigate('cart')}
            >
              <div className="fahasa-action-icon">
                🛒
                {cartCount > 0 && <span className="fahasa-cart-badge">{cartCount}</span>}
              </div>
              <span className="fahasa-action-label">Giỏ Hàng</span>
            </div>

            {/* 3. Tài khoản */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <div
                className="fahasa-action-item"
                onClick={() => {
                  if (isCustomerLoggedIn) {
                    setShowUserDropdown(!showUserDropdown);
                  } else {
                    onNavigate('login');
                  }
                }}
              >
                <div className="fahasa-action-icon">👤</div>
                <span className="fahasa-action-label">
                  {isCustomerLoggedIn ? customer.name.split(' ').pop() : 'Tài Khoản'}
                </span>
              </div>

              {/* Dropdown người dùng đã đăng nhập */}
              {isCustomerLoggedIn && showUserDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '110%',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid #e2e8f0',
                    width: '180px',
                    zIndex: 1100,
                    overflow: 'hidden',
                  }}
                >
                  <button
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      fontSize: '13px',
                      display: 'block',
                      borderBottom: '1px solid #f1f5f9',
                      fontWeight: 600,
                    }}
                    onClick={() => {
                      setShowUserDropdown(false);
                      onNavigate('orders');
                    }}
                  >
                    📦 Đơn hàng của tôi
                  </button>
                  <button
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      fontSize: '13px',
                      color: '#ef4444',
                      display: 'block',
                      fontWeight: 600,
                    }}
                    onClick={() => {
                      setShowUserDropdown(false);
                      logoutCustomer();
                    }}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
