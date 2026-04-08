const Product = require('../models/Product');
const mongoose = require('mongoose');

const productDao = {
    createProduct: async (productData) => {
        return await Product.create(productData);
    },

    /**
     * Thuật toán tìm kiếm thông minh: 
     * Nếu keyword là một chuỗi 24 ký tự hợp lệ -> Tìm theo chính xác ID
     * Nếu không -> Tìm gần đúng (Contains) theo Tên sản phẩm, không phân biệt hoa thường
     */
    searchProducts: async (keyword) => {
        const query = {};

        if (keyword) {
            if (mongoose.Types.ObjectId.isValid(keyword)) {
                query._id = keyword; // Tìm chính xác theo ID
            } else {
                query.productName = { $regex: keyword, $options: 'i' }; // 'i' là case-insensitive
            }
        }

        // Trả về tối đa 20 kết quả để tối ưu tốc độ cho Frontend
        return await Product.find(query).populate('farmId', 'name location').limit(20);
    }
};

module.exports = productDao;