# Stream 5: Cập nhật Hành trình Vận chuyển (Automatic Shipping Journey Update)

## 📋 Tổng Quan

**Luồng 5** cho phép hệ thống tự động cập nhật thông tin vận chuyển lô hàng NFT lên Blockchain mà không cần tốn Gas của User (người nông dân).

**Áp dụng cho:** Các lô hàng đã là NFT (`status: 'MINTED'`)

---

## ⚙️ Chuẩn Bị Môi Trường

### 1️⃣ Environment Variables (`.env`)

Đảm bảo file `.env` có các biến sau:

```env
# Blockchain Configuration
ETH_RPC_URL=<blockchain_rpc_endpoint>
SYSTEM_PRIVATE_KEY=<system_admin_wallet_private_key>
NFT_CONTRACT_ADDRESS=<deployed_contract_address>

# IPFS Configuration (Pinata)
PINATA_API_KEY=<your_pinata_api_key>
PINATA_API_SECRET=<your_pinata_api_secret>

# Database
MONGO_URI=<your_mongodb_connection_string>

# Server
PORT=8080
```

### 2️⃣ Blockchain Requirements

- **Smart Contract Address:** Deployed `BatchNFT.sol` contract
- **System Admin Wallet:** Private key of the wallet with `systemAdmin` role
- **RPC Endpoint:** Ethereum-compatible RPC URL (Sepolia, Polygon, etc.)

---

## 🔌 API Endpoint

### Request

```http
POST /api/batches/:batchId/shipping
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "location": "Kho lạnh Co.opMart Quận 1",
  "status": "Đang nhập kho"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `batchId` | String (ObjectId) | ✅ | ID của lô hàng (từ URL) |
| `location` | String | ✅ | Vị trí hiện tại của lô hàng (do máy quét mã/tài xế gửi) |
| `status` | String | ✅ | Trạng thái vận chuyển (e.g., "Đang vận chuyển", "Đã nhập kho") |

### Response (Success)

```json
{
  "success": true,
  "message": "Cập nhật vận chuyển lên Blockchain thành công!",
  "newIpfsHash": "QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

### Response (Error)

```json
{
  "message": "Lỗi hệ thống",
  "error": "Error message details"
}
```

---

## 🔄 Backend Logic Flow (Chi Tiết)

### Bước 1: Kiểm Tra Lô Hàng

```javascript
const batch = await batchDao.findByIdWithProduct(batchId);
if (!batch || batch.status !== 'MINTED') {
  // Lô hàng chưa đúc NFT
  return res.status(400).json({ message: 'Lô hàng chưa đúc NFT hoặc không tồn tại' });
}
```

### Bước 2: Tạo Log Data & Cập Nhật DB

```javascript
const logData = {
  action: status,           // "Đang nhập kho"
  actorId: null,           // Hệ thống tự cập nhật (không có người dùng)
  location: location,       // "Kho lạnh Co.opMart Quận 1"
  timestamp: new Date()     // Thời gian hiện tại
};
const updatedBatch = await batchDao.pushLog(batchId, logData);
```

**DB được cập nhật:** Mảng `logs` có thêm một phần tử mới

### Bước 3: Re-Pin IPFS

```javascript
const dataToPin = {
  batchId: updatedBatch._id,
  product: updatedBatch.productId,
  harvestDate: updatedBatch.harvestDate,
  logs: updatedBatch.logs  // ⭐ Logs đã cập nhật
};
const pinResult = await pinJsonToIPFS({ pinataContent: dataToPin });
const newIpfsHash = pinResult.IpfsHash;
```

**Kết quả:** Nhận về `newIpfsHash` mới

### Bước 4: Hệ Thống Tự Ký & Gửi Giao Dịch

```javascript
// 4.1 Khởi tạo Provider
const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);

// 4.2 Nạp ví Admin
const wallet = new ethers.Wallet(process.env.SYSTEM_PRIVATE_KEY, provider);

// 4.3 Kết nối Contract
const contract = new ethers.Contract(
  process.env.NFT_CONTRACT_ADDRESS, 
  MINIMAL_ABI, 
  wallet
);

// 4.4 Gọi hàm Smart Contract
const tx = await contract.updateShipping(updatedBatch.tokenId, newIpfsHash);

// 4.5 Đợi hoàn tất
await tx.wait();
```

**Solidity Require:** `require(msg.sender == systemAdmin, "Chi he thong moi duoc cap nhat van chuyen");`

### Bước 5: Cập Nhật ipfsHash trong DB

```javascript
await batchDao.updateFields(batchId, { ipfsHash: newIpfsHash });
```

---

## 📊 Database Schema

### Batch Model

```javascript
{
  _id: ObjectId,
  farmerId: ObjectId,
  productId: ObjectId,
  inspectorId: ObjectId,
  harvestDate: Date,
  quantity: Number,
  status: "MINTED",  // ⭐ Yêu cầu
  logs: [
    {
      action: "Đang nhập kho",
      actorId: ObjectId | null,
      location: "Kho lạnh Co.opMart Quận 1",
      timestamp: Date,
      imageUrl: String
    }
  ],
  ipfsHash: "QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  tokenId: Number,  // ⭐ Cần có
  txHash: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing Guide

### Test Case 1: Happy Path ✅

**Điều kiện:**
- Lô hàng tồn tại với `status: 'MINTED'`
- Có hợp lệ `tokenId` và `ipfsHash`
- Environment variables đã cấu hình đúng

**Request:**
```bash
curl -X POST http://localhost:8080/api/batches/507f1f77bcf86cd799439011/shipping \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Kho lạnh Co.opMart Quận 1",
    "status": "Đang nhập kho"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Cập nhật vận chuyển lên Blockchain thành công!",
  "newIpfsHash": "QmNewHashValue..."
}
```

### Test Case 2: Lô Hàng Chưa MINTED ❌

**Request:**
```json
{
  "location": "Kho lạnh",
  "status": "Đang vận chuyển"
}
```

**Expected Response:**
```json
{
  "message": "Lô hàng chưa đúc NFT hoặc không tồn tại"
}
```

### Test Case 3: Missing Fields ❌

**Request (thiếu `location`):**
```json
{
  "status": "Đang nhập kho"
}
```

**Backend sẽ:**
- Vẫn tạo log (vì không validate trong controller)
- Gọi IPFS & blockchain
- **Recommendation:** Thêm validation

---

## ⚠️ Error Handling & Troubleshooting

| Error | Nguyên Nhân | Giải Pháp |
|-------|-----------|----------|
| `Lô hàng chưa đúc NFT` | `status !== 'MINTED'` | Chạy pinToIPFS → confirmMint trước |
| `Chi he thong moi duoc cap nhat van chuyen` | Signer không phải `systemAdmin` | Kiểm tra `SYSTEM_PRIVATE_KEY` |
| `IPFS timeout` | Mạng lưới chậm | Thử lại, kiểm tra Pinata credentials |
| `Invalid RPC endpoint` | `ETH_RPC_URL` sai | Cập nhật `.env` với endpoint hợp lệ |

---

## 🔐 Bảo Mật & Best Practices

1. ✅ **JWT Authentication:** Endpoint yêu cầu token hợp lệ
2. ✅ **System Admin Signing:** Hệ thống tự ký (không tốn gas người dùng)
3. ⚠️ **SYSTEM_PRIVATE_KEY:** Tuyệt đối **KHÔNG** commit lên Git
4. ⚠️ **Gas Management:** Monitor gas usage để tối ưu chi phí
5. ✅ **Immutable Logs:** Blockchain đảm bảo logs không thể bị chỉnh sửa

---

## 📝 Log Structure

Mỗi shipping update tạo một log entry:

```javascript
{
  action: "Đang nhập kho",           // Trạng thái vận chuyển
  actorId: null,                      // Hệ thống tự cập nhật
  location: "Kho lạnh Co.opMart",     // Vị trí
  timestamp: Date.now(),              // Unix timestamp
  imageUrl: ""                        // Có thể mở rộng sau
}
```

Tất cả logs được gom vào IPFS → Hash được lưu on-chain

---

## 🚀 Triển Khai Lên Production

### Checklist

- [ ] Kiểm tra `SYSTEM_PRIVATE_KEY` có đủ balance trên Blockchain
- [ ] Test với Testnet trước (Sepolia, Mumbai, etc.)
- [ ] Cấu hình Pinata API credentials
- [ ] Verify Smart Contract address đã deploy
- [ ] Setup monitoring/logging cho giao dịch
- [ ] Cấu hình rate limiting nếu cần

---

## 📚 Related Files

- **Controller:** [batchController.js](./src/controllers/batchController.js) - `updateShippingLog()`
- **DAO:** [batchDAO.js](./src/daos/batchDAO.js) - `pushLog()`, `updateFields()`
- **Model:** [Batch.js](./src/models/Batch.js) - Schema định nghĩa
- **Routes:** [batch.js](./src/routes/batch.js) - Endpoint registration
- **Smart Contract:** [BatchNFT.sol](../smartcontract/BatchNFT.sol) - `updateShipping()`
- **IPFS Utility:** [ipfs.js](./src/utils/ipfs.js) - `pinJsonToIPFS()`, `fetchJsonFromIPFS()`

---

## 🔗 Integration Points

```
Máy quét QR / Tài xế
    ↓
POST /api/batches/:batchId/shipping
    ↓
[Controller] updateShippingLog()
    ↓
[Step 1] Kiểm tra batch.status === 'MINTED'
    ↓
[Step 2] Tạo log + DB.pushLog() → Tập logs mới
    ↓
[Step 3] Re-pin IPFS (pinJsonToIPFS) → newIpfsHash
    ↓
[Step 4] System tự ký Tx: contract.updateShipping(tokenId, newIpfsHash)
    ↓
[Step 5] DB.updateFields({ ipfsHash: newIpfsHash })
    ↓
✅ Response: { success: true, newIpfsHash }
```

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Logs server (xem chi tiết lỗi)
2. Environment variables (`.env`)
3. Blockchain connection (RPC endpoint)
4. Pinata API credentials
5. Smart contract authorization
