import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders } from '../../services/cart';
import { formatPrice, cleanNumericPrice, getImageUrl } from '../../services/utils';

export default function OrderHistoryPage({ onContinueShopping }) {
  const { customer } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customer && customer.id) {
      loadOrders(customer.id);
    }
  }, [customer]);

  const loadOrders = async (userId) => {
    try {
      setLoading(true);
      const res = await getUserOrders(userId);
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Lỗi tải đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Chờ xác nhận':
        return <span className="badge badge-pending">⏳ Chờ xác nhận</span>;
      case 'Đang giao':
        return <span className="badge badge-shipping">🚚 Đang giao hàng</span>;
      case 'Đã giao':
        return <span className="badge badge-completed">✓ Đã giao thành công</span>;
      case 'Đã hủy':
        return <span className="badge badge-cancelled">✕ Đã hủy</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="container page-transition" style={{ padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>📦 ĐƠN HÀNG CỦA TÔI</h1>
        <button className="btn btn-outline btn-sm" onClick={() => customer && loadOrders(customer.id)}>
          🔄 Làm mới danh sách
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p>Đang tải lịch sử đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', background: '#fff', padding: '48px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '50px', marginBottom: '14px' }}>📭</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Bạn chưa có đơn hàng nào</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Sau khi đặt sách với hình thức COD, bạn có thể theo dõi tiến trình giao hàng tại đây.
          </p>
          <button className="btn btn-primary" onClick={onContinueShopping}>
            Mua Sắm Ngay
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => {
            const orderTotal = cleanNumericPrice(order.total || order.total_amount);

            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary-color)' }}>
                      {order.orderCode || `#DH-${order.id}`}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '12px' }}>
                      Ngày đặt: {order.date}
                    </span>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Danh sách các sản phẩm trong đơn */}
                <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '12px' }}>
                  {(order.items || []).map((item, idx) => {
                    const itemPrice = cleanNumericPrice(item.price);
                    const itemQty = Math.max(1, Number(item.quantity) || 1);
                    const itemSubtotal = itemPrice * itemQty;

                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          style={{ width: '45px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px' }}>{item.name}</h4>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                            {itemQty} x {formatPrice(itemPrice)} = <strong style={{ color: 'var(--text-main)' }}>{formatPrice(itemSubtotal)}</strong>
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--accent-sale)' }}>
                          {formatPrice(itemSubtotal)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Thông tin nhận hàng & Tổng tiền COD */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-body)', maxWidth: '500px' }}>
                    <p style={{ margin: '2px 0' }}><strong>Người nhận:</strong> {order.customer_name || order.customerName} ({order.phone || order.customer_phone})</p>
                    <p style={{ margin: '2px 0' }}><strong>Địa chỉ:</strong> {order.address || order.shipping_address}</p>
                    <p style={{ margin: '2px 0' }}><strong>Phương thức:</strong> <span className="badge badge-cod">Thanh toán COD</span></p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Tổng thanh toán khi nhận hàng:</span>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-sale)' }}>
                      {formatPrice(orderTotal)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
