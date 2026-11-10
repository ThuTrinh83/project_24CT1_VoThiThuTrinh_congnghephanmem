import { useCart } from '../../context/CartContext';
import { formatPrice, getImageUrl } from '../../services/utils';

export default function CartPage({ onNavigateCheckout, onContinueShopping }) {
  const { cart, cartTotal, updateItemQty, removeItem } = useCart();

  const shippingFee = cartTotal >= 250000 || cartTotal === 0 ? 0 : 25000;
  const finalTotal = cartTotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="container page-transition" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🛒</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Giỏ hàng của bạn đang trống</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Hãy dạo quanh nhà sách và chọn những cuốn sách yêu thích của bạn nhé!
          </p>
          <button className="btn btn-primary" onClick={onContinueShopping}>
            Khám Phá Sách Ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-transition">
      <div style={{ margin: '24px 0 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>🛒 GIỎ HÀNG CỦA BẠN ({cart.length} sản phẩm)</h1>
      </div>

      <div className="cart-layout">
        {/* Bảng sản phẩm trong giỏ */}
        <div className="cart-table-card">
          {cart.map((item) => (
            <div key={item.id} className="cart-item-row">
              <img
                src={getImageUrl(item.image)}
                alt={item.name}
                className="cart-item-img"
              />

              <div className="cart-item-info">
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.author}</span>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {item.name}
                </h3>
                <div style={{ fontWeight: 700, color: 'var(--accent-sale)', fontSize: '15px' }}>
                  {formatPrice(item.price)}
                </div>
              </div>

              {/* Điều khiển số lượng */}
              <div className="quantity-control">
                <button
                  className="qty-btn"
                  onClick={() => updateItemQty(item.id, (item.quantity || 1) - 1)}
                >
                  -
                </button>
                <input
                  type="text"
                  className="qty-input"
                  value={item.quantity || 1}
                  readOnly
                />
                <button
                  className="qty-btn"
                  onClick={() => updateItemQty(item.id, (item.quantity || 1) + 1)}
                >
                  +
                </button>
              </div>

              {/* Thành tiền cho item */}
              <div style={{ minWidth: '110px', textAlign: 'right', fontWeight: 700 }}>
                {formatPrice(Number(item.price) * (item.quantity || 1))}
              </div>

              {/* Nút xóa */}
              <button
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--accent-sale)', border: 'none', fontSize: '16px' }}
                onClick={() => removeItem(item.id)}
                title="Xóa khỏi giỏ hàng"
              >
                🗑️
              </button>
            </div>
          ))}

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-outline" onClick={onContinueShopping}>
              ← Tiếp tục chọn sách
            </button>
          </div>
        </div>

        {/* Tóm tắt thanh toán */}
        <div className="cart-summary-card">
          <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '20px' }}>TÓM TẮT ĐƠN HÀNG</h3>

          <div className="summary-row">
            <span>Tạm tính:</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>

          <div className="summary-row">
            <span>Phí vận chuyển (COD):</span>
            <span>
              {shippingFee === 0 ? (
                <strong style={{ color: 'var(--accent-green)' }}>Miễn phí (Freeship)</strong>
              ) : (
                formatPrice(shippingFee)
              )}
            </span>
          </div>

          {cartTotal < 250000 && (
            <p style={{ fontSize: '12px', color: 'var(--accent-orange)', marginBottom: '14px' }}>
              💡 Mua thêm {formatPrice(250000 - cartTotal)} để được Miễn Phí Vận Chuyển!
            </p>
          )}

          <div className="summary-row summary-total">
            <span>Tổng cộng:</span>
            <span style={{ fontSize: '22px' }}>{formatPrice(finalTotal)}</span>
          </div>

          <button
            className="btn btn-danger btn-lg"
            style={{ width: '100%', marginTop: '24px' }}
            onClick={onNavigateCheckout}
          >
            Tiến Hành Đặt Hàng (COD) →
          </button>
        </div>
      </div>
    </div>
  );
}
