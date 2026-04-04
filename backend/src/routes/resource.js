const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// ==========================================
// CÁC ROUTE CẦN QUYỀN NÔNG DÂN (WRITE)
// ==========================================
// Đảm bảo chỉ người đăng nhập và có role FARMER mới được thêm
router.post('/farms', verifyToken, requireRole('FARMER'), resourceController.addFarm);
router.post('/products', verifyToken, requireRole('FARMER'), resourceController.addProduct);

// ==========================================
// CÁC ROUTE TÌM KIẾM DÙNG CHUNG (READ)
// ==========================================
// Có thể mở cho tất cả User đăng nhập, hoặc thậm chí Public tùy logic nghiệp vụ của bạn
router.get('/products/search', verifyToken, resourceController.searchProducts);
router.get('/inspectors/search', verifyToken, resourceController.searchInspectors);

module.exports = router;