/**
 * UTILS.JS - CÁC HÀM TIỆN ÍCH DÙNG CHUNG
 */
import { generateBookCoverSvg } from './bookCoverGenerator';

// Chuyển đổi an toàn bất kỳ định dạng giá (chuỗi '168.000 đ', '45000', v.v.) sang Number nguyên thủy
export function cleanNumericPrice(price) {
  if (price === undefined || price === null || price === '') return 0;
  if (typeof price === 'number') return isNaN(price) ? 0 : Math.round(price);
  const clean = Number(String(price).replace(/[^0-9]/g, ''));
  return isNaN(clean) ? 0 : clean;
}

// Định dạng giá tiền Việt Nam (VNĐ) chuẩn Quốc tế & chống lỗi hiển thị 0đ
export function formatPrice(price) {
  const numeric = cleanNumericPrice(price);
  if (numeric === 0) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(numeric) + ' đ';
}

// Định dạng ngày giờ hiển thị
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Xử lý link ảnh bìa Manga: Ưu tiên ảnh thật & tự động tạo bìa SVG chuẩn khớp 100% tên truyện
export function getImageUrl(imagePath, product = null) {
  // Nếu là data URI SVG đã tạo
  if (imagePath && imagePath.startsWith('data:image/')) {
    return imagePath;
  }

  // Nếu là ảnh upload thực tế từ Kênh Người Bán
  if (imagePath && imagePath.includes('/uploads/products/')) {
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return imagePath.startsWith('http') ? imagePath : `http://localhost:3000${cleanPath}`;
  }

  // Nếu là ảnh trong thư mục public/images/
  if (imagePath && (imagePath.startsWith('/images/') || imagePath.startsWith('images/'))) {
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  }

  // Nếu ảnh là link ngẫu nhiên từ Unsplash / Picsum hoặc bị trống -> Tạo ảnh bìa Manga SVG chuẩn 100%
  if (!imagePath || imagePath.includes('unsplash.com') || imagePath.includes('picsum.photos')) {
    return generateBookCoverSvg(product || { name: 'Manga' });
  }

  // Nếu là link ảnh trực tiếp hợp lệ khác
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  return generateBookCoverSvg(product || { name: 'Manga' });
}

// Tính phần trăm giảm giá
export function calculateDiscountPercent(price, oldPrice) {
  const cleanP = cleanNumericPrice(price);
  const cleanOld = cleanNumericPrice(oldPrice);
  if (!cleanOld || cleanOld <= cleanP) return 0;
  return Math.round(((cleanOld - cleanP) / cleanOld) * 100);
}
