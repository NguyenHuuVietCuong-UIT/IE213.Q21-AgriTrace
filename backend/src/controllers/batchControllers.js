const Batch = require('../models/Batch');
const { pinJsonToIPFS } = require('../utils/ipfs');
const { ethers } = require('ethers');

// 1. Lấy danh sách lô hàng của chính nông dân
exports.getMyBatches = async (req, res) => {
    try {
        const batches = await Batch.find({ farmer: req.user._id }).sort({ createdAt: -1 });
        res.json(batches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Nông dân tạo lô hàng mới
exports.createBatch = async (req, res) => {
    const { cropType, name, estimatedQuantity } = req.body;
    if (!cropType || !name || !estimatedQuantity) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    const batch = await Batch.create({
        farmer: req.user._id,
        cropType,
        name,
        estimatedQuantity
    });
    res.status(201).json(batch);
};

// 3. Nông dân thêm nhật ký canh tác (logs)
exports.addLog = async (req, res) => {
    const { batchId } = req.params;
    const { activity, notes, imageUrl } = req.body;

    const batch = await Batch.findOne({ _id: batchId, farmer: req.user._id });
    if (!batch) return res.status(404).json({ message: 'Không tìm thấy lô hàng' });
    if (batch.status !== 'PENDING') return res.status(400).json({ message: 'Lô hàng đã khóa, không thể thêm nhật ký' });

    batch.logs.push({ activity, notes, imageUrl });
    await batch.save();
    res.json(batch);
};

// 4. Nhà kiểm định lấy danh sách lô hàng chờ duyệt (LOCKED)
exports.getPendingBatches = async (req, res) => {
    const batches = await Batch.find({ status: 'LOCKED' }).populate('farmer', 'phone');
    res.json(batches);
};

// 5. Đẩy dữ liệu lô hàng lên IPFS (Pinata)
exports.pinToIPFS = async (req, res) => {
    const { batchId } = req.params;
    const batch = await Batch.findById(batchId).populate('farmer', 'phone');

    if (!batch || batch.status !== 'LOCKED') {
        return res.status(404).json({ message: 'Lô hàng không sẵn sàng để kiểm định' });
    }

    const data = {
        batchId: batch._id,
        cropType: batch.cropType,
        name: batch.name,
        logs: batch.logs,
        farmerPhone: batch.farmer.phone
    };

    try {
        const pinResult = await pinJsonToIPFS({ pinataContent: data });
        batch.ipfsLink = `ipfs://${pinResult.IpfsHash}`;
        await batch.save();
        res.json({ success: true, ipfsLink: batch.ipfsLink });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi IPFS', error: err.message });
    }
};

// 6. Cập nhật trạng thái sau khi đúc NFT thành công
exports.confirmMint = async (req, res) => {
    const { batchId } = req.params;
    const { tokenId, txHash } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch || !batch.ipfsLink) return res.status(400).json({ message: 'Dữ liệu chưa sẵn sàng' });

    batch.status = 'MINTED';
    batch.tokenId = tokenId;
    batch.txHash = txHash;
    await batch.save();
    res.json(batch);
};