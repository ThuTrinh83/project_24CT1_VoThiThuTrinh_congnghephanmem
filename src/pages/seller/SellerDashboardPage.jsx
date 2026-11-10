import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/seller-dashboard';
import { formatPrice } from '../../services/utils';

export default function SellerDashboardPage({ onNavigateTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Lỗi tải thống kê dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Chờ xác nhận':
        return <span className="badge badge-pending">Chờ xác nhận</span>;
      case 'Đang giao':
        return <span className="badge badge-shipping">Đang giao</span>;
      case 'Đã giao':
        return <span className="badge badge-completed">Đã giao</span>;
      case 'Đã hủy':
        return <span className="badge badge-cancelled">Đã hủy</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p>Đang tải dữ liệu tổng quan Kênh Người Bán...</p>
      </div>
    );
  }

  return (
    <div className="page-transition">
      {/* 1. Lưới Thống Kê Tổng Quan */}
      <div className="stats-grid">
        {/* Doanh thu */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">💰</div>
          <div className="stat-info">
            <h3>{formatPrice(stats?.totalRevenue || 0)}</h3>
            <p>Doanh Thu Đơn Hàng</p>
          </div>
        </div>

        {/* Tổng đơn hàng */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">📦</div>
          <div className="stat-info">
            <h3>{stats?.totalOrders || 0}</h3>
            <p>Tổng Đơn Hàng Đã Tạo</p>
          </div>
        </div>

        {/* Đơn chờ xác nhận */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-orange">⏳</div>
          <div className="stat-info">
            <h3 style={{ color: 'var(--accent-orange)' }}>{stats?.pendingOrders || 0}</h3>
            <p>Đơn Chờ Xác Nhận Duyệt</p>
          </div>
        </div>

        {/* Sách & Tồn kho */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-green">📚</div>
          <div className="stat-info">
            <h3>{stats?.totalProducts || 0}</h3>
            <p>
              Tựa Sách Đang Bán{' '}
              {stats?.lowStockProducts > 0 && (
                <span style={{ color: 'var(--accent-sale)', fontWeight: 700 }}>
                  ({stats.lowStockProducts} sắp hết)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Thao Tác Nhanh */}
      <div className="seller-card" style={{ background: '#f8fafc', border: '1.5px dashed #bae6fd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0369a1' }}>
              ⚡ Thao tác nghiệp vụ nhanh
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Đăng sách mới với tính năng tải ảnh từ máy tính hoặc kiểm tra duyệt các đơn COD mới nhất
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-primary"
              onClick={() => onNavigateTab('products')}
            >
              ➕ Thêm Sách Mới (Upload Ảnh)
            </button>
            <button
              className="btn btn-outline"
              style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
              onClick={() => onNavigateTab('orders')}
            >
              📋 Duyệt Đơn Hàng ({stats?.pendingOrders || 0} đơn chờ)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bảng 5 Đơn Hàng Mới Nhất */}
      <div className="seller-card">
        <div className="seller-card-header">
          <h2 className="seller-card-title">📦 Đơn Hàng Mới Nhận Gần Đây</h2>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onNavigateTab('orders')}
          >
            Xem tất cả đơn hàng →
          </button>
        </div>

        <div className="table-responsive">
          <table className="seller-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Số Điện Thoại</th>
                <th>Thời Gian Đặt</th>
                <th>Tổng Tiền (COD)</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Chưa có đơn hàng nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                stats?.recentOrders?.map((ord) => (
                  <tr key={ord.id}>
                    <td><strong>{ord.orderCode}</strong></td>
                    <td>{ord.customer_name}</td>
                    <td>{ord.phone}</td>
                    <td>{ord.date}</td>
                    <td><strong style={{ color: 'var(--accent-sale)' }}>{formatPrice(ord.total)}</strong></td>
                    <td>{getStatusBadge(ord.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
