import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getProducts,
  getCategories,
  uploadProductImage,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/product';
import { formatPrice, getImageUrl } from '../../services/utils';

export default function SellerProductPage() {
  const { showToast } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal Thêm/Sửa sách
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    category_id: 1,
    price: '',
    oldPrice: '',
    stock: 20,
    description: '',
  });

  // State xử lý File Upload và Preview Ảnh từ máy tính
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, [filterCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        getProducts(filterCategory, searchTerm),
        getCategories(),
      ]);

      if (prodRes.success && prodRes.products) setProducts(prodRes.products);
      if (catRes.success && catRes.categories) setCategories(catRes.categories);
    } catch (err) {
      console.error('Lỗi nạp dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mở modal thêm sách mới
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      author: '',
      category_id: categories[0]?.id || 1,
      price: '',
      oldPrice: '',
      stock: 20,
      description: '',
    });
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setShowModal(true);
  };

  // Mở modal sửa sách
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      author: product.author || '',
      category_id: product.category_id || 1,
      price: product.price,
      oldPrice: product.oldPrice || product.price,
      stock: product.stock,
      description: product.description || '',
    });
    setSelectedImageFile(null);
    setImagePreviewUrl(getImageUrl(product.image));
    setShowModal(true);
  };

  // Xử lý khi chọn file ảnh từ máy tính (Kéo thả hoặc Input Change)
  const handleProcessFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chỉ chọn file hình ảnh (JPG, PNG, WEBP)!', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Dung lượng ảnh không được vượt quá 10MB!', 'error');
      return;
    }

    setSelectedImageFile(file);
    // Tạo link xem trước (Instant Image Preview)
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    showToast('Đã chọn ảnh thành công! Xem trước bên dưới.', 'info');
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleProcessFile(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleProcessFile(file);
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Lưu thông tin sách (Thêm mới hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price) {
      showToast('Vui lòng nhập tên sách và giá bán!', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      let finalImageUrl = editingProduct ? editingProduct.image : '';

      // Nếu có chọn file ảnh mới từ máy tính, tiến hành upload Multipart FormData
      if (selectedImageFile) {
        showToast('Đang tải ảnh sách lên máy chủ...', 'info');
        const uploadRes = await uploadProductImage(selectedImageFile);
        if (uploadRes.success && uploadRes.imageUrl) {
          finalImageUrl = uploadRes.imageUrl;
        } else {
          throw new Error('Không thể tải ảnh sách lên server!');
        }
      }

      const payload = {
        name: formData.name.trim(),
        author: formData.author.trim(),
        category_id: Number(formData.category_id),
        price: Number(formData.price),
        oldPrice: Number(formData.oldPrice || formData.price),
        stock: Number(formData.stock || 0),
        description: formData.description.trim(),
        image: finalImageUrl,
      };

      if (editingProduct) {
        // Cập nhật sách
        const res = await updateProduct(editingProduct.id, payload);
        if (res.success) {
          showToast(`Đã cập nhật sách "${formData.name}" thành công!`, 'success');
        }
      } else {
        // Thêm mới sách
        const res = await createProduct(payload);
        if (res.success) {
          showToast(`Thêm cuốn sách "${formData.name}" thành công!`, 'success');
        }
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Lỗi lưu thông tin sách!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa sách
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa cuốn sách "${product.name}"?`)) {
      return;
    }

    try {
      const res = await deleteProduct(product.id);
      if (res.success) {
        showToast(`Đã xóa sách "${product.name}" khỏi hệ thống!`, 'info');
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Không thể xóa cuốn sách này!', 'error');
    }
  };

  return (
    <div className="page-transition">
      <div className="seller-card">
        <div className="seller-card-header">
          <div>
            <h2 className="seller-card-title">📚 Quản Lý Danh Mục Sách & Tồn Kho</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Thêm mới tựa sách bằng cách tải file ảnh trực tiếp từ máy tính, điều chỉnh giá và số lượng tồn kho.
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            ➕ Đăng Sách Mới (Tải Ảnh Từ Máy)
          </button>
        </div>

        {/* Thanh tìm kiếm & lọc danh mục */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Tìm sách theo tên hoặc tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadData()}
            />
          </div>

          <div style={{ width: '200px' }}>
            <select
              className="form-control"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-outline" onClick={loadData}>
            Lọc
          </button>
        </div>

        {/* Bảng sách */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>Đang nạp kho sách...</div>
        ) : (
          <div className="table-responsive">
            <table className="seller-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Bìa Sách</th>
                  <th>Tên Sách</th>
                  <th>Tác Giả</th>
                  <th>Danh Mục</th>
                  <th>Giá Bán</th>
                  <th>Tồn Kho</th>
                  <th style={{ textAlign: 'center' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      Không có cuốn sách nào khớp với tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <img
                          src={getImageUrl(prod.image)}
                          alt={prod.name}
                          style={{ width: '48px', height: '64px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                        />
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)', fontSize: '14.5px' }}>{prod.name}</strong>
                      </td>
                      <td>{prod.author || 'Đang cập nhật'}</td>
                      <td>
                        <span className="badge badge-shipping">{prod.category || 'Chung'}</span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--accent-sale)' }}>{formatPrice(prod.price)}</strong>
                        {prod.oldPrice && prod.oldPrice > prod.price && (
                          <div style={{ fontSize: '11px', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                            {formatPrice(prod.oldPrice)}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${prod.stock > 5 ? 'badge-completed' : prod.stock > 0 ? 'badge-pending' : 'badge-cancelled'}`}
                        >
                          {prod.stock > 0 ? `${prod.stock} cuốn` : 'Hết hàng'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleOpenEditModal(prod)}
                            title="Sửa sách"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteProduct(prod)}
                            title="Xóa sách"
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL THÊM / SỬA SÁCH CÓ TÍNH NĂNG TẢI ẢNH TỪ MÁY TÍNH */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduct ? '✏️ Cập Nhật Thông Tin Sách' : '➕ Thêm Tựa Sách Mới Vào Gian Hàng'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* 1. KHU VỰC DRAG & DROP TẢI ẢNH TỪ MÁY TÍNH (FILE UPLOAD) */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">
                    🖼️ Ảnh bìa sách (* Bắt buộc tải file trực tiếp từ máy tính, KHÔNG dùng URL)
                  </label>

                  {/* Vùng kéo thả file */}
                  <div
                    className={`dropzone-container ${isDragActive ? 'drag-active' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="dropzone-input-file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                    />

                    <div className="dropzone-icon">📁</div>
                    <div className="dropzone-text">
                      <h4>Kéo & Thả file ảnh vào đây hoặc nhấp để duyệt file</h4>
                      <p>Hỗ trợ: JPEG, JPG, PNG, WEBP (Tối đa 10MB)</p>
                    </div>
                  </div>

                  {/* KHU VỰC XEM TRƯỚC ẢNH (IMAGE PREVIEW) TỨC THÌ */}
                  {imagePreviewUrl && (
                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Xem trước ảnh bìa sách sẽ hiển thị:
                      </span>
                      <div className="image-preview-box">
                        <img src={imagePreviewUrl} alt="Xem trước ảnh bìa" />
                        <button
                          type="button"
                          className="remove-preview-btn"
                          onClick={handleRemoveImage}
                          title="Hủy chọn ảnh"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. CÁC THÔNG TIN CỦA SÁCH */}
                <div className="form-group">
                  <label className="form-label">Tên tựa sách (*)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: Đắc Nhân Tâm, Thám Tử Lừng Danh Conan..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Tác giả (*)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Dale Carnegie, Gosho Aoyama..."
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Thể loại / Danh mục (*)</label>
                    <select
                      className="form-control"
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Giá bán (VNĐ) (*)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Ví dụ: 85000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      min={0}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Giá bìa gốc (VNĐ)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Ví dụ: 100000"
                      value={formData.oldPrice}
                      onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                      min={0}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số lượng tồn kho (*)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      min={0}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tóm tắt nội dung sách</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Mô tả tóm lược cốt truyện, giới thiệu nội dung cuốn sách..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang tải ảnh & Lưu...' : '💾 Lưu Thông Tin Sách'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
