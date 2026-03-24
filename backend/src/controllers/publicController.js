const Batch = require('../models/Batch');
const Product = require('../models/Product');
const Farm = require('../models/Farm');
const { ethers } = require('ethers');

// 1. Lấy chi tiết lô hàng công khai (dùng cho trang Tracking khi quét QR)
exports.getBatchPublicDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Truy vấn lồng cực sâu để lấy thông tin Lô hàng -> Sản phẩm -> Nông trại -> Chủ nông trại
        const batch = await Batch.findById(id)
            .populate({
                path: 'productId',
                populate: {
                    path: 'farmId',
                    populate: { path: 'ownerId', select: 'name email' }
                }
            })
            .populate('inspectorId', 'name email walletAddress');

        if (!batch) return res.status(404).json({ message: 'Không tìm thấy thông tin lô hàng' });

        // Trả về dữ liệu đã được gộp chuẩn xác để Frontend vẽ Timeline
        res.json({
            id: batch._id,
            product: batch.productId, // Chứa thông tin tên sản phẩm, mô tả, hình đại diện
            harvestDate: batch.harvestDate,
            quantity: batch.quantity,
            status: batch.status,
            logs: batch.logs,         // Chứa mảng nhật ký canh tác (có hình ảnh)
            ipfsHash: batch.ipfsHash,
            tokenId: batch.tokenId,
            txHash: batch.txHash,
            inspector: batch.inspectorId,
            createdAt: batch.createdAt
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi truy xuất dữ liệu', error: err.message });
    }
};

// 2. Kiểm chứng dữ liệu trực tiếp từ Blockchain
exports.verifyOnChain = async (req, res) => {
    const { id } = req.params;

    try {
        const batch = await Batch.findById(id);

        if (!batch || batch.status !== 'MINTED') {
            return res.status(400).json({ message: 'Lô hàng chưa được đúc NFT để kiểm chứng' });
        }

        const rpcUrl = process.env.ETH_RPC_URL;
        const contractAddress = process.env.NFT_CONTRACT_ADDRESS;

        if (!rpcUrl || !contractAddress) {
            return res.status(500).json({ message: 'Thiếu cấu hình kết nối Blockchain (RPC/Contract Address)' });
        }

        // ABI rút gọn để đọc tokenURI
        const abi = ['function tokenURI(uint256 tokenId) view returns (string)'];
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(contractAddress, abi, provider);

        // Gọi hàm tokenURI trên Smart Contract
        const onChainUri = await contract.tokenURI(BigInt(batch.tokenId));

        // So sánh: tùy thuộc vào cách Smart Contract lưu, nó có thể là "Hash" hoặc "ipfs://Hash"
        const matched = onChainUri === batch.ipfsHash || onChainUri === `ipfs://${batch.ipfsHash}`;

        return res.json({
            batchId: batch._id,
            tokenId: batch.tokenId,
            txHash: batch.txHash,
            dbIpfsHash: batch.ipfsHash,
            onChainUri,
            matched // Nếu true -> Dữ liệu Blockchain hoàn toàn khớp với Database
        });
    } catch (err) {
        return res.status(500).json({ message: 'Không thể kết nối với Blockchain để kiểm chứng', error: err.message });
    }
};