const express = require("express");
const cors = require("cors");
const sql = require("mssql/msnodesqlv8");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

const config = {
    connectionString:
        "Driver={ODBC Driver 18 for SQL Server};" +
        "Server=DESKTOP-C3NT4R6\\SQLEXPRESS01;" +
        "Database=ComicHub;" +
        "Trusted_Connection=Yes;" +
        "Encrypt=No;" +
        "TrustServerCertificate=Yes;"
};

const poolPromise = sql.connect(config)
    .then(pool => {
        console.log("Kết nối SQL Server thành công!");
        return pool;
    })
    .catch(error => {
        console.error("Lỗi kết nối SQL Server:", error);
        throw error;
    });


/* 1. Kiểm tra Backend */

app.get("/", (req, res) => {
    res.json({
        message: "ComicHub Backend đang hoạt động!"
    });
});


/* 2. Kiểm tra Database */

app.get("/api/test-db", async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                DB_NAME() AS database_name,
                GETDATE() AS server_time
        `);

        res.json({
            success: true,
            message: "Kết nối Database thành công!",
            data: result.recordset
        });

    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            success: false,
            message: "Không kết nối được Database",
            error: error.message
        });
    }
});

/* Lấy danh mục */
app.get("/api/categories", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Categories");
        res.json({ success: true, categories: result.recordset });
    } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy danh mục", error: error.message });
    }
});

/* Lấy danh sách sản phẩm */
app.get("/api/products", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT p.id, p.name, p.author, p.category_id, p.price, p.old_price as oldPrice, p.discount, p.rating, p.stock, p.image, p.description, p.created_at, c.name as category
            FROM Products p
            LEFT JOIN Categories c ON p.category_id = c.id
        `);
        res.json({ success: true, products: result.recordset });
    } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy sản phẩm", error: error.message });
    }
});

/* Lấy chi tiết sản phẩm */
app.get("/api/products/:id", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT p.id, p.name, p.author, p.category_id, p.price, p.old_price as oldPrice, p.discount, p.rating, p.stock, p.image, p.description, p.created_at, c.name as category
                FROM Products p
                LEFT JOIN Categories c ON p.category_id = c.id
                WHERE p.id = @id
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }
        res.json({ success: true, product: result.recordset[0] });
    } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy chi tiết sản phẩm", error: error.message });
    }
});

/* 2.8 Lấy giỏ hàng */
app.get("/api/cart/:userId", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, req.params.userId)
            .query(`
                SELECT 
                    ci.id as cartItemId, 
                    ci.quantity, 
                    p.id, p.name, p.author, p.category_id, p.price, p.old_price as oldPrice, p.discount, p.rating, p.stock, p.image, p.description, p.created_at, 
                    c.name as category
                FROM CartItems ci
                JOIN Cart cart ON ci.cart_id = cart.id
                JOIN Products p ON ci.product_id = p.id
                LEFT JOIN Categories c ON p.category_id = c.id
                WHERE cart.user_id = @userId
            `);
        res.json({ success: true, cart: result.recordset });
    } catch (error) {
        console.error("Lỗi lấy giỏ hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy giỏ hàng" });
    }
});

/* 2.9 Thêm vào giỏ hàng */
app.post("/api/cart/:userId", async (req, res) => {
    try {
        const pool = await poolPromise;
        const { userId } = req.params;
        const { productId, amount } = req.body;
        
        // Find cart
        let cartResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT id FROM Cart WHERE user_id = @userId');
            
        let cartId;
        if (cartResult.recordset.length === 0) {
            let insertCart = await pool.request()
                .input('userId', sql.Int, userId)
                .query('INSERT INTO Cart (user_id) OUTPUT INSERTED.id VALUES (@userId)');
            cartId = insertCart.recordset[0].id;
        } else {
            cartId = cartResult.recordset[0].id;
        }
        
        // Check if item exists
        let itemResult = await pool.request()
            .input('cartId', sql.Int, cartId)
            .input('productId', sql.Int, productId)
            .query('SELECT id, quantity FROM CartItems WHERE cart_id = @cartId AND product_id = @productId');
            
        if (itemResult.recordset.length > 0) {
            let newQty = itemResult.recordset[0].quantity + amount;
            await pool.request()
                .input('qty', sql.Int, newQty)
                .input('id', sql.Int, itemResult.recordset[0].id)
                .query('UPDATE CartItems SET quantity = @qty WHERE id = @id');
        } else {
            await pool.request()
                .input('cartId', sql.Int, cartId)
                .input('productId', sql.Int, productId)
                .input('qty', sql.Int, amount)
                .query('INSERT INTO CartItems (cart_id, product_id, quantity) VALUES (@cartId, @productId, @qty)');
        }
        
        res.json({ success: true, message: "Đã cập nhật giỏ hàng" });
    } catch (error) {
        console.error("Lỗi thêm giỏ hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi thêm giỏ hàng" });
    }
});

/* 2.10 Cập nhật số lượng */
app.put("/api/cart/:userId/:productId", async (req, res) => {
    try {
        const pool = await poolPromise;
        const { userId, productId } = req.params;
        const { quantity } = req.body;
        
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .input('qty', sql.Int, quantity)
            .query(`
                UPDATE ci
                SET ci.quantity = @qty
                FROM CartItems ci
                JOIN Cart c ON ci.cart_id = c.id
                WHERE c.user_id = @userId AND ci.product_id = @productId
            `);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

/* 2.11 Xóa khỏi giỏ */
app.delete("/api/cart/:userId/:productId", async (req, res) => {
    try {
        const pool = await poolPromise;
        const { userId, productId } = req.params;
        
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .query(`
                DELETE ci
                FROM CartItems ci
                JOIN Cart c ON ci.cart_id = c.id
                WHERE c.user_id = @userId AND ci.product_id = @productId
            `);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

/* 2.12 Tạo đơn hàng */
app.post("/api/orders", async (req, res) => {
    try {
        const pool = await poolPromise;
        const { userId, customerName, phone, address, note, items, total } = req.body;
        
        // 1. Insert into Orders
        const orderResult = await pool.request()
            .input('userId', sql.Int, userId)
            .input('customerName', sql.NVarChar, customerName)
            .input('phone', sql.VarChar, phone)
            .input('address', sql.NVarChar, address)
            .input('note', sql.NVarChar, note)
            .input('total', sql.Decimal, total)
            .input('status', sql.NVarChar, 'Chờ xác nhận')
            .query(`
                INSERT INTO Orders (user_id, customer_name, phone, address, note, total, status)
                OUTPUT INSERTED.id
                VALUES (@userId, @customerName, @phone, @address, @note, @total, @status)
            `);
            
        const orderId = orderResult.recordset[0].id;
        
        // 2. Insert into OrderItems
        for (let item of items) {
            await pool.request()
                .input('orderId', sql.Int, orderId)
                .input('productId', sql.Int, item.id)
                .input('quantity', sql.Int, item.quantity)
                .input('price', sql.Decimal, item.price)
                .query(`
                    INSERT INTO OrderItems (order_id, product_id, quantity, price)
                    VALUES (@orderId, @productId, @quantity, @price)
                `);
        }
        
        // 3. Xóa giỏ hàng sau khi đặt thành công
        await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                DELETE ci
                FROM CartItems ci
                JOIN Cart c ON ci.cart_id = c.id
                WHERE c.user_id = @userId
            `);

        res.json({ success: true, message: "Đặt hàng thành công", orderId });
    } catch (error) {
        console.error("Lỗi tạo đơn hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi tạo đơn hàng" });
    }
});

/* 2.13 Lấy danh sách đơn hàng */
app.get("/api/orders/:userId", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, req.params.userId)
            .query(`
                SELECT *, FORMAT(created_at, 'dd/MM/yyyy') as date 
                FROM Orders 
                WHERE user_id = @userId
                ORDER BY created_at DESC
            `);
            
        const orders = result.recordset;
        
        // Lấy items cho mỗi order
        for (let order of orders) {
            const itemsResult = await pool.request()
                .input('orderId', sql.Int, order.id)
                .query(`
                    SELECT oi.*, p.name, p.image 
                    FROM OrderItems oi
                    JOIN Products p ON oi.product_id = p.id
                    WHERE oi.order_id = @orderId
                `);
            order.items = itemsResult.recordset;
        }
        
        res.json({ success: true, orders });
    } catch (error) {
        console.error("Lỗi lấy đơn hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy đơn hàng" });
    }
});

/* 2.14 Cập nhật trạng thái đơn hàng (Shop) */
app.put("/api/orders/:id/status", async (req, res) => {
    try {
        const pool = await poolPromise;
        const { id } = req.params;
        const { status } = req.body;
        
        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.NVarChar, status)
            .query('UPDATE Orders SET status = @status WHERE id = @id');
            
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

/* ===== D. ĐÁNH GIÁ SẢN PHẨM ===== */

/* Lấy đánh giá theo sản phẩm */
app.get("/api/reviews/:productId", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('productId', sql.Int, req.params.productId)
            .query(`
                SELECT r.id, r.rating, r.comment, r.created_at,
                       u.name as user_name
                FROM Reviews r
                JOIN Users u ON r.user_id = u.id
                WHERE r.product_id = @productId
                ORDER BY r.created_at DESC
            `);
        res.json({ success: true, reviews: result.recordset });
    } catch (error) {
        console.error("Lỗi lấy đánh giá:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy đánh giá" });
    }
});

/* Thêm đánh giá (chỉ sau khi đã mua) */
app.post("/api/reviews/:productId", async (req, res) => {
    try {
        const pool = await poolPromise;
        const { userId, rating, comment } = req.body;
        const { productId } = req.params;

        // Kiểm tra đã mua chưa
        const bought = await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .query(`
                SELECT COUNT(*) as cnt
                FROM OrderItems oi
                JOIN Orders o ON oi.order_id = o.id
                WHERE o.user_id = @userId AND oi.product_id = @productId
            `);

        if (bought.recordset[0].cnt === 0) {
            return res.status(403).json({
                success: false,
                message: "Bạn cần mua sản phẩm này trước khi đánh giá!"
            });
        }

        // Kiểm tra đã đánh giá chưa
        const existed = await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .query('SELECT id FROM Reviews WHERE user_id = @userId AND product_id = @productId');

        if (existed.recordset.length > 0) {
            // Cập nhật đánh giá
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('productId', sql.Int, productId)
                .input('rating', sql.Int, rating)
                .input('comment', sql.NVarChar, comment)
                .query('UPDATE Reviews SET rating=@rating, comment=@comment WHERE user_id=@userId AND product_id=@productId');
        } else {
            // Thêm mới
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('productId', sql.Int, productId)
                .input('rating', sql.Int, rating)
                .input('comment', sql.NVarChar, comment)
                .query('INSERT INTO Reviews (user_id, product_id, rating, comment) VALUES (@userId, @productId, @rating, @comment)');
        }

        res.json({ success: true, message: "Đánh giá thành công!" });
    } catch (error) {
        console.error("Lỗi đánh giá:", error);
        res.status(500).json({ success: false, message: "Lỗi đánh giá" });
    }
});

/* ===== E. CHAT / TƯ VẤN ===== */

/* Lấy lịch sử tin nhắn của 1 user */
app.get("/api/messages/:userId", async (req, res) => {
    try {
        const pool = await poolPromise;
        const userId = req.params.userId;
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT m.*, 
                       u.name as sender_name
                FROM Messages m
                JOIN Users u ON m.sender_id = u.id
                WHERE m.sender_id = @userId OR m.receiver_id = @userId
                ORDER BY m.created_at ASC
            `);
        res.json({ success: true, messages: result.recordset });
    } catch (error) {
        console.error("Lỗi lấy tin nhắn:", error);
        res.status(500).json({ success: false });
    }
});

/* Gửi tin nhắn (sender_id -> receiver_id) */
app.post("/api/messages", async (req, res) => {
    try {
        const pool = await poolPromise;
        const { senderId, receiverId, content } = req.body;
        await pool.request()
            .input('senderId', sql.Int, senderId)
            .input('receiverId', sql.Int, receiverId)
            .input('content', sql.NVarChar, content)
            .query('INSERT INTO Messages (sender_id, receiver_id, content) VALUES (@senderId, @receiverId, @content)');
        res.json({ success: true });
    } catch (error) {
        console.error("Lỗi gửi tin nhắn:", error);
        res.status(500).json({ success: false });
    }
});

/* Lấy tất cả chat (cho Shop xem - group theo user) */
app.get("/api/messages/shop/all", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT m.*, 
                       s.name as sender_name,
                       r.name as receiver_name
                FROM Messages m
                JOIN Users s ON m.sender_id = s.id
                JOIN Users r ON m.receiver_id = r.id
                ORDER BY m.created_at ASC
            `);
        res.json({ success: true, messages: result.recordset });
    } catch (error) {
        console.error("Lỗi lấy toàn bộ chat:", error);
        res.status(500).json({ success: false });
    }
});

/* 3. Đăng ký tài khoản */

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu!"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu phải có ít nhất 6 ký tự!"
            });
        }

        const pool = await poolPromise;

        /* Kiểm tra email đã tồn tại */

        const existingUser = await pool
            .request()
            .input("email", sql.VarChar(150), email)
            .query(`
                SELECT id
                FROM Users
                WHERE email = @email
            `);

        if (existingUser.recordset.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email này đã được đăng ký!"
            });
        }


        /* Mã hóa mật khẩu */

        const hashedPassword = await bcrypt.hash(password, 10);


        /* Thêm tài khoản vào Database */

        const result = await pool
            .request()
            .input("name", sql.NVarChar(100), name)
            .input("email", sql.VarChar(150), email)
            .input("password", sql.VarChar(255), hashedPassword)
            .query(`
                INSERT INTO Users
                (
                    name,
                    email,
                    password
                )
                OUTPUT
                    INSERTED.id,
                    INSERTED.name,
                    INSERTED.email,
                    INSERTED.role
                VALUES
                (
                    @name,
                    @email,
                    @password
                )
            `);

        res.status(201).json({
            success: true,
            message: "Đăng ký tài khoản thành công!",
            user: result.recordset[0]
        });

    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            success: false,
            message: "Đăng ký thất bại!",
            error: error.message
        });
    }
});


/* 4. Đăng nhập */

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email và mật khẩu!"
            });
        }

        const pool = await poolPromise;

        /* Tìm tài khoản theo email */

        const result = await pool
            .request()
            .input("email", sql.VarChar(150), email)
            .query(`
                SELECT
                    id,
                    name,
                    email,
                    password,
                    phone,
                    address,
                    role
                FROM Users
                WHERE email = @email
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng!"
            });
        }

        const user = result.recordset[0];

        /* Kiểm tra mật khẩu */

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng!"
            });
        }

        /* Không trả mật khẩu về Frontend */

        delete user.password;

        res.json({
            success: true,
            message: "Đăng nhập thành công!",
            user: user
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Đăng nhập thất bại!",
            error: error.message
        });
    }
});


/* 5. Khởi động Server */

app.listen(5000, () => {
    console.log(
        "ComicHub Backend chạy tại http://localhost:5000"
    );
});