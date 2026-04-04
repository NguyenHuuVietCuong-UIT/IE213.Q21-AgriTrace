// Đọc các biến môi trường từ file .env ngay từ dòng đầu tiên
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// ============================================================================
// 1. IMPORT CÁC ROUTES
// ============================================================================
// (Giả sử bạn đã tạo các file này trong thư mục src/routes)
const userRoutes = require('./src/routes/user');
const batchRoutes = require('./src/routes/batch');
const publicRoutes = require('./src/routes/public');

// Khởi tạo ứng dụng Express
const app = express();

// ============================================================================
// 2. CẤU HÌNH MIDDLEWARE TOÀN CỤC
// ============================================================================
// Bật CORS để cho phép Frontend (React/Next.js) gọi API ở port khác mà không bị chặn
app.use(cors());

// Cho phép Express tự động parse dữ liệu JSON gửi lên từ req.body
app.use(express.json());

// ============================================================================
// 3. GẮN ROUTES VÀO ỨNG DỤNG
// ============================================================================
app.get('/api/ping', (req, res) => {
    res.json({ success: true, message: 'AgriTrace Backend đang hoạt động ổn định! 🚀' });
});

// Các API nghiệp vụ
app.use('/api/user', userRoutes);       // Đăng ký, đăng nhập, nonce...
app.use('/api/batches', batchRoutes);   // Tạo lô hàng, thêm nhật ký, update IPFS...
app.use('/api/public', publicRoutes);   // Tracking public (có gắn rate-limit ở trong)
app.use('/api/resources', require('./routes/resourceRoutes')); // Các route liên quan đến tài nguyên (nông trại, sản phẩm, kiểm định viên)

// ============================================================================
// 4. KẾT NỐI MONGODB & KHỞI CHẠY SERVER
// ============================================================================
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('LỖI NGHIÊM TRỌNG: Chưa khai báo MONGO_URI trong file .env');
    process.exit(1); // Dừng server ngay lập tức nếu không có kết nối DB
}

// Kết nối Mongoose
mongoose.connect(MONGO_URI)
    .then((conn) => {
        console.log(`Kết nối MongoDB thành công!`);
        console.log(`Host: ${conn.connection.host}`);
        // ĐÁP ỨNG YÊU CẦU CỦA BẠN: In ra tên của Database đang dùng
        console.log(`Database: [ ${conn.connection.name} ]`);

        // Chỉ khi DB kết nối thành công thì mới mở port cho user truy cập
        app.listen(PORT, () => {
            console.log(`Server đang lắng nghe tại http://localhost:${PORT}`);
            console.log(`=======================================================`);
        });
    })
    .catch((err) => {
        console.error(`Lỗi kết nối MongoDB: ${err.message}`);
        process.exit(1);
    });