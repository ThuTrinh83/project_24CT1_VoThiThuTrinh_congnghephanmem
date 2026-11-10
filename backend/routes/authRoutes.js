const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Đăng ký khách hàng
router.post("/register", authController.register);

// Đăng nhập khách hàng (Hỗ trợ cả /login và /customer-login)
router.post("/login", authController.customerLogin);
router.post("/customer-login", authController.customerLogin);

// Đăng nhập Kênh Người Bán (Hỗ trợ cả /seller/login và /seller-login)
router.post("/seller/login", authController.sellerLogin);
router.post("/seller-login", authController.sellerLogin);

module.exports = router;
