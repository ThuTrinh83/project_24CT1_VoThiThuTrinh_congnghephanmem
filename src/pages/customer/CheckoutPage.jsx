import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, cleanNumericPrice, getImageUrl } from '../../services/utils';
import { createCODOrder } from '../../services/cart';

export default function CheckoutPage({ onOrderSuccess, onBackToCart }) {
  const { cart, clearCart } = useCart();
  const { customer, showToast } = useAuth();

  const [customerName, setCustomerName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [note, setNote] = useState('Thanh toán tiền mặt khi nhận hàng (COD)');
  const [submitting, setSubmitting] = useState(false);

  // Tính toán lại tổng tiền an toàn 100%
  const subtotal = cart.reduce((sum, item) => {
    const p = cleanNumericPrice(item.price || item.sale_price);
    const q = Math.max(1, Number(item.quantity) || 1);
    return sum + (p * q);
  }, 0);

  const shippingFee = subtotal >= 250000 || subtotal === 0 ? 0 : 25000;
  const finalTotal = subtotal + shippingFee;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      showToast('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!', 'warning');
      return;
    }

    if (cart.length === 0) {
      showToast('Giỏ hàng trống! Không thể đặt hàng.', 'warning');
      return;
    }

    try {
      setSubmitting(true);

      // Chuẩn hóa danh sách sản phẩm với giá nguyên bản số nguyên > 0
      const itemsPayload = cart.map((item) => {
        const cleanPrice = cleanNumericPrice(item.price || item.sale_price);
        return {
          id: item.id,
          book_id: item.id,
          name: item.name || item.title || '',
          quantity: Math.max(1, Number(item.quantity) || 1),
          price: cleanPrice,
        };
      });

      const orderPayload = {
        userId: customer?.id || null,
        user_id: customer?.id || null,
        customerName: customerName.trim(),
        customer_name: customerName.trim(),
        phone: phone.trim(),
        customer_phone: phone.trim(),
        address: address.trim(),
        shipping_address: address.trim(),
        note: note.trim() || 'Thanh toán tiền mặt khi nhận hàng (COD)',
        items: itemsPayload,
        total: finalTotal,
        total_amount: finalTotal,
      };

      const res = await createCODOrder(orderPayload);
      if (res.success) {
        clearCart();
        showToast(`Đặt hàng thành công! Mã đơn: ${res.orderCode || '#' + res.orderId}`, 'success');
        if (onOrderSuccess) onOrderSuccess(res.orderId);
      }
    } catch (err) {
      showToast(err.message || 'Đặt hàng thất bại. Vui lòng thử lại!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-transition">
      <div style={{ margin: '24px 0 16px' }}>
        <button className="btn btn-outline btn-sm" onClick={onBackToCart}>
          ← Quay lại giỏ hàng
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginTop: '12px' }}>
          🚚 THANH TOÁN ĐƠN HÀNG
        </h1>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="checkout-layout">
          {/* Cột thông tin nhận hàng & phương thức COD */}
          <div>
            {/* Form Địa chỉ nhận hàng */}
            <div className="cart-table-card" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
                📍 ĐỊA CHỈ NHẬN HÀNG
              </h2>

              <div className="form-group">
                <label className="form-label">Họ và tên người nhận (*)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại liên hệ (*)</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Ví dụ: 0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Địa chỉ nhận hàng chi tiết (*)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ghi chú giao hàng (Tùy chọn)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            {/* Phương thức thanh toán DUY NHẤT: COD */}
            <div className="cart-table-card">
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
                💳 PHƯƠNG THỨC THANH TOÁN
              </h2>

              <div className="cod-exclusive-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="radio"
                    id="cod-method"
                    name="payment_method"
                    checked
                    readOnly
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                  />
                  <label htmlFor="cod-method" style={{ cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>
                    💵 Thanh toán tiền mặt khi nhận hàng (COD)
                  </label>
                  <span className="badge badge-cod">Duy Nhất</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0 0 30px' }}>
                  Quý khách chỉ thanh toán khi đã nhận sách và kiểm tra đúng đơn hàng. An toàn và tiện lợi 100%.
                </p>
              </div>
            </div>
          </div>

          {/* Cột tóm tắt đơn hàng */}
          <div>
            <div className="order-summary-card">
              <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                ĐƠN HÀNG CỦA BẠN ({cart.length} cuốn)
              </h3>

              {/* Danh sách sách trong đơn */}
              <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '16px' }}>
                {cart.map((item) => {
                  const itemPrice = cleanNumericPrice(item.price || item.sale_price);
                  const qty = Math.max(1, Number(item.quantity) || 1);
                  return (
                    <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        style={{ width: '42px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '13.5px', fontWeight: 600, margin: 0, lineClamp: 1 }}>
                          {item.name}
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {qty} x {formatPrice(itemPrice)}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '13.5px' }}>
                        {formatPrice(itemPrice * qty)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chi tiết tiền */}
              <div className="summary-row">
                <span>Tiền sách:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển COD:</span>
                <span>
                  {shippingFee === 0 ? (
                    <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Miễn phí</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              <div className="summary-divider" />

              <div className="summary-row" style={{ fontSize: '18px', fontWeight: 800 }}>
                <span>Tổng thanh toán:</span>
                <span style={{ color: 'var(--accent-sale)' }}>{formatPrice(finalTotal)}</span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '14px 0', textAlign: 'center' }}>
                ✓ Đảm bảo nhận đúng sách đã đặt trước khi trả tiền
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 700 }}
                disabled={submitting}
              >
                {submitting ? 'Đang tạo đơn hàng...' : `XÁC NHẬN ĐẶT HÀNG COD (${formatPrice(finalTotal)})`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
