const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Lấy đánh giá của 1 sản phẩm
router.get("/:productId", reviewController.getProductReviews);

// Thêm đánh giá
router.post("/:productId", reviewController.addReview);

module.exports = router;
