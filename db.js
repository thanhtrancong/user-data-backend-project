// db.js

const mongoose = require('mongoose');
require('.env').config(); // Ghi chú: Đọc file .env

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully! Ready for use.');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        // Thoát ứng dụng nếu không thể kết nối Database
        process.exit(1); 
    }
};

module.exports = connectDB;
