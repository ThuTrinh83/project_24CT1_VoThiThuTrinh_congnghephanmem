const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middlewares/uploadMiddleware");
const { verifySeller } = require("../middlewares/authMiddleware");

// Upload file ảnh trực tiếp từ máy tính
router.post("/upload", upload.single("image"), productController.uploadImage);

// Lấy danh mục
router.get("/categories", productController.getCategories);

// Lấy danh sách sản phẩm & chi tiết
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

// Các thao tác quản lý sách (Kênh Người Bán)
router.post("/", verifySeller, productController.createProduct);
router.put("/:id", verifySeller, productController.updateProduct);
router.delete("/:id", verifySeller, productController.deleteProduct);

module.exports = router;
