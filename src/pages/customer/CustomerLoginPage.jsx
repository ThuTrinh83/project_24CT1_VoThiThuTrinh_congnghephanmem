import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FALLBACK_PRODUCTS } from '../../services/product';
import ProductCard from '../../components/customer/ProductCard';

export default function CustomerLoginPage({ onLoginSuccess, onNavigateSellerLogin, onSelectProduct, initialTab = 'login' }) {
  const { loginCustomer, registerCustomer } = useAuth();

  // Tab chuyển đổi trực tiếp trên cùng 1 khung: 'login' | 'register'
  const [activeTab, setActiveTab] = useState(initialTab);

  // Form Đăng nhập
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form Đăng ký
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // Gợi ý cho bạn (4 cuốn Manga Hot nhất)
  const suggestionProducts = FALLBACK_PRODUCTS.slice(0, 5);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await loginCustomer(loginEmail, loginPassword);
    setLoading(false);
    if (res?.success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await registerCustomer({
      name: regName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
    });
    setLoading(false);
    if (res?.success) {
      setActiveTab('login');
      setLoginEmail(regEmail);
    }
  };

  return (
    <div className="page-transition" style={{ padding: '24px 16px 48px' }}>
      {/* KHUNG ĐĂNG NHẬP / ĐĂNG KÝ CHUẨN FAHASA */}
      <div className="fahasa-auth-container">
        {/* 2 Tab chuyển đổi trực tiếp trên cùng 1 khung */}
        <div className="fahasa-auth-tabs">
          <div
            className={`fahasa-auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Đăng nhập
          </div>
          <div
            className={`fahasa-auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Đăng ký
          </div>
        </div>

        <div className="fahasa-auth-body">
          {activeTab === 'login' ? (
            /* TAB ĐĂNG NHẬP */
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '13px' }}>
                  Số điện thoại / Email (*)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập số điện thoại hoặc email..."
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '13px' }}>
                  Mật khẩu (*)
                </label>
                <div className="fahasa-password-group">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Nhập mật khẩu..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <span
                    className="fahasa-toggle-pwd-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? 'Ẩn' : 'Hiện'}
                  </span>
                </div>
              </div>

              {/* Link Quên mật khẩu căn phải */}
              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <button
                  type="button"
                  style={{ fontSize: '13px', color: '#0284c7', fontWeight: 600 }}
                  onClick={() => alert('Vui lòng liên hệ Hotline 1900 6656 để đặt lại mật khẩu.')}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Nút Đăng nhập bo tròn */}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', borderRadius: '24px', fontWeight: 700 }}
                disabled={loading}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
          ) : (
            /* TAB ĐĂNG KÝ */
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '13px' }}>
                  Họ và tên (*)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '13px' }}>
                  Email (*)
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="email@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '13px' }}>
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="0912345678"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontSize: '13px' }}>
                  Mật khẩu (*)
                </label>
                <div className="fahasa-password-group">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Ít nhất 6 ký tự..."
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <span
                    className="fahasa-toggle-pwd-btn"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                  >
                    {showRegPassword ? 'Ẩn' : 'Hiện'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', borderRadius: '24px', fontWeight: 700 }}
                disabled={loading}
              >
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
              </button>
            </form>
          )}

          {/* Lối vào Kênh Người Bán */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>Bạn là Người bán / Đối tác? </span>
            <button
              style={{ fontSize: '12.5px', color: '#0284c7', fontWeight: 700 }}
              onClick={onNavigateSellerLogin}
            >
              Đến Kênh Người Bán →
            </button>
          </div>
        </div>
      </div>

      {/* KHUNG "✨ GỢI Ý CHO BẠN ✨" NGAY BÊN DƯỚI KHUNG ĐĂNG NHẬP */}
      <section className="fahasa-auth-suggestions">
        <h3 className="fahasa-suggestion-title">
          ✨ Gợi ý cho bạn ✨
        </h3>
        <div className="fahasa-grid-5">
          {suggestionProducts.map((book) => (
            <ProductCard
              key={book.id}
              product={book}
              onSelect={onSelectProduct}
              isFlashSale={true}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
