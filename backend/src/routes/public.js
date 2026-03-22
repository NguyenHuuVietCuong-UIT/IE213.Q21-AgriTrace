const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Route lấy thông tin hiển thị Timeline
router.get('/batches/:id', publicController.getBatchPublicDetail);

// Route kiểm chứng Blockchain (Nút "Verify" trên giao diện của Member 4/5)
router.get('/batches/:id/verify-blockchain', publicController.verifyOnChain);

module.exports = router;