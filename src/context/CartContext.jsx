import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart, updateQuantity, removeFromCart } from '../services/cart';
import { useAuth } from './AuthContext';
import { cleanNumericPrice } from '../services/utils';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { customer, showToast } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tải giỏ hàng khi user thay đổi
  useEffect(() => {
    if (customer && customer.id) {
      loadCart(customer.id);
    } else {
      setCart([]);
    }
  }, [customer]);

  const loadCart = async (userId) => {
    try {
      setLoading(true);
      const res = await getCart(userId);
      if (res.success && Array.isArray(res.cart)) {
        const cleaned = res.cart.map((item) => ({
          ...item,
          price: cleanNumericPrice(item.price || item.sale_price),
          quantity: Math.max(1, Number(item.quantity) || 1),
        }));
        setCart(cleaned);
      }
    } catch (err) {
      console.error('Lỗi tải giỏ hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  // Thêm sản phẩm vào giỏ
  const addItem = async (product, amount = 1) => {
    if (!customer) {
      showToast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', 'warning');
      return false;
    }

    const priceNum = cleanNumericPrice(product.price || product.sale_price);

    try {
      const res = await addToCart(customer.id, product.id, amount, {
        ...product,
        price: priceNum,
      });

      if (res.success) {
        await loadCart(customer.id);
        showToast(`Đã thêm "${product.name || product.title}" vào giỏ hàng!`, 'success');
        return true;
      }
    } catch (err) {
      // Dự phòng lưu local state nếu backend tạm thời chưa online
      setCart((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.id === product.id ? { ...i, quantity: (i.quantity || 1) + amount } : i
          );
        }
        return [
          ...prev,
          {
            ...product,
            price: priceNum,
            quantity: amount,
          },
        ];
      });
      showToast(`Đã thêm "${product.name || product.title}" vào giỏ hàng!`, 'success');
      return true;
    }
  };

  // Cập nhật số lượng
  const updateItemQty = async (productId, newQty) => {
    if (!customer || newQty < 1) return;
    try {
      await updateQuantity(customer.id, productId, newQty);
      await loadCart(customer.id);
    } catch {
      setCart((prev) =>
        prev.map((i) => (i.id === productId ? { ...i, quantity: newQty } : i))
      );
    }
  };

  // Xóa sản phẩm khỏi giỏ
  const removeItem = async (productId) => {
    if (!customer) return;
    try {
      await removeFromCart(customer.id, productId);
      await loadCart(customer.id);
      showToast('Đã xóa sản phẩm khỏi giỏ hàng.', 'info');
    } catch {
      setCart((prev) => prev.filter((i) => i.id !== productId));
      showToast('Đã xóa sản phẩm khỏi giỏ hàng.', 'info');
    }
  };

  // Xóa sạch giỏ sau khi đặt hàng thành công
  const clearCart = () => {
    setCart([]);
  };

  // Tổng số lượng và tổng tiền trong giỏ (luôn tính dựa trên cleanNumericPrice)
  const cartCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const cartTotal = cart.reduce((sum, item) => {
    const itemPrice = cleanNumericPrice(item.price || item.sale_price);
    const qty = Math.max(1, Number(item.quantity) || 1);
    return sum + (itemPrice * qty);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        loading,
        addItem,
        updateItemQty,
        removeItem,
        clearCart,
        reloadCart: () => customer && loadCart(customer.id),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
