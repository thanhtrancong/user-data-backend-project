/*
 * ========================================
 * FILE: ROUTES/AUTHROUTES.JS (MỚI)
 * MÔ TẢ: Xử lý Đăng ký (Register) và Đăng nhập (Login)
 * ========================================
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import User model
const bcrypt = require('bcryptjs'); // Import bcrypt
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// --- HÀM TẠO TOKEN ---
// Ghi chú: Tạo một hàm helper để tạo token
const generateToken = (id) => {
    // Ghi chú: jwt.sign(payload, secret_key, options)
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token hết hạn sau 30 ngày
    });
};

// --- 1. ENDPOINT: TẠO USER MỚI (REGISTER) ---
// Đường dẫn: POST /api/v1/auth/register
router.post('/register', async (req, res) => {
    try {
        // Ghi chú: Chúng ta lấy 'password' thô từ req.body
        const { username, email, password, profile, role } = req.body;

        // 1. Kiểm tra xem user đã tồn tại chưa
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // 2. Tạo user mới
        // Ghi chú: Hook 'pre-save' trong User.js sẽ tự động HASH 'password'
        const newUser = await User.create({
            username,
            email,
            password, // Gửi password thô vào
            profile,
            role
        });

        // 3. Trả về thông tin user (trừ password) và cấp Token ngay
        if (newUser) {
            res.status(201).json({
                message: "Tạo User thành công!",
                data: {
                    _id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                },
                token: generateToken(newUser._id) // Cấp token
            });
        }
    } catch (err) {
        res.status(400).json({ message: "Tạo User thất bại", error: err.message });
    }
});

// --- 2. ENDPOINT: ĐĂNG NHẬP (LOGIN) ---
// Đường dẫn: POST /api/v1/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. Tìm user bằng email
        // Ghi chú (Rất quan trọng): Vì Schema có 'select: false',
        // chúng ta phải dùng .select('+password') để lấy lại trường password khi đăng nhập
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            // Ghi chú: Không nên nói "Email không tồn tại" (lộ thông tin)
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // 2. So sánh mật khẩu
        // Ghi chú: Dùng bcrypt.compare để so sánh mật khẩu thô (từ req.body)
        // với mật khẩu đã hash (từ CSDL)
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // 3. Đăng nhập thành công: Trả về thông tin và Token
        res.status(200).json({
            message: "Đăng nhập thành công",
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token: generateToken(user._id)
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
});

module.exports = router;