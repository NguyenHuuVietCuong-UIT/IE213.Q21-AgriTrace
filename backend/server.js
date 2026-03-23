require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// CHỈNH SỬA: Đã xóa dòng require mongodb-memory-server gây lỗi

const authRoutes = require('./src/routes/auth');
const batchRoutes = require('./src/routes/batch');
const publicRoutes = require('./src/routes/public');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/public', publicRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AgriTrace backend running' });
});

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000; // Đổi mặc định thành 5000 cho khớp với các hướng dẫn trước

async function start() {
  try {
    // CHỈNH SỬA: Chỉ giữ lại logic kết nối trực tiếp tới MongoDB Atlas
    // Đảm bảo trong file .env bạn đặt tên biến là MONGODB_URI hoặc MONGO_URI cho khớp
    const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!dbUri) {
      console.error('LỖI: Chưa cấu hình MONGODB_URI trong file .env');
      process.exit(1);
    }

    await mongoose.connect(dbUri);
    console.log('✅ MongoDB Atlas connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup failure:', err.message);
    process.exit(1);
  }
}

start();