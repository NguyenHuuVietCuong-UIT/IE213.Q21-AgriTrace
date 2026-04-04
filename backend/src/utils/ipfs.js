const axios = require('axios');

// ==========================================
// 1. ĐẨY DỮ LIỆU LÊN IPFS (WRITE)
// ==========================================
async function pinJsonToIPFS(jsonData) {
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    const apiKey = process.env.PINATA_API_KEY;
    const apiSecret = process.env.PINATA_API_SECRET;

    if (!apiKey || !apiSecret) throw new Error('Pinata credentials are missing');

    const response = await axios.post(url, jsonData, {
        headers: {
            pinata_api_key: apiKey,
            pinata_secret_api_key: apiSecret,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

// ==========================================
// 2. KÉO DỮ LIỆU TỪ IPFS VỀ (READ) - [THÊM MỚI]
// ==========================================
async function fetchJsonFromIPFS(ipfsHash) {
    // Có thể dùng gateway của Pinata hoặc gateway public như ipfs.io, dweb.link
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    try {
        // Thêm timeout 10s để tránh việc Request bị treo vĩnh viễn nếu mạng lưới IPFS chậm
        const response = await axios.get(gatewayUrl, { timeout: 10000 });
        return response.data;
    } catch (error) {
        console.error(`[IPFS Fetch Error] Hash: ${ipfsHash}`, error.message);
        throw new Error('Mạng lưới lưu trữ IPFS đang quá tải hoặc Hash không tồn tại.');
    }
}

// Xuất cả 2 hàm ra để dùng
module.exports = { pinJsonToIPFS, fetchJsonFromIPFS };