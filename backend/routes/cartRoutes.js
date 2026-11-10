const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// Lấy giỏ hàng
router.get("/:userId", cartController.getCart);

// Thêm vào giỏ
router.post("/:userId", cartController.addToCart);

// Cập nhật số lượng
router.put("/:userId/:productId", cartController.updateQuantity);

// Xóa khỏi giỏ
router.delete("/:userId/:productId", cartController.removeFromCart);

module.exports = router;
