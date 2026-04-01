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
        // Lọc các lô hàng có inspectorId trùng với tài khoản Inspector đang đăng nhập
        const batches = await Batch.find({ inspectorId: req.user._id })
            .populate('productId')
            .populate('inspectorId', 'name email')
            .sort({ updatedAt: -1 }); // Sắp xếp lô hàng mới cập nhật lên đầu

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
    // Lấy thêm inspectorId do Nông dân gửi lên từ Frontend khi bấm khóa lô hàng
    const { inspectorId } = req.body;

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

        if (!inspectorId) {
            return res.status(400).json({ message: 'Vui lòng chỉ định người kiểm định (inspectorId) cho lô hàng này' });
        }

        // Gán Inspector và Chuyển trạng thái sang LOCKED (Chờ kiểm định)
        batch.inspectorId = inspectorId;
        batch.status = 'LOCKED';
        await batch.save();

        res.json({ message: 'Đã gửi yêu cầu kiểm định thành công', batch });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi khóa lô hàng', error: err.message });
    }
};

// ABI rút gọn chứa hàm updateShipping
const MINIMAL_ABI = [
    "function updateShipping(uint _tokenId, string memory _newIpfsHash) public"
];

exports.updateShippingLog = async (req, res) => {
    const { batchId } = req.params;
    const { location, status } = req.body; // Dữ liệu vận chuyển mới

    try {
        const batch = await Batch.findById(batchId).populate('productId');
        if (!batch || batch.status !== 'MINTED') {
            return res.status(400).json({ message: 'Lô hàng chưa đúc NFT hoặc không tồn tại' });
        }

        // 1. Thêm log vận chuyển vào DB
        batch.logs.push({
            action: status,
            actorId: null, // Hệ thống tự cập nhật
            location: location,
            timestamp: new Date()
        });
        await batch.save();

        // 2. Gom toàn bộ cục Data mới để Pin lại lên IPFS
        const dataToPin = {
            batchId: batch._id,
            product: batch.productId,
            harvestDate: batch.harvestDate,
            logs: batch.logs // Lúc này logs đã có thêm bước vận chuyển
        };
        const pinResult = await pinJsonToIPFS({ pinataContent: dataToPin });
        const newIpfsHash = pinResult.IpfsHash;

        // 3. Backend tự động gọi Smart Contract
        // Khởi tạo provider từ RPC URL (Sepolia)
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

        // Khởi tạo ví từ Private Key (Ví này sẽ trả tiền Gas)
        const wallet = new ethers.Wallet(process.env.SYSTEM_PRIVATE_KEY, provider);

        // Kết nối contract
        const contract = new ethers.Contract(process.env.SMART_CONTRACT_ADDRESS, MINIMAL_ABI, wallet);

        // Gọi hàm update trên Blockchain
        const tx = await contract.updateShipping(batch.tokenId, newIpfsHash);
        await tx.wait(); // Đợi block được đào

        // 4. Lưu lại hash mới vào DB
        batch.ipfsHash = newIpfsHash;
        await batch.save();

        res.json({ success: true, message: 'Cập nhật vận chuyển lên Blockchain thành công!', newIpfsHash });

    } catch (err) {
        console.error("Lỗi cập nhật:", err);
        res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
    }
};