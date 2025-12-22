const mongoose = require('mongoose');
// BƯỚC 1: Import bcryptjs
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Import thư viện có sẵn của Node.js 
// để tạo chuỗi ngẫu nhiên và hash token reset password
const userSchema = new mongoose.Schema({
        // ... các trường cũ (username, email, password, role...)
    
    // 👇 THÊM 2 TRƯỜNG NÀY trong bài gưit mail, forgetpassword
    resetPasswordToken: {
        type: String,
        select: false // 👈 Thêm để ẩn token khỏi query
    },
    resetPasswordExpire: Date,

    // (Giữ nguyên username, email, profile, role, orders, wishlist, cart...)
    username:
    {
        type: String,
        required: [true, 'Username is required'], // Bắt buộc, kèm thông báo lỗi
        unique: true,
        trim: true, // Tự động xóa khoảng trắng
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email:
    {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,// Tự động chuyển thành chữ thường
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
        // Kiểm tra định dạng email
    },
    // passwordHash: 
    // { 
    //     type: String, 
    //     required: true,
    //     required: [true, 'PasswordHash is required'] // Sẽ sửa thành 'password' ở Tuần 7
    // }, // Nền tảng Bảo mật
    // BƯỚC 2: Đổi 'passwordHash' thành 'password' và thêm Validators
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],

        // Ghi chú (Rất quan trọng):
        // 'select: false' tự động ẩn trường này khỏi tất cả các truy vấn 'find()'
        // Điều này đảm bảo mật khẩu hash KHÔNG BAO GIỜ bị gửi về phía client
        select: false
    },
    profile:
    {
        fullName:
        {
            type: String,
            default: '',
            trim: true
        },
        phone:
        {
            type: String,
            default: '',
            trim: true
        },
        // Avatar URL
        avatarUrl: {
            type: String,
            default: '',
            trim: true
        }
    },
    role: {
        type: String,
        enum: { // Chỉ cho phép các giá trị này
            values: ['user', 'admin'],
            message: '{VALUE} is not a supported role' // Thông báo lỗi
        },
        default: 'user'
    },
    // THAM CHIẾU MỐI QUAN HỆ 1-1: Liên kết Cart
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },

    // Tham chiếu N-n: Mảng các Order IDs
    orders:
        [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order'
            }
        ],

    // Tham chiếu 1-1: Liên kết với Wishlist
    wishlist:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wishlist'
    },



}, { timestamps: true });
// BƯỚC 3: Thêm Mongoose Hook 'pre-save'
// Ghi chú: Hàm này sẽ tự động chạy TRƯỚC KHI một tài liệu 'User' mới được lưu 
// (bằng lệnh .save() hoặc .create())
userSchema.pre('save', async function (next) {

    // Ghi chú: Chỉ hash mật khẩu nếu nó được SỬA (hoặc là TẠO MỚI)
    // Nếu không có dòng này, mỗi lần user cập nhật email, mật khẩu sẽ bị hash LẠI
    if (!this.isModified('password')) {
        return next(); // Nếu mật khẩu không đổi, bỏ qua
    }

    try {
        // Ghi chú: Tạo Salt (độ phức tạp 10)
        // 10 là mức cân bằng (cost factor) - càng cao càng tốn thời gian hash (an toàn hơn)
        const salt = await bcrypt.genSalt(10);

        // Ghi chú: Băm (Hash) mật khẩu thô của người dùng với Salt
        this.password = await bcrypt.hash(this.password, salt);

        // Ghi chú: Chuyển sang bước tiếp theo (lưu vào CSDL)
        next();
    } catch (error) {
        next(error); // Chuyển lỗi cho Mongoose
    }
});
// 👇 THÊM PHƯƠNG THỨC TẠO TOKEN RESET
userSchema.methods.getResetPasswordToken = function () {
    // 1. Tạo chuỗi ngẫu nhiên (20 byte)
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash token và lưu vào Database (để bảo mật, không lưu token gốc)
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // 3. Token hết hạn sau 10 phút
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken; // Trả về token gốc (chưa hash) để gửi qua email
};

module.exports = mongoose.model('User', userSchema);