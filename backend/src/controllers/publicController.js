const { ethers } = require('ethers');
const publicDao = require('../daos/publicDAO');
// Import hàm đọc IPFS mới viết
const { fetchJsonFromIPFS } = require('../utils/ipfs');

const PUBLIC_CONTRACT_ABI = [
    "function batches(uint256) view returns (uint256 tokenId, string ipfsHash, address owner)"
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

            const contractData = await contract.batches(dbBatch.tokenId);
            const onChainIpfsHash = contractData.ipfsHash;

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
                    ipfsHash: onChainIpfsHash,
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