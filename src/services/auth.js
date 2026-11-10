import { request } from './api';

const CUSTOMER_KEY = 'comichub_customer';
const SELLER_KEY = 'comichub_seller';

// 1. Đăng nhập Khách hàng
export async function customerLogin(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.success && data.user) {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(data.user));
  }
  return data;
}

// 2. Đăng ký Khách hàng
export async function customerRegister(userData) {
  return await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

// 3. Đăng nhập Kênh Người Bán (Shopee Seller Portal)
export async function sellerLogin(email, password) {
  const data = await request('/auth/seller/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.success && data.user) {
    localStorage.setItem(SELLER_KEY, JSON.stringify(data.user));
  }
  return data;
}

// 4. Lấy dữ liệu phiên đã lưu
export function getStoredCustomer() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function getStoredSeller() {
  try {
    return JSON.parse(localStorage.getItem(SELLER_KEY) || 'null');
  } catch {
    return null;
  }
}

// 5. Đăng xuất
export function logoutCustomer() {
  localStorage.removeItem(CUSTOMER_KEY);
}

export function logoutSeller() {
  localStorage.removeItem(SELLER_KEY);
}
