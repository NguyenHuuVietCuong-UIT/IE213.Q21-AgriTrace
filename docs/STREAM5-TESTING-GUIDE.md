# Stream 5 Testing Guide
**Purpose**: Instructions for testing the fixed shipping update feature  
**Date**: April 27, 2024

---

## 🎯 Quick Start

### Prerequisites
- Node.js 14+ installed
- Backend running on http://localhost:8080
- MongoDB connection working
- At least one MINTED batch in database with assigned Inspector

### 1. Setup Environment Variables

Create a `.env.test` file or add to your `.env`:

```bash
# API Configuration
API_URL=http://localhost:8080/api

# MongoDB
MONGO_URI=mongodb://localhost:27017/agritrace

# Test Credentials - YOU NEED TO OBTAIN THESE:
# Token of Inspector who owns the batch you want to test with
TEST_JWT_TOKEN=your_inspector_token_here

# The batch ID with status='MINTED' and valid tokenId
TEST_BATCH_ID=your_minted_batch_id_here

# Token of a DIFFERENT user (Farmer, or different Inspector) - for authorization test
TEST_UNAUTHORIZED_JWT=different_user_token_here
```

### 2. Get Required Values

#### Getting TEST_JWT_TOKEN (Inspector Token)

**Option A: Via Login Endpoint** (if implemented)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d {
    "email": "inspector@example.com",
    "password": "inspector_password"
  }

# Response will include: { token: "eyJhbGc..." }
# Use that token as TEST_JWT_TOKEN
```

**Option B: Check MongoDB**
```javascript
// In MongoDB shell or Compass:
db.users.findOne({ role: "Inspector", email: "inspector@example.com" })
// Get the _id, then create a JWT manually or login

// Then use that token as TEST_JWT_TOKEN
```

#### Getting TEST_BATCH_ID

```javascript
// In MongoDB shell:
db.batches.findOne({ status: "MINTED", tokenId: { $exists: true } })
// Copy the _id value

// Or via API (if you know the batch):
GET http://localhost:8080/api/batches/{batchId}
```

Verify the batch:
- ✅ `status: "MINTED"`
- ✅ `tokenId: (valid integer)`
- ✅ `inspectorId: (the Inspector's user ID)`

#### Getting TEST_UNAUTHORIZED_JWT

This should be a token from a **different user** (not the Inspector owner):

**Option A: Farmer Token**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d {
    "email": "farmer@example.com",
    "password": "farmer_password"
  }
# Use this token as TEST_UNAUTHORIZED_JWT
```

**Option B: Different Inspector Token**
```bash
# Login as a different Inspector
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d {
    "email": "inspector2@example.com",
    "password": "inspector2_password"
  }
# Use this token as TEST_UNAUTHORIZED_JWT
```

---

## 🧪 Running Tests

### Run All Tests
```bash
cd backend
node test-stream5-shipping.js
```

### Expected Output

```
======================================================================
  🧪 STREAM 5: SHIPPING UPDATE TESTS
======================================================================

📋 Configuration:
   API Base URL: http://localhost:8080/api
   Test Batch ID: 66xxx...
   JWT Token: ✅ Configured

⚠️  NOTE: Ensure TEST_BATCH_ID points to a MINTED batch with valid tokenId!

✅ [2024-04-27T10:30:45.123Z] Test 1: Happy Path - Cập nhật vận chuyển thành công
   📊 Response: { success: true, message: "...", newIpfsHash: "QmXxx...", txHash: "0x123..." }

✅ [2024-04-27T10:30:46.456Z] Test 2: Validation - Missing location field
   ✅ Correctly rejected (Validation failed)

✅ [2024-04-27T10:30:47.789Z] Test 3: Validation - Missing status field
   ✅ Correctly rejected (Validation failed)

✅ [2024-04-27T10:30:49.012Z] Test 4: Validation - Empty location field
   ✅ Correctly rejected (Validation failed)

✅ [2024-04-27T10:30:50.345Z] Test 5: Authentication - Missing JWT token
   ✅ Correctly rejected (Auth failure)

✅ [2024-04-27T10:30:51.678Z] Test 6: Invalid Batch ID
   ✅ Correctly returned 404 (Not Found)

✅ [2024-04-27T10:30:52.901Z] Test 7: Authorization - Non-owner Inspector cannot update
   ✅ Correctly rejected (Authorization denied)

======================================================================
  📊 TEST SUMMARY
======================================================================

✅ Passed: 7/7 (100%)
❌ Failed: 0/7
⏽ Skipped: 0

🎉 All tests passed! Stream 5 is ready for production.

======================================================================
```

---

## 🔍 Manual Testing

### Test 1: Happy Path (Authorized Update)
```bash
curl -X POST http://localhost:8080/api/batches/{TEST_BATCH_ID}/shipping \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TEST_JWT_TOKEN}" \
  -d {
    "location": "Kho lạnh Co.opMart Quận 1",
    "status": "Đang nhập kho"
  }

# Expected Response: 200 OK
# {
#   "success": true,
#   "message": "Cập nhật vận chuyển lên Blockchain thành công!",
#   "newIpfsHash": "QmXxxx...",
#   "txHash": "0x123abc..."
# }
```

### Test 2: Unauthorized Access (403)
```bash
curl -X POST http://localhost:8080/api/batches/{TEST_BATCH_ID}/shipping \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TEST_UNAUTHORIZED_JWT}" \
  -d {
    "location": "Kho lạnh Co.opMart",
    "status": "Đang vận chuyển"
  }

# Expected Response: 403 Forbidden
# {
#   "message": "Bạn không có quyền cập nhật vận chuyển cho lô hàng này. Chỉ Inspector được phép."
# }
```

### Test 3: Missing Authentication (401)
```bash
curl -X POST http://localhost:8080/api/batches/{TEST_BATCH_ID}/shipping \
  -H "Content-Type: application/json" \
  -d {
    "location": "Kho lạnh",
    "status": "Đang vận chuyển"
  }

# Expected Response: 401 Unauthorized
# {
#   "message": "Vui lòng đăng nhập trước"
# }
```

### Test 4: Invalid Batch (404)
```bash
curl -X POST http://localhost:8080/api/batches/invalid_id/shipping \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TEST_JWT_TOKEN}" \
  -d {
    "location": "Kho lạnh",
    "status": "Đang vận chuyển"
  }

# Expected Response: 404 Not Found
# {
#   "message": "Lô hàng không tồn tại"
# }
```

---

## 🐛 Troubleshooting

### Error: "TEST_JWT_TOKEN not configured"
**Solution**: 
1. Login and get a valid token (see "Getting TEST_JWT_TOKEN" above)
2. Set environment variable: `export TEST_JWT_TOKEN="your_token"`

### Error: "Lô hàng không tồn tại"
**Solution**:
1. Verify TEST_BATCH_ID exists: `GET /api/batches/{TEST_BATCH_ID}`
2. Check batch status is "MINTED"
3. Ensure batch has `tokenId` assigned

### Error: "Lô hàng chưa đúc NFT (status phải là MINTED)"
**Solution**:
1. Create a MINTED batch first (see backend docs)
2. Or test with an existing MINTED batch

### Error: "Bạn không có quyền cập nhật..." (but you're the Inspector)
**Solution**:
1. Verify JWT token belongs to the batch's Inspector
2. Check `batch.inspectorId` matches `req.user._id`
3. Re-login and get a fresh token

### Error: "Connection refused" or backend not responding
**Solution**:
1. Start backend: `npm start` (in backend directory)
2. Check MongoDB connection
3. Verify API_URL in .env matches backend port (default 8080)

---

## ✅ Verification Checklist

Before considering testing complete:

- [ ] Test 1 passes: Happy path returns 200 with newIpfsHash
- [ ] Test 2 passes: Missing location returns 400
- [ ] Test 3 passes: Missing status returns 400
- [ ] Test 4 passes: Empty location returns 400
- [ ] Test 5 passes: No JWT returns 401
- [ ] Test 6 passes: Invalid batch returns 404
- [ ] Test 7 passes: **Unauthorized user returns 403** ← NEW & IMPORTANT
- [ ] IPFS hash is updated after successful request
- [ ] Blockchain transaction confirmed (check txHash)
- [ ] NFT metadata reflects new shipping logs

---

## 📊 Test Data Requirements

For comprehensive testing, you may need:

| User Type | Count | Purpose |
|-----------|-------|---------|
| Inspector | ≥2 | Test authorization (owner vs non-owner) |
| Farmer | ≥1 | Test unauthorized access |
| Admin | ≥1 | (Optional) Test admin override if implemented |
| Batch (MINTED) | ≥1 | Test happy path |
| Batch (Non-MINTED) | 1 | Test status validation |

---

## 📝 Test Report Template

After testing, fill out:

```markdown
# Stream 5 Testing Report
Date: [date]
Tester: [name]
Environment: [local/staging/production]

## Test Results
- [ ] All 7 tests passed
- [ ] Manual authorization test passed
- [ ] Blockchain transaction verified
- [ ] IPFS hash updated correctly

## Issues Found
(If any)
1. ...
2. ...

## Sign-off
Tester: _______________
Date: _______________
Ready for next stage: YES / NO
```

---

## 🚀 Next Steps After Testing

1. ✅ All tests pass → Ready for code review
2. ✅ Code review approved → Ready for staging deployment
3. ✅ Staging verified → Ready for production deployment
4. ✅ Production deployed → Monitor for errors

---

**Questions?** Check the full bug fix documentation:
- `docs/STREAM5-BUG-FIXES.md` - Technical details
- `docs/STREAM5-COMPLETION-REPORT.md` - Complete overview
