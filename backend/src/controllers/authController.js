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

// --- LOGIC CHO NÔNG DÂN (FARMER - WEB2) ---
exports.registerFarmer = async (req, res) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ email, tên và mật khẩu' });
    }

    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email này đã được đăng ký' });

        const hashed = await bcrypt.hash(password, 10);
        const farmer = await User.create({
            email,
            name,
            passwordHash: hashed,
            role: 'FARMER'
        });

        res.status(201).json({ user: { id: farmer._id, email: farmer.email, name: farmer.name, role: 'FARMER' } });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};

exports.loginFarmer = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });

    try {
        const user = await User.findOne({ email, role: 'FARMER' });
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ' });
        }

        const token = getJwt(user);
        res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};

// --- LOGIC CHO NHÀ KIỂM ĐỊNH (INSPECTOR - WEB3) ---
exports.requestNonce = async (req, res) => {
    const { walletAddress } = req.body;
    if (!ethers.isAddress(walletAddress)) return res.status(400).json({ message: 'Địa chỉ ví không hợp lệ' });

    const address = walletAddress.toLowerCase();
    try {
        const inspector = await User.findOne({ walletAddress: address, role: 'INSPECTOR' });
        if (!inspector) return res.status(404).json({ message: 'Ví kiểm định viên chưa được đăng ký trong hệ thống' });

        inspector.nonce = makeNonce();
        await inspector.save();
        res.json({ nonce: inspector.nonce });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};

exports.verifyInspector = async (req, res) => {
    const { walletAddress, signature } = req.body;
    const address = walletAddress.toLowerCase();

    try {
        const inspector = await User.findOne({ walletAddress: address, role: 'INSPECTOR' });
        if (!inspector) return res.status(401).json({ message: 'Không tìm thấy kiểm định viên' });

        const message = `AgriTrace login nonce: ${inspector.nonce}`;
        try {
            const signer = ethers.verifyMessage(message, signature);
            if (signer.toLowerCase() !== address) throw new Error();
        } catch (err) {
            return res.status(401).json({ message: 'Xác thực chữ ký thất bại' });
        }

        inspector.nonce = makeNonce(); // Reset nonce sau khi dùng để chống replay attack
        await inspector.save();

        const token = getJwt(inspector);
        res.json({ token, user: { id: inspector._id, walletAddress: inspector.walletAddress, name: inspector.name, role: inspector.role } });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};

// Thêm hàm Đăng ký Kiểm định viên
exports.registerInspector = async (req, res) => {
    const { name, walletAddress } = req.body;

    if (!name || !walletAddress) {
        return res.status(400).json({ message: 'Vui lòng cung cấp tên và địa chỉ ví MetaMask' });
    }

    if (!ethers.isAddress(walletAddress)) {
        return res.status(400).json({ message: 'Địa chỉ ví không hợp lệ' });
    }

    const address = walletAddress.toLowerCase();

    try {
        const existing = await User.findOne({ walletAddress: address });
        if (existing) return res.status(400).json({ message: 'Ví này đã được đăng ký trong hệ thống' });

        const inspector = await User.create({
            name,
            walletAddress: address,
            role: 'INSPECTOR',
            nonce: makeNonce()
        });

        res.status(201).json({
            message: 'Đăng ký thành công',
            user: { id: inspector._id, name: inspector.name, walletAddress: inspector.walletAddress, role: 'INSPECTOR' }
        });
    } catch (err) {
        // Log lỗi ra console của backend để dễ debug
        console.error("Lỗi khi tạo Inspector:", err);
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};