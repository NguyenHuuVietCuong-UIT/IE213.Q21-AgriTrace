const Batch = require('../models/Batch');

const publicDao = {
    getTrackingId: async (batchId) => {
        // Chỉ lấy những thông tin tối thiểu cần thiết
        return await Batch.findById(batchId).select('tokenId status txHash');
    }
};

module.exports = publicDao;