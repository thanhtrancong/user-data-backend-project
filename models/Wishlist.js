const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    // Tham chiếu 1-1: Mỗi User chỉ có 1 Wishlist Document
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
        unique: true 
    },
    
    // Nhúng & Tham chiếu: Mảng các Product ID (dữ liệu Reference được Nhúng vào Wishlist Document)
    products: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
    }],
    
    itemCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
