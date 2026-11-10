const express = require("express");
const cors = require("cors");
const path = require("path");

// Khởi tạo ứng dụng Express
const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cung cấp thư mục tĩnh để truy cập ảnh upload từ client
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import các Module Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Đăng ký các API Routes chuẩn RESTful
app.use("/api/auth", authRoutes);
app.use("/api/books", productRoutes); // Endpoint chuẩn đề tài Sách
app.use("/api/products", productRoutes); // Hỗ trợ tương thích song song
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reviews", reviewRoutes);

// Endpoint tắt danh mục và auth nhanh
const productController = require("./controllers/productController");
const authController = require("./controllers/authController");
app.get("/api/categories", productController.getCategories);
app.post("/api/register", authController.register);
app.post("/api/login", authController.customerLogin);

// Kiểm tra hoạt động server
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "ComicHub Bookstore Full-Stack API (MySQL XAMPP) đang hoạt động mượt mà!",
        database: "comichub_db",
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Xử lý lỗi tập trung
app.use((err, req, res, _next) => {
    console.error("Server Error:", err.stack);
    res.status(500).json({
        success: false,
        message: err.message || "Đã xảy ra lỗi nội bộ trên máy chủ!"
    });
});

// Khởi động Server
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(` ComicHub Backend (MySQL XAMPP) đang chạy tại:`);
    console.log(` 👉 http://localhost:${PORT}`);
    console.log(` API Books: http://localhost:${PORT}/api/books`);
    console.log(` API Products: http://localhost:${PORT}/api/products`);
    console.log(` Thư mục lưu ảnh: http://localhost:${PORT}/uploads/products/`);
    console.log(`=================================================`);
});