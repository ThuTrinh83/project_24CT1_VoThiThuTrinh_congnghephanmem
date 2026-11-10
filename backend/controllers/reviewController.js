// Controller Đánh giá sản phẩm
const productReviews = new Map();

exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = productReviews.get(String(productId)) || [];
        res.json({ success: true, reviews });
    } catch (error) {
        console.error("Lỗi lấy đánh giá:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy đánh giá" });
    }
};

exports.addReview = async (req, res) => {
    try {
        const { userId, userName, rating, comment } = req.body;
        const { productId } = req.params;

        if (!rating || !comment) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập số sao và nội dung nhận xét!" });
        }

        const pId = String(productId);
        const reviews = productReviews.get(pId) || [];
        reviews.unshift({
            id: Date.now(),
            userId: userId || 1,
            userName: userName || "Độc giả ComicHub",
            rating: Number(rating) || 5,
            comment: comment.trim(),
            date: new Date().toLocaleDateString("vi-VN")
        });
        productReviews.set(pId, reviews);

        res.json({ success: true, message: "Đánh giá sách thành công!" });
    } catch (error) {
        console.error("Lỗi gửi đánh giá:", error);
        res.status(500).json({ success: false, message: "Lỗi gửi đánh giá" });
    }
};
