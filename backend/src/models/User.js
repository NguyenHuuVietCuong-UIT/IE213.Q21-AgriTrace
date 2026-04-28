const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, trim: true, unique: true, sparse: true },
    passwordHash: { type: String },
    walletAddress: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    role: { type: String, enum: ['FARMER', 'INSPECTOR', 'DELIVERER'], required: true },
    nonce: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
