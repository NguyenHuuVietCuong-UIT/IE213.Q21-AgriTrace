const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const userDao = require('../daos/userDAO');

// ==========================================
// CÁC HÀM BỔ TRỢ (HELPER FUNCTIONS)
// ==========================================

const getJwt = (user) => {
    return jwt.sign(
        { id: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const makeNonce = () => Math.floor(100000 + Math.random() * 900000).toString();

// ==========================================
// LOGIC CHO NÔNG DÂN (FARMER - WEB2)
// ==========================================

const authController = {
    registerFarmer: async (req, res) => {
        const { email, name, password } = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ email, tên và mật khẩu' });
        }

        try {
            // 1. Kiểm tra email tồn tại qua DAO
            const existing = await userDao.findByEmail(email);
            if (existing) {
                return res.status(400).json({ message: 'Email này đã được đăng ký' });
            }

            // 2. Xử lý nghiệp vụ: Mã hóa mật khẩu
            const hashed = await bcrypt.hash(password, 10);

            // 3. Lưu vào DB qua DAO
            const farmer = await userDao.createUser({
                email,
                name,
                passwordHash: hashed,
                role: 'FARMER'
            });

            return res.status(201).json({
                user: { id: farmer._id, email: farmer.email, name: farmer.name, role: farmer.role }
            });
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
        }
    },

    loginFarmer: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
        }

        try {
            // 1. Lấy dữ liệu qua DAO
            const user = await userDao.findByEmailAndRole(email, 'FARMER');

            // 2. Xử lý nghiệp vụ: So sánh mật khẩu
            if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
                return res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ' });
            }

            // 3. Cấp Token
            const token = getJwt(user);
            return res.json({
                token,
                user: { id: user._id, email: user.email, name: user.name, role: user.role }
            });
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
        }
    },
    // ==========================================
    // LOGIC CHO NGƯỜI VẬN CHUYỂN (DELIVERER - WEB2)
    // ==========================================

    registerDeliverer: async (req, res) => {
        const { email, name, password } = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ email, tên và mật khẩu' });
        }

        try {
            const existing = await userDao.findByEmail(email);
            if (existing) {
                return res.status(400).json({ message: 'Email này đã được đăng ký' });
            }

            const hashed = await bcrypt.hash(password, 10);

            // Truyền role là DELIVERER
            const deliverer = await userDao.createUser({
                email,
                name,
                passwordHash: hashed,
                role: 'DELIVERER'
            });

            return res.status(201).json({
                user: { id: deliverer._id, email: deliverer.email, name: deliverer.name, role: deliverer.role }
            });
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
        }
    },

    loginDeliverer: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
        }

        try {
            // Chỉ tìm user có role là DELIVERER
            const user = await userDao.findByEmailAndRole(email, 'DELIVERER');

            if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
                return res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ hoặc sai vai trò' });
            }

            const token = getJwt(user);
            return res.json({
                token,
                user: { id: user._id, email: user.email, name: user.name, role: user.role }
            });
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
        }
    },
    // ==========================================
    // LOGIC CHO NHÀ KIỂM ĐỊNH (INSPECTOR - WEB3)
    // ==========================================

    registerInspector: async (req, res) => {
        const { name, walletAddress } = req.body;

        if (!name || !walletAddress) {
            return res.status(400).json({ message: 'Vui lòng cung cấp tên và địa chỉ ví MetaMask' });
        }

        if (!ethers.isAddress(walletAddress)) {
            return res.status(400).json({ message: 'Địa chỉ ví không hợp lệ' });
        }

        const address = walletAddress.toLowerCase();

        try {
            // 1. Kiểm tra ví tồn tại qua DAO
            const existing = await userDao.findByWallet(address);
            if (existing) {
                return res.status(400).json({ message: 'Ví này đã được đăng ký trong hệ thống' });
            }

            // 2. Khởi tạo user qua DAO
            const inspector = await userDao.createUser({
                name,
                walletAddress: address,
                role: 'INSPECTOR',
                nonce: makeNonce()
            });

            return res.status(201).json({
                message: 'Đăng ký thành công',
                user: { id: inspector._id, name: inspector.name, walletAddress: inspector.walletAddress, role: inspector.role }
            });
        } catch (err) {
            console.error("Lỗi khi tạo Inspector:", err);
            return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
        }
    },

    requestNonce: async (req, res) => {
        const { walletAddress } = req.body;

        if (!ethers.isAddress(walletAddress)) {
            return res.status(400).json({ message: 'Địa chỉ ví không hợp lệ' });
        }

        const address = walletAddress.toLowerCase();

        try {
            // 1. Lấy Inspector qua DAO
            const inspector = await userDao.findByWalletAndRole(address, 'INSPECTOR');
            if (!inspector) {
                return res.status(404).json({ message: 'Ví kiểm định viên chưa được đăng ký trong hệ thống' });
            }

            // 2. Cập nhật Nonce qua DAO
            const updatedInspector = await userDao.updateNonce(inspector._id, makeNonce());

            return res.json({ nonce: updatedInspector.nonce });
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
        }
    },

    verifyInspector: async (req, res) => {
        const { walletAddress, signature } = req.body;
        const address = walletAddress.toLowerCase();

        try {
            // 1. Lấy dữ liệu qua DAO
            const inspector = await userDao.findByWalletAndRole(address, 'INSPECTOR');
            if (!inspector) {
                return res.status(401).json({ message: 'Không tìm thấy kiểm định viên' });
            }

            // 2. Xử lý nghiệp vụ Web3: Xác thực chữ ký
            const message = `AgriTrace login nonce: ${inspector.nonce}`;
            try {
                const signer = ethers.verifyMessage(message, signature);
                if (signer.toLowerCase() !== address) throw new Error();
            } catch (err) {
                return res.status(401).json({ message: 'Xác thực chữ ký thất bại' });
            }

            // 3. Reset nonce sau khi dùng để chống replay attack qua DAO
            await userDao.updateNonce(inspector._id, makeNonce());

            // 4. Cấp token
            const token = getJwt(inspector);
            return res.json({
                token,
                user: { id: inspector._id, walletAddress: inspector.walletAddress, name: inspector.name, role: inspector.role }
            });
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
        }
    }
};

module.exports = authController;