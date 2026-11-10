/**
 * Middleware phân quyền cho Khách hàng và Người bán (Seller)
 */

// Middleware kiểm tra quyền truy cập Kênh Người Bán (Shop / Seller / Admin)
function verifySeller(req, res, next) {
    const userRole = (req.headers['x-user-role'] || '').toLowerCase();
    const userId = req.headers['x-user-id'];

    if (!userRole) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập! Vui lòng đăng nhập vào Kênh Người Bán."
        });
    }

    if (userRole !== 'seller' && userRole !== 'shop' && userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Tài khoản của bạn là Khách hàng, không có quyền truy cập Kênh Người Bán!"
        });
    }

    req.user = { id: userId, role: userRole };
    next();
}

// Middleware kiểm tra tài khoản Khách hàng
function verifyCustomer(req, res, next) {
    const userRole = (req.headers['x-user-role'] || '').toLowerCase();
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Vui lòng đăng nhập để thực hiện chức năng này!"
        });
    }

    req.user = { id: userId, role: userRole || 'customer' };
    next();
}

module.exports = {
    verifySeller,
    verifyCustomer
};
