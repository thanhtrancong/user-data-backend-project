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

// ----------------------------------------------------
// 1. ENDPOINT: TẠO NGƯỜI DÙNG MỚI (CREATE)
// Phương thức: POST | Đường dẫn cuối cùng: /api/v1/users/
// Ghi chú: Chúng ta sử dụng async/await vì thao tác với CSDL là bất đồng bộ
// ----------------------------------------------------
router.post('/', async (req, res) => {
    try {
        // Ghi chú: req.body chứa dữ liệu JSON từ Postman (nhờ express.json())
        // Chúng ta sẽ tạo một User mới dựa trên Schema đã định nghĩa
        // (Lưu ý: Tuần này chúng ta chưa mã hóa passwordHash, sẽ làm ở Tuần 7)
        const newUser = await User.create(req.body);

        // Trả về 201 Created và dữ liệu user vừa tạo
        res.status(201).json({
            message: "Tạo User thành công!",
            data: newUser
        });

    } catch (err) {
        // Ghi chú: Xử lý lỗi nếu dữ liệu không hợp lệ (ví dụ: trùng email, thiếu trường required)
        res.status(400).json({
            message: "Tạo User thất bại",
            error: err.message 
        });
    }
});

// ----------------------------------------------------
// 2. ENDPOINT: LẤY DANH SÁCH NGƯỜI DÙNG (READ ALL)
// Phương thức: GET  | Đường dẫn cuối cùng: /api/v1/users/
// ----------------------------------------------------
router.get('/', async (req, res) => {
    try {
        // Ghi chú: Dùng Mongoose Model. User.find({}) tìm tất cả tài liệu
        const users = await User.find();
        
        // Trả về 200 OK và toàn bộ danh sách users
        res.status(200).json({
            message: "Lấy danh sách Users thành công",
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
// 3. ENDPOINT: LẤY CHI TIẾT NGƯỜI DÙNG (READ ONE)
// Phương thức: GET  | Đường dẫn cuối cùng: /api/v1/users/:id
// ----------------------------------------------------
router.get('/:id', async (req, res) => {
    try {
        // Ghi chú: Lấy ID từ URL (req.params.id)
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            // Ghi chú: Nếu không tìm thấy user, trả về 404
            return res.status(404).json({ message: `Không tìm thấy User với ID: ${userId}` });
        }
        
        // Trả về 200 OK và dữ liệu user tìm thấy
        res.status(200).json({
            message: "Tìm thấy User",
            data: user
        });

    } catch (err) {
        res.status(500).json({
            message: "Lỗi Server",
            error: err.message
        });
    }
});

// ----------------------------------------------------
// 4. ENDPOINT: CẬP NHẬT NGƯỜI DÙNG (UPDATE)
// Phương thức: PUT/PATCH | Đường dẫn cuối cùng: /api/v1/users/:id
// ----------------------------------------------------
router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;

        // Ghi chú: Tìm và cập nhật
        // { new: true } để trả về tài liệu *sau* khi đã cập nhật
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: `Không tìm thấy User với ID: ${userId}` });
        }
        
        res.status(200).json({
            message: `Cập nhật User ID ${userId} thành công`,
            data: updatedUser
        });

    } catch (err) {
        res.status(400).json({
            message: "Cập nhật thất bại",
            error: err.message
        });
    }
});

// ----------------------------------------------------
// 5. ENDPOINT: XÓA NGƯỜI DÙNG (DELETE)
// Phương thức: DELETE | Đường dẫn cuối cùng: /api/v1/users/:id
// ----------------------------------------------------
router.delete('/:id', async (req, res) => {
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