const Farm = require('../models/Farm');
const mongoose = require('mongoose');

const farmDao = {
    createFarm: async (farmData) => {
        return await Farm.create(farmData);
    },

    // Tìm trang trại theo chủ sở hữu (Nông dân)
    getFarmsByOwner: async (ownerId) => {
        return await Farm.find({ ownerId }).sort({ createdAt: -1 });
    }
};

module.exports = farmDao;