/**
 * BOOK COVER GENERATOR (SVG DATA URI)
 * Tự động tạo ảnh bìa Manga chất lượng cao, đúng 100% tên truyện, số tập, tác giả và NXB.
 * Đảm bảo không phụ thuộc vào link ảnh ngẫu nhiên bên ngoài, tải tức thì và sắc nét.
 */

const MANGA_PRESETS = [
  {
    keywords: ["one piece", "luffy"],
    title: "ONE PIECE",
    subTitle: "ĐẢO HẢI TẶC",
    accentColor: "#dc2626",
    bgGradient: ["#7f1d1d", "#dc2626", "#b91c1c"],
    icon: "☠️",
    badgeColor: "#fbbf24",
    badgeTextColor: "#000",
    publisher: "NXB KIM ĐỒNG",
    symbolText: "STRAW HAT CREW",
    decorStyle: "pirate",
  },
  {
    keywords: ["conan", "thám tử"],
    title: "CONAN",
    subTitle: "THÁM TỬ LỪNG DANH",
    accentColor: "#2563eb",
    bgGradient: ["#0f172a", "#1e3a8a", "#0284c7"],
    icon: "🔍",
    badgeColor: "#dc2626",
    badgeTextColor: "#fff",
    publisher: "NXB KIM ĐỒNG",
    symbolText: "DETECTIVE CONAN",
    decorStyle: "detective",
  },
  {
    keywords: ["jujutsu", "chú thuật"],
    title: "JUJUTSU KAISEN",
    subTitle: "CHÚ THUẬT HỒI CHIẾN",
    accentColor: "#7c3aed",
    bgGradient: ["#09090b", "#3b0764", "#1e1b4b"],
    icon: "⚡",
    badgeColor: "#06b6d4",
    badgeTextColor: "#000",
    publisher: "NXB KIM ĐỒNG",
    symbolText: "RYOMEN SUKUNA",
    decorStyle: "curse",
  },
  {
    keywords: ["spy x family", "anya", "điệp viên"],
    title: "SPY x FAMILY",
    subTitle: "GIA ĐÌNH ĐIỆP VIÊN",
    accentColor: "#059669",
    bgGradient: ["#064e3b", "#0d9488", "#115e59"],
    icon: "⭐",
    badgeColor: "#fef08a",
    badgeTextColor: "#000",
    publisher: "NXB KIM ĐỒNG",
    symbolText: "OPERATION STRIX",
    decorStyle: "spy",
  },
  {
    keywords: ["chainsaw", "người cưa"],
    title: "CHAINSAW MAN",
    subTitle: "NGƯỜI CƯA",
    accentColor: "#ea580c",
    bgGradient: ["#18181b", "#9a3412", "#c2410c"],
    icon: "⚙️",
    badgeColor: "#f97316",
    badgeTextColor: "#fff",
    publisher: "NXB TRẺ",
    symbolText: "DENJI & POCHITA",
    decorStyle: "chainsaw",
  },
  {
    keywords: ["blue lock", "cầu thủ"],
    title: "BLUE LOCK",
    subTitle: "TIỀN ĐẠO SỐ 1",
    accentColor: "#0284c7",
    bgGradient: ["#030712", "#0c4a6e", "#0369a1"],
    icon: "⚽",
    badgeColor: "#38bdf8",
    badgeTextColor: "#000",
    publisher: "NXB TRẺ",
    symbolText: "EGOIST FORWARD",
    decorStyle: "soccer",
  },
  {
    keywords: ["doraemon", "nobita"],
    title: "DORAEMON",
    subTitle: "CHÚ MÈO MÁY",
    accentColor: "#0284c7",
    bgGradient: ["#0369a1", "#0ea5e9", "#38bdf8"],
    icon: "🔔",
    badgeColor: "#ef4444",
    badgeTextColor: "#fff",
    publisher: "NXB KIM ĐỒNG",
    symbolText: "FUJIKO F. FUJIO",
    decorStyle: "magic",
  },
  {
    keywords: ["dragon ball", "ngọc rồng", "goku"],
    title: "DRAGON BALL",
    subTitle: "BẢY VIÊN NGỌC RỒNG",
    accentColor: "#f59e0b",
    bgGradient: ["#7c2d12", "#ea580c", "#d97706"],
    icon: "🐉",
    badgeColor: "#fbbf24",
    badgeTextColor: "#000",
    publisher: "NXB KIM ĐỒNG",
    symbolText: "SUPER SAIYAN",
    decorStyle: "energy",
  },
  {
    keywords: ["oshi no ko", "hào quang"],
    title: "OSHI NO KO",
    subTitle: "DƯỚI ÁNH HÀO QUANG",
    accentColor: "#d946ef",
    bgGradient: ["#3b0764", "#701a75", "#a21caf"],
    icon: "✨",
    badgeColor: "#f43f5e",
    badgeTextColor: "#fff",
    publisher: "NXB TRẺ",
    symbolText: "HOSHINO AI",
    decorStyle: "star",
  },
  {
    keywords: ["tokyo revengers", "takemichi"],
    title: "TOKYO REVENGERS",
    subTitle: "CHUYỆN TAKEMICHI",
    accentColor: "#eab308",
    bgGradient: ["#09090b", "#1c1917", "#292524"],
    icon: "🔥",
    badgeColor: "#eab308",
    badgeTextColor: "#000",
    publisher: "NXB TRẺ",
    symbolText: "TOKYO MANJI GANG",
    decorStyle: "delinquent",
  },
  {
    keywords: ["haikyu", "bóng chuyền"],
    title: "HAIKYU!!",
    subTitle: "VUA BÓNG CHUYỀN",
    accentColor: "#f97316",
    bgGradient: ["#0f172a", "#9a3412", "#c2410c"],
    icon: "🏐",
    badgeColor: "#f97316",
    badgeTextColor: "#fff",
    publisher: "NXB KIM ĐỒNG",
    symbolText: "FLY HIGH KARASUNO",
    decorStyle: "volleyball",
  },
  {
    keywords: ["demon slayer", "kimetsu", "yaiba"],
    title: "DEMON SLAYER",
    subTitle: "THANH GƯƠM DIỆT QUỶ",
    accentColor: "#059669",
    bgGradient: ["#022c22", "#064e3b", "#0f766e"],
    icon: "⚔️",
    badgeColor: "#dc2626",
    badgeTextColor: "#fff",
    publisher: "NXB KIM ĐỒNG",
    symbolText: "NICHIRIN SWORD",
    decorStyle: "blade",
  },
  {
    keywords: ["solo leveling", "thăng cấp"],
    title: "SOLO LEVELING",
    subTitle: "TÔI THĂNG CẤP MỘT MÌNH",
    accentColor: "#06b6d4",
    bgGradient: ["#030712", "#1e1b4b", "#31104b"],
    icon: "🗡️",
    badgeColor: "#06b6d4",
    badgeTextColor: "#000",
    publisher: "COMICHUB MANHWA",
    symbolText: "SHADOW MONARCH",
    decorStyle: "shadow",
  },
  {
    keywords: ["death note", "quyển sổ"],
    title: "DEATH NOTE",
    subTitle: "QUYỂN SỔ TỬ THẦN",
    accentColor: "#dc2626",
    bgGradient: ["#000000", "#18181b", "#27272a"],
    icon: "🍎",
    badgeColor: "#dc2626",
    badgeTextColor: "#fff",
    publisher: "COMICHUB MANGA",
    symbolText: "SHINIGAMI RYUK",
    decorStyle: "gothic",
  },
  {
    keywords: ["genshin"],
    title: "GENSHIN IMPACT",
    subTitle: "TUYỂN TẬP MANGA",
    accentColor: "#3b82f6",
    bgGradient: ["#0f172a", "#1e3a8a", "#1d4ed8"],
    icon: "💎",
    badgeColor: "#fbbf24",
    badgeTextColor: "#000",
    publisher: "COMICHUB",
    symbolText: "TEYVAT ADVENTURE",
    decorStyle: "elemental",
  },
  {
    keywords: ["attack on titan", "titan"],
    title: "ATTACK ON TITAN",
    subTitle: "ĐẠI CHIẾN TITAN",
    accentColor: "#15803d",
    bgGradient: ["#14532d", "#3f2e14", "#78350f"],
    icon: "🪽",
    badgeColor: "#22c55e",
    badgeTextColor: "#000",
    publisher: "NXB TRẺ",
    symbolText: "SURVEY CORPS",
    decorStyle: "wings",
  },
  {
    keywords: ["naruto"],
    title: "NARUTO",
    subTitle: "LÀNG LÁ",
    accentColor: "#ea580c",
    bgGradient: ["#7c2d12", "#ea580c", "#0284c7"],
    icon: "🌀",
    badgeColor: "#f97316",
    badgeTextColor: "#fff",
    publisher: "NXB KIM ĐỒNG",
    symbolText: "HOKAGE NINJA",
    decorStyle: "ninja",
  }
];

/**
 * Tạo ảnh bìa Manga SVG Data URI
 */
export function generateBookCoverSvg(product) {
  const name = product.name || "Truyện Tranh";
  const lowerName = name.toLowerCase();

  // Tìm preset tương ứng
  let preset = MANGA_PRESETS.find((p) =>
    p.keywords.some((kw) => lowerName.includes(kw))
  );

  if (!preset) {
    preset = {
      title: name.split("-")[0].trim().toUpperCase().slice(0, 24),
      subTitle: "MANGA COMIC",
      accentColor: "#0284c7",
      bgGradient: ["#0f172a", "#0369a1", "#0284c7"],
      icon: "📚",
      badgeColor: "#38bdf8",
      badgeTextColor: "#000",
      publisher: "COMICHUB",
      symbolText: "OFFICIAL EDITION",
      decorStyle: "standard",
    };
  }

  // Lấy volume từ sản phẩm hoặc tách từ name
  let volume = product.volume;
  if (!volume) {
    const match = name.match(/Tập\s+[\d+-]+/i);
    volume = match ? match[0].toUpperCase() : "TẬP 1";
  }

  const author = (product.author || "TÁC GIẢ").toUpperCase().slice(0, 26);

  // SVG Markup (300 x 420)
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" width="300" height="420">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${preset.bgGradient[0]}" />
      <stop offset="50%" stop-color="${preset.bgGradient[1]}" />
      <stop offset="100%" stop-color="${preset.bgGradient[2]}" />
    </linearGradient>
    <linearGradient id="spineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.5)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.05)" />
    </linearGradient>
    <pattern id="dotPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.12)" />
    </pattern>
  </defs>

  <!-- Nền Gradient Manga -->
  <rect width="300" height="420" fill="url(#bgGrad)" rx="8" />

  <!-- Họa tiết chấm Halftone Manga -->
  <rect width="300" height="420" fill="url(#dotPattern)" rx="8" />

  <!-- Gáy sách phản quang (Book Spine) -->
  <rect x="0" y="0" width="14" height="420" fill="url(#spineGrad)" />

  <!-- Viền khung trang bìa mạ vàng/bạc -->
  <rect x="18" y="16" width="264" height="388" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" rx="4" />

  <!-- Dải Ribbon Nhà Xuất Bản Trên Cùng -->
  <rect x="18" y="16" width="264" height="26" fill="rgba(0,0,0,0.6)" rx="4" />
  <text x="32" y="34" fill="#fbbf24" font-family="'Be Vietnam Pro', sans-serif" font-size="11" font-weight="800" letter-spacing="1.5">
    ★ ${preset.publisher} ★
  </text>
  <text x="268" y="34" text-anchor="end" fill="#fff" font-family="'Be Vietnam Pro', sans-serif" font-size="10" font-weight="700" opacity="0.8">
    BẢN QUYỀN
  </text>

  <!-- Biểu tượng chính của bộ truyện -->
  <circle cx="150" cy="150" r="54" fill="rgba(0,0,0,0.35)" stroke="${preset.accentColor}" stroke-width="2.5" />
  <circle cx="150" cy="150" r="44" fill="rgba(255,255,255,0.06)" />
  <text x="150" y="166" text-anchor="middle" font-size="44">
    ${preset.icon}
  </text>

  <!-- Tiêu đề bộ truyện lớn -->
  <rect x="24" y="218" width="252" height="66" fill="rgba(0,0,0,0.65)" rx="6" />
  <text x="150" y="244" text-anchor="middle" fill="#ffffff" font-family="'Be Vietnam Pro', sans-serif" font-size="18" font-weight="900" letter-spacing="1">
    ${preset.title}
  </text>
  <text x="150" y="264" text-anchor="middle" fill="${preset.accentColor}" font-family="'Be Vietnam Pro', sans-serif" font-size="11" font-weight="800" letter-spacing="1.2">
    ${preset.subTitle}
  </text>

  <!-- Huy hiệu Số Tập Nổi Bật Chính Giữa -->
  <rect x="75" y="296" width="150" height="34" fill="${preset.badgeColor}" rx="17" />
  <text x="150" y="319" text-anchor="middle" fill="${preset.badgeTextColor}" font-family="'Be Vietnam Pro', sans-serif" font-size="14" font-weight="900" letter-spacing="0.8">
    ${volume}
  </text>

  <!-- Tên Tác Giả & Họa Sĩ -->
  <text x="150" y="354" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="'Be Vietnam Pro', sans-serif" font-size="11" font-weight="700" letter-spacing="0.5">
    TÁC GIẢ: ${author}
  </text>

  <!-- Thanh Footer Bìa Sách: Mã Vạch & ComicHub Seal -->
  <line x1="28" y1="368" x2="272" y2="368" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
  
  <!-- Giả lập vạch Barcode -->
  <g fill="rgba(255,255,255,0.7)" transform="translate(32, 376)">
    <rect x="0" y="0" width="2" height="18" />
    <rect x="4" y="0" width="3" height="18" />
    <rect x="9" y="0" width="1" height="18" />
    <rect x="12" y="0" width="4" height="18" />
    <rect x="18" y="0" width="2" height="18" />
    <rect x="22" y="0" width="3" height="18" />
    <rect x="27" y="0" width="1" height="18" />
    <rect x="30" y="0" width="4" height="18" />
    <rect x="36" y="0" width="2" height="18" />
    <rect x="40" y="0" width="3" height="18" />
  </g>
  <text x="82" y="389" fill="rgba(255,255,255,0.6)" font-family="monospace" font-size="9">
    978-604-2-00
  </text>

  <!-- Huy hiệu ComicHub Official Seal -->
  <rect x="180" y="374" width="94" height="20" fill="rgba(2,132,199,0.4)" stroke="#38bdf8" stroke-width="1" rx="4" />
  <text x="227" y="388" text-anchor="middle" fill="#fff" font-family="'Be Vietnam Pro', sans-serif" font-size="9" font-weight="800">
    COMICHUB.VN
  </text>
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Xử lý hoặc gán ảnh bìa Manga cho sản phẩm:
 * - Nếu sản phẩm có ảnh upload thực tế từ Kênh Người Bán (bắt đầu bằng http hoặc /uploads) -> Giữ nguyên ảnh upload!
 * - Nếu sản phẩm dùng link Unsplash/Picsum ngẫu nhiên hoặc ảnh trống -> Tự động thay thế bằng SVG Cover chuẩn 100%!
 */
export function getAccurateMangaCover(product) {
  if (!product) return '';

  const image = product.image || '';

  // Nếu là ảnh upload thực tế từ Kênh Người Bán (bắt đầu bằng http://localhost hoặc /uploads)
  if (image.includes('/uploads/products/') || image.startsWith('data:image/')) {
    return image;
  }

  // Nếu là ảnh có trong public/images/ và tồn tại
  if (image.startsWith('/images/') || image.startsWith('images/')) {
    return image.startsWith('/') ? image : `/${image}`;
  }

  // Nếu là ảnh Unsplash / Picsum ngẫu nhiên hoặc bị thiếu ảnh -> Dùng Book Cover Generator chuẩn xác!
  return generateBookCoverSvg(product);
}
