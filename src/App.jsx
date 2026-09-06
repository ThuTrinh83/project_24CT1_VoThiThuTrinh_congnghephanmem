import { useState } from 'react'
import './App.css'

const products = [
  {
    id: 1,
    name: 'One Piece - Tập 108',
    author: 'Eiichiro Oda',
    category: 'Shounen',
    price: 25000,
    oldPrice: 30000,
    discount: 17,
    rating: 4.9,
    stock: 25,
    image: '🏴‍☠️',
    description:
      'Hành trình của Luffy và băng Mũ Rơm tiếp tục với những cuộc phiêu lưu đầy hấp dẫn.',
  },
  {
    id: 2,
    name: 'Naruto - Tập 72',
    author: 'Masashi Kishimoto',
    category: 'Shounen',
    price: 22000,
    oldPrice: 28000,
    discount: 21,
    rating: 4.8,
    stock: 18,
    image: '🍥',
    description:
      'Tập cuối của hành trình Naruto, nơi những trận chiến quan trọng đi đến hồi kết.',
  },
  {
    id: 3,
    name: 'Demon Slayer - Tập 23',
    author: 'Koyoharu Gotouge',
    category: 'Action',
    price: 30000,
    oldPrice: 35000,
    discount: 14,
    rating: 4.9,
    stock: 30,
    image: '⚔️',
    description:
      'Tanjiro và những người đồng đội bước vào trận chiến quyết định cuối cùng.',
  },
  {
    id: 4,
    name: 'Solo Leveling - Tập 8',
    author: 'Chu-Gong',
    category: 'Fantasy',
    price: 45000,
    oldPrice: 50000,
    discount: 10,
    rating: 4.9,
    stock: 15,
    image: '🖤',
    description:
      'Sung Jin-Woo tiếp tục hành trình trở thành thợ săn mạnh nhất.',
  },
  {
    id: 5,
    name: 'Attack on Titan - Tập 34',
    author: 'Hajime Isayama',
    category: 'Action',
    price: 35000,
    oldPrice: 42000,
    discount: 17,
    rating: 4.8,
    stock: 20,
    image: '🧱',
    description:
      'Cuộc chiến giữa nhân loại và Titan bước vào giai đoạn quyết định.',
  },
  {
    id: 6,
    name: 'Jujutsu Kaisen - Tập 25',
    author: 'Gege Akutami',
    category: 'Shounen',
    price: 28000,
    oldPrice: 33000,
    discount: 15,
    rating: 4.8,
    stock: 22,
    image: '👹',
    description:
      'Yuji và những chú thuật sư đối mặt với những nguy hiểm ngày càng lớn.',
  },
]

const categories = ['Tất cả', 'Shounen', 'Action', 'Fantasy']

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [searchText, setSearchText] = useState('')

  const [cart, setCart] = useState([])
  const [quantity, setQuantity] = useState(1)

  const [orders, setOrders] = useState([])

  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [message, setMessage] = useState('')

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'shop',
      text: 'Xin chào! ComicHub có thể giúp gì cho bạn?',
    },
  ])

  const [chatText, setChatText] = useState('')

  function showToast(text) {
    setMessage(text)

    setTimeout(() => {
      setMessage('')
    }, 2500)
  }

  function goToPage(page) {
    setCurrentPage(page)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function openProduct(product) {
    setSelectedProduct(product)
    setQuantity(1)
    setCurrentPage('detail')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function addToCart(product, amount = 1) {
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

  function increaseCartItem(id) {
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

  function decreaseCartItem(id) {
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

  function removeFromCart(id) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id),
    )

    showToast('Đã xóa sản phẩm khỏi giỏ hàng!')
  }

  function createOrder(event) {
    event.preventDefault()

    if (cart.length === 0) {
      showToast('Giỏ hàng đang trống!')
      return
    }

    const newOrder = {
      id: `CH${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('vi-VN'),
      items: cart,
      total: cartTotal,
      status: 'Chờ xác nhận',
    }

    setOrders((currentOrders) => [
      newOrder,
      ...currentOrders,
    ])

    setCart([])

    showToast('Đặt hàng thành công!')

    goToPage('orders')
  }

  function sendMessage() {
    const text = chatText.trim()

    if (!text) {
      return
    }

    setChatMessages((messages) => [
      ...messages,
      {
        id: Date.now(),
        sender: 'customer',
        text,
      },
    ])

    setChatText('')

    setTimeout(() => {
      setChatMessages((messages) => [
        ...messages,
        {
          id: Date.now() + 1,
          sender: 'shop',
          text:
            'Shop đã nhận được tin nhắn của bạn. Mình sẽ tư vấn ngay nhé!',
        },
      ])
    }, 700)
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  const cartTotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0,
  )

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchText.toLowerCase())

    const matchesCategory =
      selectedCategory === 'Tất cả' ||
      product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  function ProductCard({ product }) {
    return (
      <div className="product-card">
        <div
          className="product-image"
          onClick={() => openProduct(product)}
        >
          <span>{product.image}</span>

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

  function HomePage() {
    return (
      <>
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-label">
              📖 THẾ GIỚI TRUYỆN TRANH
            </span>

            <h1>
              Tìm câu chuyện
              <br />
              dành cho riêng bạn
            </h1>

            <p>
              Khám phá hàng nghìn bộ truyện tranh hấp dẫn
              và tìm kiếm những câu chuyện bạn yêu thích.
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
            <span>{selectedProduct.image}</span>
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
                    {item.image}
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
                placeholder="Nguyễn Văn A"
                required
              />
            </label>

            <label>
              Số điện thoại

              <input
                type="tel"
                placeholder="09xxxxxxxx"
                required
              />
            </label>

            <label>
              Địa chỉ nhận hàng

              <input
                type="text"
                placeholder="Nhập địa chỉ..."
                required
              />
            </label>

            <label>
              Ghi chú

              <textarea
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
                      <span>
                        {item.image} {item.name} ×{' '}
                        {item.quantity}
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

  function ChatPage() {
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

  function AccountPage() {
    return (
      <section className="section page-section">
        <div className="account-card">
          <div className="account-avatar">
            👤
          </div>

          <h1>Nguyễn Minh</h1>

          <p>minh@example.com</p>

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

  function LoginModal() {
    return (
      <div
        className="modal-overlay"
        onMouseDown={() => setShowLogin(false)}
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

          <label>
            Email

            <input
              type="email"
              placeholder="Nhập email..."
            />
          </label>

          <label>
            Mật khẩu

            <input
              type="password"
              placeholder="Nhập mật khẩu..."
            />
          </label>

          <button
            type="button"
            className="primary-button full-button"
            onClick={() => {
              setIsLoggedIn(true)
              setShowLogin(false)
              showToast('Đăng nhập thành công!')
            }}
          >
            Đăng nhập
          </button>

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

  function RegisterModal() {
    return (
      <div
        className="modal-overlay"
        onMouseDown={() =>
          setShowRegister(false)
        }
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

          <label>
            Họ và tên

            <input
              type="text"
              placeholder="Nhập họ tên..."
            />
          </label>

          <label>
            Email

            <input
              type="email"
              placeholder="Nhập email..."
            />
          </label>

          <label>
            Mật khẩu

            <input
              type="password"
              placeholder="Tạo mật khẩu..."
            />
          </label>

          <button
            type="button"
            className="primary-button full-button"
            onClick={() => {
              setShowRegister(false)
              setShowLogin(true)

              showToast(
                'Đăng ký thành công! Hãy đăng nhập.',
              )
            }}
          >
            Đăng ký
          </button>

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
        return <ChatPage />

      case 'account':
        return <AccountPage />

      default:
        return <HomePage />
    }
  }

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

      {showLogin && <LoginModal />}

      {showRegister && <RegisterModal />}
    </div>
  )
}

export default App