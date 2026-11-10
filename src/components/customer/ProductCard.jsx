import { useCart } from '../../context/CartContext';
import { formatPrice, getImageUrl } from '../../services/utils';

export default function ProductCard({ product, onSelect, isFlashSale = false }) {
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product, 1);
  };

  // Badge góc trên bên trái: "Sắp Có Hàng", "Độc Quyền", "Mới"
  const getBadgeClass = (badge) => {
    switch (badge) {
      case 'Sắp Có Hàng':
        return 'fahasa-badge-preorder';
      case 'Độc Quyền':
        return 'fahasa-badge-exclusive';
      default:
        return 'fahasa-badge-new';
    }
  };

  // Tính phần trăm tiến độ bán
  const soldCount = product.sold || 120;
  const progressPercent = Math.min(Math.round((soldCount / 500) * 100), 100);

  return (
    <div className="fahasa-product-card" onClick={() => onSelect(product)}>
      {/* 1. KHU VỰC ẢNH BÌA SÁCH */}
      <div className="fahasa-thumb-box">
        {/* Badge góc trên bên trái: "Sắp Có Hàng" / "Độc Quyền" / "Mới" */}
        {product.badge && (
          <span className={`fahasa-badge-top-left ${getBadgeClass(product.badge)}`}>
            {product.badge}
          </span>
        )}

        {/* Badge góc dưới bên phải ảnh: Nhãn màu đen bo góc ghi số tập ("Tập 25+26", "Tập 108") */}
        {product.volume && (
          <span className="fahasa-volume-tag">
            {product.volume}
          </span>
        )}

        {/* Ảnh bìa đứng */}
        <img
          src={getImageUrl(product.image, product)}
          alt={product.name}
          className="fahasa-book-cover"
          loading="lazy"
        />

        {/* Nút thêm vào giỏ nhanh khi hover */}
        <button
          className="fahasa-quick-add-btn"
          onClick={handleAddToCart}
          title="Thêm nhanh vào giỏ hàng"
        >
          🛒 Thêm vào giỏ
        </button>
      </div>

      {/* 2. KHU VỰC THÔNG TIN SÁCH */}
      <div className="fahasa-card-body">
        {/* Tiêu đề sách (tối đa 2 dòng) kèm Tag phía trước */}
        <h3 className="fahasa-card-title" title={product.name}>
          {product.tag && (
            <span className="fahasa-title-tag">{product.tag}</span>
          )}
          {product.name}
        </h3>

        {/* Giá bán & Khuyến mãi */}
        <div className="fahasa-price-container">
          <div className="fahasa-price-main-row">
            <span className="fahasa-sale-price">{formatPrice(product.price)}</span>
            {product.discount > 0 && (
              <span className="fahasa-discount-badge">-{product.discount}%</span>
            )}
          </div>
          {product.oldPrice && product.oldPrice > product.price && (
            <div className="fahasa-original-price">
              {formatPrice(product.oldPrice)}
            </div>
          )}
        </div>

        {/* Thanh tiến độ / Đánh giá sao */}
        <div className="fahasa-card-footer">
          {isFlashSale ? (
            /* Thanh tiến độ Flash Sale: "Đã bán 219" hoặc "Sắp hết" */
            <div className="fahasa-progress-track">
              <div
                className="fahasa-progress-fill"
                style={{ width: `${Math.max(progressPercent, 18)}%` }}
              />
              <span className="fahasa-progress-label">
                {progressPercent > 85 ? '🔥 Sắp hết hàng' : `Đã bán ${soldCount}`}
              </span>
            </div>
          ) : (
            /* Danh sách thường: 5 sao vàng ★★★★★ | Đã bán 170 */
            <div className="fahasa-rating-row">
              <span className="fahasa-stars">★★★★★</span>
              <span className="fahasa-sold-text">| Đã bán {soldCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
