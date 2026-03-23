# AgriTrace Backend

## Cài đặt

1. `cd backend`
2. `npm install`
3. Tạo file `.env` từ `.env.example`
4. `npm run dev`

## API chính

- POST `/api/auth/farmer/register` Body: `{ email, password }`
- POST `/api/auth/farmer/login` Body: `{ email, password }`
- POST `/api/auth/inspector/request-nonce` Body: `{ walletAddress }`
- POST `/api/auth/inspector/verify` Body: `{ walletAddress, signature }`
- POST `/api/batches` (người FARMER) Body: `{ cropType, name, estimatedQuantity }`
- POST `/api/batches/:batchId/logs` (người FARMER) Body: `{ activity, notes?, imageUrl? }`
- POST `/api/batches/:batchId/complete` (người FARMER)
- GET `/api/batches/pending` (người INSPECTOR)
- POST `/api/batches/:batchId/pin` (người INSPECTOR)
- POST `/api/batches/:batchId/mint` (người INSPECTOR) Body: `{ tokenId, txHash }`
- GET `/api/public/batches/:id`

## Notes

- JWT gửi qua header: `Authorization: Bearer <token>`
- `inspector/verify` xác thực chữ ký với message `AgriTrace login nonce: <nonce>`
- `pin` lưu IPFS link qua Pinata và cập nhật batch.
