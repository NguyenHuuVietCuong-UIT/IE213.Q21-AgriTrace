const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const { trackingLimiter } = require('../middlewares/auth');

// Khách vãng lai quét mã QR, không cần đăng nhập nhưng bị giới hạn tốc độ chống spam
router.get('/batches/:id', trackingLimiter, publicController.getBatchFromIPFS);

module.exports = router;