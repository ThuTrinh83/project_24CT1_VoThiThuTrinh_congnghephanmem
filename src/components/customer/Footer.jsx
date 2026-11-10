export default function Footer() {
  return (
    <footer className="customer-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '12px' }}>
              📚 ComicHub.vn
            </h3>
            <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Hệ thống bán lẻ sách và truyện tranh trực tuyến hàng đầu. Cam kết 100% sách chính hãng, đóng gói cẩn thận và giao hàng tận tay với phương thức COD an toàn.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-body)' }}>
              <strong>Địa chỉ:</strong> 254 Nguyễn Văn Linh, Đà Nẵng
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-body)' }}>
              <strong>Hotline hỗ trợ:</strong> 1900 6656
            </p>
          </div>

          <div className="footer-col">
            <h4>DỊCH VỤ</h4>
            <ul className="footer-links">
              <li><a href="#!">Điều khoản sử dụng</a></li>
              <li><a href="#!">Chính sách bảo mật</a></li>
              <li><a href="#!">Chính sách giao hàng COD</a></li>
              <li><a href="#!">Chính sách đổi trả - hoàn tiền</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>HỖ TRỢ</h4>
            <ul className="footer-links">
              <li><a href="#!">Hướng dẫn đặt hàng</a></li>
              <li><a href="#!">Phương thức thanh toán COD</a></li>
              <li><a href="#!">Tra cứu đơn hàng</a></li>
              <li><a href="#!">Liên hệ CSKH</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>PHƯƠNG THỨC THANH TOÁN</h4>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#047857', fontSize: '13.5px' }}>
                <span>🛡️</span> Thanh toán khi nhận hàng (COD)
              </div>
              <p style={{ fontSize: '12px', color: '#065f46', marginTop: '4px' }}>
                Khách hàng được kiểm tra ngoại quan gói hàng trước khi thanh toán tiền mặt cho shipper.
              </p>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              © 2026 ComicHub.vn - Giữ toàn quyền tác giả.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
