import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { getProducts, getCategories } from './services/product';

// Components Dùng Chung
import ToastNotification from './components/common/ToastNotification';
import AuthGuard from './components/common/AuthGuard';

// Customer Components & Pages
import Header from './components/customer/Header';
import Footer from './components/customer/Footer';
import HomePage from './pages/customer/HomePage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import CustomerLoginPage from './pages/customer/CustomerLoginPage';
import CustomerRegisterPage from './pages/customer/CustomerRegisterPage';

// Seller Components & Pages
import SellerSidebar from './components/seller/SellerSidebar';
import SellerHeader from './components/seller/SellerHeader';
import SellerLoginPage from './pages/seller/SellerLoginPage';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import SellerProductPage from './pages/seller/SellerProductPage';
import SellerOrderPage from './pages/seller/SellerOrderPage';

function MainApp() {
  const { logoutSeller } = useAuth();

  // Navigation State: 'home' | 'detail' | 'cart' | 'checkout' | 'orders' | 'login' | 'register' | 'seller-login' | 'seller-dashboard'
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellerTab, setSellerTab] = useState('dashboard'); // 'dashboard' | 'products' | 'orders'

  // Global Products & Categories for Customer Views
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Tất cả']);
  const [searchFilter, setSearchFilter] = useState('');

  // Tải danh sách sách và danh mục
  useEffect(() => {
    loadStoreData();
  }, [searchFilter]);

  const loadStoreData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        getProducts('all', searchFilter),
        getCategories(),
      ]);

      if (prodRes.success && prodRes.products) setProducts(prodRes.products);
      if (catRes.success && catRes.categories) {
        setCategories(['Tất cả', ...catRes.categories.map((c) => c.name)]);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu cửa hàng:', err);
    }
  };

  const navigateTo = (page, product = null) => {
    if (product) setSelectedProduct(product);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // 1. LUỒNG KÊNH NGƯỜI BÁN (SELLER PORTAL)
  // ==========================================
  if (currentPage === 'seller-login') {
    return (
      <>
        <ToastNotification />
        <SellerLoginPage
          onLoginSuccess={() => navigateTo('seller-dashboard')}
          onNavigateStore={() => navigateTo('home')}
        />
      </>
    );
  }

  if (currentPage === 'seller-dashboard') {
    return (
      <AuthGuard roleRequired="seller" onNavigate={navigateTo}>
        <ToastNotification />
        <div className="seller-layout">
          <SellerSidebar
            activeTab={sellerTab}
            onTabChange={setSellerTab}
            onNavigateStore={() => navigateTo('home')}
          />
          <div className="seller-main">
            <SellerHeader
              title={
                sellerTab === 'dashboard'
                  ? '📊 Bảng Điều Khiển Tổng Quan'
                  : sellerTab === 'products'
                  ? '📚 Quản Lý Tựa Sách & Tồn Kho'
                  : '📦 Quản Lý & Duyệt Đơn Hàng'
              }
              subtitle="Hệ thống Shopee Kênh Người Bán - ComicHub Bookstore"
              onLogout={() => {
                logoutSeller();
                navigateTo('seller-login');
              }}
            />
            <div className="seller-content-body">
              {sellerTab === 'dashboard' && (
                <SellerDashboardPage onNavigateTab={setSellerTab} />
              )}
              {sellerTab === 'products' && <SellerProductPage />}
              {sellerTab === 'orders' && <SellerOrderPage />}
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // ==========================================
  // 2. LUỒNG KHÁCH HÀNG (CUSTOMER PORTAL)
  // ==========================================
  const renderCustomerContent = () => {
    switch (currentPage) {
      case 'detail':
        return (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => navigateTo('home')}
            onNavigateCheckout={() => navigateTo('checkout')}
          />
        );

      case 'cart':
        return (
          <CartPage
            onNavigateCheckout={() => navigateTo('checkout')}
            onContinueShopping={() => navigateTo('home')}
          />
        );

      case 'checkout':
        return (
          <CheckoutPage
            onOrderSuccess={(_orderId) => {
              loadStoreData();
              navigateTo('orders');
            }}
            onBackToCart={() => navigateTo('cart')}
          />
        );

      case 'orders':
        return (
          <AuthGuard roleRequired="customer" onNavigate={navigateTo}>
            <OrderHistoryPage onContinueShopping={() => navigateTo('home')} />
          </AuthGuard>
        );

      case 'login':
        return (
          <CustomerLoginPage
            onNavigateRegister={() => navigateTo('register')}
            onLoginSuccess={() => navigateTo('home')}
            onNavigateSellerLogin={() => navigateTo('seller-login')}
            onSelectProduct={(prod) => navigateTo('detail', prod)}
          />
        );

      case 'register':
        return (
          <CustomerRegisterPage
            onNavigateLogin={() => navigateTo('login')}
            onNavigateSellerLogin={() => navigateTo('seller-login')}
            onSelectProduct={(prod) => navigateTo('detail', prod)}
          />
        );

      default:
        return (
          <HomePage
            products={products}
            categories={categories}
            onSelectProduct={(prod) => navigateTo('detail', prod)}
          />
        );
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ToastNotification />

      <Header
        onNavigate={navigateTo}
        onSearch={(term) => setSearchFilter(term)}
        allProducts={products}
        onSelectProduct={(prod) => navigateTo('detail', prod)}
      />

      <main style={{ flex: 1 }}>{renderCustomerContent()}</main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}