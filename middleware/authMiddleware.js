/*
 * ========================================
 * FILE: MIDDLEWARE/AUTHMIDDLEWARE.JS
 * MÔ TẢ: Middleware để kiểm tra Token (JWT) và Phân quyền
 * ========================================
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Cần Model User để tìm user

// --- 1. MIDDLEWARE: BẢO VỆ (PROTECT) ---
// Ghi chú: Middleware này dùng để kiểm tra xem user đã đăng nhập chưa (có token hợp lệ không)
exports.protect = async (req, res, next) => {
    let token;

    // 1. Kiểm tra xem Header Authorization có tồn tại và bắt đầu bằng 'Bearer' không
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Lấy token từ header (Bỏ chữ 'Bearer ')
            // Kết quả: 'Bearer eyJhbGciOi...' -> 'eyJhbGciOi...'
            token = req.headers.authorization.split(' ')[1];

            // 3. Xác minh (Verify) token
            // Ghi chú: Dùng Khóa bí mật (JWT_SECRET) để giải mã token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Lấy thông tin User từ ID trong token (Payload)
            // Ghi chú: Gắn thông tin user vào đối tượng req (trừ password)
            // Bất kỳ API nào chạy sau middleware này đều sẽ có req.user
            req.user = await User.findById(decoded.id).select('-password');
            
            // 5. Cho phép đi tiếp
            next(); 
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Không có quyền truy cập, token không hợp lệ' });
        }
    }

    // 6. Nếu không có token
    if (!token) {
        res.status(401).json({ message: 'Không có quyền truy cập, không tìm thấy token' });
    }
};
// --- 2. MIDDLEWARE: PHÂN QUYỀN (AUTHORIZE) ---
// Ghi chú: Middleware này dùng để kiểm tra vai trò (role)
// ...roles là một mảng các vai trò được phép (ví dụ: 'admin', 'moderator')
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Ghi chú: Middleware này phải chạy SAU 'protect', vì nó cần req.user
        if (!req.user) {
            return res.status(401).json({ message: 'Lỗi không xác định được người dùng' });
        }
        
        // 2. Kiểm tra xem 'role' của user (từ req.user) có nằm trong mảng 'roles' được phép không
        if (!roles.includes(req.user.role)) {
            // 3. Nếu không có quyền -> Trả về lỗi 403 Forbidden
            return res.status(403).json({ 
                message: `Vai trò '${req.user.role}' không có quyền thực hiện chức năng này` 
            });
        }
        
        // 4. Nếu có quyền -> Cho đi tiếp
        next();
    };
};

