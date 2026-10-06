import { useState, useEffect } from 'react'
import './App.css'

// Định dạng giá tiền sang tiền Việt
function formatPrice(price) {
  if (price === undefined || price === null) return '0đ';
  return price.toLocaleString('vi-VN') + 'đ'
}

// Component chính của ứng dụng ComicHub
function App() {
  // ===== KHAI BÁO TẤT CẢ STATE TRƯỚC =====

  // Dữ liệu từ Backend
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['Tất cả'])

  // Trạng thái chuyển trang và sản phẩm đang được chọn
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Trạng thái tìm kiếm và lọc sản phẩm
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [searchText, setSearchText] = useState('')

  // Trạng thái giỏ hàng và số lượng sản phẩm
  const [cart, setCart] = useState([])
  const [quantity, setQuantity] = useState(1)

  // Trạng thái đơn hàng
  const [orders, setOrders] = useState([])

  // Trạng thái đăng nhập và tài khoản người dùng
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // ===== useEffect SAU KHI CÓ ĐỦ STATE =====

  // Lấy danh mục và sản phẩm lúc tải trang
  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(['Tất cả', ...data.categories.map(c => c.name)])
        }
      })
      .catch(err => console.error('Lỗi lấy danh mục:', err))

    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.products)
        }
      })
      .catch(err => console.error('Lỗi lấy sản phẩm:', err))
  }, [])

  // Khôi phục session từ localStorage khi tải trang
  useEffect(() => {
    const saved = localStorage.getItem('comichub_user')
    if (saved) {
      try {
        const user = JSON.parse(saved)
        setCurrentUser(user)
        setIsLoggedIn(true)
      } catch (_) {
        localStorage.removeItem('comichub_user')
      }
    }
  }, [])

  // Đồng bộ giỏ hàng, đơn hàng, chat khi đăng nhập/đăng xuất
  useEffect(() => {
    if (currentUser) {
      fetch(`http://localhost:5000/api/cart/${currentUser.id}`)
        .then(res => res.json())
        .then(data => { if (data.success) setCart(data.cart) })
        .catch(console.error)

      fetch(`http://localhost:5000/api/orders/${currentUser.id}`)
        .then(res => res.json())
        .then(data => { if (data.success) setOrders(data.orders) })
        .catch(console.error)

      fetch(`http://localhost:5000/api/messages/${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Map về định dạng {id, sender, text}
            setChatMessages(data.messages.map(m => ({
              id: m.id,
              sender: m.sender_id === currentUser.id ? 'customer' : 'shop',
              text: m.content,
            })))
          }
        })
        .catch(console.error)
    } else {
      setCart([])
      setOrders([])
      setChatMessages([])
    }
  }, [currentUser])

  // Dữ liệu nhập trong form đăng nhập
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  // Dữ liệu nhập trong form đăng ký
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  // Trạng thái đang xử lý đăng nhập hoặc đăng ký
  const [authLoading, setAuthLoading] = useState(false)

  // Thông báo nhỏ hiển thị trên giao diện
  const [message, setMessage] = useState('')

  // Chat — lấy từ DB, không hard-code
  const [chatMessages, setChatMessages] = useState([])
  const [chatText, setChatText] = useState('')

  // Shop ID cố định (user role='shop' trong DB)
  const SHOP_USER_ID = 2

  // Hiển thị thông báo nhanh trên giao diện
  function showToast(text) {
    setMessage(text)

    setTimeout(() => {
      setMessage('')
    }, 2500)
  }

  // Xử lý đăng nhập tài khoản
  async function handleLogin(event) {
    event.preventDefault()

    if (!loginEmail || !loginPassword) {
      showToast('Vui lòng nhập email và mật khẩu!')
      return
    }

    try {
      setAuthLoading(true)

      // Gửi thông tin đăng nhập lên Backend
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        showToast(data.message || 'Email hoặc mật khẩu không đúng!')
        return
      }

      setCurrentUser(data.user)
      setIsLoggedIn(true)
      setShowLogin(false)
      setLoginEmail('')
      setLoginPassword('')
      localStorage.setItem('comichub_user', JSON.stringify(data.user))
      showToast(`Đăng nhập thành công! Xin chào ${data.user.name}!`)
    } catch (error) {
      console.error('Login error:', error)
      showToast('Không kết nối được đến Backend!')
    } finally {
      setAuthLoading(false)
    }
  }

  // Xử lý đăng ký tài khoản mới
  async function handleRegister(event) {
    event.preventDefault()

    if (!registerName || !registerEmail || !registerPassword) {
      showToast('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    try {
      setAuthLoading(true)

      // Gửi thông tin đăng ký lên Backend để lưu vào SQL Server
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        showToast(data.message || 'Đăng ký thất bại!')
        return
      }

      setRegisterName('')
      setRegisterEmail('')
      setRegisterPassword('')
      setShowRegister(false)
      setShowLogin(true)
      showToast('Đăng ký thành công! Hãy đăng nhập.')
    } catch (error) {
      console.error('Register error:', error)
      showToast('Không kết nối được đến Backend!')
    } finally {
      setAuthLoading(false)
    }
  }

  // Chuyển đổi giữa các trang trong website
  function goToPage(page) {
    setCurrentPage(page)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // Mở trang chi tiết của sản phẩm
  function openProduct(product) {
    setSelectedProduct(product)
    setQuantity(1)
    setCurrentPage('detail')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // Thêm sản phẩm vào giỏ hàng
  function addToCart(product, amount = 1) {
    if (currentUser) {
      fetch(`http://localhost:5000/api/cart/${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, amount })
      }).catch(console.error);
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id,
      )

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + amount,
                  product.stock,
                ),
              }
            : item,
        )
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: Math.min(amount, product.stock),
        },
      ]
    })

    showToast('Đã thêm truyện vào giỏ hàng!')
  }

  // Tăng số lượng sản phẩm trong giỏ hàng
  function increaseCartItem(id) {
    const item = cart.find(i => i.id === id);
    if (item && currentUser) {
      fetch(`http://localhost:5000/api/cart/${currentUser.id}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: Math.min(item.quantity + 1, item.stock) })
      }).catch(console.error);
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(
                item.quantity + 1,
                item.stock,
              ),
            }
          : item,
      ),
    )
  }

  // Giảm số lượng sản phẩm trong giỏ hàng
  function decreaseCartItem(id) {
    const item = cart.find(i => i.id === id);
    if (item && currentUser) {
      if (item.quantity - 1 <= 0) {
        fetch(`http://localhost:5000/api/cart/${currentUser.id}/${id}`, { method: 'DELETE' }).catch(console.error);
      } else {
        fetch(`http://localhost:5000/api/cart/${currentUser.id}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: item.quantity - 1 })
        }).catch(console.error);
      }
    }

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  // Xóa sản phẩm khỏi giỏ hàng
  function removeFromCart(id) {
    if (currentUser) {
      fetch(`http://localhost:5000/api/cart/${currentUser.id}/${id}`, { method: 'DELETE' }).catch(console.error);
    }

    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id),
    )

    showToast('Đã xóa sản phẩm khỏi giỏ hàng!')
  }

  // Tạo đơn hàng từ giỏ hàng
  async function createOrder(event) {
    event.preventDefault()

    if (cart.length === 0) {
      showToast('Giỏ hàng đang trống!')
      return
    }

    if (!currentUser) {
      showToast('Vui lòng đăng nhập để đặt hàng!')
      setShowLogin(true)
      return
    }

    const formData = new FormData(event.target);
    const customerName = formData.get('customerName');
    const phone = formData.get('phone');
    const address = formData.get('address');
    const note = formData.get('note');

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          customerName,
          phone,
          address,
          note,
          items: cart,
          total: cartTotal
        })
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('Đặt hàng thành công!');
        setCart([]);
        
        // Cập nhật lại danh sách đơn hàng
        fetch(`http://localhost:5000/api/orders/${currentUser.id}`)
          .then(res => res.json())
          .then(ordersData => {
            if (ordersData.success) {
              setOrders(ordersData.orders);
            }
          });
          
        goToPage('orders');
      } else {
        showToast('Lỗi đặt hàng!');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối Backend!');
    }
  }

  // Gửi tin nhắn tư vấn cho Shop
  async function sendMessage() {
    const text = chatText.trim()
    if (!text) return

    if (!currentUser) {
      showToast('Vui lòng đăng nhập để chat!')
      setShowLogin(true)
      return
    }

    // Lưu tin nhắn local ngay lập tức
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'customer', text }])
    setChatText('')

    // Gửi lên DB
    try {
      await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: SHOP_USER_ID,
          content: text
        })
      })
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err)
    }
  }

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  // Tính tổng tiền các sản phẩm trong giỏ hàng
  const cartTotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0,
  )

  // Lọc sản phẩm theo từ khóa tìm kiếm và thể loại
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchText.toLowerCase())

    const matchesCategory =
      selectedCategory === 'Tất cả' ||
      product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Component hiển thị một sản phẩm truyện tranh
  function ProductCard({ product }) {
    return (
      <div className="product-card">
        <div
          className="product-image"
          onClick={() => openProduct(product)}
        >
          <img
            src={product.image}
            alt={`Bìa ${product.name}`}
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />

          <span className="discount">
            -{product.discount}%
          </span>
        </div>

        <div className="product-info">
          <span className="product-category">
            {product.category}
          </span>

          <h3 onClick={() => openProduct(product)}>
            {product.name}
          </h3>

          <p className="author">
            {product.author}
          </p>

          <div className="rating">
            ⭐ {product.rating}
          </div>

          <div className="product-bottom">
            <div>
              <span className="price">
                {formatPrice(product.price)}
              </span>

              <span className="old-price">
                {formatPrice(product.oldPrice)}
              </span>
            </div>

            <button
              type="button"
              className="add-button"
              onClick={() => addToCart(product)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Thanh đầu trang và menu điều hướng
  function Header() {
    return (
      <header className="header">
        <div className="header-inner">
          <div
            className="logo"
            onClick={() => goToPage('home')}
          >
            <span className="logo-icon">📚</span>
            <span>ComicHub</span>
          </div>

          <nav className="nav">
            <button
              type="button"
              onClick={() => goToPage('home')}
            >
              Trang chủ
            </button>

            <button
              type="button"
              onClick={() => goToPage('shop')}
            >
              Cửa hàng
            </button>

            <button
              type="button"
              onClick={() => goToPage('category')}
            >
              Thể loại
            </button>

            <button
              type="button"
              onClick={() => goToPage('sale')}
            >
              Khuyến mãi
            </button>

            <button
              type="button"
              onClick={() => goToPage('chat')}
            >
              💬 Tư vấn
            </button>
          </nav>

          <div className="header-actions">
            <div className="search-box">
              <span>🔍</span>

              <input
                type="text"
                placeholder="Tìm truyện..."
                value={searchText}
                onChange={(event) => {
                  setSearchText(event.target.value)
                  setCurrentPage('shop')
                }}
              />
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={() => goToPage('cart')}
            >
              🛒

              {cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className="icon-button"
              onClick={() => {
                if (isLoggedIn) {
                  goToPage('account')
                } else {
                  setShowLogin(true)
                }
              }}
            >
              👤
            </button>
          </div>
        </div>
      </header>
    )
  }

  // Trang chủ ComicHub
  function HomePage() {
    return (
      <>
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-label">
              📖 THẾ GIỚI TRUYỆN TRANH
            </span>

            <h1>
              Từ trang giấy 
              <br />
              những thế giới thành hình
            </h1>

            <p>
              Có một thế giới đang chờ bạn, chỉ cách một lần lật trang.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => goToPage('shop')}
            >
              Khám phá ngay
            </button>
          </div>

          <div className="hero-art">
            <div className="hero-book">📚</div>
            <div className="hero-star">✦</div>
            <div className="hero-star second">✦</div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <span className="section-label">
                ĐƯỢC YÊU THÍCH
              </span>

              <h2>Truyện nổi bật</h2>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() => goToPage('shop')}
            >
              Xem tất cả →
            </button>
          </div>

          <div className="product-grid">
            {products.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </section>

        <Benefits />
      </>
    )
  }

  // Trang cửa hàng và danh sách sản phẩm
  function ShopPage() {
    return (
      <section className="section page-section">
        <div className="shop-heading">
          <div>
            <span className="section-label">
              COMICHUB STORE
            </span>

            <h1>Cửa hàng truyện tranh</h1>

            <p>
              Tìm kiếm và khám phá những bộ truyện
              yêu thích của bạn.
            </p>
          </div>
        </div>

        <div className="category-filter">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={
                selectedCategory === category
                  ? 'selected'
                  : ''
              }
              onClick={() =>
                setSelectedCategory(category)
              }
            >
              {category}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))
          ) : (
            <div className="empty-state">
              <div>🔍</div>
              <h3>Không tìm thấy truyện</h3>
              <p>
                Thử tìm kiếm với từ khóa khác nhé.
              </p>
            </div>
          )}
        </div>
      </section>
    )
  }

  // Trang chi tiết sản phẩm
  function DetailPage() {
    if (!selectedProduct) {
      return null
    }

    return (
      <section className="section page-section">
        <button
          type="button"
          className="back-button"
          onClick={() => goToPage('shop')}
        >
          ← Quay lại cửa hàng
        </button>

        <div className="detail-content">
          <div className="detail-image">
            <img
              src={selectedProduct.image}
              alt={`Bìa ${selectedProduct.name}`}
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          </div>

          <div className="detail-info">
            <span className="product-category">
              {selectedProduct.category}
            </span>

            <h1>{selectedProduct.name}</h1>

            <p className="detail-author">
              Tác giả: {selectedProduct.author}
            </p>

            <div className="detail-rating">
              ⭐ {selectedProduct.rating} / 5
            </div>

            <p className="detail-description">
              {selectedProduct.description}
            </p>

            <div className="detail-price">
              <span>
                {formatPrice(selectedProduct.price)}
              </span>

              <del>
                {formatPrice(
                  selectedProduct.oldPrice,
                )}
              </del>
            </div>

            <p className="stock">
              Còn {selectedProduct.stock} sản phẩm
            </p>

            <div className="quantity-box">
              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    Math.max(1, quantity - 1),
                  )
                }
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    Math.min(
                      selectedProduct.stock,
                      quantity + 1,
                    ),
                  )
                }
              >
                +
              </button>
            </div>

            <div className="detail-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  addToCart(
                    selectedProduct,
                    quantity,
                  )
                }
              >
                🛒 Thêm vào giỏ
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  addToCart(
                    selectedProduct,
                    quantity,
                  )
                  goToPage('cart')
                }}
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Trang giỏ hàng
  function CartPage() {
    return (
      <section className="section page-section">
        <div className="page-title">
          <span className="section-label">
            COMICHUB
          </span>

          <h1>Giỏ hàng</h1>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state large">
            <div>🛒</div>

            <h2>Giỏ hàng đang trống</h2>

            <p>
              Hãy chọn một vài bộ truyện mà bạn yêu
              thích nhé.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => goToPage('shop')}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-list">
              {cart.map((item) => (
                <div
                  className="cart-item"
                  key={item.id}
                >
                  <div className="cart-item-image">
                    <img
                      src={item.image}
                      alt={`Bìa ${item.name}`}
                      onError={(event) => {
                        event.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>{item.author}</p>

                    <span className="cart-price">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  <div className="cart-quantity">
                    <button
                      type="button"
                      onClick={() =>
                        decreaseCartItem(item.id)
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        increaseCartItem(item.id)
                      }
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-subtotal">
                    {formatPrice(
                      item.price * item.quantity,
                    )}
                  </div>

                  <button
                    type="button"
                    className="remove-button"
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Tóm tắt đơn hàng</h2>

              <div className="summary-row">
                <span>Tạm tính</span>

                <span>
                  {formatPrice(cartTotal)}
                </span>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển</span>

                <span>30.000đ</span>
              </div>

              <div className="summary-total">
                <span>Tổng cộng</span>

                <strong>
                  {formatPrice(cartTotal + 30000)}
                </strong>
              </div>

              <button
                type="button"
                className="primary-button full-button"
                onClick={() => {
                  if (!isLoggedIn) {
                    setShowLogin(true)
                    return
                  }

                  goToPage('checkout')
                }}
              >
                Tiến hành đặt hàng
              </button>
            </div>
          </div>
        )}
      </section>
    )
  }

  // Trang nhập thông tin đặt hàng
  function CheckoutPage() {
    return (
      <section className="section page-section">
        <div className="page-title">
          <span className="section-label">
            CHECKOUT
          </span>

          <h1>Thông tin đặt hàng</h1>
        </div>

        <form
          className="checkout-form"
          onSubmit={createOrder}
        >
          <div className="checkout-fields">
            <label>
              Họ và tên

              <input
                type="text"
                name="customerName"
                placeholder="Nguyễn Văn A"
                required
              />
            </label>

            <label>
              Số điện thoại

              <input
                type="tel"
                name="phone"
                placeholder="09xxxxxxxx"
                required
              />
            </label>

            <label>
              Địa chỉ nhận hàng

              <input
                type="text"
                name="address"
                placeholder="Nhập địa chỉ..."
                required
              />
            </label>

            <label>
              Ghi chú

              <textarea
                name="note"
                placeholder="Ghi chú cho shop..."
                rows="4"
              />
            </label>
          </div>

          <div className="checkout-summary">
            <h2>Đơn hàng</h2>

            {cart.map((item) => (
              <div
                className="checkout-item"
                key={item.id}
              >
                <span>
                  {item.name} × {item.quantity}
                </span>

                <span>
                  {formatPrice(
                    item.price * item.quantity,
                  )}
                </span>
              </div>
            ))}

            <div className="summary-total">
              <span>Tổng thanh toán</span>

              <strong>
                {formatPrice(cartTotal + 30000)}
              </strong>
            </div>

            <button
              type="submit"
              className="primary-button full-button"
            >
              Xác nhận đặt hàng
            </button>
          </div>
        </form>
      </section>
    )
  }

  // Trang lịch sử và trạng thái đơn hàng
  function OrdersPage() {
    return (
      <section className="section page-section">
        <div className="page-title">
          <span className="section-label">
            COMICHUB
          </span>

          <h1>Đơn hàng của tôi</h1>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state large">
            <div>📦</div>

            <h2>Chưa có đơn hàng</h2>

            <p>
              Các đơn hàng của bạn sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div
                className="order-card"
                key={order.id}
              >
                <div className="order-header">
                  <div>
                    <h3>#{order.id}</h3>
                    <p>{order.date}</p>
                  </div>

                  <span className="order-status">
                    {order.status}
                  </span>
                </div>

                <div className="order-products">
                  {order.items.map((item) => (
                    <div
                      className="order-product"
                      key={item.id}
                    >
                      <span className="order-product-name">
                        <img
                          src={item.image}
                          alt={`Bìa ${item.name}`}
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                      </span>

                      <span>
                        {formatPrice(
                          item.price *
                            item.quantity,
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-total">
                  Tổng tiền:{' '}
                  <strong>
                    {formatPrice(
                      order.total + 30000,
                    )}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    )
  }

  // Trang danh sách thể loại truyện
  function CategoryPage() {
    return (
      <section className="section page-section">
        <div className="page-title">
          <span className="section-label">
            KHÁM PHÁ
          </span>

          <h1>Thể loại truyện</h1>
        </div>

        <div className="category-grid">
          {categories
            .filter((category) => category !== 'Tất cả')
            .map((category) => (
              <button
                type="button"
                className="category-card"
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  goToPage('shop')
                }}
              >
                <span>
                  {category === 'Shounen'
                    ? '⚔️'
                    : category === 'Action'
                      ? '🔥'
                      : '✨'}
                </span>

                <h3>{category}</h3>

                <p>
                  Khám phá truyện {category}
                </p>
              </button>
            ))}
        </div>
      </section>
    )
  }

  // Trang truyện đang được khuyến mãi
  function SalePage() {
    return (
      <section className="section page-section">
        <div className="page-title">
          <span className="section-label">
            ƯU ĐÃI ĐẶC BIỆT
          </span>

          <h1>Truyện đang khuyến mãi</h1>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>
    )
  }

  // Trang tư vấn và chat với Shop
  function renderChatPage() {
    return (
      <section className="section page-section">
        <div className="page-title">
          <span className="section-label">
            HỖ TRỢ KHÁCH HÀNG
          </span>

          <h1>Chat với Shop</h1>

          <p>
            Bạn cần tư vấn truyện? Hãy nhắn cho shop nhé.
          </p>
        </div>

        <div className="chat-container">
          <div className="chat-header">
            <div className="shop-avatar">
              📚
            </div>

            <div>
              <h3>ComicHub Shop</h3>

              <span>
                🟢 Đang hoạt động
              </span>
            </div>
          </div>

          <div className="chat-messages">
            {chatMessages.map((item) => (
              <div
                key={item.id}
                className={
                  item.sender === 'customer'
                    ? 'message customer-message'
                    : 'message shop-message'
                }
              >
                {item.text}
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={chatText}
              onChange={(event) =>
                setChatText(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  sendMessage()
                }
              }}
            />

            <button
              type="button"
              className="primary-button"
              onClick={sendMessage}
            >
              Gửi
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Trang thông tin tài khoản người dùng
  function AccountPage() {
    return (
      <section className="section page-section">
        <div className="account-card">
          <div className="account-avatar">
            👤
          </div>

          <h1>{currentUser?.name || 'Tài khoản'}</h1>

          <p>{currentUser?.email || ''}</p>

          <div className="account-actions">
            <button
              type="button"
              onClick={() => goToPage('orders')}
            >
              📦 Lịch sử đơn hàng
            </button>

            <button
              type="button"
              onClick={() => goToPage('chat')}
            >
              💬 Chat với Shop
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(false)
                setCurrentUser(null)
                localStorage.removeItem('comichub_user')
                showToast('Đã đăng xuất!')
                goToPage('home')
              }}
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Cửa sổ đăng nhập tài khoản
  function renderLoginModal() {
    return (
      <div
        className="modal-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setShowLogin(false)
          }
        }}
      >
        <div
          className="login-modal"
          onMouseDown={(event) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            className="modal-close"
            onClick={() => setShowLogin(false)}
          >
            ×
          </button>

          <div className="modal-icon">
            📚
          </div>

          <h2>Đăng nhập</h2>

          <p className="modal-description">
            Đăng nhập để tiếp tục mua sắm tại ComicHub.
          </p>

          <form onSubmit={handleLogin}>
            <label>
              Email

              <input
                type="email"
                placeholder="Nhập email..."
                value={loginEmail}
                onChange={(event) =>
                  setLoginEmail(event.target.value)
                }
                required
              />
            </label>

            <label>
              Mật khẩu

              <input
                type="password"
                placeholder="Nhập mật khẩu..."
                value={loginPassword}
                onChange={(event) =>
                  setLoginPassword(event.target.value)
                }
                required
              />
            </label>

            <button
              type="submit"
              className="primary-button full-button"
              disabled={authLoading}
            >
              {authLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="modal-switch">
            Chưa có tài khoản?

            <button
              type="button"
              onClick={() => {
                setShowLogin(false)
                setShowRegister(true)
              }}
            >
              Đăng ký
            </button>
          </p>
        </div>
      </div>
    )
  }

  // Cửa sổ đăng ký tài khoản mới
  function renderRegisterModal() {
    return (
      <div
        className="modal-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setShowRegister(false)
          }
        }}
      >
        <div
          className="login-modal"
          onMouseDown={(event) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            className="modal-close"
            onClick={() =>
              setShowRegister(false)
            }
          >
            ×
          </button>

          <div className="modal-icon">
            ✨
          </div>

          <h2>Đăng ký</h2>

          <p className="modal-description">
            Tạo tài khoản mới để sử dụng ComicHub.
          </p>

          <form onSubmit={handleRegister}>
            <label>
              Họ và tên

              <input
                type="text"
                placeholder="Nhập họ tên..."
                value={registerName}
                onChange={(event) =>
                  setRegisterName(event.target.value)
                }
                required
              />
            </label>

            <label>
              Email

              <input
                type="email"
                placeholder="Nhập email..."
                value={registerEmail}
                onChange={(event) =>
                  setRegisterEmail(event.target.value)
                }
                required
              />
            </label>

            <label>
              Mật khẩu

              <input
                type="password"
                placeholder="Tạo mật khẩu..."
                value={registerPassword}
                onChange={(event) =>
                  setRegisterPassword(event.target.value)
                }
                minLength={6}
                required
              />
            </label>

            <button
              type="submit"
              className="primary-button full-button"
              disabled={authLoading}
            >
              {authLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <p className="modal-switch">
            Đã có tài khoản?

            <button
              type="button"
              onClick={() => {
                setShowRegister(false)
                setShowLogin(true)
              }}
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
    )
  }

  // Khu vực giới thiệu lợi ích của ComicHub
  function Benefits() {
    return (
      <section className="benefits-section">
        <div className="benefit">
          <span>🚚</span>

          <div>
            <h3>Giao hàng nhanh</h3>
            <p>Đóng gói cẩn thận</p>
          </div>
        </div>

        <div className="benefit">
          <span>🛡️</span>

          <div>
            <h3>Sản phẩm chính hãng</h3>
            <p>Cam kết chất lượng</p>
          </div>
        </div>

        <div className="benefit">
          <span>💬</span>

          <div>
            <h3>Tư vấn tận tình</h3>
            <p>Hỗ trợ qua chat</p>
          </div>
        </div>

        <div className="benefit">
          <span>💳</span>

          <div>
            <h3>Thanh toán an toàn</h3>
            <p>Nhiều phương thức</p>
          </div>
        </div>
      </section>
    )
  }

  // Chân trang website
  function Footer() {
    return (
      <footer className="footer">
        <div>
          <div className="logo footer-logo">
            <span className="logo-icon">📚</span>
            <span>ComicHub</span>
          </div>

          <p>
            Nơi kết nối bạn với những câu chuyện
            tuyệt vời.
          </p>
        </div>

        <div>
          <h3>ComicHub</h3>
          <p>Về chúng tôi</p>
          <p>Điều khoản</p>
          <p>Chính sách</p>
        </div>

        <div>
          <h3>Hỗ trợ</h3>
          <p>Trung tâm trợ giúp</p>
          <p>Liên hệ</p>
          <p>Chat với Shop</p>
        </div>
      </footer>
    )
  }

  // Xác định nội dung trang cần hiển thị
  function renderPage() {
    switch (currentPage) {
      case 'shop':
        return <ShopPage />

      case 'detail':
        return <DetailPage />

      case 'cart':
        return <CartPage />

      case 'checkout':
        return <CheckoutPage />

      case 'orders':
        return <OrdersPage />

      case 'category':
        return <CategoryPage />

      case 'sale':
        return <SalePage />

      case 'chat':
        return renderChatPage()

      case 'account':
        return <AccountPage />

      default:
        return <HomePage />
    }
  }

  // Giao diện tổng thể của website
  return (
    <div className="app">
      <Header />

      <main>{renderPage()}</main>

      <Footer />

      {message && (
        <div className="toast">
          {message}
        </div>
      )}

      {showLogin && renderLoginModal()}

      {showRegister && renderRegisterModal()}
    </div>
  )
}

export default App