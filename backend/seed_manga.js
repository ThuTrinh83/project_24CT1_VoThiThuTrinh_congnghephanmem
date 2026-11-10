const { sql, poolPromise } = require('./config/db');

const mangaData = [
  {
    name: "One Piece - Tập 108: Sinh Mạng Khắp Thế Giới",
    author: "Eiichiro Oda",
    category_id: 1, // Shounen
    price: 25000,
    old_price: 30000,
    discount: 17,
    rating: 5.0,
    stock: 45,
    image: "/images/onepiece.jpg",
    description: "Trận chiến nảy lửa tại đảo Egghead giữa Luffy Băng Mũ Rơm cùng Tiến sĩ Vegapunk chống lại Ngũ Lão Tinh và Đô đốc Kizaru! Một chương lịch sử hé lộ bí mật về Thế kỷ Trống và vũ khí cổ đại."
  },
  {
    name: "Thám Tử Lừng Danh Conan - Tập 105",
    author: "Gosho Aoyama",
    category_id: 2, // Action / Trinh thám
    price: 28000,
    old_price: 35000,
    discount: 20,
    rating: 4.9,
    stock: 60,
    image: "",
    description: "Cuộc đối đầu kịch tính nghẹt thở giữa Conan và tổ chức Áo Đen. Những manh mối then chốt về nhân vật bí ẩn RUM bắt đầu được bóc tách."
  },
  {
    name: "Jujutsu Kaisen - Chú Thuật Hồi Chiến - Tập 25+26",
    author: "Gege Akutami",
    category_id: 1, // Shounen
    price: 68000,
    old_price: 85000,
    discount: 20,
    rating: 5.0,
    stock: 80,
    image: "/images/jujutsu-kaisen.jpg",
    description: "Trận đại chiến đỉnh cao thế kỷ giữa Chú thuật sư mạnh nhất Gojo Satoru và Vua nguyền hồn Ryomen Sukuna tại Shinjuku! Combo 2 tập đặc biệt tặng kèm Postcard hologram."
  },
  {
    name: "Spy x Family - Gia Đình Điệp Viên - Tập 12",
    author: "Tatsuya Endo",
    category_id: 3, // Fantasy / Hài hước
    price: 32000,
    old_price: 40000,
    discount: 20,
    rating: 4.9,
    stock: 55,
    image: "",
    description: "Cô bé Anya Forger với năng lực đọc suy nghĩ cùng điệp viên Hoàng Hôn Loid và sát thủ Yor bước vào kỳ nghỉ du thuyền đầy những tình huống dở khóc dở cười."
  },
  {
    name: "Chainsaw Man - Người Cưa - Tập 15",
    author: "Tatsuki Fujimoto",
    category_id: 1, // Shounen
    price: 36000,
    old_price: 45000,
    discount: 20,
    rating: 4.8,
    stock: 35,
    image: "",
    description: "Phần 2 tiếp tục câu chuyện ly kỳ về Quỷ Chiến Tranh Asa Mitaka và sự xuất hiện kỳ quặc của Denji tại trường cấp ba."
  },
  {
    name: "Blue Lock - Khóa Huấn Luyện Cầu Thủ - Tập 18",
    author: "Muneyuki Kaneshiro",
    category_id: 1, // Shounen / Thể thao
    price: 35000,
    old_price: 42000,
    discount: 17,
    rating: 4.9,
    stock: 40,
    image: "",
    description: "Dự án Blue Lock bước vào vòng giải đấu Neo Egoist League! Isagi Yoichi chạm trán gã quái vật Michael Kaiser của Bastard Munchen."
  },
  {
    name: "Doraemon - Truyện Dài - Tập 24: Nobita Ở Vương Quốc Gió",
    author: "Fujiko F. Fujio",
    category_id: 3, // Fantasy / Thiếu nhi
    price: 24000,
    old_price: 28000,
    discount: 14,
    rating: 5.0,
    stock: 70,
    image: "",
    description: "Chuyến phiêu lưu kỳ thú của nhóm bạn Nobita và chú rồng con Fuko đến xứ sở gió diệu kỳ chống lại thế lực bão tố tàn phá thế giới."
  },
  {
    name: "Oshi No Ko - Dưới Ánh Hào Quang - Tập 10",
    author: "Aka Akasaka",
    category_id: 2, // Drama
    price: 38000,
    old_price: 45000,
    discount: 16,
    rating: 4.8,
    stock: 28,
    image: "",
    description: "Bí mật đằng sau cái chết của thần tượng huyền thoại Hoshino Ai dần dần được Aqua hé lộ trong giới showbiz đầy toan tính và cạm bẫy."
  },
  {
    name: "Dragon Ball Super - 7 Viên Ngọc Rồng Siêu Cấp - Tập 22",
    author: "Akira Toriyama & Toyotarou",
    category_id: 1, // Shounen
    price: 28000,
    old_price: 35000,
    discount: 20,
    rating: 4.9,
    stock: 50,
    image: "",
    description: "Sự thức tỉnh sức mạnh tối thượng: Gohan Beast và Orange Piccolo hợp lực chống lại Quái vật Cell Max nhằm bảo vệ Trái Đất."
  },
  {
    name: "Tokyo Revengers - Chuyện Của Takemichi - Tập 31 (Tập Cuối)",
    author: "Ken Wakui",
    category_id: 2, // Action
    price: 35000,
    old_price: 42000,
    discount: 17,
    rating: 4.8,
    stock: 65,
    image: "",
    description: "Chặng đường du hành thời gian giải cứu bạn bè của Hanagaki Takemichi chính thức khép lại với cái kết viên mãn đầy cảm xúc cho Băng Tokyo Manji."
  },
  {
    name: "Haikyu!! - Vua Bóng Chuyền - Tập 45 (Bản Đặc Biệt)",
    author: "Haruichi Furudate",
    category_id: 1, // Thể thao
    price: 65000,
    old_price: 80000,
    discount: 19,
    rating: 5.0,
    stock: 35,
    image: "",
    description: "Trận đấu chuyên nghiệp đỉnh cao giữa Hinata Shoyo và Kageyama Tobio trên sân bóng thế giới. Bản in giới hạn kèm bộ sticker huy hiệu Karasuno."
  },
  {
    name: "Demon Slayer - Kimetsu No Yaiba - Họa Tập Chính Thức",
    author: "Koyoharu Gotouge",
    category_id: 2, // Action
    price: 135000,
    old_price: 168000,
    discount: 20,
    rating: 5.0,
    stock: 25,
    image: "/images/demon-slayer.jpg",
    description: "Tập tranh minh họa màu toàn bộ các nhân vật Sát Quỷ Đội, Thập Nhị Nguyệt Quỷ và những bản phác thảo chưa từng công bố của tác giả Gotouge."
  },
  {
    name: "Solo Leveling - Tôi Thăng Cấp Một Mình - Tập 8 (Bản Màu)",
    author: "Chugong & DUBU",
    category_id: 3, // Fantasy
    price: 120000,
    old_price: 150000,
    discount: 20,
    rating: 4.9,
    stock: 45,
    image: "/images/solo-leveling.jpg",
    description: "Sung Jin-woo chính thức thức tỉnh sức mạnh Hoàng Đế Bóng Tối, dẫn đầu đội quân bất tử nghênh chiến các Quân Chủ Hủy Diệt để bảo vệ nhân loại."
  },
  {
    name: "Genshin Impact - Tuyển Tập Truyện Tranh Chính Thức",
    author: "miHoYo",
    category_id: 3, // Fantasy
    price: 85000,
    old_price: 105000,
    discount: 19,
    rating: 4.8,
    stock: 30,
    image: "",
    description: "Hành trình khám phá vùng đất Teyvat của Nhà Lữ Hành cùng Paimon, hé lộ quá khứ của các nhân vật Mondstadt và Liyue."
  },
  {
    name: "Death Note - Quyển Sổ Tử Thần - Bản Complete Edition",
    author: "Tsugumi Ohba & Takeshi Obata",
    category_id: 2, // Trinh thám
    price: 245000,
    old_price: 290000,
    discount: 16,
    rating: 5.0,
    stock: 20,
    image: "",
    description: "Tuyệt phẩm đấu trí kinh điển giữa thiên tài Yagami Light (Kira) và thám tử huyền thoại L trong cuốn đại toàn thư dày hơn 2400 trang đóng hộp sang trọng."
  }
];

async function seed() {
  try {
    const pool = await poolPromise;
    console.log("Cập nhật lại ảnh bìa Manga trong SQL Server (loại bỏ hoàn toàn link ngẫu nhiên)...");

    for (let item of mangaData) {
      await pool.request()
        .input("name", sql.NVarChar, item.name)
        .input("author", sql.NVarChar, item.author)
        .input("price", sql.Decimal(18, 2), item.price)
        .input("oldPrice", sql.Decimal(18, 2), item.old_price)
        .input("discount", sql.Int, item.discount)
        .input("image", sql.NVarChar, item.image)
        .input("description", sql.NVarChar, item.description)
        .query(`
          UPDATE Products 
          SET author = @author, price = @price, old_price = @oldPrice, discount = @discount, image = @image, description = @description
          WHERE name = @name
        `);
    }

    console.log(" Hoàn tất cập nhật cơ sở dữ liệu Manga!");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi seed:", error);
    process.exit(1);
  }
}

seed();
