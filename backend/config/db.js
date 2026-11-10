const mysql = require("mysql2/promise");

// Cấu hình kết nối MySQL XAMPP (phpMyAdmin)
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "comichub_db",
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4"
});

// Kiểm tra kết nối khi khởi động
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("=================================================");
        console.log(" Đã kết nối thành công MySQL XAMPP (comichub_db)!");
        console.log("=================================================");
        connection.release();
    } catch (error) {
        console.warn("=================================================");
        console.warn(" CHƯA KẾT NỐI ĐƯỢC MYSQL XAMPP:", error.message);
        console.warn(" 👉 Hãy mở XAMPP Control Panel và bấm [Start] ở mục MySQL.");
        console.warn(" 👉 Import file database/comichub_db.sql vào phpMyAdmin nếu chưa tạo CSDL.");
        console.warn("=================================================");
    }
})();

module.exports = pool;
