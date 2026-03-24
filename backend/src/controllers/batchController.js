const Batch = require('../models/Batch');
const { pinJsonToIPFS } = require('../utils/ipfs');
const { ethers } = require('ethers');

exports.getMyBatches = async (req, res) => {
    try {
        // Tìm các lô hàng mà Nông dân này đã tham gia ghi nhật ký (hoặc là chủ nông trại)
        const batches = await Batch.find({ farmerId: req.user._id })
            .populate('productId')
            .sort({ createdAt: -1 });
        res.json(batches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createBatch = async (req, res) => {
    const { productId, harvestDate, quantity } = req.body;

    if (!productId || !harvestDate || !quantity) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin: productId, harvestDate, quantity' });
    }

    try {
        const batch = await Batch.create({
            farmerId: req.user._id, // Gán ID của người tạo
            productId,
            harvestDate,
            quantity,
            status: 'PENDING'
        });
        res.status(201).json(batch);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi tạo lô hàng', error: err.message });
    }
};

exports.addLog = async (req, res) => {
    const { batchId } = req.params;
    const { action, location, imageUrl } = req.body;

    if (!action || !location) {
        return res.status(400).json({ message: 'Thiếu thông tin hành động (action) hoặc địa điểm (location)' });
    }

    try {
        const batch = await Batch.findById(batchId);

        if (!batch) return res.status(404).json({ message: 'Không tìm thấy lô hàng' });
        if (batch.status !== 'PENDING') return res.status(400).json({ message: 'Lô hàng đã khóa, không thể thêm nhật ký' });

        batch.logs.push({
            action,
            actorId: req.user._id,
            location,
            timestamp: new Date(),
            imageUrl: imageUrl || ""
        });

        await batch.save();
        res.json(batch);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi thêm nhật ký', error: err.message });
    }
};

exports.getPendingBatches = async (req, res) => {
    try {
        const batches = await Batch.find({ status: 'LOCKED' })
            .populate('productId')
            .populate('inspectorId', 'name email');
        res.json(batches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.pinToIPFS = async (req, res) => {
    const { batchId } = req.params;

    try {
        const batch = await Batch.findById(batchId).populate('productId');

        if (!batch || batch.status !== 'LOCKED') {
            return res.status(404).json({ message: 'Lô hàng không sẵn sàng để kiểm định' });
        }

        const dataToPin = {
            batchId: batch._id,
            product: batch.productId,
            harvestDate: batch.harvestDate,
            quantity: batch.quantity,
            logs: batch.logs
        };

        const pinResult = await pinJsonToIPFS({ pinataContent: dataToPin });

        batch.ipfsHash = pinResult.IpfsHash;
        batch.inspectorId = req.user._id; // Gắn ID người kiểm định lúc duyệt
        await batch.save();

        res.json({ success: true, ipfsHash: batch.ipfsHash });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi IPFS', error: err.message });
    }
};

exports.confirmMint = async (req, res) => {
    const { batchId } = req.params;
    const { tokenId, txHash } = req.body;

    try {
        const batch = await Batch.findById(batchId);
        if (!batch || !batch.ipfsHash) return res.status(400).json({ message: 'Dữ liệu chưa sẵn sàng (Chưa có ipfsHash)' });

        batch.status = 'MINTED';
        batch.tokenId = Number(tokenId);
        batch.txHash = txHash;

        await batch.save();
        res.json(batch);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái NFT', error: err.message });
    }
};

exports.lockBatch = async (req, res) => {
    const { batchId } = req.params;

    try {
        const batch = await Batch.findById(batchId);

        if (!batch) return res.status(404).json({ message: 'Không tìm thấy lô hàng' });

        // Kiểm tra quyền sở hữu
        if (batch.farmerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền thao tác trên lô hàng này' });
        }

        if (batch.status !== 'PENDING') {
            return res.status(400).json({ message: 'Lô hàng không ở trạng thái có thể khóa' });
        }

        // Chuyển trạng thái sang LOCKED (Chờ kiểm định)
        batch.status = 'LOCKED';
        await batch.save();

        res.json({ message: 'Đã gửi yêu cầu kiểm định thành công', batch });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi khóa lô hàng', error: err.message });
    }
};