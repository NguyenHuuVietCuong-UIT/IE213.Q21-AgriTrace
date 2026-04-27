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
// 2. KÉO DỮ LIỆU TỪ IPFS VỀ (READ) - CÓ FALLBACK & FAKE USER-AGENT
// ==========================================
async function fetchJsonFromIPFS(ipfsHash) {
    // THÊM DÒNG NÀY: Xóa chữ 'ipfs://' ở đầu chuỗi (nếu có) để lấy đúng mã Hash gốc
    const cleanHash = ipfsHash.replace(/^ipfs:\/\//, '');

    // Sử dụng cleanHash thay cho ipfsHash
    const gateways = [
        `https://gateway.pinata.cloud/ipfs/${cleanHash}`,
        `https://cloudflare-ipfs.com/ipfs/${cleanHash}`,
        `https://ipfs.io/ipfs/${cleanHash}`,
        `https://dweb.link/ipfs/${cleanHash}`
    ];

    let lastError = null;

    for (const url of gateways) {
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            });

            return response.data;
        } catch (error) {
            console.warn(`[IPFS Warn] Không thể tải từ ${url}:`, error.message);
            lastError = error;
        }
    }

    console.error(`[IPFS Error] Tất cả các Gateway đều thất bại cho Hash: ${cleanHash}`);
    throw new Error('Mạng lưới lưu trữ Blockchain (IPFS) đang quá tải. Vui lòng thử lại sau ít phút!');
}

// Xuất cả 2 hàm ra để các Controller sử dụng
module.exports = { pinJsonToIPFS, fetchJsonFromIPFS };