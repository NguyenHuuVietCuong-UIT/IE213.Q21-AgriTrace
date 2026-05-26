const { ethers } = require('ethers');
const publicDao = require('../daos/publicDAO');
// Import hàm đọc IPFS mới viết
const { fetchJsonFromIPFS } = require('../utils/ipfs');

// CẬP NHẬT 1: Thêm định nghĩa event BatchUpdated vào ABI
const PUBLIC_CONTRACT_ABI = [
    "function batches(uint256) view returns (uint256 tokenId, string ipfsHash, address owner)",
    "event BatchUpdated(uint256 tokenId, string newIpfsHash)"
];

const publicController = {
    getBatchFromIPFS: async (req, res) => {
        const { id } = req.params;

        try {
            // Bước 1: Tra cứu Token ID từ DB
            const dbBatch = await publicDao.getTrackingId(id);
            if (!dbBatch || dbBatch.status !== 'MINTED' || !dbBatch.tokenId) {
                return res.status(404).json({ message: 'Lô hàng không tồn tại hoặc chưa được đúc NFT.' });
            }

            // Bước 2: Lấy IPFS Hash từ Smart Contract
            const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
            const contract = new ethers.Contract(process.env.NFT_CONTRACT_ADDRESS, PUBLIC_CONTRACT_ABI, provider);

            // Lấy dữ liệu gốc lúc đúc (Mint)
            const contractData = await contract.batches(dbBatch.tokenId);
            let onChainIpfsHash = contractData.ipfsHash;

            // ========================================================
            // CẬP NHẬT 2: QUÉT SỰ KIỆN ĐỂ LẤY IPFS HASH MỚI NHẤT
            // ========================================================
            try {
                // Tạo bộ lọc chỉ tìm sự kiện BatchUpdated của đúng tokenId này
                const filter = contract.filters.BatchUpdated(dbBatch.tokenId);

                // Quét lịch sử Blockchain để lấy mảng các sự kiện
                const events = await contract.queryFilter(filter);

                if (events.length > 0) {
                    // Lấy sự kiện cập nhật mới nhất (nằm ở cuối mảng)
                    const latestEvent = events[events.length - 1];

                    // Trong Ethers.js v6, dữ liệu event nằm trong mảng args. 
                    // args[0] là tokenId, args[1] là newIpfsHash
                    onChainIpfsHash = latestEvent.args[1];

                    console.log(`[Tra cứu] Đã cập nhật IPFS Hash mới nhất từ Event cho Token ${dbBatch.tokenId}`);
                }
            } catch (eventErr) {
                console.error("Lỗi khi quét sự kiện Blockchain:", eventErr.message);
                // Nếu lỗi mạng lưới khi quét, vẫn tiếp tục chạy với onChainIpfsHash gốc để hệ thống không bị sập
            }

            // Kiểm tra kết quả cuối cùng
            if (!onChainIpfsHash) {
                return res.status(404).json({ message: 'Dữ liệu Blockchain bị trống.' });
            }

            // ========================================================
            // BƯỚC 3: TẢI DỮ LIỆU TỪ IPFS (Siêu gọn gàng nhờ Utils)
            // ========================================================
            let agriculturalData;
            try {
                // Chỉ cần gọi 1 dòng duy nhất!
                agriculturalData = await fetchJsonFromIPFS(onChainIpfsHash);
            } catch (ipfsErr) {
                return res.status(503).json({ message: ipfsErr.message });
            }

            // Bước 4: Trả về cho Frontend
            return res.json({
                success: true,
                metaData: {
                    tokenId: contractData.tokenId.toString(),
                    contractAddress: process.env.NFT_CONTRACT_ADDRESS,
                    ipfsHash: onChainIpfsHash, // Đây sẽ là hash mới nhất (nếu có sự kiện update)
                    mintTxHash: dbBatch.txHash,
                    ownerWallet: contractData.owner
                },
                productData: agriculturalData
            });

        } catch (err) {
            return res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
        }
    }
};

module.exports = publicController;