/*
 * ========================================
 * FILE: ROUTES/USERROUTES.JS
 * MÔ TẢ: Định tuyến các API liên quan đến User
 * CẬP NHẬT (TUẦN 5): Tích hợp Mongoose Model
 * ========================================
 */

const express = require('express');
const router = express.Router();

// Ghi chú (Quan trọng): Import Mongoose Model
// Giờ đây, thay vì tạo JSON ảo, chúng ta sẽ dùng Model 'User'
// để tương tác với Collection 'users' trong MongoDB.
const User = require('../models/User'); 
// (Giả sử file User.js nằm trong thư mục models)
// BƯỚC 1: Import middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// ----------------------------------------------------
// 1. ENDPOINT: TẠO NGƯỜI DÙNG MỚI (CREATE)
// Phương thức: POST | Đường dẫn cuối cùng: /api/v1/users/
// Ghi chú: Chúng ta sử dụng async/await vì thao tác với CSDL là bất đồng bộ
// ----------------------------------------------------
// router.post('/', async (req, res) => {
//     try {
//         // Ghi chú: req.body chứa dữ liệu JSON từ Postman (nhờ express.json())
//         // Chúng ta sẽ tạo một User mới dựa trên Schema đã định nghĩa
//         // Ghi chú: req.body bây giờ chứa "username", "email", và "password" (thô)
//         // Hook 'pre-save' trong User.js sẽ tự động HASH 'password'

//         const newUser = await User.create(req.body);

//         // Trả về 201 Created và dữ liệu user vừa tạo
//         // Ghi chú: newUser trả về ở đây sẽ KHÔNG có trường password
//         // vì chúng ta đã đặt 'select: false' trong Schema.

//         res.status(201).json({
//             message: "Tạo User thành công!",
//             data: newUser
//         });

//     } catch (err) {
//         // Ghi chú: Xử lý lỗi nếu dữ liệu không hợp lệ (ví dụ: trùng email, thiếu trường required)
//         // Ghi chú: Nếu validation (minlength: 6) thất bại, lỗi sẽ rơi vào đây.
//         res.status(400).json({
//             message: "Tạo User thất bại",
//             error: err.message 
//         });
//     }
// });

// ----------------------------------------------------
// 2. ENDPOINT: LẤY DANH SÁCH NGƯỜI DÙNG (READ ALL)
// / 2. ENDPOINT: LẤY DANH SÁCH USER (Chỉ Admin) --> WEEK09
// Phương thức: GET  | Đường dẫn cuối cùng: /api/v1/users/
// ----------------------------------------------------
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        // Ghi chú: Dùng Mongoose Model. User.find({}) tìm tất cả tài liệu
        const users = await User.find();
        
        // Trả về 200 OK và toàn bộ danh sách users
        res.status(200).json({
            message: "Lấy danh sách Users thành công (Admin only",
            count: users.length,
            data: users
        });

    } catch (err) {
        // Ghi chú: Xử lý lỗi nếu Server CSDL gặp sự cố
        res.status(500).json({
            message: "Lỗi Server",
            error: err.message
        });
    }
});

// ----------------------------------------------------
// 3. ENDPOINT: LẤY CHI TIẾT NGƯỜI DÙNG (MY PROFILE)
// Phương thức: GET  | Đường dẫn cuối cùng: /api/v1/users/me
// ----------------------------------------------------
router.get('/me', protect, async (req, res) => {
    try {
        // Ghi chú: Lấy ID từ URL (req.params.id)
        const userId = req.user.id;
        const user = await User.findById(userId);
    // Ghi chú: Middleware 'protect' đã tìm user và gán vào req.user
    // Chúng ta chỉ cần trả về req.user

        if (!user) {
            // Ghi chú: Nếu không tìm thấy user, trả về 404
            return res.status(404).json({ message: `Không tìm thấy User với ID: ${userId}` });
        }
        
        // Trả về 200 OK và dữ liệu user tìm thấy
        res.status(200).json({
            message: "Lấy thông tin cá nhân thành công",
            data: req.user
        });

    } catch (err) {
        res.status(500).json({
            message: "Lỗi Server",
            error: err.message
        });
    }
});
// ----------------------------------------------------
// 4. ENDPOINT: LẤY CHI TIẾT USER (Chỉ Admin)
// Phương thức: GET  | Đường dẫn: /api/v1/users/:id
// ----------------------------------------------------
router.get('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: `Không tìm thấy User` });
        }
        res.status(200).json({ message: "Tìm thấy User", data: user });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
});

// ----------------------------------------------------
// 5. ENDPOINT: CẬP NHẬT USER (Chỉ Admin)
// Phương thức: PUT | Đường dẫn: /api/v1/users/:id
// ----------------------------------------------------
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        // (Logic PUT giữ nguyên...)
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({ message: `Không tìm thấy User` });
        }
        res.status(200).json({ message: `Cập nhật User thành công`, data: updatedUser });
    } catch (err) {
        res.status(400).json({ message: "Cập nhật thất bại", error: err.message });
    }
});


// ----------------------------------------------------
// 6. ENDPOINT: XÓA NGƯỜI DÙNG (DELETE)
// Phương thức: DELETE | Đường dẫn cuối cùng: /api/v1/users/:id
// ----------------------------------------------------
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const userId = req.params.id;
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: `Không tìm thấy User với ID: ${userId}` });
        }
        
        // Ghi chú: Chuẩn RESTful trả về 204 No Content (không có nội dung) khi xóa thành công
        res.status(204).send();

    } catch (err) {
        res.status(500).json({
            message: "Lỗi Server",
            error: err.message
        });
    }
});


module.exports = router;