/*
 * ========================================
 * FILE: ROUTES/AUTHROUTES.JS (MỚI)
 * MÔ TẢ: Xử lý Đăng ký (Register) và Đăng nhập (Login)
 * ========================================
 */
// Ghi chú: Import các thư viện và module cần thiết
const express = require('express'); // Framework web Express
const router = express.Router(); // Tạo router để định nghĩa các route
const User = require('../models/User'); // Import User model để thao tác với collection Users
const bcrypt = require('bcryptjs'); // Thư viện hash và so sánh mật khẩu
const jwt = require('jsonwebtoken'); // Thư viện tạo và xác thực JSON Web Token
const sendEmail = require('../utils/sendEmail'); // Hàm gửi email
const crypto = require('crypto'); // Module có sẵn của Node.js để tạo hash và random string


// --- HÀM TẠO TOKEN ---
// Ghi chú: Tạo một hàm helper để tạo JWT token cho user
const generateToken = (id) => {
    // Ghi chú: jwt.sign(payload, secret_key, options)
    // - payload: Dữ liệu muốn mã hóa vào token (ở đây là user id)
    // - secret_key: Chuỗi bí mật để ký token (lấy từ biến môi trường)
    // - options: Cấu hình token (thời gian hết hạn)
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token hết hạn sau 30 ngày
    });
};

// --- 1. ENDPOINT: TẠO USER MỚI (REGISTER) ---
// Đường dẫn: POST /api/v1/auth/register
router.post('/register', async (req, res, next) => {
    try {
        // Ghi chú: Destructuring - lấy các trường từ request body
        const { username, email, password, profile, role } = req.body;

        // 1. Kiểm tra xem email đã tồn tại trong database chưa
        // Ghi chú: findOne() trả về 1 document hoặc null
        const userExists = await User.findOne({ email });
        if (userExists) {
            // Ghi chú: Return để dừng hàm, tránh code phía dưới chạy tiếp
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // 2. Tạo user mới vào database
        // Ghi chú: Hook 'pre-save' trong User.js sẽ tự động HASH 'password' trước khi lưu
        // Vì vậy ta gửi password thô vào, không cần hash thủ công
        const newUser = await User.create({
            username,
            email,
            password, // Gửi password thô vào, hook sẽ tự động hash
            profile,
            role
        });

        // 3. Trả về thông tin user (trừ password) và cấp Token ngay
        if (newUser) {
            // Ghi chú: status(201) = Created - tạo tài nguyên mới thành công
            res.status(201).json({
                message: "Tạo User thành công!",
                data: {
                    _id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                    // Ghi chú: KHÔNG trả về password vì lý do bảo mật
                },
                token: generateToken(newUser._id) // Tạo và trả về JWT token
            });
        }
    } catch (err) {
        // Ghi chú: next(err) chuyển lỗi xuống middleware errorHandler
        next(err);
    }
});

// --- 2. ENDPOINT: ĐĂNG NHẬP (LOGIN) ---
// Đường dẫn: POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
    try {
        // Ghi chú: Lấy email và password từ request body
        const { email, password } = req.body;
        
        // 1. Tìm user bằng email
        // Ghi chú (Rất quan trọng): Vì Schema có 'select: false' cho trường password,
        // chúng ta phải dùng .select('+password') để BUỘC lấy lại trường password
        // Dấu '+' nghĩa là thêm trường này vào kết quả (override select: false)
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            // Ghi chú: Không nên nói "Email không tồn tại" vì sẽ lộ thông tin
            // Luôn trả về thông báo chung chung để bảo mật
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // 2. So sánh mật khẩu thô với mật khẩu đã hash
        // Ghi chú: bcrypt.compare(plainPassword, hashedPassword)
        // - plainPassword: Mật khẩu thô từ req.body
        // - hashedPassword: Mật khẩu đã hash từ database
        // Trả về true nếu khớp, false nếu không khớp
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Ghi chú: status(401) = Unauthorized - Xác thực thất bại
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // 3. Đăng nhập thành công: Trả về thông tin user và JWT Token
        // Ghi chú: status(200) = OK - Yêu cầu thành công
        res.status(200).json({
            message: "Đăng nhập thành công",
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
                // Ghi chú: KHÔNG trả về password
            },
            token: generateToken(user._id) // Tạo JWT token cho phiên đăng nhập
        });
    } catch (err) {
        // Ghi chú: Chuyển lỗi xuống middleware errorHandler
        next(err);
    }
});

// --- 3. ENDPOINT: QUÊN MẬT KHẨU (Gửi Email) ---
// Đường dẫn: POST /api/v1/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
    try {
        // Ghi chú: Tìm user theo email từ request body
        const user = await User.findOne({ email: req.body.email });
        
        if (!user) {
            // Ghi chú: status(404) = Not Found - Không tìm thấy tài nguyên
            res.status(404);
            throw new Error('Không tìm thấy Email này trong hệ thống');
        }

        // Ghi chú: Gọi method tự định nghĩa trong User model để tạo reset token
        // Method này sẽ:
        // 1. Tạo chuỗi ngẫu nhiên (token gốc)
        // 2. Hash token và lưu vào user.resetPasswordToken
        // 3. Set thời gian hết hạn (10 phút)
        // 4. Trả về token gốc (chưa hash) để gửi qua email
        const resetToken = user.getResetPasswordToken();
        
        // Ghi chú: Lưu user với token và expiry time vào database
        // validateBeforeSave: false -> Bỏ qua validation (vì chỉ update 2 trường token)
        await user.save({ validateBeforeSave: false });

        // Ghi chú: Tạo URL reset password
        // req.protocol: http hoặc https
        // req.get('host'): Tên domain (localhost:5000)
        // resetToken: Token gốc chưa hash để gửi cho user
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

        // Ghi chú: Nội dung email gửi cho user
        const message = `Bạn vừa yêu cầu đổi mật khẩu. Hãy gửi request PUT đến link sau để đặt lại:\n\n${resetUrl}`;

        try {
            // Ghi chú: Gửi email chứa link reset password
            await sendEmail({
                email: user.email,
                subject: 'Token đổi mật khẩu (Hết hạn sau 10p)',
                message
            });
            
            // Ghi chú: Gửi email thành công
            res.status(200).json({ 
                success: true, 
                message: 'Đã gửi email hướng dẫn!' 
            });
        } catch (err) {
            // Ghi chú: Nếu gửi mail LỖI thì XÓA token trong DB đi
            // để user có thể thử lại từ đầu
            // 👇👇👇 THÊM DÒNG NÀY ĐỂ XEM LỖI Ở TERMINAL 👇👇👇
        console.log("CHI TIẾT LỖI GỬI MAIL:", err); 
        // 👆👆👆 ------------------------------------- 👆👆👆
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            
            return next(new Error('Không thể gửi email, vui lòng thử lại'));
        }
    } catch (err) {
        next(err);
    }
});

// --- 4. ENDPOINT: ĐẶT LẠI MẬT KHẨU (Reset Password) ---
// Đường dẫn: PUT /api/v1/auth/reset-password/:token
router.put('/reset-password/:token', async (req, res, next) => {
    try {
        // Ghi chú: Hash token từ URL để so sánh với token đã hash trong database
        // Vì trong DB ta lưu token đã hash (bảo mật), nên phải hash token từ URL
        // để so sánh 2 token đã hash với nhau
        const resetPasswordToken = crypto
            .createHash('sha256') // Tạo hash SHA-256
            .update(req.params.token) // Token lấy từ URL parameter
            .digest('hex'); // Chuyển thành chuỗi hex

        // Ghi chú: Tìm user có token khớp VÀ chưa hết hạn
        // $gt: greater than -> resetPasswordExpire phải > thời gian hiện tại
        const user = await User.findOne({
            resetPasswordToken, // Token phải khớp
            resetPasswordExpire: { $gt: Date.now() } // Chưa hết hạn
        });

        if (!user) {
            // Ghi chú: Token không tồn tại hoặc đã hết hạn (quá 10 phút)
            res.status(400);
            throw new Error('Token không hợp lệ hoặc đã hết hạn');
        }

        // Ghi chú: Đặt mật khẩu mới từ request body
        // Hook pre-save sẽ tự động hash mật khẩu mới này
        user.password = req.body.password;
        
        // Ghi chú: Xóa token đã dùng khỏi database (1 token chỉ dùng 1 lần)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        // Ghi chú: Lưu user với mật khẩu mới (đã hash) vào database
        await user.save();

        // Ghi chú: Trả về thông báo thành công
        res.status(200).json({ 
            success: true, 
            message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' 
        });
    } catch (err) {
        next(err);
    }
});

// Ghi chú: Export router để dùng trong server.js
module.exports = router;