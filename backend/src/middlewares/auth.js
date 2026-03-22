const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware xác thực Token (JWT)
 * Kiểm tra xem người dùng đã đăng nhập chưa và token có hợp lệ không
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Kiểm tra header Authorization có đúng định dạng "Bearer <token>" không
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Thiếu hoặc sai định dạng mã xác thực (Authorization header)' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Giải mã token bằng JWT_SECRET trong file .env
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm người dùng trong Database dựa trên ID từ token
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại hoặc không có quyền truy cập' });
    }

    // Gán thông tin người dùng vào request để các hàm sau sử dụng
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
  }
};

/**
 * Middleware phân quyền theo vai trò (Role)
 * Ví dụ: requireRole('FARMER') hoặc requireRole('INSPECTOR')
 */
const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: 'Từ chối truy cập: Bạn không có quyền thực hiện hành động này' });
  }
  next();
};

module.exports = { verifyToken, requireRole };