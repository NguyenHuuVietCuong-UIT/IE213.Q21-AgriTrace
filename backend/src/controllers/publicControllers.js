const Batch = require('../models/Batch');
const { ethers } = require('ethers');

// 1. Lấy chi tiết lô hàng công khai (dùng cho trang Tracking khi quét QR)
exports.getBatchPublicDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const batch = await Batch.findById(id).populate('farmer', 'phone');

        if (!batch) return res.status(404).json({ message: 'Không tìm thấy thông tin lô hàng' });

        // Trả về dữ liệu cần thiết để hiển thị trên Timeline
        res.json({
            id: batch._id,
            cropType: batch.cropType,
            name: batch.name,
            estimatedQuantity: batch.estimatedQuantity,
            status: batch.status,
            logs: batch.logs,
            ipfsLink: batch.ipfsLink,
            tokenId: batch.tokenId,
            txHash: batch.txHash,
            farmerPhone: batch.farmer?.phone,
            createdAt: batch.createdAt
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi truy xuất dữ liệu' });
    }
};

// 2. Kiểm chứng dữ liệu trực tiếp từ Blockchain
exports.verifyOnChain = async (req, res) => {
    const { id } = req.params;
    const batch = await Batch.findById(id);

    if (!batch || batch.status !== 'MINTED') {
        return res.status(400).json({ message: 'Lô hàng chưa được đúc NFT để kiểm chứng' });
    }

    const rpcUrl = process.env.ETH_RPC_URL;
    const contractAddress = process.env.NFT_CONTRACT_ADDRESS;

    if (!rpcUrl || !contractAddress) {
        return res.status(500).json({ message: 'Thiếu cấu hình kết nối Blockchain (RPC/Contract Address)' });
    }

    // ABI rút gọn chỉ chứa hàm cần thiết để đọc link IPFS từ NFT
    const abi = ['function tokenURI(uint256 tokenId) view returns (string)'];

    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(contractAddress, abi, provider);

        // Gọi hàm tokenURI trên Smart Contract của Thành viên 1
        const onChainUri = await contract.tokenURI(BigInt(batch.tokenId));

        // So sánh link IPFS trong DB với link IPFS được lưu trên NFT
        const matched = onChainUri === batch.ipfsLink;

        return res.json({
            batchId: batch._id,
            tokenId: batch.tokenId,
            txHash: batch.txHash,
            dbIpfsLink: batch.ipfsLink,
            onChainUri,
            matched // Nếu true -> Dữ liệu chuẩn xác 100%
        });
    } catch (err) {
        return res.status(500).json({ message: 'Không thể kết nối với Blockchain để kiểm chứng', error: err.message });
    }
};