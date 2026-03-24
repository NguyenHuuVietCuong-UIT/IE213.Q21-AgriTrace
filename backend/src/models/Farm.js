const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
    farmName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // nếu có model User
        required: true
    }
}, {
    timestamps: false, // vì schema không có createdAt/updatedAt
    collection: 'farm'
});

module.exports = mongoose.model('Farm', farmSchema);