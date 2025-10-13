const mongoose = require('mongoose');

// Dữ liệu Nhúng: Order Items
const orderItemSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 } 
}, { _id: false }); 
// Ghi chú: { _id: false } - Tắt ID cho tài liệu nhúng.

const orderSchema = new mongoose.Schema({
    // Tham chiếu: Liên kết đến User đã tạo đơn hàng
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Liên kết đến Model User
        required: true 
    },
    
    // Nhúng: Danh sách các mặt hàng đã mua
    items: { 
        type: [orderItemSchema], 
        required: true 
    },
    
    totalAmount: { type: Number, required: true, min: 0 },
    status: { 
        type: String, 
        enum: ['Pending', 'Delivered', 'Cancelled'],
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
