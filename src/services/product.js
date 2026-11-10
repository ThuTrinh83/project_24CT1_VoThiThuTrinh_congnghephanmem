import { request } from './api';
import { generateBookCoverSvg } from './bookCoverGenerator';

// Dữ liệu mẫu phong phú Manga / Comic chính thức để luôn sẵn sàng hiển thị
export const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "One Piece - Tập 108: Sinh Mạng Khắp Thế Giới",
    author: "Eiichiro Oda",
    category: "Shounen Manga",
    category_id: 1,
    price: 25000,
    oldPrice: 30000,
    discount: 17,
    rating: 5.0,
    stock: 45,
    volume: "Tập 108",
    badge: "Mới",
    tag: "Xu hướng 📈",
    sold: 432,
    image: "/images/onepiece.jpg",
    description: "Trận chiến nảy lửa tại đảo Egghead giữa Luffy Băng Mũ Rơm cùng Tiến sĩ Vegapunk chống lại Ngũ Lão Tinh và Đô đốc Kizaru! Một chương lịch sử hé lộ bí mật về Thế kỷ Trống và vũ khí cổ đại."
  },
  {
    id: 2,
    name: "Thám Tử Lừng Danh Conan - Tập 105",
    author: "Gosho Aoyama",
    category: "Action & Trinh Thám",
    category_id: 2,
    price: 28000,
    oldPrice: 35000,
    discount: 20,
    rating: 4.9,
    stock: 60,
    volume: "Tập 105",
    badge: "Độc Quyền",
    tag: "Bestseller 🔥",
    sold: 580,
    image: "",
    description: "Cuộc đối đầu kịch tính nghẹt thở giữa Conan và tổ chức Áo Đen. Những manh mối then chốt về nhân vật bí ẩn RUM bắt đầu được bóc tách."
  },
  {
    id: 3,
    name: "Jujutsu Kaisen - Chú Thuật Hồi Chiến - Tập 25+26",
    author: "Gege Akutami",
    category: "Shounen Manga",
    category_id: 1,
    price: 68000,
    oldPrice: 85000,
    discount: 20,
    rating: 5.0,
    stock: 80,
    volume: "Tập 25+26",
    badge: "Sắp Có Hàng",
    tag: "HOT ⚡",
    sold: 1250,
    image: "/images/jujutsu-kaisen.jpg",
    description: "Trận đại chiến đỉnh cao thế kỷ giữa Chú thuật sư mạnh nhất Gojo Satoru và Vua nguyền hồn Ryomen Sukuna tại Shinjuku! Combo 2 tập đặc biệt tặng kèm Postcard hologram."
  },
  {
    id: 4,
    name: "Spy x Family - Gia Đình Điệp Viên - Tập 12",
    author: "Tatsuya Endo",
    category: "Fantasy & Isekai",
    category_id: 3,
    price: 32000,
    oldPrice: 40000,
    discount: 20,
    rating: 4.9,
    stock: 55,
    volume: "Tập 12",
    badge: "Mới",
    tag: "Xu hướng 📈",
    sold: 389,
    image: "",
    description: "Cô bé Anya Forger với năng lực đọc suy nghĩ cùng điệp viên Hoàng Hôn Loid và sát thủ Yor bước vào kỳ nghỉ du thuyền đầy những tình huống dở khóc dở cười."
  },
  {
    id: 5,
    name: "Chainsaw Man - Người Cưa - Tập 15",
    author: "Tatsuki Fujimoto",
    category: "Shounen Manga",
    category_id: 1,
    price: 36000,
    oldPrice: 45000,
    discount: 20,
    rating: 4.8,
    stock: 35,
    volume: "Tập 15",
    badge: "Độc Quyền",
    tag: "HOT ⚡",
    sold: 295,
    image: "",
    description: "Phần 2 tiếp tục câu chuyện ly kỳ về Quỷ Chiến Tranh Asa Mitaka và sự xuất hiện kỳ quặc của Denji tại trường cấp ba."
  },
  {
    id: 6,
    name: "Blue Lock - Khóa Huấn Luyện Cầu Thủ - Tập 18",
    author: "Muneyuki Kaneshiro",
    category: "Shounen Manga",
    category_id: 1,
    price: 35000,
    oldPrice: 42000,
    discount: 17,
    rating: 4.9,
    stock: 40,
    volume: "Tập 18",
    badge: "Mới",
    tag: "Xu hướng 📈",
    sold: 512,
    image: "",
    description: "Dự án Blue Lock bước vào vòng giải đấu Neo Egoist League! Isagi Yoichi chạm trán gã quái vật Michael Kaiser của Bastard Munchen."
  },
  {
    id: 7,
    name: "Doraemon - Truyện Dài - Tập 24: Vương Quốc Gió",
    author: "Fujiko F. Fujio",
    category: "Fantasy & Isekai",
    category_id: 3,
    price: 24000,
    oldPrice: 28000,
    discount: 14,
    rating: 5.0,
    stock: 70,
    volume: "Tập 24",
    badge: "Kinh Điển",
    tag: "Yêu thích ❤️",
    sold: 890,
    image: "",
    description: "Chuyến phiêu lưu kỳ thú của nhóm bạn Nobita và chú rồng con Fuko đến xứ sở gió diệu kỳ chống lại thế lực bão tố tàn phá thế giới."
  },
  {
    id: 8,
    name: "Oshi No Ko - Dưới Ánh Hào Quang - Tập 10",
    author: "Aka Akasaka",
    category: "Action & Trinh Thám",
    category_id: 2,
    price: 38000,
    oldPrice: 45000,
    discount: 16,
    rating: 4.8,
    stock: 28,
    volume: "Tập 10",
    badge: "Mới",
    tag: "Bestseller 🔥",
    sold: 340,
    image: "",
    description: "Bí mật đằng sau cái chết của thần tượng huyền thoại Hoshino Ai dần dần được Aqua hé lộ trong giới showbiz đầy toan tính và cạm bẫy."
  },
  {
    id: 9,
    name: "Dragon Ball Super - 7 Viên Ngọc Rồng - Tập 22",
    author: "Akira Toriyama",
    category: "Shounen Manga",
    category_id: 1,
    price: 28000,
    oldPrice: 35000,
    discount: 20,
    rating: 4.9,
    stock: 50,
    volume: "Tập 22",
    badge: "Bestseller",
    tag: "HOT ⚡",
    sold: 620,
    image: "",
    description: "Sự thức tỉnh sức mạnh tối thượng: Gohan Beast và Orange Piccolo hợp lực chống lại Quái vật Cell Max nhằm bảo vệ Trái Đất."
  },
  {
    id: 10,
    name: "Tokyo Revengers - Chuyện Của Takemichi - Tập 31",
    author: "Ken Wakui",
    category: "Action & Trinh Thám",
    category_id: 2,
    price: 35000,
    oldPrice: 42000,
    discount: 17,
    rating: 4.8,
    stock: 65,
    volume: "Tập 31",
    badge: "Độc Quyền",
    tag: "Tập Cuối 🏁",
    sold: 780,
    image: "",
    description: "Chặng đường du hành thời gian giải cứu bạn bè của Hanagaki Takemichi chính thức khép lại với cái kết viên mãn đầy cảm xúc."
  },
  {
    id: 11,
    name: "Haikyu!! - Vua Bóng Chuyền - Tập 45 (Bản Đặc Biệt)",
    author: "Haruichi Furudate",
    category: "Shounen Manga",
    category_id: 1,
    price: 65000,
    oldPrice: 80000,
    discount: 19,
    rating: 5.0,
    stock: 35,
    volume: "Tập 45",
    badge: "Sắp Có Hàng",
    tag: "Đặc Biệt ✨",
    sold: 410,
    image: "",
    description: "Trận đấu chuyên nghiệp đỉnh cao giữa Hinata Shoyo và Kageyama Tobio trên sân bóng thế giới. Bản in giới hạn kèm bộ sticker huy hiệu Karasuno."
  },
  {
    id: 12,
    name: "Demon Slayer - Kimetsu No Yaiba - Họa Tập Chính Thức",
    author: "Koyoharu Gotouge",
    category: "Action & Trinh Thám",
    category_id: 2,
    price: 135000,
    oldPrice: 168000,
    discount: 20,
    rating: 5.0,
    stock: 25,
    volume: "Artbook",
    badge: "Độc Quyền",
    tag: "Bestseller 🔥",
    sold: 290,
    image: "/images/demon-slayer.jpg",
    description: "Tập tranh minh họa màu toàn bộ các nhân vật Sát Quỷ Đội, Thập Nhị Nguyệt Quỷ và những bản phác thảo chưa từng công bố của tác giả Gotouge."
  },
  {
    id: 13,
    name: "Solo Leveling - Tôi Thăng Cấp Một Mình - Tập 8",
    author: "Chugong & DUBU",
    category: "Manhwa / Webtoon",
    category_id: 4,
    price: 120000,
    oldPrice: 150000,
    discount: 20,
    rating: 4.9,
    stock: 45,
    volume: "Tập 8",
    badge: "Mới",
    tag: "Manhwa 🌟",
    sold: 670,
    image: "/images/solo-leveling.jpg",
    description: "Sung Jin-woo chính thức thức tỉnh sức mạnh Hoàng Đế Bóng Tối, dẫn đầu đội quân bất tử nghênh chiến các Quân Chủ Hủy Diệt."
  },
  {
    id: 14,
    name: "Genshin Impact - Tuyển Tập Truyện Tranh Chính Thức",
    author: "miHoYo",
    category: "Fantasy & Isekai",
    category_id: 3,
    price: 85000,
    oldPrice: 105000,
    discount: 19,
    rating: 4.8,
    stock: 30,
    volume: "Tập 1",
    badge: "Mới",
    tag: "Game Manga 🎮",
    sold: 310,
    image: "",
    description: "Hành trình khám phá vùng đất Teyvat của Nhà Lữ Hành cùng Paimon, hé lộ quá khứ của các nhân vật Mondstadt và Liyue."
  },
  {
    id: 15,
    name: "Death Note - Quyển Sổ Tử Thần - Bản Complete Edition",
    author: "Tsugumi Ohba",
    category: "Action & Trinh Thám",
    category_id: 2,
    price: 245000,
    oldPrice: 290000,
    discount: 16,
    rating: 5.0,
    stock: 20,
    volume: "Trọn Bộ",
    badge: "Kinh Điển",
    tag: "Bestseller 🔥",
    sold: 520,
    image: "",
    description: "Tuyệt phẩm đấu trí kinh điển giữa thiên tài Yagami Light (Kira) và thám tử huyền thoại L trong cuốn đại toàn thư dày hơn 2400 trang đóng hộp sang trọng."
  }
];

export const FALLBACK_CATEGORIES = [
  { id: 1, name: "Shounen Manga" },
  { id: 2, name: "Action & Trinh Thám" },
  { id: 3, name: "Fantasy & Isekai" },
  { id: 4, name: "Manhwa / Webtoon" },
  { id: 5, name: "Light Novel & Sách Chữ" }
];

// Hàm bọc bổ sung các thông tin Volume, Badge, Tag và tạo ảnh bìa SVG chuẩn xác
export function enrichProductData(p) {
  let volume = p.volume;
  if (!volume && p.name) {
    const match = p.name.match(/Tập\s+[\d+-]+/i);
    if (match) volume = match[0];
  }
  if (!volume) {
    volume = `Tập ${(p.id % 25) + 1}`;
  }

  let badge = p.badge;
  if (!badge) {
    const badges = ["Mới", "Sắp Có Hàng", "Độc Quyền", "Bestseller"];
    badge = badges[p.id % badges.length];
  }

  let tag = p.tag;
  if (!tag) {
    const tags = ["Xu hướng 📈", "HOT ⚡", "Bestseller 🔥", "Mới ✨"];
    tag = tags[p.id % tags.length];
  }

  let sold = p.sold || (((p.id * 37) % 380) + 45);

  let image = p.image;
  // Tuyệt đối không dùng ảnh Unsplash/Picsum ngẫu nhiên -> Chuyển thành SVG Manga Cover Generator
  if (!image || image.includes('unsplash.com') || image.includes('picsum.photos')) {
    image = generateBookCoverSvg({ ...p, volume });
  }

  return {
    ...p,
    volume,
    badge,
    tag,
    sold,
    image,
  };
}

// 1. Lấy danh sách sản phẩm (có fallback dữ liệu mẫu phong phú)
export async function getProducts(categoryId = 'all', search = '') {
  try {
    const params = new URLSearchParams();
    if (categoryId && categoryId !== 'all') params.append('categoryId', categoryId);
    if (search && search.trim()) params.append('search', search.trim());

    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await request(`/products${query}`);

    if (data.success && data.products && data.products.length > 0) {
      return {
        success: true,
        products: data.products.map(enrichProductData),
      };
    }
  } catch (err) {
    console.warn("Backend không phản hồi, sử dụng dữ liệu mẫu Manga ComicHub:", err.message);
  }

  // Fallback lọc dữ liệu mẫu
  let result = [...FALLBACK_PRODUCTS];
  if (categoryId && categoryId !== 'all') {
    result = result.filter(p => p.category_id === Number(categoryId) || p.category === categoryId);
  }
  if (search && search.trim()) {
    const kw = search.trim().toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(kw) || p.author.toLowerCase().includes(kw));
  }

  return {
    success: true,
    products: result.map(enrichProductData),
  };
}

// 2. Lấy danh mục sách
export async function getCategories() {
  try {
    const data = await request('/products/categories');
    if (data.success && data.categories && data.categories.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Lỗi nạp danh mục, dùng danh mục mẫu:", err.message);
  }

  return {
    success: true,
    categories: FALLBACK_CATEGORIES,
  };
}

// 3. Lấy chi tiết sách
export async function getProductById(id) {
  try {
    const data = await request(`/products/${id}`);
    if (data.success && data.product) {
      return {
        success: true,
        product: enrichProductData(data.product),
      };
    }
  } catch (err) {
    console.warn("Lỗi nạp chi tiết, dùng fallback:", err.message);
  }

  const found = FALLBACK_PRODUCTS.find(p => p.id === Number(id)) || FALLBACK_PRODUCTS[0];
  return {
    success: true,
    product: enrichProductData(found),
  };
}

// 4. Tải file ảnh thực tế từ máy tính lên Server (File Upload - FormData)
export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  return await request('/products/upload', {
    method: 'POST',
    body: formData,
  });
}

// 5. Thêm sách mới (Seller)
export async function createProduct(productData) {
  return await request('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
}

// 6. Cập nhật thông tin sách (Seller)
export async function updateProduct(id, productData) {
  return await request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
}

// 7. Xóa sách (Seller)
export async function deleteProduct(id) {
  return await request(`/products/${id}`, {
    method: 'DELETE',
  });
}

// 8. Đánh giá sách
export async function getProductReviews(productId) {
  try {
    return await request(`/reviews/${productId}`);
  } catch {
    return { success: true, reviews: [] };
  }
}

export async function addProductReview(productId, reviewData) {
  return await request(`/reviews/${productId}`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
}
