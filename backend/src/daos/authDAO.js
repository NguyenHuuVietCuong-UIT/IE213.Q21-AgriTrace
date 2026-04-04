const User = require('../models/User');

const userDao = {
    // ==========================================
    // NHÓM TRUY VẤN CHUNG VÀ KHỞI TẠO
    // ==========================================

    /**
     * Tạo một User mới (dùng chung cho cả Farmer và Inspector)
     * @param {Object} userData - Dữ liệu user cần tạo
     */
    createUser: async (userData) => {
        return await User.create(userData);
    },

    /**
     * Cập nhật Nonce mới cho User theo ID
     * @param {String} userId - ID của user
     * @param {String} newNonce - Chuỗi nonce mới
     */
    updateNonce: async (userId, newNonce) => {
        return await User.findByIdAndUpdate(
            userId,
            { nonce: newNonce },
            { new: true } // Trả về document sau khi đã update
        );
    },

    // ==========================================
    // NHÓM TRUY VẤN CHO FARMER (WEB2)
    // ==========================================

    /**
     * Tìm user bằng Email
     */
    findByEmail: async (email) => {
        return await User.findOne({ email });
    },

    /**
     * Tìm user bằng Email và Role cụ thể
     */
    findByEmailAndRole: async (email, role) => {
        return await User.findOne({ email, role });
    },

    // ==========================================
    // NHÓM TRUY VẤN CHO INSPECTOR (WEB3)
    // ==========================================

    /**
     * Tìm user bằng địa chỉ ví
     */
    findByWallet: async (walletAddress) => {
        return await User.findOne({ walletAddress });
    },

    /**
     * Tìm user bằng địa chỉ ví và Role cụ thể
     */
    findByWalletAndRole: async (walletAddress, role) => {
        return await User.findOne({ walletAddress, role });
    }
};

module.exports = userDao;