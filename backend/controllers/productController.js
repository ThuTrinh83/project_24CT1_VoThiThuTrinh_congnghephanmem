const pool = require("../config/db");

// Helper map từ dòng database `books` sang format chuẩn Frontend
function mapBookRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        name: row.title,
        title: row.title,
        author: row.author || "Đang cập nhật",
        category_id: row.category_id,
        category: row.category || "Truyện Tranh",
        price: Number(row.price),
        oldPrice: Number(row.original_price || row.price),
        original_price: Number(row.original_price || row.price),
        discount: Number(row.discount_percent || 0),
        discount_percent: Number(row.discount_percent || 0),
        rating: 5.0,
        stock: Number(row.stock || 0),
        sold: Number(row.sold_count || 0),
        sold_count: Number(row.sold_count || 0),
        volume: row.episode_badge || "Tập 1",
        episode_badge: row.episode_badge || "Tập 1",
        badge: row.status_badge || "Mới",
        status_badge: row.status_badge || "Mới",
        image: row.image_url || "",
        image_url: row.image_url || "",
        description: row.description || "",
        created_at: row.created_at
    };
}

// 1. Lấy danh sách danh mục sách
exports.getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query("SELECT * FROM categories ORDER BY id ASC");
        res.json({
            success: true,
            categories: categories
        });
    } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi lấy danh mục sách",
            error: error.message
        });
    }
};

// 2. Lấy danh sách sách (hỗ trợ lọc danh mục & tìm kiếm)
exports.getProducts = async (req, res) => {
    try {
        const { categoryId, category_id, search } = req.query;
        const catFilter = categoryId || category_id;

        let query = `
            SELECT b.*, c.name as category
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (catFilter && catFilter !== 'all') {
            query += " AND b.category_id = ?";
            params.push(catFilter);
        }

        if (search && search.trim() !== "") {
            query += " AND (b.title LIKE ? OR b.author LIKE ?)";
            const term = `%${search.trim()}%`;
            params.push(term, term);
        }

        query += " ORDER BY b.id DESC";

        const [rows] = await pool.query(query, params);
        const products = rows.map(mapBookRow);

        res.json({
            success: true,
            products: products,
            books: products // alias cho cả 2 cách gọi
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách sách:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi lấy danh sách sách",
            error: error.message
        });
    }
};

// 3. Lấy chi tiết 1 cuốn sách
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT b.*, c.name as category
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.id = ?
            LIMIT 1
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sách yêu cầu!"
            });
        }

        const product = mapBookRow(rows[0]);

        res.json({
            success: true,
            product: product,
            book: product
        });
    } catch (error) {
        console.error("Lỗi chi tiết sách:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi lấy chi tiết sách",
            error: error.message
        });
    }
};

// 4. Tải file ảnh thực tế từ máy tính lên Server
exports.uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Không có file ảnh nào được tải lên!"
            });
        }

        const protocol = req.protocol;
        const host = req.get('host');
        const imageUrl = `${protocol}://${host}/uploads/products/${req.file.filename}`;

        res.json({
            success: true,
            message: "Tải ảnh lên thành công!",
            filename: req.file.filename,
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error("Lỗi upload ảnh:", error);
        res.status(500).json({
            success: false,
            message: "Không thể lưu file ảnh!"
        });
    }
};

// 5. Thêm sách mới (Kênh Người Bán)
exports.createProduct = async (req, res) => {
    try {
        const {
            title, name,
            author,
            category_id, categoryId,
            price,
            original_price, oldPrice,
            discount_percent, discount,
            stock,
            episode_badge, volume,
            status_badge, badge,
            image_url, image,
            description
        } = req.body;

        const bookTitle = (title || name || "").trim();
        const bookPrice = Number(price);

        if (!bookTitle || isNaN(bookPrice) || bookPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập tên sách và giá bán hợp lệ!"
            });
        }

        const bookCatId = Number(category_id || categoryId) || 1;
        const bookAuthor = (author || "Đang cập nhật").trim();
        const bookOldPrice = Number(original_price || oldPrice || bookPrice);
        const bookDiscount = Number(discount_percent || discount || (bookOldPrice > bookPrice ? Math.round(((bookOldPrice - bookPrice) / bookOldPrice) * 100) : 0));
        const bookStock = Number(stock !== undefined ? stock : 50);
        const bookVolume = (episode_badge || volume || "Tập 1").trim();
        const bookBadge = (status_badge || badge || "Mới").trim();
        const bookImage = (image_url || image || "").trim();
        const bookDesc = (description || "").trim();

        const [result] = await pool.query(`
            INSERT INTO books 
                (category_id, title, author, episode_badge, status_badge, price, original_price, discount_percent, stock, image_url, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            bookCatId,
            bookTitle,
            bookAuthor,
            bookVolume,
            bookBadge,
            bookPrice,
            bookOldPrice,
            bookDiscount,
            bookStock,
            bookImage,
            bookDesc
        ]);

        const [newBookRows] = await pool.query(`
            SELECT b.*, c.name as category
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.id = ?
        `, [result.insertId]);

        const product = mapBookRow(newBookRows[0]);

        res.status(201).json({
            success: true,
            message: "Thêm sách mới vào MySQL thành công!",
            product: product,
            book: product
        });
    } catch (error) {
        console.error("Lỗi thêm sách:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi thêm sách vào cơ sở dữ liệu",
            error: error.message
        });
    }
};

// 6. Cập nhật sách (Kênh Người Bán)
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, name,
            author,
            category_id, categoryId,
            price,
            original_price, oldPrice,
            discount_percent, discount,
            stock,
            episode_badge, volume,
            status_badge, badge,
            image_url, image,
            description
        } = req.body;

        const bookTitle = (title || name || "").trim();
        const bookPrice = Number(price);

        if (!bookTitle || isNaN(bookPrice) || bookPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập tên sách và giá bán hợp lệ!"
            });
        }

        const bookCatId = Number(category_id || categoryId) || 1;
        const bookAuthor = (author || "Đang cập nhật").trim();
        const bookOldPrice = Number(original_price || oldPrice || bookPrice);
        const bookDiscount = Number(discount_percent || discount || (bookOldPrice > bookPrice ? Math.round(((bookOldPrice - bookPrice) / bookOldPrice) * 100) : 0));
        const bookStock = Number(stock !== undefined ? stock : 0);
        const bookVolume = (episode_badge || volume || "Tập 1").trim();
        const bookBadge = (status_badge || badge || "Mới").trim();
        const bookImage = (image_url || image || "").trim();
        const bookDesc = (description || "").trim();

        await pool.query(`
            UPDATE books
            SET category_id = ?,
                title = ?,
                author = ?,
                episode_badge = ?,
                status_badge = ?,
                price = ?,
                original_price = ?,
                discount_percent = ?,
                stock = ?,
                image_url = ?,
                description = ?
            WHERE id = ?
        `, [
            bookCatId,
            bookTitle,
            bookAuthor,
            bookVolume,
            bookBadge,
            bookPrice,
            bookOldPrice,
            bookDiscount,
            bookStock,
            bookImage,
            bookDesc,
            id
        ]);

        const [updatedRows] = await pool.query(`
            SELECT b.*, c.name as category
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.id = ?
        `, [id]);

        const product = mapBookRow(updatedRows[0]);

        res.json({
            success: true,
            message: "Cập nhật thông tin sách thành công!",
            product: product,
            book: product
        });
    } catch (error) {
        console.error("Lỗi cập nhật sách:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi cập nhật thông tin sách",
            error: error.message
        });
    }
};

// 7. Xóa sách (Kênh Người Bán)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query("DELETE FROM books WHERE id = ?", [id]);

        res.json({
            success: true,
            message: "Đã xóa sách khỏi cơ sở dữ liệu!"
        });
    } catch (error) {
        console.error("Lỗi xóa sách:", error);
        res.status(500).json({
            success: false,
            message: "Không thể xóa sách do sách đã có trong đơn hàng!",
            error: error.message
        });
    }
};
