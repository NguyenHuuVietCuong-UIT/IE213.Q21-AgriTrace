const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

// ============================================================================
// NHÓM 1: MIDDLEWARE XÁC THỰC & PHÂN QUYỀN (AUTHENTICATION & AUTHORIZATION)
// ============================================================================

/**
 * [Auth] Middleware xác thực Token (JWT)
 * Nhiệm vụ: Kiểm tra tính hợp lệ của token, giải mã và gắn thông tin User vào Request.
 * Sử dụng bảo vệ các API cần đăng nhập (Farmer tạo lô hàng, Inspector kiểm định...)
 */
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 1. Kiểm tra header Authorization có tồn tại và đúng chuẩn "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Thiếu hoặc sai định dạng mã xác thực (Authorization header)' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Giải mã token bằng JWT_SECRET
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Truy vấn Database kiểm tra User có thực sự còn tồn tại không
        const user = await User.findById(payload.id);
        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại hoặc tài khoản đã bị xóa' });
        }

        // 4. Gán cục data user vào req để Controller phía sau sử dụng (req.user)
        req.user = user;

        // 5. Cho phép đi tiếp vào Controller
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết phiên đăng nhập' });
    }
};

/**
 * [Auth] Middleware phân quyền theo vai trò (Role-based Access Control)
 * Nhiệm vụ: Chặn những user không đủ thẩm quyền (VD: Farmer không được phép duyệt lô hàng).
 * Lưu ý: BẮT BUỘC phải gọi sau middleware verifyToken (vì cần req.user)
 * * @param {String} role - Vai trò yêu cầu (VD: 'FARMER', 'INSPECTOR', 'ADMIN')
 */
const requireRole = (role) => {
    return (req, res, next) => {
        // Kiểm tra req.user (được gắn từ verifyToken) và khớp Role
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({
                message: `Từ chối truy cập: Chỉ tài khoản cấp [${role}] mới có quyền thực hiện hành động này.`
            });
        }
        next();
    };
};

// ============================================================================
// NHÓM 2: MIDDLEWARE BẢO MẬT & KIỂM SOÁT LƯU LƯỢNG (SECURITY & TRAFFIC CONTROL)
// ============================================================================

/**
 * [Security] Middleware chống Spam (Rate Limiter) cho API Public
 * Nhiệm vụ: Giới hạn số lần gọi API từ 1 địa chỉ IP trong một khoảng thời gian.
 * Sử dụng bảo vệ hệ thống/RPC Node khỏi các cuộc tấn công DDoS vào trang Tracking.
 */
const trackingLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // Khung thời gian: 1 phút
    max: 20,                 // Giới hạn: Tối đa 20 requests / 1 IP / 1 phút
    standardHeaders: true,   // Trả về thông tin rate limit trong header (RateLimit-*)
    legacyHeaders: false,    // Tắt các header X-RateLimit-* cũ
    message: {
        success: false,
        message: 'Bạn đã quét mã QR hoặc truy xuất dữ liệu quá nhiều lần. Hệ thống tạm khóa để chống Spam, vui lòng thử lại sau 1 phút.'
    }
});

module.exports = {
    verifyToken,
    requireRole,
    trackingLimiter
};