const farmDao = require('../daos/farmDao');
const productDao = require('../daos/productDao');
const userDao = require('../daos/userDAO');

const resourceController = {
    // ==========================================
    // QUẢN LÝ NÔNG TRẠI (FARM)
    // ==========================================
    addFarm: async (req, res) => {
        const { name, location, description } = req.body;

        if (!name || !location) {
            return res.status(400).json({ message: 'Vui lòng nhập tên và vị trí nông trại' });
        }

        try {
            const farm = await farmDao.createFarm({
                name,
                location,
                description,
                ownerId: req.user._id // Gắn với tài khoản Nông dân đang đăng nhập
            });
            return res.status(201).json({ success: true, data: farm });
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi khi tạo nông trại', error: err.message });
        }
    },

    // ==========================================
    // QUẢN LÝ SẢN PHẨM (PRODUCT)
    // ==========================================
    addProduct: async (req, res) => {
        const { name, farmId, description, seedInfo } = req.body;

        if (!name || !farmId) {
            return res.status(400).json({ message: 'Vui lòng nhập tên sản phẩm và ID nông trại' });
        }

        try {
            // (Tùy chọn): Có thể kiểm tra xem farmId này có đúng là của Nông dân này không
            const product = await productDao.createProduct({
                name,
                farmId,
                description,
                seedInfo
            });
            return res.status(201).json({ success: true, data: product });
        } catch (err) {
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