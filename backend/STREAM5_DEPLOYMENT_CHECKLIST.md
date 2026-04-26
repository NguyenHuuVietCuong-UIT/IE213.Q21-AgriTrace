# Stream 5 Implementation Checklist & Deployment Guide

## 📋 Implementation Status

### ✅ COMPLETED TASKS

- [x] **Route Registration** - Added `POST /api/batches/:batchId/shipping` to [batch.js](./src/routes/batch.js)
- [x] **Controller Logic** - Enhanced `updateShippingLog()` with comprehensive validation in [batchController.js](./src/controllers/batchController.js)
- [x] **Input Validation** - Added checks for location, status fields
- [x] **Database Integration** - Uses existing `batchDAO.pushLog()` and `updateFields()` methods
- [x] **IPFS Re-pinning** - Leverages `pinJsonToIPFS()` utility
- [x] **Blockchain Integration** - System auto-signs transactions using admin wallet
- [x] **Error Handling** - Comprehensive error responses and logging
- [x] **Documentation** - Created [STREAM5_SHIPPING_GUIDE.md](./STREAM5_SHIPPING_GUIDE.md)
- [x] **Testing Suite** - Created [test-stream5-shipping.js](./test-stream5-shipping.js)
- [x] **Environment Template** - Created [.env.stream5.example](./.env.stream5.example)

---

## 🚀 PRE-DEPLOYMENT CHECKLIST

### 1. Environment Setup

- [ ] **Blockchain Network Selection**
  - [ ] Choose network: Sepolia / Polygon Mumbai / Hardhat Local / Other
  - [ ] Obtain RPC endpoint with suitable rate limits
  - [ ] Store in `ETH_RPC_URL` environment variable

- [ ] **System Admin Wallet**
  - [ ] Create/export private key from wallet (MetaMask, Hardhat, etc.)
  - [ ] Verify wallet has sufficient ETH/MATIC for gas fees
  - [ ] Store in `SYSTEM_PRIVATE_KEY` (never commit to Git!)
  - [ ] Test: `node -e "const { ethers } = require('ethers'); const w = new ethers.Wallet('0x...'); console.log(w.address);"`

- [ ] **Smart Contract**
  - [ ] Compile `BatchNFT.sol` with `pragma solidity ^0.8.0`
  - [ ] Deploy to chosen network
  - [ ] Verify `systemAdmin` is set correctly to wallet address
  - [ ] Store contract address in `NFT_CONTRACT_ADDRESS`
  - [ ] Test: Visit block explorer and confirm contract exists

- [ ] **IPFS / Pinata**
  - [ ] Create Pinata account: https://www.pinata.cloud
  - [ ] Generate API key and secret
  - [ ] Store in `PINATA_API_KEY` and `PINATA_API_SECRET`
  - [ ] Test connection:
    ```bash
    curl -H "pinata_api_key: $PINATA_API_KEY" \
         https://api.pinata.cloud/data/testAuthentication
    ```

- [ ] **Database**
  - [ ] MongoDB is running and accessible
  - [ ] `MONGO_URI` is set correctly
  - [ ] Database contains test data with MINTED batches

### 2. Code Verification

- [ ] **Files Modified**
  - [ ] [src/routes/batch.js](./src/routes/batch.js) - Route registered ✅
  - [ ] [src/controllers/batchController.js](./src/controllers/batchController.js) - Controller updated ✅

- [ ] **Dependencies Check**
  ```bash
  npm list ethers axios mongoose express
  ```
  - [ ] `ethers.js` v6.x
  - [ ] `axios` for HTTP requests
  - [ ] `mongoose` for MongoDB
  - [ ] `express` framework

- [ ] **Imports Verified**
  - [ ] `const { ethers } = require('ethers');` in controller
  - [ ] `const { pinJsonToIPFS } = require('../utils/ipfs');` in controller
  - [ ] `const batchDao = require('../daos/batchDAO');` in controller

### 3. Database Validation

- [ ] **Batch Schema**
  - [ ] Model includes `logs` array field
  - [ ] `status` field supports 'MINTED'
  - [ ] `tokenId` and `ipfsHash` fields exist
  ```javascript
  // Expected structure
  {
    status: "MINTED",
    tokenId: Number,
    ipfsHash: String,
    logs: [
      { action, location, timestamp, actorId, imageUrl }
    ]
  }
  ```

- [ ] **Test Data**
  - [ ] At least one batch exists with status='MINTED'
  - [ ] Batch has valid `tokenId` (number > 0)
  - [ ] Batch has valid `ipfsHash` from previous mint operation

### 4. Security Review

- [ ] **Private Key Security**
  - [ ] `.env` file is in `.gitignore`
  - [ ] Never log `SYSTEM_PRIVATE_KEY`
  - [ ] Use environment variable, not hardcoded
  - [ ] Rotate keys in production regularly

- [ ] **Authentication**
  - [ ] Route requires JWT token via `verifyToken` middleware
  - [ ] JWT secret is strong and unique
  - [ ] Token expiration is set appropriately

- [ ] **Authorization**
  - [ ] No specific role check (any authenticated user can call)
  - [ ] Consider adding additional checks if needed

- [ ] **Input Validation**
  - [ ] Location: non-empty string ✅
  - [ ] Status: non-empty string ✅
  - [ ] Batch exists: checked ✅
  - [ ] Batch is MINTED: checked ✅

### 5. Testing

- [ ] **Unit Testing**
  ```bash
  node test-stream5-shipping.js
  ```
  - [ ] Test 1: Happy path passes ✅
  - [ ] Test 2: Missing location rejected ✅
  - [ ] Test 3: Missing status rejected ✅
  - [ ] Test 4: Empty location rejected ✅
  - [ ] Test 5: Missing JWT rejected ✅
  - [ ] Test 6: Invalid batch ID returns 404 ✅

- [ ] **Integration Testing**
  - [ ] Start backend server: `npm start` or `node server.js`
  - [ ] Have a valid JWT token from login endpoint
  - [ ] Get a batch ID with `status='MINTED'`
  - [ ] Run test file with proper environment variables
  - [ ] Verify response includes `newIpfsHash` and `txHash`

- [ ] **Manual Testing with cURL**
  ```bash
  # Replace values
  JWT_TOKEN="your_token"
  BATCH_ID="your_batch_id"
  
  curl -X POST http://localhost:8080/api/batches/$BATCH_ID/shipping \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "location": "Kho lạnh Co.opMart Quận 1",
      "status": "Đang nhập kho"
    }'
  ```

### 6. Monitoring & Logging

- [ ] **Server Logs**
  - [ ] Set `NODE_ENV=production` for production
  - [ ] Configure logging service (Winston, Bunyan, etc.)
  - [ ] Log transaction hashes for tracking

- [ ] **Blockchain Monitoring**
  - [ ] Monitor gas usage and costs
  - [ ] Check transaction status on block explorer
  - [ ] Alert on failed transactions

- [ ] **IPFS Monitoring**
  - [ ] Monitor Pinata API rate limits
  - [ ] Check IPFS hash retrieval success rate
  - [ ] Alert on pin failures

---

## 🔧 Configuration Steps

### Step 1: Copy Environment Template

```bash
cd backend
cp .env.stream5.example .env
# Edit .env with your actual values
```

### Step 2: Install/Verify Dependencies

```bash
npm install ethers@6 axios mongoose express dotenv
```

### Step 3: Deploy Smart Contract (if not done)

```bash
# Example using Hardhat
cd ../smartcontract
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Save the deployed contract address → `NFT_CONTRACT_ADDRESS` in `.env`

### Step 4: Start Backend Server

```bash
cd backend
npm start
# Should see: Server đang lắng nghe tại http://localhost:8080
```

### Step 5: Obtain Test JWT Token

```bash
# Use your login endpoint or test authentication
curl -X POST http://localhost:8080/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Copy the token from response → TEST_JWT_TOKEN
```

### Step 6: Find Test Batch ID

```bash
# Get your batches (requires auth)
curl http://localhost:8080/api/batches/mine \
  -H "Authorization: Bearer $JWT_TOKEN"

# Find one with status='MINTED' and valid tokenId → TEST_BATCH_ID
```

### Step 7: Run Tests

```bash
TEST_JWT_TOKEN="your_token" \
TEST_BATCH_ID="your_batch_id" \
node test-stream5-shipping.js
```

---

## 📊 Expected Behavior

### Successful Update Flow

```
Request:
POST /api/batches/:batchId/shipping
{
  "location": "Kho lạnh Co.opMart Quận 1",
  "status": "Đang nhập kho"
}

Response (200 OK):
{
  "success": true,
  "message": "Cập nhật vận chuyển lên Blockchain thành công!",
  "newIpfsHash": "QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "txHash": "0x123456789abcdef..."
}

Database Changes:
- Batch.logs array gets new entry with location & status
- Batch.ipfsHash updated to newIpfsHash
- Transaction stored on blockchain
```

### Error Scenarios

| Scenario | Status | Message |
|----------|--------|---------|
| Batch not found | 404 | Lô hàng không tồn tại |
| Batch not MINTED | 400 | Lô hàng chưa đúc NFT |
| Missing location | 400 | Thiếu hoặc sai định dạng: location |
| Missing status | 400 | Thiếu hoặc sai định dạng: status |
| No JWT token | 401 | Unauthorized |
| IPFS failure | 500 | Lỗi hệ thống |
| Blockchain failure | 500 | Lỗi hệ thống |

---

## 🐛 Troubleshooting

### Issue: "Chi he thong moi duoc cap nhat van chuyen"

**Cause:** Smart contract checking that `msg.sender == systemAdmin`, but signer wallet doesn't match

**Solution:**
1. Verify `SYSTEM_PRIVATE_KEY` belongs to the correct wallet
2. Verify that wallet is set as `systemAdmin` in smart contract
3. Check contract deployment was correct

### Issue: "Mạng lưới lưu trữ IPFS đang quá tải"

**Cause:** Pinata API timeout or network issues

**Solution:**
1. Check Pinata API credentials
2. Retry the request
3. Check Pinata status page for outages

### Issue: "Lô hàng chưa có tokenId"

**Cause:** Batch exists but confirmMint was not called properly

**Solution:**
1. Ensure batch went through Stream 3 (minting)
2. Verify `tokenId` is saved in database
3. Check batch status is 'MINTED'

### Issue: Out of Memory / RPC limit

**Cause:** Too many requests or RPC rate limit exceeded

**Solution:**
1. Use a paid RPC service with higher limits (Infura, Alchemy)
2. Add request delays between updates
3. Batch requests efficiently

---

## 📈 Performance Optimization

### Gas Cost Optimization

```javascript
// Use estimated gas before sending
const gasEstimate = await contract.estimateGas.updateShipping(tokenId, hash);
console.log(`Estimated gas: ${gasEstimate.toString()}`);

// Set gas limit slightly higher
const tx = await contract.updateShipping(tokenId, newIpfsHash, {
  gasLimit: gasEstimate.mul(110).div(100) // +10% buffer
});
```

### Batch Updates

For multiple updates, consider batching requests:

```javascript
const updates = [
  { location: "Kho xuất phát", status: "Bắt đầu" },
  { location: "Cảng", status: "Tại cảng" },
  { location: "Kho đích", status: "Đã nhập kho" }
];

for (const update of updates) {
  await updateShippingLog(batchId, update);
  await sleep(2000); // Avoid rate limits
}
```

---

## 📞 Support & Escalation

If you encounter issues:

1. **Check logs:** Server logs usually contain detailed error messages
2. **Verify configuration:** Run the checklist above
3. **Test individual components:**
   - Blockchain connection: `ethers.js` + RPC
   - IPFS: Pinata API test
   - Database: MongoDB connection test
4. **Review contracts:** Ensure Smart Contract is correctly deployed
5. **Contact team:** Provide error logs and configuration summary

---

## 📚 Related Documentation

- [Stream 5 Implementation Guide](./STREAM5_SHIPPING_GUIDE.md)
- [Test Suite](./test-stream5-shipping.js)
- [Smart Contract](../smartcontract/BatchNFT.sol)
- [Batch DAO](./src/daos/batchDAO.js)
- [IPFS Utility](./src/utils/ipfs.js)
- [Environment Template](./.env.stream5.example)

---

## ✅ Sign-Off

Once all checks pass:

```
Implementation Status: ✅ COMPLETE
Testing Status: ✅ PASSED
Documentation Status: ✅ COMPLETE
Ready for: ✅ PRODUCTION DEPLOYMENT
```

Last Updated: 2024-04-26
