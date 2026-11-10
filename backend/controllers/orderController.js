const pool = require("../config/db");

// Bản đồ trạng thái đơn hàng (Song ngữ Việt - Anh)
const STATUS_VN_TO_DB = {
    "Chờ xác nhận": "pending",
    "Đang giao": "shipping",
    "Đã giao": "completed",
    "Đã hủy": "cancelled",
    "pending": "pending",
    "shipping": "shipping",
    "completed": "completed",
    "cancelled": "cancelled"
};

const STATUS_DB_TO_VN = {
    "pending": "Chờ xác nhận",
    "shipping": "Đang giao",
    "completed": "Đã giao",
    "cancelled": "Đã hủy"
};

// Helper chuyển đổi an toàn sang số nguyên dương
function cleanNum(val) {
    if (val === undefined || val === null || val === '') return 0;
    const clean = Number(String(val).replace(/[^0-9]/g, ''));
    return isNaN(clean) ? 0 : clean;
}

function formatOrderRow(order) {
    if (!order) return null;
    const dbStatus = order.status || "pending";
    const statusVn = STATUS_DB_TO_VN[dbStatus] || "Chờ xác nhận";

    return {
        id: order.id,
        orderCode: order.order_code || `DH-${String(order.id).padStart(5, '0')}`,
        order_code: order.order_code || `DH-${String(order.id).padStart(5, '0')}`,
        userId: order.user_id,
        user_id: order.user_id,
        customerName: order.customer_name,
        customer_name: order.customer_name,
        phone: order.customer_phone,
        customer_phone: order.customer_phone,
        address: order.shipping_address,
        shipping_address: order.shipping_address,
        note: order.note || "",
        total: Number(order.total_amount || 0),
        total_amount: Number(order.total_amount || 0),
        paymentMethod: order.payment_method || "COD",
        payment_method: order.payment_method || "COD",
        status: statusVn, // Trả về tiếng Việt cho Frontend Seller & Customer
        dbStatus: dbStatus,
        date: order.created_at ? new Date(order.created_at).toLocaleString("vi-VN") : "",
        created_at: order.created_at,
        items: []
    };
}

// 1. Tạo đơn hàng COD mới (Dành cho Khách hàng)
exports.createOrder = async (req, res) => {
    try {
        const {
            userId, user_id,
            customerName, customer_name,
            phone, customer_phone,
            address, shipping_address,
            note,
            items,
            total, total_amount
        } = req.body;

        const name = (customerName || customer_name || "").trim();
        const contactPhone = (phone || customer_phone || "").trim();
        const shipAddress = (address || shipping_address || "").trim();

        if (!name || !contactPhone || !shipAddress || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin nhận hàng và chọn ít nhất 1 cuốn sách!"
            });
        }

        // Xử lý và kiểm tra giá từng sản phẩm
        let calculatedItemsTotal = 0;
        const verifiedItems = [];

        for (const item of items) {
            const bookId = Number(item.book_id || item.id);
            const qty = Math.max(1, Number(item.quantity || 1));
            let itemPrice = cleanNum(item.price);

            // NẾU GIÁ BỊ THIẾU HOẶC <= 0, TỰ ĐỘNG LẤY TỪ BẢNG BOOKS TRONG MYSQL
            if (!itemPrice || itemPrice <= 0) {
                const [bookRows] = await pool.query(
                    "SELECT price FROM books WHERE id = ? LIMIT 1",
                    [bookId]
                );
                if (bookRows.length > 0) {
                    itemPrice = Number(bookRows[0].price || 0);
                }
            }

            calculatedItemsTotal += (itemPrice * qty);
            verifiedItems.push({
                bookId,
                qty,
                price: itemPrice
            });
        }

        // Tính phí ship (nếu tổng sách < 250k thì cộng 25k ship, ngược lại freeship)
        const shippingFee = (calculatedItemsTotal >= 250000 || calculatedItemsTotal === 0) ? 0 : 25000;
        const clientTotal = cleanNum(total || total_amount);
        // Đảm bảo tổng tiền luôn > 0 và khớp với đơn hàng
        const finalTotalAmount = (clientTotal > 0 && clientTotal >= calculatedItemsTotal)
            ? clientTotal
            : (calculatedItemsTotal + shippingFee);

        // Tạo mã đơn hàng độc nhất dạng DH-XXXXX
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const orderCode = `DH-${randomNum}`;
        const finalUserId = userId || user_id || null;

        // Lưu đơn hàng vào bảng `orders`
        const [orderResult] = await pool.query(`
            INSERT INTO orders 
                (order_code, user_id, customer_name, customer_phone, shipping_address, note, total_amount, payment_method, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'COD', 'pending')
        `, [
            orderCode,
            finalUserId,
            name,
            contactPhone,
            shipAddress,
            note || "Giao hàng thanh toán tận nơi (COD)",
            finalTotalAmount
        ]);

        const orderId = orderResult.insertId;

        // Lưu danh sách sản phẩm vào `order_items` với giá hợp lệ > 0 & cập nhật tồn kho
        for (const item of verifiedItems) {
            await pool.query(`
                INSERT INTO order_items (order_id, book_id, quantity, price)
                VALUES (?, ?, ?, ?)
            `, [orderId, item.bookId, item.qty, item.price]);

            // Trừ tồn kho và tăng số lượng đã bán của sách
            await pool.query(`
                UPDATE books
                SET stock = GREATEST(0, stock - ?),
                    sold_count = sold_count + ?
                WHERE id = ?
            `, [item.qty, item.qty, item.bookId]);
        }

        res.status(201).json({
            success: true,
            message: "Đặt hàng thành công với hình thức COD (Thanh toán khi nhận hàng)!",
            orderId: orderId,
            orderCode: orderCode,
            totalAmount: finalTotalAmount
        });

    } catch (error) {
        console.error("Lỗi tạo đơn hàng COD:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi tạo đơn hàng",
            error: error.message
        });
    }
};

// 2. Lấy danh sách đơn hàng của 1 khách hàng
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.params.userId || req.params.id;

        const [orders] = await pool.query(`
            SELECT * FROM orders 
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);

        const formattedOrders = [];

        for (const o of orders) {
            const orderObj = formatOrderRow(o);

            // Query order_items kết hợp lấy giá chuẩn từ MySQL nếu oi.price bị 0
            const [items] = await pool.query(`
                SELECT 
                    oi.id,
                    oi.order_id,
                    oi.book_id,
                    oi.quantity,
                    COALESCE(NULLIF(oi.price, 0), b.price, 0) as price,
                    b.title as name,
                    b.author,
                    b.image_url as image
                FROM order_items oi
                LEFT JOIN books b ON oi.book_id = b.id
                WHERE oi.order_id = ?
            `, [o.id]);

            orderObj.items = items.map(item => ({
                ...item,
                price: Number(item.price || 0),
                quantity: Number(item.quantity || 1)
            }));

            // Nếu đơn cũ bị lưu 0đ trong DB, tự động tính lại tổng thanh toán hiển thị
            let finalTotal = Number(orderObj.total);
            if (finalTotal <= 0 && orderObj.items.length > 0) {
                const itemsSum = orderObj.items.reduce((s, it) => s + (it.price * it.quantity), 0);
                finalTotal = itemsSum + (itemsSum >= 250000 ? 0 : 25000);
                orderObj.total = finalTotal;
                orderObj.total_amount = finalTotal;
            }

            formattedOrders.push(orderObj);
        }

        res.json({
            success: true,
            orders: formattedOrders
        });

    } catch (error) {
        console.error("Lỗi lấy đơn hàng của khách:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi lấy danh sách đơn hàng",
            error: error.message
        });
    }
};

// 3. Lấy toàn bộ đơn hàng (Kênh Người Bán) kèm bộ lọc trạng thái
exports.getAllOrdersForSeller = async (req, res) => {
    try {
        const { status } = req.query;

        let query = "SELECT * FROM orders WHERE 1=1";
        const params = [];

        if (status && status !== 'Tất cả' && status !== 'all') {
            const mappedStatus = STATUS_VN_TO_DB[status] || status;
            query += " AND status = ?";
            params.push(mappedStatus);
        }

        query += " ORDER BY created_at DESC";

        const [orders] = await pool.query(query, params);
        const formattedOrders = [];

        for (const o of orders) {
            const orderObj = formatOrderRow(o);

            const [items] = await pool.query(`
                SELECT 
                    oi.id,
                    oi.order_id,
                    oi.book_id,
                    oi.quantity,
                    COALESCE(NULLIF(oi.price, 0), b.price, 0) as price,
                    b.title as name,
                    b.image_url as image
                FROM order_items oi
                LEFT JOIN books b ON oi.book_id = b.id
                WHERE oi.order_id = ?
            `, [o.id]);

            orderObj.items = items.map(item => ({
                ...item,
                price: Number(item.price || 0),
                quantity: Number(item.quantity || 1)
            }));

            // Tự động sửa hiển thị nếu đơn cũ bị 0đ
            let finalTotal = Number(orderObj.total);
            if (finalTotal <= 0 && orderObj.items.length > 0) {
                const itemsSum = orderObj.items.reduce((s, it) => s + (it.price * it.quantity), 0);
                finalTotal = itemsSum + (itemsSum >= 250000 ? 0 : 25000);
                orderObj.total = finalTotal;
                orderObj.total_amount = finalTotal;
            }

            formattedOrders.push(orderObj);
        }

        res.json({
            success: true,
            orders: formattedOrders
        });

    } catch (error) {
        console.error("Lỗi lấy đơn hàng người bán:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi lấy danh sách đơn hàng cho người bán",
            error: error.message
        });
    }
};

// 4. Cập nhật trạng thái đơn hàng (Duyệt đơn: Chờ xác nhận -> Đang giao -> Đã giao / Đã hủy)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const mappedStatus = STATUS_VN_TO_DB[status];
        if (!mappedStatus) {
            return res.status(400).json({
                success: false,
                message: "Trạng thái đơn hàng không hợp lệ! (Chấp nhận: Chờ xác nhận, Đang giao, Đã giao, Đã hủy)"
            });
        }

        await pool.query("UPDATE orders SET status = ? WHERE id = ?", [mappedStatus, id]);

        res.json({
            success: true,
            message: `Đã cập nhật trạng thái đơn hàng thành: ${STATUS_DB_TO_VN[mappedStatus]}`,
            status: STATUS_DB_TO_VN[mappedStatus],
            dbStatus: mappedStatus
        });

    } catch (error) {
        console.error("Lỗi cập nhật trạng thái đơn hàng:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi cập nhật trạng thái đơn hàng",
            error: error.message
        });
    }
};
