import { useState } from 'react';
import ProductCard from '../../components/customer/ProductCard';

export default function HomePage({ products = [], categories = [], onSelectProduct }) {
  // Tab hiện tại trong Section Xu Hướng Mua Sắm
  const [activeTrendTab, setActiveTrendTab] = useState('day');
  // Lọc theo danh mục chính
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Lọc danh sách theo tab Xu hướng
  const getTrendProducts = () => {
    switch (activeTrendTab) {
      case 'hot':
        return products.filter((p) => (p.discount || 0) >= 18).slice(0, 5);
      case 'bestseller':
        return products.filter((p) => (p.sold || 0) > 400).slice(0, 5);
      case 'combo':
        return products.filter((p) => p.name.includes('+') || p.price > 60000).slice(0, 5);
      default:
        // 'day'
        return products.slice(0, 5);
    }
  };

  // Lọc theo danh mục
  const filteredProducts = selectedCategory === 'Tất cả'
    ? products
    : products.filter((p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="container page-transition" style={{ padding: '0 16px 40px' }}>
      {/* 1. HERO BANNER SLIDER & 2 BANNER PHỤ */}
      <section className="fahasa-hero-section">
        <div className="fahasa-hero-grid">
          {/* Main Banner Slider Poster */}
          <div className="fahasa-slider-container">
            <div
              className="fahasa-slide"
              style={{
                background: 'linear-gradient(135deg, #091e3a 0%, #0369a1 55%, #0284c7 100%)',
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.4)',
              }}
            >
              <div className="fahasa-slide-overlay" />
              <div className="fahasa-slide-content">
                <span className="fahasa-slide-tag">ĐẠI TIỆC MANGA 2026</span>
                <h1 className="fahasa-slide-title">
                  Thế Giới Truyện Tranh & Sách Bản Quyền - ComicHub.vn
                </h1>
                <p className="fahasa-slide-desc">
                  Trọn bộ One Piece, Conan, Jujutsu Kaisen, Spy x Family, Chainsaw Man... Sách mới phát hành chính hãng, đóng gói kỹ càng và giao hàng COD tận tay trên toàn quốc.
                </p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => {
                    const el = document.getElementById('trend-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Khám Phá Xu Hướng Ngay 🔥
                </button>
              </div>
            </div>
          </div>

          {/* 2 Banner phụ bên phải */}
          <div className="fahasa-sub-banners">
            <div
              className="fahasa-sub-banner-item"
              style={{
                background: 'linear-gradient(135deg, #9a3412 0%, #ea580c 60%, #f97316 100%)',
                color: '#fff',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
              onClick={() => setActiveTrendTab('hot')}
            >
              <span style={{ fontSize: '28px', marginBottom: '4px' }}>⚡</span>
              <strong style={{ fontSize: '17px', fontWeight: 800 }}>Manga Siêu Giảm Sốc</strong>
              <span style={{ fontSize: '13px', opacity: 0.95, marginTop: '2px' }}>Ưu đãi đến 30% hôm nay →</span>
            </div>

            <div
              className="fahasa-sub-banner-item"
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 60%, #0284c7 100%)',
                color: '#fff',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
              onClick={() => setActiveTrendTab('bestseller')}
            >
              <span style={{ fontSize: '28px', marginBottom: '4px' }}>🏆</span>
              <strong style={{ fontSize: '17px', fontWeight: 800 }}>Top Manga Bestseller</strong>
              <span style={{ fontSize: '13px', opacity: 0.95, marginTop: '2px' }}>Sách được săn đón nhiều nhất →</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION "XU HƯỚNG MUA SẮM" (FAHASA STYLE) */}
      <section className="fahasa-trend-section" id="trend-section">
        <div className="fahasa-trend-header">
          {/* Tiêu đề khung xanh kèm icon tăng trưởng 📈 */}
          <div className="fahasa-trend-title-box">
            <span>📈</span>
            <span>XU HƯỚNG MUA SẮM</span>
          </div>

          {/* Tabs chuyển đổi mượt mà */}
          <div className="fahasa-trend-tabs">
            {[
              { id: 'day', label: 'Xu Hướng Theo Ngày' },
              { id: 'hot', label: 'Sách HOT - Giảm Sốc' },
              { id: 'bestseller', label: 'Manga Bestseller' },
              { id: 'combo', label: 'Combo Quà Tặng' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`fahasa-trend-tab-btn ${activeTrendTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTrendTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* LƯỚI ĐÚNG 5 SẢN PHẨM TRÊN 1 HÀNG CÓ THANH TIẾN ĐỘ BÁN HÀNG */}
        <div className="fahasa-grid-5">
          {getTrendProducts().map((book) => (
            <ProductCard
              key={book.id}
              product={book}
              onSelect={onSelectProduct}
              isFlashSale={true}
            />
          ))}
        </div>
      </section>

      {/* 3. SECTION DANH MỤC SÁCH & TOÀN BỘ SẢN PHẨM */}
      <section style={{ margin: '30px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#0284c7' }}>📚</span> TẤT CẢ TỰA SÁCH & MANGA
          </h2>
          <span style={{ fontSize: '13.5px', color: '#64748b' }}>
            Hiển thị {filteredProducts.length} cuốn sách
          </span>
        </div>

        {/* Category Pills */}
        <div className="category-pills" style={{ marginBottom: '20px' }}>
          {categories.map((catName) => (
            <button
              key={catName}
              className={`category-pill ${selectedCategory === catName ? 'active' : ''}`}
              onClick={() => setSelectedCategory(catName)}
            >
              {catName}
            </button>
          ))}
        </div>

        {/* LƯỚI ĐÚNG 5 SẢN PHẨM TRÊN 1 HÀNG (SẢN PHẨM THƯỜNG - 5 SAO VÀNG + ĐÃ BÁN) */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: '12px' }}>
            <p style={{ fontSize: '16px', color: '#64748b' }}>Đang nạp dữ liệu sách...</p>
          </div>
        ) : (
          <div className="fahasa-grid-5">
            {filteredProducts.map((book) => (
              <ProductCard
                key={book.id}
                product={book}
                onSelect={onSelectProduct}
                isFlashSale={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
