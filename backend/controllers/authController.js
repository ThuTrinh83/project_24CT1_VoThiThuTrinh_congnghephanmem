const bcrypt = require("bcryptjs");
const pool = require("../config/db");

// Đăng ký tài khoản Khách hàng
exports.register = async (req, res) => {
    try {
        const { name, full_name, email, password, phone } = req.body;
        const displayName = full_name || name;

        if (!displayName || !email || !password) {
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

        // Kiểm tra email trùng lặp trong MySQL
        const [existingUsers] = await pool.query(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email này đã được sử dụng! Vui lòng chọn email khác."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [insertResult] = await pool.query(
            "INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, 'customer')",
            [displayName, email, phone || "", hashedPassword]
        );

        const newUser = {
            id: insertResult.insertId,
            name: displayName,
            full_name: displayName,
            email: email,
            phone: phone || "",
            role: "customer"
        };

        res.status(201).json({
            success: true,
            message: "Đăng ký tài khoản thành công!",
            user: newUser
        });

    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).json({
            success: false,
            message: "Đăng ký thất bại!",
            error: error.message
        });
    }
};

// Đăng nhập Khách hàng
exports.customerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email và mật khẩu!"
            });
        }

        const [users] = await pool.query(
            "SELECT id, full_name, email, phone, password, role FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng!"
            });
        }

        const user = users[0];

        // Hỗ trợ so sánh mật khẩu bcrypt mã hóa và chuỗi thuần (phù hợp test đồ án)
        let isPasswordCorrect = false;
        try {
            isPasswordCorrect = await bcrypt.compare(password, user.password);
        } catch {
            isPasswordCorrect = false;
        }

        if (!isPasswordCorrect && password === user.password) {
            isPasswordCorrect = true;
        }

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng!"
            });
        }

        const safeUser = {
            id: user.id,
            name: user.full_name,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone || "",
            role: user.role
        };

        res.json({
            success: true,
            message: "Đăng nhập Khách hàng thành công!",
            user: safeUser
        });

    } catch (error) {
        console.error("Lỗi đăng nhập khách hàng:", error);
        res.status(500).json({
            success: false,
            message: "Đăng nhập thất bại!",
            error: error.message
        });
    }
};

// Đăng nhập Kênh Người Bán (Shopee Seller Portal)
exports.sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập tài khoản Người bán và mật khẩu!"
            });
        }

        const [users] = await pool.query(
            "SELECT id, full_name, email, phone, password, role FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Tài khoản Người bán không tồn tại!"
            });
        }

        const user = users[0];

        // So sánh mật khẩu
        let isPasswordCorrect = false;
        try {
            isPasswordCorrect = await bcrypt.compare(password, user.password);
        } catch {
            isPasswordCorrect = false;
        }

        if (!isPasswordCorrect && password === user.password) {
            isPasswordCorrect = true;
        }

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Mật khẩu Người bán không đúng!"
            });
        }

        // Kiểm tra phân quyền Người Bán: seller, shop, admin
        if (user.role !== 'seller' && user.role !== 'shop' && user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Truy cập bị từ chối! Tài khoản của bạn là Khách hàng, không có quyền vào Kênh Người Bán."
            });
        }

        const safeUser = {
            id: user.id,
            name: user.full_name,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone || "",
            role: user.role
        };

        res.json({
            success: true,
            message: "Đăng nhập Kênh Người Bán thành công!",
            user: safeUser
        });

    } catch (error) {
        console.error("Lỗi đăng nhập người bán:", error);
        res.status(500).json({
            success: false,
            message: "Đăng nhập thất bại!",
            error: error.message
        });
    }
};
