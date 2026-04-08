const farmDao = require('../daos/farmDao');
const productDao = require('../daos/productDao');
const userDao = require('../daos/userDAO');
const Farm = require('../models/Farm');
const Product = require('../models/Product');

const resourceController = {
    // ==========================================
    // QUẢN LÝ NÔNG TRẠI (FARM)
    // ==========================================
    getMyFarm: async (req, res) => {
        try {
            // Tìm nông trại có ownerId là id của user đang đăng nhập
            const farm = await Farm.findOne({ ownerId: req.user.id });
            return res.json({ success: true, data: farm }); // Có thể trả về null nếu chưa có
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi khi lấy thông tin nông trại', error: err.message });
        }
    },

    addFarm: async (req, res) => {
        const { name, location, description } = req.body;

        if (!name || !location) {
            return res.status(400).json({ message: 'Vui lòng nhập tên và vị trí nông trại' });
        }

        try {
            // Kiểm tra xem User đã có nông trại chưa
            const existingFarm = await Farm.findOne({ ownerId: req.user.id });
            if (existingFarm) {
                return res.status(400).json({ message: 'Mỗi tài khoản chỉ được tạo tối đa 1 nông trại!' });
            }

            // SỬA LỖI 500 Ở ĐÂY: Dùng đúng tên trường 'farmName' của file Farm.js
            // Gọi thẳng Farm.create để tránh việc DAO map sai dữ liệu
            const farm = await Farm.create({
                farmName: name,
                location: location,
                ownerId: req.user.id
            });

            return res.status(201).json({ success: true, data: farm });
        } catch (err) {
            console.error("Lỗi khi addFarm:", err); // Sẽ in ra terminal backend nếu có lỗi
            return res.status(500).json({ message: 'Lỗi khi tạo nông trại', error: err.message });
        }
    },

    // ==========================================
    // QUẢN LÝ SẢN PHẨM (PRODUCT)
    // ==========================================
    addProduct: async (req, res) => {
        const { name, farmId, description } = req.body;

        if (!name || !farmId) {
            return res.status(400).json({ message: 'Vui lòng nhập tên sản phẩm và ID nông trại' });
        }

        try {
            const Product = require('../models/Product'); // Import model Product trực tiếp

            // SỬA LỖI: Dùng đúng trường 'productName' và thêm 'createdAt' theo đúng Model Product.js
            const product = await Product.create({
                productName: name,
                description: description || 'Không có mô tả',
                farmId: farmId,
                createdAt: new Date() // Bắt buộc phải có ngày tạo theo schema
            });

            return res.status(201).json({ success: true, data: product });
        } catch (err) {
            console.error("Lỗi khi addProduct:", err);
            return res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error: err.message });
        }
    },

    searchProducts: async (req, res) => {
        // Lấy từ khóa từ query string (VD: ?q=cà chua)
        const keyword = req.query.q;

        try {
            const products = await productDao.searchProducts(keyword);
            return res.json({ success: true, data: products });
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi khi tìm kiếm sản phẩm', error: err.message });
        }
    },

    // ==========================================
    // TÌM KIẾM NGƯỜI KIỂM ĐỊNH (INSPECTOR)
    // ==========================================
    searchInspectors: async (req, res) => {
        const keyword = req.query.q;

        try {
            const inspectors = await userDao.searchInspectors(keyword);
            return res.json({ success: true, data: inspectors });
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi khi tìm kiếm kiểm định viên', error: err.message });
        }
    }
};

module.exports = resourceController;