# 🚀 Stream 5 - Getting Started Guide

**Luồng 5: Cập nhật Hành trình Vận chuyển**

Hướng dẫn nhanh để bắt đầu sử dụng Stream 5 trên frontend.

---

## ⚡ Quick Start (5 Phút)

### 1. Khởi động Frontend Dev Server
```bash
cd frontend
npm install  # Nếu chưa cài
npm start
```
Frontend chạy tại: `http://localhost:3000`

### 2. Truy cập Trang Vận Chuyển
```
http://localhost:3000/shipping
```

### 3. Kiểm Tra Backend
Đảm bảo backend đang chạy:
```bash
cd backend
npm start
```
Backend chạy tại: `http://localhost:8080` (hoặc port khác trong `.env`)

### 4. Đăng Nhập
- Sử dụng tài khoản Inspector/User của bạn
- JWT token tự động lưu vào localStorage

### 5. Cập Nhật Vận Chuyển
- Vào `/shipping`
- Chọn lô hàng MINTED
- Click "Cập nhật vị trí"
- Nhập địa điểm & trạng thái
- Submit
- ✅ Done!

---

## 📁 File Structure

```
PROJECT ROOT
├── backend/                          [Backend Implementation]
│   ├── src/
│   │   ├── routes/batch.js          [UPDATED - Route added]
│   │   └── controllers/batchController.js  [UPDATED - Logic added]
│   ├── test-stream5-shipping.js      [Test suite]
│   ├── STREAM5_*.md                  [6 documentation files]
│   └── .env.stream5.example
│
└── frontend/                         [Frontend Implementation]
    ├── src/
    │   ├── components/Shipping/      [2 Components + styles]
    │   ├── pages/Shipping/           [1 Page + styles]
    │   ├── services/shippingService.js
    │   └── App.jsx                   [UPDATED - Route added]
    ├── STREAM5_FRONTEND_GUIDE.md
    ├── STREAM5_FRONTEND_CHECKLIST.md
    └── README.md
```

---

## 🔌 API Endpoint

```
POST /api/batches/:batchId/shipping

Example curl:
curl -X POST http://localhost:8080/api/batches/507f1f77bcf86cd799439011/shipping \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Kho lạnh Co.opMart Quận 1",
    "status": "Đang nhập kho"
  }'
```

---

## 📊 Components Overview

### ShippingUpdateModal
Modal form để cập nhật vận chuyển
- Location input
- Status dropdown (6 options)
- Form validation
- Loading/error states

### ShippingLog
Timeline hiển thị lịch sử vận chuyển
- Visual timeline
- Status & location display
- Timestamp formatting
- Image support

### ShippingManagement
Trang chính quản lý vận chuyển
- List MINTED batches
- Search functionality
- Statistics
- Modal integration

---

## 🔐 Authentication

Frontend tự động xử lý:
1. Lấy JWT từ localStorage
2. Gửi kèm Authorization header
3. Nếu token hết hạn → User tự đăng nhập lại

```javascript
// Tự động thêm vào header
Authorization: Bearer {token}
```

---

## 🧪 Testing

### Manual Test
```javascript
// 1. Vào http://localhost:3000/shipping
// 2. Chọn batch MINTED
// 3. Click "Cập nhật vị trí"
// 4. Nhập:
//    Location: "Kho lạnh Co.opMart Quận 1"
//    Status: "Đang nhập kho"
// 5. Submit
// 6. Kiểm tra success message
// 7. Scroll down để xem log mới
```

### API Test
```bash
# Test backend endpoint
node backend/test-stream5-shipping.js
```

---

## 📱 Responsive Design

Tự động thích ứng với:
- 💻 Desktop (1200px+)
- 📱 Tablet (768px - 1199px)
- 📱 Mobile (< 768px)

Bạn không cần làm gì, nó tự động!

---

## 🎨 UI Features

✨ **Timeline View**
- Visual dots and lines
- Status badges
- Timestamps
- Actor information

🎯 **Form Modal**
- Input validation
- Dropdown selection
- Character counter
- Error messages
- Loading state

📊 **Dashboard**
- Statistics cards
- Search bar
- Filter buttons
- Real-time updates

---

## 🔧 Environment Variables

### Backend (.env)
```env
ETH_RPC_URL=https://your-rpc
SYSTEM_PRIVATE_KEY=0x...
NFT_CONTRACT_ADDRESS=0x...
PINATA_API_KEY=...
PINATA_API_SECRET=...
MONGO_URI=mongodb://...
PORT=8080
```

### Frontend (.env)
```env
REACT_APP_API_BASE=http://localhost:8080/api
```

---

## 🐛 Troubleshooting

### "Không tải được lô hàng"
✅ Backend đang chạy?
✅ JWT token hợp lệ?
✅ Có lô hàng MINTED?

### "Modal không mở"
✅ Reload page
✅ Check browser console
✅ Kiểm tra state

### "Lỗi cập nhật"
✅ Check backend logs
✅ Verify API endpoint
✅ Kiểm tra JWT token

---

## 📚 Documentation

| Document | Mục Đích |
|----------|----------|
| [STREAM5_FRONTEND_GUIDE.md](./frontend/STREAM5_FRONTEND_GUIDE.md) | API & Integration |
| [STREAM5_FRONTEND_CHECKLIST.md](./frontend/STREAM5_FRONTEND_CHECKLIST.md) | Deployment guide |
| [backend/STREAM5_SHIPPING_GUIDE.md](./backend/STREAM5_SHIPPING_GUIDE.md) | Backend details |
| [STREAM5_COMPLETE_IMPLEMENTATION.md](./STREAM5_COMPLETE_IMPLEMENTATION.md) | Full overview |

---

## 🚀 Deployment

### Frontend
```bash
# Build
cd frontend
npm run build

# Deploy build/ folder to hosting
# Vercel, Netlify, GitHub Pages, etc.
```

### Backend
```bash
# Deploy to server
# Set environment variables
# Run with: node server.js
```

---

## ✅ Checklist

Frontend ready?
- [ ] npm start successfully
- [ ] Access /shipping page
- [ ] See batch list
- [ ] Can open modal
- [ ] API calls work

Backend ready?
- [ ] npm start successfully
- [ ] API responding
- [ ] Database connected
- [ ] IPFS configured
- [ ] Blockchain connected

---

## 💡 Tips

1. **Use search** - Tìm batch nhanh hơn
2. **Check logs** - Xem lịch sử chi tiết
3. **Mobile friendly** - Sử dụng trên phone
4. **Keyboard nav** - Tab để navigate
5. **Error messages** - Đọc kỹ thông báo lỗi

---

## 🎓 Learn More

### Components
```javascript
import { ShippingLog, ShippingUpdateModal } from './components/Shipping';
```

### Service
```javascript
import shippingService from './services/shippingService';
```

### Page
```javascript
import ShippingManagement from './pages/Shipping/ShippingManagement';
```

---

## 🤝 Need Help?

1. **Đọc documentation** - 5 guides available
2. **Check code comments** - Chi tiết trong code
3. **Look at examples** - Usage examples provided
4. **Review tests** - Test cases có comment
5. **Check browser console** - Error details

---

## 🎊 You're All Set!

✅ Backend implemented
✅ Frontend implemented
✅ Documentation complete
✅ Tests available
✅ Ready to deploy

**Enjoy using Stream 5!** 🚚✨

---

**Questions?** Check the detailed guides in documentation folder.

**Last Updated:** April 26, 2024
