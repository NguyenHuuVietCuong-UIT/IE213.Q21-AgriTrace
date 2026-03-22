const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  date: { type: Date, default: () => new Date() },
  activity: { type: String, required: true },
  notes: { type: String },
  imageUrl: { type: String }
});

const batchSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropType: { type: String, required: true },
  name: { type: String, required: true },
  estimatedQuantity: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'LOCKED', 'MINTED'], default: 'PENDING' },
  logs: [logSchema],
  ipfsLink: { type: String },
  tokenId: { type: String },
  txHash: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
