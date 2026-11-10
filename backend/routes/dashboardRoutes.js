const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { verifySeller } = require("../middlewares/authMiddleware");

// Thống kê doanh thu, đơn hàng cho Bảng điều khiển Người bán
router.get("/stats", verifySeller, dashboardController.getDashboardStats);

module.exports = router;
