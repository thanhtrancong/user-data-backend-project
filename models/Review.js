const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // Tham chiếu: Liên kết đến sản phẩm (Model Product giả định)
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true
    },
    
    // Tham chiếu: Liên kết đến người dùng đã viết đánh giá
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    
    // NHÚNG: username vào đây để hiển thị nhanh (tối ưu tốc độ đọc)
    username: { 
        type: String, 
        required: true 
    }, 
    
    rating: { 
        type: Number, 
        required: true,
        min: 1, 
        max: 5 
    },
    
    comment: { 
        type: String, 
        trim: true 
    }
}, { timestamps: true });

// Ghi chú: Index để đảm bảo 1 user chỉ đánh giá 1 sản phẩm 1 lần
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
