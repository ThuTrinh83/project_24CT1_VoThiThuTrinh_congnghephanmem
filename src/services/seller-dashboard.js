import { request } from './api';

// Lấy thống kê Dashboard Người bán
export async function getDashboardStats() {
  return await request('/dashboard/stats');
}

// Lấy tất cả đơn hàng cho Người bán (hỗ trợ lọc trạng thái)
export async function getAllOrders(status = 'Tất cả') {
  const query = status && status !== 'Tất cả' ? `?status=${encodeURIComponent(status)}` : '';
  return await request(`/orders/seller/all${query}`);
}

// Cập nhật trạng thái duyệt đơn (Chờ xác nhận -> Đang giao -> Đã giao / Đã hủy)
export async function updateOrderStatus(orderId, status) {
  return await request(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}
