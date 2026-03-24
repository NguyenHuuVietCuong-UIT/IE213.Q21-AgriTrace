const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    farmId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm', // liên kết với Farm
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: false
});

module.exports = mongoose.model('Product', productSchema);