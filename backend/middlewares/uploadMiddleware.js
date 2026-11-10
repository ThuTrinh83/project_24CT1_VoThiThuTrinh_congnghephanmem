const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục lưu ảnh tồn tại
const uploadDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ file ảnh trên đĩa cứng
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Đặt tên file: book-[timestamp]-[random].[ext]
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `book-${uniqueSuffix}${ext}`);
    }
});

// Bộ lọc chỉ cho phép tải lên file hình ảnh (jpg, png, webp, jpeg, gif)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận các định dạng ảnh: JPEG, JPG, PNG, WEBP, GIF!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Giới hạn kích thước ảnh 10MB
    },
    fileFilter: fileFilter
});

module.exports = upload;
