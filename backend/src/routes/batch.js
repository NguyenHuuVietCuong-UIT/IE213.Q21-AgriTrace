const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Routes cho Farmer (Web2)
router.get('/mine', verifyToken, requireRole('FARMER'), batchController.getMyBatches);
router.post('/', verifyToken, requireRole('FARMER'), batchController.createBatch);
router.post('/:batchId/logs', verifyToken, requireRole('FARMER'), batchController.addLog);
router.put('/:batchId/lock', verifyToken, requireRole('FARMER'), batchController.lockBatch);

// Routes cho Inspector (Web3)
router.get('/pending', verifyToken, requireRole('INSPECTOR'), batchController.getPendingBatches);
router.post('/:batchId/pin', verifyToken, requireRole('INSPECTOR'), batchController.pinToIPFS);
router.post('/:batchId/mint', verifyToken, requireRole('INSPECTOR'), batchController.confirmMint);
router.get('/inspector-all', verifyToken, requireRole('INSPECTOR'), batchController.getAllInspectorBatches);

// Route cho Cập nhật Vận chuyển (Stream 5) - Hệ thống tự động
// POST /api/batches/:batchId/shipping
router.post('/:batchId/shipping', verifyToken, requireRole(['INSPECTOR', 'DELIVERER']), batchController.updateShippingLog);

// Thêm route lấy chi tiết 1 lô hàng để DELIVERER tìm kiếm
router.get('/:batchId', verifyToken, batchController.getBatchById);

module.exports = router;