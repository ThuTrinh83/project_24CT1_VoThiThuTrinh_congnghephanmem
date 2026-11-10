import { request } from './api';
import { cleanNumericPrice } from './utils';

// Lấy danh sách sản phẩm trong giỏ
export async function getCart(userId) {
  if (!userId) return { success: true, cart: [] };
  return await request(`/cart/${userId}`);
}

// Thêm sản phẩm vào giỏ (gửi đầy đủ id, amount, và thông tin chi tiết)
export async function addToCart(userId, productId, amount = 1, productData = {}) {
  const cleanPrice = cleanNumericPrice(productData.price || productData.sale_price);

  return await request(`/cart/${userId}`, {
    method: 'POST',
    body: JSON.stringify({
      productId,
      amount,
      price: cleanPrice,
      name: productData.name || productData.title || '',
      image: productData.image || productData.image_url || '',
      author: productData.author || '',
    }),
  });
}

// Cập nhật số lượng
export async function updateQuantity(userId, productId, quantity) {
  return await request(`/cart/${userId}/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

// Xóa sản phẩm khỏi giỏ
export async function removeFromCart(userId, productId) {
  return await request(`/cart/${userId}/${productId}`, {
    method: 'DELETE',
  });
}

// Tạo đơn hàng COD duy nhất
export async function createCODOrder(orderData) {
  return await request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

// Lấy lịch sử đơn hàng của khách
export async function getUserOrders(userId) {
  return await request(`/orders/user/${userId}`);
}
