/*
 * ========================================
 * FILE: ROUTES/PRODUCTROUTES.JS
 * MÔ TẢ: API cho Sản phẩm (Có Lọc, Sắp xếp, Phân trang - Week 10)
 * ========================================
 */

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
// Import middleware bảo vệ (Week 08)
const { protect, authorize } = require('../middleware/authMiddleware');

// ==============================================================================
// 1. LẤY DANH SÁCH SẢN PHẨM (NÂNG CAO - WEEK 10)
// Public: Ai cũng xem được
// URL ví dụ: GET /api/v1/products?price[gte]=50000&sort=-price&page=1&limit=5
// ==============================================================================
router.get('/', async (req, res) => {
    try {
        // --- A. LỌC (FILTERING) ---
        // 1. Tạo bản sao của req.query để không ảnh hưởng object gốc
        const queryObj = { ...req.query };
        
        // 2. Các trường đặc biệt cần loại bỏ khỏi query lọc dữ liệu
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 3. Xử lý các toán tử so sánh (gte, gt, lte, lt)
        // Chuyển object thành chuỗi JSON
        let queryStr = JSON.stringify(queryObj);
        // Dùng Regex để thêm dấu '$' vào trước các toán tử (vd: gte -> $gte)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        
        // 4. Khởi tạo câu lệnh tìm kiếm (Chưa chạy ngay)
        let query = Product.find(JSON.parse(queryStr));

        // --- B. SẮP XẾP (SORTING) ---
        if (req.query.sort) {
            // Nếu có tham số sort (vd: ?sort=-price,name)
            // Mongoose cần định dạng: "-price name"
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            // Mặc định: Sắp xếp theo ngày tạo mới nhất
            query = query.sort('-createdAt');
        }

        // --- C. CHỌN TRƯỜNG (FIELD LIMITING) ---
        if (req.query.fields) {
            // Nếu muốn chỉ lấy vài trường (vd: ?fields=name,price)
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            // Mặc định: Trừ trường __v (của Mongoose)
            query = query.select('-__v');
        }

        // --- D. PHÂN TRANG (PAGINATION) ---
        // Chuyển đổi sang số (Multiplication by 1 is a trick to convert string to number)
        const page = req.query.page * 1 || 1;      // Trang hiện tại (Mặc định trang 1)
        const limit = req.query.limit * 1 || 10;   // Số lượng item mỗi trang (Mặc định 10)
        const skip = (page - 1) * limit;           // Số lượng item cần bỏ qua

        // Áp dụng skip và limit
        query = query.skip(skip).limit(limit);

        // --- E. THỰC THI QUERY ---
        const products = await query;

        // Trả về kết quả
        res.status(200).json({
            success: true,
            count: products.length,
            page: page,
            data: products
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==============================================================================
// 2. LẤY CHI TIẾT 1 SẢN PHẨM
// Public
// ==============================================================================
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==============================================================================
// 3. TẠO SẢN PHẨM MỚI
// Private: Chỉ Admin mới được tạo
// ==============================================================================
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công',
            data: newProduct
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// ==============================================================================
// 4. CẬP NHẬT SẢN PHẨM
// Private: Chỉ Admin mới được sửa
// ==============================================================================
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Trả về dữ liệu mới sau khi update
            runValidators: true // Chạy lại validate
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: product
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// ==============================================================================
// 5. XÓA SẢN PHẨM
// Private: Chỉ Admin mới được xóa
// ==============================================================================
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        res.status(204).send(); // 204 No Content
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;