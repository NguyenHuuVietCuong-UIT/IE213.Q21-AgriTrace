const mongoose = require('mongoose');

// Khai báo Schema cho từng đối tượng bên trong mảng logs
const logSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  imageUrl: { type: String, default: "" } // TRƯỜNG HÌNH ẢNH MỚI ĐƯỢC THÊM VÀO
}, { _id: false });

// Schema chính của Lô hàng
const batchSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  harvestDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'LOCKED', 'MINTED'], default: 'PENDING' },
  logs: [logSchema], // Mảng logs chứa hình ảnh nằm ở đây
  ipfsHash: { type: String },
  tokenId: { type: Number },
  txHash: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);