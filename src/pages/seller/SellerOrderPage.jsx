import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllOrders, updateOrderStatus } from '../../services/seller-dashboard';
import { formatPrice, getImageUrl } from '../../services/utils';

export default function SellerOrderPage() {
  const { showToast } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const tabs = ['Tất cả', 'Chờ xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'];

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders(statusFilter);
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Lỗi tải đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  // Duyệt và cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast(`Đã chuyển đơn hàng sang trạng thái: "${newStatus}"!`, 'success');
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        await loadOrders();
      }
    } catch (err) {
      showToast(err.message || 'Lỗi cập nhật trạng thái đơn hàng!', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Chờ xác nhận':
        return <span className="badge badge-pending">⏳ Chờ xác nhận</span>;
      case 'Đang giao':
        return <span className="badge badge-shipping">🚚 Đang giao hàng</span>;
      case 'Đã giao':
        return <span className="badge badge-completed">✓ Đã giao</span>;
      case 'Đã hủy':
        return <span className="badge badge-cancelled">✕ Đã hủy</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="page-transition">
      <div className="seller-card">
        <div className="seller-card-header">
          <div>
            <h2 className="seller-card-title">📦 Quản Lý & Duyệt Đơn Hàng (Shopee Seller Centre)</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Theo dõi đơn hàng COD, đóng gói và xác nhận chuyển giao cho đơn vị vận chuyển
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={loadOrders}>
            🔄 Làm mới danh sách
          </button>
        </div>

        {/* Tab lọc trạng thái */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', overflowX: 'auto' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm ${statusFilter === tab ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Bảng danh sách đơn hàng */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>Đang nạp dữ liệu đơn hàng...</div>
        ) : (
          <div className="table-responsive">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Mã Đơn Hàng</th>
                  <th>Khách Hàng</th>
                  <th>Số Điện Thoại</th>
                  <th>Ngày Đặt</th>
                  <th>Tổng Tiền COD</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'center' }}>Thao Tác Duyệt Đơn</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      Không có đơn hàng nào trong mục này.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <strong style={{ color: 'var(--primary-color)' }}>{ord.orderCode}</strong>
                      </td>
                      <td>
                        <strong>{ord.customer_name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ord.address}
                        </div>
                      </td>
                      <td>{ord.phone}</td>
                      <td>{ord.date}</td>
                      <td>
                        <strong style={{ color: 'var(--accent-sale)' }}>{formatPrice(ord.total)}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--accent-green)' }}>COD tiền mặt</div>
                      </td>
                      <td>{getStatusBadge(ord.status)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedOrder(ord)}
                            title="Xem chi tiết"
                          >
                            👁️ Xem
                          </button>

                          {/* Nút chuyển trạng thái nhanh */}
                          {ord.status === 'Chờ xác nhận' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleUpdateStatus(ord.id, 'Đang giao')}
                            >
                              🚚 Giao hàng
                            </button>
                          )}

                          {ord.status === 'Đang giao' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleUpdateStatus(ord.id, 'Đã giao')}
                            >
                              ✓ Hoàn tất
                            </button>
                          )}

                          {ord.status !== 'Đã giao' && ord.status !== 'Đã hủy' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                if (window.confirm(`Bạn có chắc muốn hủy đơn hàng ${ord.orderCode}?`)) {
                                  handleUpdateStatus(ord.id, 'Đã hủy');
                                }
                              }}
                            >
                              ✕ Hủy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL XEM CHI TIẾT ĐƠN HÀNG */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                Chi Tiết Đơn Hàng {selectedOrder.orderCode}
              </h3>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Thời gian đặt:</span>
                  <div style={{ fontWeight: 600 }}>{selectedOrder.date}</div>
                </div>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Trạng thái:</span>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>

              {/* Thông tin khách nhận */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13.5px' }}>
                <p><strong>Người nhận:</strong> {selectedOrder.customer_name}</p>
                <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
                <p><strong>Địa chỉ giao:</strong> {selectedOrder.address}</p>
                <p><strong>Ghi chú:</strong> {selectedOrder.note || 'Không có ghi chú'}</p>
              </div>

              {/* Danh sách sách trong đơn */}
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Sách trong đơn:</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      style={{ width: '40px', height: '52px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {formatPrice(item.price)} x {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>
                      {formatPrice(Number(item.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--border-color)', paddingTop: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700 }}>Tổng tiền thu COD:</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-sale)' }}>
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              {selectedOrder.status === 'Chờ xác nhận' && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'Đang giao')}
                >
                  🚚 Xác Nhận & Giao Hàng
                </button>
              )}
              {selectedOrder.status === 'Đang giao' && (
                <button
                  className="btn btn-success"
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'Đã giao')}
                >
                  ✓ Xác Nhận Đã Giao Thành Công
                </button>
              )}
              <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
