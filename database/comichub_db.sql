-- ========================================================
-- CƠ SỞ DỮ LIỆU COMICHUB E-COMMERCE (MYSQL XAMPP / PHPMYADMIN)
-- ========================================================

CREATE DATABASE IF NOT EXISTS `comichub_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `comichub_db`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. BẢNG USERS (TÀI KHOẢN KHÁCH HÀNG & NGƯỜI BÁN)
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(20) DEFAULT '',
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'seller') NOT NULL DEFAULT 'customer',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG CATEGORIES (DANH MỤC SÁCH)
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG BOOKS (DANH MỤC TRUYỆN TRANH & SÁCH)
CREATE TABLE `books` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NULL,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(100) DEFAULT 'Đang cập nhật',
  `episode_badge` VARCHAR(50) DEFAULT 'Tập 1',
  `status_badge` VARCHAR(50) DEFAULT 'Mới',
  `price` DECIMAL(12, 2) NOT NULL,
  `original_price` DECIMAL(12, 2) DEFAULT 0,
  `discount_percent` INT DEFAULT 0,
  `stock` INT DEFAULT 50,
  `sold_count` INT DEFAULT 0,
  `image_url` TEXT,
  `description` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG ORDERS (ĐƠN HÀNG COD)
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_code` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(20) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `note` TEXT,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'COD',
  `status` ENUM('pending', 'shipping', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG ORDER_ITEMS (CHI TIẾT ĐƠN HÀNG)
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `book_id` INT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- INSERT DỮ LIỆU MẪU (SEED DATA)
-- ========================================================

-- A. TÀI KHOẢN MẪU (MẬT KHẨU BCRYPT & TEST CẢ CHUỖI GỐC)
-- Seller: seller@comichub.vn / seller123456 (hoặc shop@comichub.vn / shop123456)
-- Customer: customer@comichub.vn / customer123456
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `password`, `role`) VALUES
(1, 'Chủ Kênh Người Bán ComicHub', 'seller@comichub.vn', '0905123456', '$2b$10$PsOX1rE2ViYcby3kNpzrcuxIbzuFUps6FW9Mh.ochATqonVWnE53K', 'seller'),
(2, 'ComicHub Shop Official', 'shop@comichub.vn', '0905666777', '$2b$10$QhdpD6ZU//J0imyIexKkteQJmR0bnyDDSaoVWlOQ34GgTzRZF.RMS', 'seller'),
(3, 'Nguyễn Văn Khách Hàng', 'customer@comichub.vn', '0912345678', '$2b$10$Xngi.u1eRVtEOhu29sQ60ujdACr8KglzsOeLGWdqZ1W3YzO8kKz3i', 'customer'),
(4, 'Võ Thị Thu Trinh', 'truynhzhen@gmail.com', '0987654321', '$2b$10$Xngi.u1eRVtEOhu29sQ60ujdACr8KglzsOeLGWdqZ1W3YzO8kKz3i', 'customer');

-- B. DANH MỤC SÁCH
INSERT INTO `categories` (`id`, `name`, `slug`) VALUES
(1, 'Manga - Comic', 'manga-comic'),
(2, 'Light Novel', 'light-novel'),
(3, 'Manhwa - Webtoon', 'manhwa-webtoon'),
(4, 'Sách Kỹ Năng', 'sach-ky-nang'),
(5, 'Văn Học', 'van-hoc');

-- C. DANH SÁCH 16 BỘ TRUYỆN TRANH & SÁCH BẢN QUYỀN
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `episode_badge`, `status_badge`, `price`, `original_price`, `discount_percent`, `stock`, `sold_count`, `image_url`, `description`) VALUES
(1, 1, 'One Piece - Tập 108: Sinh Mạng Khắp Thế Giới', 'Eiichiro Oda', 'Tập 108', 'Mới', 25000, 30000, 17, 45, 432, '/images/onepiece.jpg', 'Trận chiến nảy lửa tại đảo Egghead giữa Luffy Băng Mũ Rơm cùng Tiến sĩ Vegapunk chống lại Ngũ Lão Tinh và Đô đốc Kizaru! Một chương lịch sử hé lộ bí mật về Thế kỷ Trống và vũ khí cổ đại.'),
(2, 1, 'Thám Tử Lừng Danh Conan - Tập 105', 'Gosho Aoyama', 'Tập 105', 'Độc Quyền', 28000, 35000, 20, 60, 580, '', 'Cuộc đối đầu kịch tính nghẹt thở giữa Conan và tổ chức Áo Đen. Những manh mối then chốt về nhân vật bí ẩn RUM bắt đầu được bóc tách.'),
(3, 1, 'Jujutsu Kaisen - Chú Thuật Hồi Chiến - Tập 25+26', 'Gege Akutami', 'Tập 25+26', 'Sắp Có Hàng', 68000, 85000, 20, 80, 1250, '/images/jujutsu-kaisen.jpg', 'Trận đại chiến đỉnh cao thế kỷ giữa Chú thuật sư mạnh nhất Gojo Satoru và Vua nguyền hồn Ryomen Sukuna tại Shinjuku! Combo 2 tập đặc biệt tặng kèm Postcard hologram.'),
(4, 1, 'Spy x Family - Gia Đình Điệp Viên - Tập 12', 'Tatsuya Endo', 'Tập 12', 'Mới', 32000, 40000, 20, 55, 389, '', 'Cô bé Anya Forger với năng lực đọc suy nghĩ cùng điệp viên Hoàng Hôn Loid và sát thủ Yor bước vào kỳ nghỉ du thuyền đầy những tình huống dở khóc dở cười.'),
(5, 1, 'Chainsaw Man - Người Cưa - Tập 15', 'Tatsuki Fujimoto', 'Tập 15', 'Độc Quyền', 36000, 45000, 20, 35, 295, '', 'Phần 2 tiếp tục câu chuyện ly kỳ về Quỷ Chiến Tranh Asa Mitaka và sự xuất hiện kỳ quặc của Denji tại trường cấp ba.'),
(6, 1, 'Blue Lock - Khóa Huấn Luyện Cầu Thủ - Tập 18', 'Muneyuki Kaneshiro', 'Tập 18', 'Mới', 35000, 42000, 17, 40, 512, '', 'Dự án Blue Lock bước vào vòng giải đấu Neo Egoist League! Isagi Yoichi chạm trán gã quái vật Michael Kaiser của Bastard Munchen.'),
(7, 1, 'Doraemon - Truyện Dài - Tập 24: Nobita Ở Vương Quốc Gió', 'Fujiko F. Fujio', 'Tập 24', 'Mới', 24000, 28000, 14, 70, 890, '', 'Chuyến phiêu lưu kỳ thú của nhóm bạn Nobita và chú rồng con Fuko đến xứ sở gió diệu kỳ chống lại thế lực bão tố tàn phá thế giới.'),
(8, 1, 'Oshi No Ko - Dưới Ánh Hào Quang - Tập 10', 'Aka Akasaka', 'Tập 10', 'Mới', 38000, 45000, 16, 28, 340, '', 'Bí mật đằng sau cái chết của thần tượng huyền thoại Hoshino Ai dần dần được Aqua hé lộ trong giới showbiz đầy toan tính và cạm bẫy.'),
(9, 1, 'Dragon Ball Super - 7 Viên Ngọc Rồng Siêu Cấp - Tập 22', 'Akira Toriyama', 'Tập 22', 'Độc Quyền', 28000, 35000, 20, 50, 620, '', 'Sự thức tỉnh sức mạnh tối thượng: Gohan Beast và Orange Piccolo hợp lực chống lại Quái vật Cell Max nhằm bảo vệ Trái Đất.'),
(10, 1, 'Tokyo Revengers - Chuyện Của Takemichi - Tập 31 (Tập Cuối)', 'Ken Wakui', 'Tập 31', 'Độc Quyền', 35000, 42000, 17, 65, 780, '', 'Chặng đường du hành thời gian giải cứu bạn bè của Hanagaki Takemichi chính thức khép lại với cái kết viên mãn đầy cảm xúc cho Băng Tokyo Manji.'),
(11, 1, 'Haikyu!! - Vua Bóng Chuyền - Tập 45 (Bản Đặc Biệt)', 'Haruichi Furudate', 'Tập 45', 'Sắp Có Hàng', 65000, 80000, 19, 35, 410, '', 'Trận đấu chuyên nghiệp đỉnh cao giữa Hinata Shoyo và Kageyama Tobio trên sân bóng thế giới. Bản in giới hạn kèm bộ sticker huy hiệu Karasuno.'),
(12, 1, 'Demon Slayer - Kimetsu No Yaiba - Họa Tập Chính Thức', 'Koyoharu Gotouge', 'Artbook', 'Độc Quyền', 135000, 168000, 20, 25, 290, '/images/demon-slayer.jpg', 'Tập tranh minh họa màu toàn bộ các nhân vật Sát Quỷ Đội, Thập Nhị Nguyệt Quỷ và những bản phác thảo chưa từng công bố của tác giả Gotouge.'),
(13, 3, 'Solo Leveling - Tôi Thăng Cấp Một Mình - Tập 8 (Bản Màu)', 'Chugong & DUBU', 'Tập 8', 'Mới', 120000, 150000, 20, 45, 670, '/images/solo-leveling.jpg', 'Sung Jin-woo chính thức thức tỉnh sức mạnh Hoàng Đế Bóng Tối, dẫn đầu đội quân bất tử nghênh chiến các Quân Chủ Hủy Diệt để bảo vệ nhân loại.'),
(14, 2, 'Genshin Impact - Tuyển Tập Truyện Tranh Chính Thức', 'miHoYo', 'Tập 1', 'Mới', 85000, 105000, 19, 30, 310, '', 'Hành trình khám phá vùng đất Teyvat của Nhà Lữ Hành cùng Paimon, hé lộ quá khứ của các nhân vật Mondstadt và Liyue.'),
(15, 1, 'Death Note - Quyển Sổ Tử Thần - Bản Complete Edition', 'Tsugumi Ohba', 'Trọn Bộ', 'Mới', 245000, 290000, 16, 20, 520, '', 'Tuyệt phẩm đấu trí kinh điển giữa thiên tài Yagami Light (Kira) và thám tử huyền thoại L trong cuốn đại toàn thư dày hơn 2400 trang đóng hộp sang trọng.'),
(16, 4, 'Đắc Nhân Tâm (Khổ Lớn Tái Bản Mới)', 'Dale Carnegie', 'Bản Mới', 'Mới', 88000, 110000, 20, 50, 410, '', 'Cuốn sách nghệ thuật thu phục lòng người kinh điển mọi thời đại, trang bị kỹ năng giao tiếp và phát triển bản thân hiệu quả.');

-- D. ĐƠN HÀNG COD MẪU
INSERT INTO `orders` (`id`, `order_code`, `user_id`, `customer_name`, `customer_phone`, `shipping_address`, `note`, `total_amount`, `payment_method`, `status`, `created_at`) VALUES
(1, 'DH-00001', 3, 'Nguyễn Văn Khách Hàng', '0912345678', 'Số 123 Đường Hải Phòng, Quận Hải Châu, Đà Nẵng', 'Giao giờ hành chính, gọi trước khi đến', 93000, 'COD', 'pending', NOW() - INTERVAL 2 HOUR),
(2, 'DH-00002', 4, 'Võ Thị Thu Trinh', '0987654321', 'K70/22 Nguyễn Tri Phương, Thanh Khê, Đà Nẵng', 'Thanh toán tiền mặt khi nhận hàng', 155000, 'COD', 'shipping', NOW() - INTERVAL 1 DAY),
(3, 'DH-00003', 3, 'Nguyễn Văn Khách Hàng', '0912345678', 'Số 123 Đường Hải Phòng, Quận Hải Châu, Đà Nẵng', 'Gói cẩn thận giúp shop nhé', 245000, 'COD', 'completed', NOW() - INTERVAL 3 DAY);

-- E. CHI TIẾT SẢN PHẨM TRONG ĐƠN HÀNG
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `price`) VALUES
(1, 1, 1, 1, 25000),
(2, 1, 3, 1, 68000),
(3, 2, 12, 1, 135000),
(4, 3, 15, 1, 245000);
