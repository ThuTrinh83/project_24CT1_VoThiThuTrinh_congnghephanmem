const pool = require("../config/db");

// Lấy số liệu thống kê tổng quan cho Bảng điều khiển Người bán
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Thống kê đơn hàng và doanh thu
        const [revenueRows] = await pool.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as totalRevenue,
                COUNT(id) as totalOrders,
                COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pendingOrders,
                COALESCE(SUM(CASE WHEN status = 'shipping' THEN 1 ELSE 0 END), 0) as shippingOrders,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completedOrders,
                COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelledOrders
            FROM orders
        `);

        // 2. Thống kê số lượng sách và tồn kho
        const [productStatsRows] = await pool.query(`
            SELECT 
                COUNT(id) as totalProducts,
                COALESCE(SUM(CASE WHEN stock <= 5 THEN 1 ELSE 0 END), 0) as lowStockProducts,
                COALESCE(SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END), 0) as outOfStockProducts
            FROM books
        `);

        // 3. Danh sách 5 đơn hàng mới nhất
        const [recentOrdersRows] = await pool.query(`
            SELECT id, order_code, customer_name, customer_phone, total_amount, status, created_at
            FROM orders
            ORDER BY created_at DESC
            LIMIT 5
        `);

        const STATUS_DB_TO_VN = {
            "pending": "Chờ xác nhận",
            "shipping": "Đang giao",
            "completed": "Đã giao",
            "cancelled": "Đã hủy"
        };

        const recentOrders = recentOrdersRows.map(o => ({
            id: o.id,
            orderCode: o.order_code || `DH-${String(o.id).padStart(5, '0')}`,
            order_code: o.order_code,
            customer_name: o.customer_name,
            customerName: o.customer_name,
            phone: o.customer_phone,
            total: Number(o.total_amount || 0),
            status: STATUS_DB_TO_VN[o.status] || o.status,
            date: o.created_at ? new Date(o.created_at).toLocaleString("vi-VN") : ""
        }));

        // 4. Doanh thu theo tháng
        const [monthlyRows] = await pool.query(`
            SELECT 
                DATE_FORMAT(created_at, '%m/%Y') as month,
                COALESCE(SUM(total_amount), 0) as revenue,
                COUNT(id) as ordersCount
            FROM orders
            WHERE status != 'cancelled'
            GROUP BY DATE_FORMAT(created_at, '%m/%Y')
            ORDER BY MIN(created_at) ASC
        `);

        const statsData = {
            totalRevenue: Number(revenueRows[0].totalRevenue || 0),
            totalOrders: Number(revenueRows[0].totalOrders || 0),
            pendingOrders: Number(revenueRows[0].pendingOrders || 0),
            shippingOrders: Number(revenueRows[0].shippingOrders || 0),
            completedOrders: Number(revenueRows[0].completedOrders || 0),
            cancelledOrders: Number(revenueRows[0].cancelledOrders || 0),
            totalProducts: Number(productStatsRows[0].totalProducts || 0),
            lowStockProducts: Number(productStatsRows[0].lowStockProducts || 0),
            outOfStockProducts: Number(productStatsRows[0].outOfStockProducts || 0),
            recentOrders: recentOrders,
            monthlyRevenue: monthlyRows.map(m => ({
                month: m.month,
                revenue: Number(m.revenue),
                ordersCount: Number(m.ordersCount)
            }))
        };

        res.json({
            success: true,
            stats: statsData
        });

    } catch (error) {
        console.error("Lỗi lấy thống kê dashboard:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi lấy số liệu dashboard từ MySQL",
            error: error.message
        });
    }
};
