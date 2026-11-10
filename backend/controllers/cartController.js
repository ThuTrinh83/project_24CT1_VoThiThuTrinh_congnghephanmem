const pool = require("../config/db");

// Bộ lưu trữ giỏ hàng tạm thời theo User (hoặc có thể lưu trong session)
const userCarts = new Map();

// Helper chuyển đổi an toàn sang số nguyên
function cleanNum(val) {
    if (val === undefined || val === null || val === '') return 0;
    const clean = Number(String(val).replace(/[^0-9]/g, ''));
    return isNaN(clean) ? 0 : clean;
}

// 1. Lấy danh sách sản phẩm trong giỏ hàng (tự động đồng bộ với bảng `books` trong MySQL)
exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const uId = String(userId);
        const rawCart = userCarts.get(uId) || [];

        const enrichedCart = [];

        for (const item of rawCart) {
            const bookId = Number(item.id || item.productId);
            const qty = Math.max(1, Number(item.quantity || 1));

            try {
                // Luôn truy vấn giá và thông tin mới nhất từ MySQL
                const [bookRows] = await pool.query(
                    "SELECT id, title as name, author, price, original_price as oldPrice, discount_percent as discount, stock, image_url as image FROM books WHERE id = ? LIMIT 1",
                    [bookId]
                );

                if (bookRows.length > 0) {
                    const b = bookRows[0];
                    enrichedCart.push({
                        id: b.id,
                        book_id: b.id,
                        name: b.name,
                        author: b.author || "Đang cập nhật",
                        price: Number(b.price || 0),
                        oldPrice: Number(b.oldPrice || b.price),
                        discount: Number(b.discount || 0),
                        stock: Number(b.stock || 50),
                        image: b.image || item.image || "",
                        quantity: qty
                    });
                } else {
                    // Fallback nếu sách chưa có trong DB
                    enrichedCart.push({
                        ...item,
                        id: bookId,
                        book_id: bookId,
                        price: cleanNum(item.price),
                        quantity: qty
                    });
                }
            } catch {
                enrichedCart.push({
                    ...item,
                    id: bookId,
                    book_id: bookId,
                    price: cleanNum(item.price),
                    quantity: qty
                });
            }
        }

        res.json({
            success: true,
            cart: enrichedCart
        });
    } catch (error) {
        console.error("Lỗi lấy giỏ hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy giỏ hàng", error: error.message });
    }
};

// 2. Thêm sách vào giỏ
exports.addToCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, amount, price, name, image, author } = req.body;
        const bookId = Number(productId);
        const qty = Math.max(1, parseInt(amount) || 1);
        const cleanPrice = cleanNum(price);

        const uId = String(userId);
        let cart = userCarts.get(uId) || [];
        const existing = cart.find(item => item.id === bookId);

        if (existing) {
            existing.quantity += qty;
            if (cleanPrice > 0) existing.price = cleanPrice;
        } else {
            cart.push({
                id: bookId,
                book_id: bookId,
                quantity: qty,
                price: cleanPrice,
                name: name || "",
                image: image || "",
                author: author || ""
            });
        }
        userCarts.set(uId, cart);

        res.json({
            success: true,
            message: "Đã thêm sách vào giỏ hàng thành công!",
            cart
        });
    } catch (error) {
        console.error("Lỗi thêm vào giỏ:", error);
        res.status(500).json({ success: false, message: "Lỗi thêm giỏ hàng", error: error.message });
    }
};

// 3. Cập nhật số lượng
exports.updateQuantity = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const { quantity } = req.body;
        const uId = String(userId);
        const bookId = Number(productId);
        let cart = userCarts.get(uId) || [];

        const item = cart.find(i => i.id === bookId);
        if (item) {
            item.quantity = Math.max(1, parseInt(quantity) || 1);
        }
        userCarts.set(uId, cart);

        res.json({ success: true, message: "Cập nhật số lượng thành công!" });
    } catch (error) {
        console.error("Lỗi cập nhật giỏ hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi cập nhật số lượng", error: error.message });
    }
};

// 4. Xóa khỏi giỏ
exports.removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const uId = String(userId);
        const bookId = Number(productId);
        let cart = userCarts.get(uId) || [];
        cart = cart.filter(i => i.id !== bookId);
        userCarts.set(uId, cart);

        res.json({ success: true, message: "Đã xóa sách khỏi giỏ hàng!" });
    } catch (error) {
        console.error("Lỗi xóa khỏi giỏ:", error);
        res.status(500).json({ success: false, message: "Lỗi xóa khỏi giỏ hàng", error: error.message });
    }
};
