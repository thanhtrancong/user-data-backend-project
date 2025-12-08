/*
 * ========================================
 * FILE: INDEX.JS (MAIN SERVER FILE)
 * MÔ TẢ: Khởi tạo Server Express, kết nối CSDL MongoDB,
 * và định tuyến các API request.
 * ========================================
 */

// --- 1. IMPORT CÁC MODULE CẦN THIẾT ---

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); // Import Mongoose để kiểm tra trạng thái kết nối
const connectDB = require('./db'); // Import hàm kết nối CSDL từ file db.js

// --- 2. IMPORT CÁC ROUTER (TỪ TUẦN 02) ---
// Ghi chú: Đây là nơi chúng ta nhập các file định tuyến (routes) đã tách module.
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes'); // <-- THÊM DÒNG NÀY
// (Các router khác như orderRoutes, reviewRoutes... sẽ được thêm ở các tuần sau)
// 👇 1. Import router sản phẩm (Bạn có thể require trực tiếp ở dưới hoặc import ở đây)
const productRoutes = require('./routes/productRoutes');

// --- 3. CẤU HÌNH BIẾN MÔI TRƯỜNG (.env) ---
// Ghi chú: Đảm bảo đã chạy 'npm install dotenv'
// Lệnh này sẽ đọc file .env và nạp các biến (MONGO_URI, PORT) vào process.env
dotenv.config();


// --- 4. KHỞI TẠO ỨNG DỤNG EXPRESS ---
const app = express();


// --- 5. KẾT NỐI CƠ SỞ DỮ LIỆU (MONGODB ATLAS) ---
// Ghi chú: Gọi hàm connectDB đã viết trong file db.js
// Server sẽ cố gắng kết nối với MongoDB Atlas ngay khi khởi động.
connectDB();


// --- 6. CẤU HÌNH MIDDLEWARE ---
// Ghi chú: Middleware là các hàm chạy ở giữa (middle) của Request và Response.

// Middleware này BẮT BUỘC phải có để Express có thể đọc dữ liệu JSON
// mà client (Postman/Frontend) gửi lên trong Body của request POST/PUT/PATCH.
app.use(express.json());


// --- 7. ĐỊNH TUYẾN (API ROUTES) ---
// Ghi chú: Gán các router đã import vào các đường dẫn gốc (base path).
app.use('/api/v1/auth', authRoutes); // <-- THÊM DÒNG NÀY (CHO Register, Login)
// Bất kỳ request nào bắt đầu bằng '/api/v1/users' sẽ được chuyển đến 'userRoutes' xử lý.
app.use('/api/v1/users', userRoutes); 

// 👇 2. THÊM DÒNG NÀY ĐỂ KÍCH HOẠT API SẢN PHẨM
// Bất kỳ request nào bắt đầu bằng '/api/v1/products' sẽ được chuyển sang file productRoutes 
// xử lý
app.use('/api/v1/products', productRoutes);

// (Ví dụ cho các tuần sau khi triển khai Controller cho Orders):
// app.use('/api/v1/orders', orderRoutes);
// app.use('/api/v1/reviews', reviewRoutes);


// Route cơ bản để kiểm tra Server Status và Database Connection
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: "Welcome to User Data Backend API (Week 3)",
        status: "Server is running",
        
        // Ghi chú: Kiểm tra trạng thái kết nối MongoDB
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        database_status: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
    });
});


// --- 8. KHỞI ĐỘNG SERVER ---
// Lấy cổng (PORT) từ file .env, nếu không có thì mặc định là 3000.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    // Ghi chú: Thông báo này xuất hiện trước, thông báo kết nối DB sẽ xuất hiện sau khi hàm connectDB() hoàn thành.
    console.log("Waiting for MongoDB connection..."); 
});