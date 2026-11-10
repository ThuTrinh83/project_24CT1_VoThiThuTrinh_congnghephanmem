/**
 * API Client tập trung cho toàn bộ ứng dụng
 */

const BASE_URL = 'http://localhost:3000/api';

export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Lấy thông tin user hiện tại từ localStorage để gửi role header
  const customer = JSON.parse(localStorage.getItem('comichub_customer') || 'null');
  const seller = JSON.parse(localStorage.getItem('comichub_seller') || 'null');
  
  const headers = {
    ...options.headers,
  };

  // Nếu gửi FormData (upload file), không set Content-Type để browser tự sinh boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Tự động đính kèm role và userId tương ứng
  if (endpoint.includes('/seller') || endpoint.includes('/dashboard')) {
    if (seller) {
      headers['x-user-role'] = seller.role;
      headers['x-user-id'] = seller.id;
    }
  } else if (customer) {
    headers['x-user-role'] = customer.role;
    headers['x-user-id'] = customer.id;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      throw new Error(data.message || `Lỗi yêu cầu: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error(`Lỗi API [${endpoint}]:`, error);
    throw error;
  }
}

export default {
  BASE_URL,
  request,
};
