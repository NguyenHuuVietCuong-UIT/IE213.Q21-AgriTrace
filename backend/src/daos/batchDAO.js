const Batch = require('../models/Batch');

const batchDao = {
    // ==========================================
    // NHÓM LẤY DỮ LIỆU (READ)
    // ==========================================

    /**
     * Lấy danh sách lô hàng theo ID của Nông dân
     */
    findByFarmer: async (farmerId) => {
        return await Batch.find({ farmerId })
            .populate('productId')
            .sort({ createdAt: -1 });
    },

    /**
     * Lấy danh sách lô hàng đang chờ kiểm định theo ID của Inspector
     */
    findByInspector: async (inspectorId) => {
        return await Batch.find({ inspectorId })
            .populate('productId')
            .populate('inspectorId', 'name email') // Bỏ populate farmId đi, dùng giống hệt hàm pending của bạn
            .sort({ createdAt: -1 });
    },

    findPendingByInspector: async (inspectorId) => {
        return await Batch.find({ inspectorId })
            .populate('productId')
            .populate('inspectorId', 'name email')
            .sort({ updatedAt: -1 });
    },

    /**
     * Lấy chi tiết 1 lô hàng theo ID (Có kèm thông tin Product)
     */
    findByIdWithProduct: async (batchId) => {
        return await Batch.findById(batchId).populate('productId');
    },

    /**
     * Lấy chi tiết 1 lô hàng theo ID (Không populate để tối ưu nếu không cần)
     */
    findById: async (batchId) => {
        return await Batch.findById(batchId);
    },

    // ==========================================
    // NHÓM TẠO VÀ CẬP NHẬT DỮ LIỆU (WRITE)
    // ==========================================

    /**
     * Tạo lô hàng mới
     */
    create: async (batchData) => {
        return await Batch.create(batchData);
    },

    /**
     * Cập nhật thông tin chung của lô hàng (Trạng thái, IPFS Hash, Blockchain TX...)
     */
    updateFields: async (batchId, updateData) => {
        return await Batch.findByIdAndUpdate(
            batchId,
            updateData,
            { new: true } // Trả về document sau khi update
        );
    },

    /**
     * Thêm một nhật ký mới vào mảng logs của lô hàng
     */
    pushLog: async (batchId, logData) => {
        return await Batch.findByIdAndUpdate(
            batchId,
            { $push: { logs: logData } }, // Dùng $push của MongoDB để thêm vào mảng
            { new: true }
        ).populate('productId');
    }
};

module.exports = batchDao;