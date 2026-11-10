const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifySeller } = require("../middlewares/authMiddleware");

// Tạo đơn hàng COD mới
router.post("/", orderController.createOrder);

// Lấy danh sách đơn hàng cho Kênh Người Bán
router.get("/seller/all", verifySeller, orderController.getAllOrdersForSeller);

// Cập nhật trạng thái đơn hàng (Duyệt đơn: Chờ xác nhận -> Đang giao -> Đã giao / Đã hủy)
router.put("/:id/status", verifySeller, orderController.updateOrderStatus);

// Lấy danh sách đơn hàng của khách
router.get("/user/:userId", orderController.getUserOrders);
router.get("/:userId", orderController.getUserOrders);

module.exports = router;
