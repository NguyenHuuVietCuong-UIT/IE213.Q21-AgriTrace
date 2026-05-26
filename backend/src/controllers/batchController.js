const batchDao = require('../daos/batchDAO');
const { pinJsonToIPFS } = require('../utils/ipfs');
const { ethers } = require('ethers');

// ABI rút gọn chứa hàm updateShipping
const MINIMAL_ABI = [
    "function updateShipping(uint _tokenId, string memory _newIpfsHash) public",
    "event BatchUpdated(uint tokenId, string newIpfsHash)"
];

const batchController = {
    // ==========================================
    // LOGIC CHO NÔNG DÂN (FARMER)
    // ==========================================

    getMyBatches: async (req, res) => {
        try {
            // Lấy lô hàng của user đang đăng nhập thông qua DAO
            const batches = await batchDao.findByFarmer(req.user._id);
            return res.json(batches);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    createBatch: async (req, res) => {
        const { productId, harvestDate, quantity } = req.body;

        if (!productId || !harvestDate || !quantity) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin: productId, harvestDate, quantity' });
        }

        try {
            const batchData = {
                farmerId: req.user._id,
                productId,
                harvestDate,
                quantity,
                status: 'PENDING'
            };

            const batch = await batchDao.create(batchData);
            return res.status(201).json(batch);
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi khi tạo lô hàng', error: err.message });
        }
    },

    addLog: async (req, res) => {
        const { batchId } = req.params;
        const { action, location, imageUrl } = req.body;

        if (!action || !location) {
            return res.status(400).json({ message: 'Thiếu thông tin hành động (action) hoặc địa điểm (location)' });
        }

        try {
            // 1. Lấy và kiểm tra lô hàng
            const batch = await batchDao.findById(batchId);
            if (!batch) return res.status(404).json({ message: 'Không tìm thấy lô hàng' });
            if (batch.status !== 'PENDING') return res.status(400).json({ message: 'Lô hàng đã khóa, không thể thêm nhật ký' });

            // 2. Thêm nhật ký thông qua DAO
            const logData = {
                action,
                actorId: req.user._id,
                location,
                timestamp: new Date(),
                imageUrl: imageUrl || ""
            };
            const updatedBatch = await batchDao.pushLog(batchId, logData);

            return res.json(updatedBatch);
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi khi thêm nhật ký', error: err.message });
        }
    },

    lockBatch: async (req, res) => {
        const { batchId } = req.params;
        const { inspectorId } = req.body;

        try {
            const batch = await batchDao.findById(batchId);
            if (!batch) return res.status(404).json({ message: 'Không tìm thấy lô hàng' });

            // Kiểm tra quyền sở hữu và trạng thái
            if (batch.farmerId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Bạn không có quyền thao tác trên lô hàng này' });
            }
            if (batch.status !== 'PENDING') {
                return res.status(400).json({ message: 'Lô hàng không ở trạng thái có thể khóa' });
            }
            if (!inspectorId) {
                return res.status(400).json({ message: 'Vui lòng chỉ định người kiểm định (inspectorId)' });
            }

            // Gọi DAO cập nhật dữ liệu
            const updatedBatch = await batchDao.updateFields(batchId, {
                inspectorId: inspectorId,
                status: 'LOCKED'
            });

            return res.json({ message: 'Đã gửi yêu cầu kiểm định thành công', batch: updatedBatch });
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi khi khóa lô hàng', error: err.message });
        }
    },

    // ==========================================
    // LOGIC CHO NHÀ KIỂM ĐỊNH (INSPECTOR)
    // ==========================================

    getAllInspectorBatches: async (req, res) => {
        try {
            // Lấy TẤT CẢ lô hàng được giao cho Inspector này (bất kể trạng thái là LOCKED, MINTED hay REJECTED)
            const batches = await batchDao.findByInspector(req.user._id);
            return res.json(batches);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    getPendingBatches: async (req, res) => {
        try {
            const batches = await batchDao.findPendingByInspector(req.user._id);
            return res.json(batches);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // ==========================================
    // LOGIC TƯƠNG TÁC WEB3 & IPFS
    // ==========================================

    pinToIPFS: async (req, res) => {
        const { batchId } = req.params;

        try {
            const batch = await batchDao.findByIdWithProduct(batchId);
            if (!batch || batch.status !== 'LOCKED') {
                return res.status(404).json({ message: 'Lô hàng không sẵn sàng để kiểm định' });
            }

            // Gói dữ liệu để đưa lên IPFS
            const dataToPin = {
                batchId: batch._id,
                product: batch.productId,
                harvestDate: batch.harvestDate,
                quantity: batch.quantity,
                logs: batch.logs
            };

            const pinResult = await pinJsonToIPFS({ pinataContent: dataToPin });

            // Lưu Hash trả về vào DB thông qua DAO
            await batchDao.updateFields(batchId, { ipfsHash: pinResult.IpfsHash });

            return res.json({ success: true, ipfsHash: pinResult.IpfsHash });
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi IPFS', error: err.message });
        }
    },

    confirmMint: async (req, res) => {
        const { batchId } = req.params;
        const { tokenId, txHash } = req.body;

        try {
            const batch = await batchDao.findById(batchId);
            if (!batch || !batch.ipfsHash) {
                return res.status(400).json({ message: 'Dữ liệu chưa sẵn sàng (Chưa có ipfsHash)' });
            }

            // Cập nhật trạng thái Minted qua DAO
            const updatedBatch = await batchDao.updateFields(batchId, {
                status: 'MINTED',
                tokenId: Number(tokenId),
                txHash: txHash
            });

            return res.json(updatedBatch);
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái NFT', error: err.message });
        }
    },

    getBatchById: async (req, res) => {
        const { batchId } = req.params;
        try {
            // Dùng hàm findByIdWithProduct đã có sẵn trong batchDAO
            const batch = await batchDao.findByIdWithProduct(batchId);

            if (!batch) {
                return res.status(404).json({ message: 'Không tìm thấy lô hàng' });
            }

            return res.json(batch);
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi khi lấy thông tin lô hàng', error: err.message });
        }
    },

    updateShippingLog: async (req, res) => {
        const { batchId } = req.params;
        const { location, status } = req.body;

        // ==========================================
        // VALIDATION: Kiểm tra input đầu vào
        // ==========================================
        if (!location || typeof location !== 'string' || location.trim() === '') {
            return res.status(400).json({ message: 'Thiếu hoặc sai định dạng: location (String)' });
        }
        if (!status || typeof status !== 'string' || status.trim() === '') {
            return res.status(400).json({ message: 'Thiếu hoặc sai định dạng: status (String)' });
        }

        try {
            // 1. Kiểm tra trạng thái lô hàng
            const batch = await batchDao.findByIdWithProduct(batchId);
            if (!batch) {
                return res.status(404).json({ message: 'Lô hàng không tồn tại' });
            }
            if (batch.status !== 'MINTED') {
                return res.status(400).json({ message: 'Lô hàng chưa đúc NFT (status phải là MINTED)' });
            }
            if (!batch.tokenId) {
                return res.status(400).json({ message: 'Lô hàng chưa có tokenId' });
            }

            // 1.1 Kiểm tra quyền - Chỉ Inspector và Deliverer của batch này mới được sửa
            const isDeliverer = req.user.role === 'DELIVERER';
            const isOwnerInspector = batch.inspectorId && batch.inspectorId.toString() === req.user._id.toString();

            if (!isDeliverer && !isOwnerInspector) {
                return res.status(403).json({
                    message: 'Từ chối: Bạn không phải người vận chuyển, cũng không phải người kiểm định của lô hàng này.'
                });
            }

            // 2. Thêm log vận chuyển vào DB bằng DAO
            const logData = {
                action: status,
                location: location.trim(),
                timestamp: new Date()
            };

            // Chỉ gọi pushLog để thêm dữ liệu vào DB, không sử dụng kết quả trả về do DB chưa cập nhật đồng bộ bản ghi mới
            await batchDao.pushLog(batchId, logData);

            // ==========================================
            // FETCH LẠI BATCH MỚI NHẤT
            // ==========================================
            // Gọi lại hàm findByIdWithProduct để lấy batch đã chứa log vừa thêm và populate đầy đủ object product
            const newestBatch = await batchDao.findByIdWithProduct(batchId);

            // 3. Gom Data đầy đủ để Pin lại lên IPFS
            const dataToPin = {
                batchId: newestBatch._id,
                product: newestBatch.productId,
                harvestDate: newestBatch.harvestDate,
                quantity: newestBatch.quantity, // Đã bổ sung trường quantity
                logs: newestBatch.logs          // Mảng logs mới nhất chứa cả nhật ký canh tác và vận chuyển
            };
            const pinResult = await pinJsonToIPFS({ pinataContent: dataToPin });
            const newIpfsHash = pinResult.IpfsHash;

            // 4. Gọi Smart Contract bằng ethers.js
            // ==========================================
            const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
            const wallet = new ethers.Wallet(process.env.SYSTEM_PRIVATE_KEY, provider);
            const contract = new ethers.Contract(process.env.NFT_CONTRACT_ADDRESS, MINIMAL_ABI, wallet);

            const tx = await contract.updateShipping(newestBatch.tokenId, newIpfsHash);
            const receipt = await tx.wait();

            // 5. Cập nhật Hash IPFS mới vào DB thông qua DAO
            await batchDao.updateFields(batchId, {
                ipfsHash: newIpfsHash,
            });

            return res.json({
                success: true,
                message: 'Cập nhật vận chuyển lên Blockchain thành công!',
                newIpfsHash,
                txHash: receipt.transactionHash
            });
        } catch (err) {
            console.error("❌ Lỗi cập nhật vận chuyển:", err);
            return res.status(500).json({
                message: 'Lỗi hệ thống',
                error: err.message
            });
        }
    }
};

module.exports = batchController;