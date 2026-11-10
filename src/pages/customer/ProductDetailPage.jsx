import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, getImageUrl } from '../../services/utils';
import { getProductReviews, addProductReview } from '../../services/product';

export default function ProductDetailPage({ product, onBack, onNavigateCheckout }) {
  const { addItem } = useCart();
  const { customer, showToast } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Tải danh sách đánh giá
  useEffect(() => {
    if (product && product.id) {
      loadReviews(product.id);
    }
  }, [product]);

  const loadReviews = async (productId) => {
    try {
      const res = await getProductReviews(productId);
      if (res.success && res.reviews) {
        setReviews(res.reviews);
      }
    } catch (err) {
      console.error('Lỗi tải đánh giá:', err);
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    const success = addItem(product, quantity);
    if (success && onNavigateCheckout) {
      onNavigateCheckout();
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!customer) {
      showToast('Vui lòng đăng nhập để gửi đánh giá!', 'warning');
      return;
    }
    if (!newComment.trim()) {
      showToast('Vui lòng nhập nội dung nhận xét!', 'warning');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await addProductReview(product.id, {
        userId: customer.id,
        rating: newRating,
        comment: newComment.trim(),
      });
      if (res.success) {
        showToast('Đánh giá sản phẩm thành công!', 'success');
        setNewComment('');
        await loadReviews(product.id);
      }
    } catch (err) {
      showToast(err.message || 'Chỉ những khách hàng đã mua và nhận sách mới có thể gửi đánh giá!', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <p>Không tìm thấy thông tin sách.</p>
        <button className="btn btn-outline" onClick={onBack}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="container page-transition">
      {/* Nút quay lại */}
      <div style={{ margin: '16px 0' }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}>
          ← Quay lại danh sách sách
        </button>
      </div>

      {/* Chi tiết sách */}
      <div className="product-detail-layout">
        {/* Hình ảnh sản phẩm */}
        <div className="detail-gallery">
          <div className="detail-main-img-box">
            <img
              src={getImageUrl(product.image, product)}
              alt={product.name}
              className="detail-main-img"
            />
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="detail-meta-box">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge badge-shipping">{product.category || 'Sách tổng hợp'}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Mã sách: #{product.id}
            </span>
          </div>

          <h1 className="detail-title">{product.name}</h1>

          <div className="detail-subinfo">
            <span>Tác giả: <strong>{product.author || 'Đang cập nhật'}</strong></span>
            <span>⭐ Đánh giá: <strong>{product.rating || '5.0'} / 5.0</strong></span>
            <span>
              Tình trạng: <strong style={{ color: (product.stock > 0 ? 'var(--accent-green)' : 'var(--accent-sale)') }}>
                {product.stock > 0 ? `Còn hàng (${product.stock} cuốn)` : 'Tạm hết hàng'}
              </strong>
            </span>
          </div>

          {/* Hộp hiển thị giá */}
          <div className="detail-price-box">
            <span className="detail-current-price">{formatPrice(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="detail-old-price">{formatPrice(product.oldPrice)}</span>
            )}
            {product.discount > 0 && (
              <span className="badge" style={{ background: 'var(--accent-sale)', color: '#fff' }}>
                Giảm {product.discount}%
              </span>
            )}
          </div>

          {/* Chọn số lượng */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '12px 0' }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Số lượng:</span>
            <div className="quantity-control">
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <input
                type="text"
                className="qty-input"
                value={quantity}
                readOnly
              />
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => (product.stock ? Math.min(product.stock, q + 1) : q + 1))}
              >
                +
              </button>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="detail-action-buttons">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              🛒 Thêm Vào Giỏ Hàng
            </button>
            <button
              className="btn btn-danger btn-lg"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
            >
              ⚡ Mua Ngay (COD)
            </button>
          </div>

          {/* Cam kết mua hàng */}
          <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13px', display: 'flex', gap: '24px' }}>
            <div>🛡️ <strong>Chính hãng 100%</strong></div>
            <div>📦 <strong>Kiểm tra hàng trước khi nhận</strong></div>
            <div>🚚 <strong>Thanh toán tiền mặt COD</strong></div>
          </div>
        </div>
      </div>

      {/* Mô tả nội dung sách */}
      <div style={{ background: '#fff', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', borderBottom: '2px solid var(--primary-light)', paddingBottom: '8px' }}>
          📖 MÔ TẢ NỘI DUNG SÁCH
        </h2>
        <div style={{ fontSize: '14.5px', lineHeight: '1.8', color: 'var(--text-body)', whiteSpace: 'pre-line' }}>
          {product.description || 'Nội dung cuốn sách đang được cập nhật chi tiết từ nhà xuất bản. Vui lòng quay lại sau.'}
        </div>
      </div>

      {/* Phần Đánh giá & Nhận xét của bạn đọc */}
      <div style={{ background: '#fff', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
          💬 ĐÁNH GIÁ TỪ BẠN ĐỌC ({reviews.length})
        </h2>

        {/* Form gửi đánh giá */}
        <form onSubmit={handleSubmitReview} style={{ background: 'var(--bg-subtle)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '28px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Gửi nhận xét của bạn:</h4>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13.5px' }}>Đánh giá sao:</span>
            <select
              className="form-control"
              style={{ width: '130px' }}
              value={newRating}
              onChange={(e) => setNewRating(Number(e.target.value))}
            >
              <option value={5}>⭐⭐⭐⭐⭐ 5 Sao</option>
              <option value={4}>⭐⭐⭐⭐ 4 Sao</option>
              <option value={3}>⭐⭐⭐ 3 Sao</option>
              <option value={2}>⭐⭐ 2 Sao</option>
              <option value={1}>⭐ 1 Sao</option>
            </select>
          </div>
          <div className="form-group">
            <textarea
              className="form-control"
              rows={3}
              placeholder="Chia sẻ cảm nghĩ của bạn về cuốn sách này (bạn cần mua sách để được duyệt đánh giá)..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>
            {submittingReview ? 'Đang gửi...' : 'Gửi Nhận Xét'}
          </button>
        </form>

        {/* Danh sách bình luận */}
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Chưa có đánh giá nào cho cuốn sách này. Hãy là người đầu tiên nhận xét!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '14px' }}>👤 {rev.userName || 'Bạn đọc'}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rev.date}</span>
                </div>
                <div style={{ color: 'var(--accent-yellow)', fontSize: '13px', marginBottom: '6px' }}>
                  {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-body)' }}>{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
