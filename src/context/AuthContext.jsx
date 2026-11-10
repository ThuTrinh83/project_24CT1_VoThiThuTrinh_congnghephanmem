import { createContext, useContext, useState, useEffect } from 'react';
import {
  customerLogin as apiCustomerLogin,
  customerRegister as apiCustomerRegister,
  sellerLogin as apiSellerLogin,
  getStoredCustomer,
  getStoredSeller,
  logoutCustomer as apiLogoutCustomer,
  logoutSeller as apiLogoutSeller,
} from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [seller, setSeller] = useState(null);
  const [toast, setToast] = useState(null);

  // Khôi phục session từ localStorage khi khởi động
  useEffect(() => {
    const savedCustomer = getStoredCustomer();
    if (savedCustomer) setCustomer(savedCustomer);

    const savedSeller = getStoredSeller();
    if (savedSeller) setSeller(savedSeller);
  }, []);

  // Helper hiển thị Toast Notification trượt góc màn hình
  const showToast = (message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Đăng nhập Khách hàng
  const loginCustomer = async (email, password) => {
    try {
      const data = await apiCustomerLogin(email, password);
      if (data.success) {
        setCustomer(data.user);
        showToast(`Đăng nhập thành công! Xin chào ${data.user.name}`, 'success');
        return { success: true };
      }
    } catch (error) {
      showToast(error.message || 'Đăng nhập thất bại!', 'error');
      return { success: false, message: error.message };
    }
  };

  // Đăng ký Khách hàng
  const registerCustomer = async (userData) => {
    try {
      const data = await apiCustomerRegister(userData);
      if (data.success) {
        showToast('Đăng ký tài khoản thành công! Vui lòng đăng nhập.', 'success');
        return { success: true };
      }
    } catch (error) {
      showToast(error.message || 'Đăng ký thất bại!', 'error');
      return { success: false, message: error.message };
    }
  };

  // Đăng xuất Khách hàng
  const logoutCustomer = () => {
    apiLogoutCustomer();
    setCustomer(null);
    showToast('Đã đăng xuất tài khoản Khách hàng.', 'info');
  };

  // Đăng nhập Kênh Người Bán
  const loginSeller = async (email, password) => {
    try {
      const data = await apiSellerLogin(email, password);
      if (data.success) {
        setSeller(data.user);
        showToast(`Chào mừng ${data.user.name} đến với Kênh Người Bán!`, 'success');
        return { success: true };
      }
    } catch (error) {
      showToast(error.message || 'Đăng nhập Người bán thất bại!', 'error');
      return { success: false, message: error.message };
    }
  };

  // Đăng xuất Kênh Người Bán
  const logoutSeller = () => {
    apiLogoutSeller();
    setSeller(null);
    showToast('Đã đăng xuất khỏi Kênh Người Bán.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        seller,
        isCustomerLoggedIn: !!customer,
        isSellerLoggedIn: !!seller,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        loginSeller,
        logoutSeller,
        toast,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
