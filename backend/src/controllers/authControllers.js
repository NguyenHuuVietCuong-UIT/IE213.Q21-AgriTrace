const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../models/User');

// Các hàm bổ trợ (Helper functions)
const getJwt = (user) => {
    return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

const makeNonce = () => Math.floor(100000 + Math.random() * 900000).toString();

// LOGIC XỬ LÝ CHÍNH
exports.registerFarmer = async (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: 'phone and password required' });

    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'Phone already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const farmer = await User.create({ phone, passwordHash: hashed, role: 'FARMER' });
    res.status(201).json({ user: { id: farmer._id, phone: farmer.phone, role: 'FARMER' } });
};

exports.loginFarmer = async (req, res) => {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone, role: 'FARMER' });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = getJwt(user);
    res.json({ token, user: { id: user._id, phone: user.phone, role: user.role } });
};

exports.requestNonce = async (req, res) => {
    const { walletAddress } = req.body;
    if (!ethers.isAddress(walletAddress)) return res.status(400).json({ message: 'Invalid address' });

    const address = walletAddress.toLowerCase();
    const inspector = await User.findOne({ walletAddress: address, role: 'INSPECTOR' });
    if (!inspector) return res.status(404).json({ message: 'Inspector not registered' });

    inspector.nonce = makeNonce();
    await inspector.save();
    res.json({ nonce: inspector.nonce });
};

exports.verifyInspector = async (req, res) => {
    const { walletAddress, signature } = req.body;
    const address = walletAddress.toLowerCase();
    const inspector = await User.findOne({ walletAddress: address, role: 'INSPECTOR' });
    if (!inspector) return res.status(401).json({ message: 'Inspector not found' });

    const message = `AgriTrace login nonce: ${inspector.nonce}`;
    try {
        const signer = ethers.verifyMessage(message, signature);
        if (signer.toLowerCase() !== address) throw new Error();
    } catch (err) {
        return res.status(401).json({ message: 'Signature verification failed' });
    }

    inspector.nonce = makeNonce(); // Reset nonce sau khi dùng
    await inspector.save();
    const token = getJwt(inspector);
    res.json({ token, user: { id: inspector._id, walletAddress: inspector.walletAddress, role: inspector.role } });
};