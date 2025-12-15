# User Data Backend Project

## Mô tả
Backend API cho quản lý người dùng và sản phẩm, xây dựng với Node.js, Express và MongoDB.

## Công nghệ sử dụng
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose**
- **JWT** (JSON Web Token) cho authentication
- **Bcrypt** để mã hóa mật khẩu
- **Cloudinary** để upload avatar

## Cài đặt

### Yêu cầu
- Node.js >= 14.x
- MongoDB
- Tài khoản Cloudinary (cho upload ảnh)

### Các bước

```bash
# Clone repository
git clone <repository-url>
cd user-data-backend-project

# Cài đặt dependencies
npm install

# Tạo file .env (copy từ .env.example)
cp .env.example .env
# Cập nhật các biến môi trường trong .env

# Chạy server
npm run dev
```

## Biến môi trường (.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Đăng ký user mới
- `POST /api/v1/auth/login` - Đăng nhập

### Users
- `GET /api/v1/users` - Lấy danh sách users (admin only)
- `GET /api/v1/users/me` - Lấy thông tin user đang đăng nhập
- `POST /api/v1/users` - Tạo user mới (admin only)
- `POST /api/v1/users/me/avatar` - Upload avatar
- `PUT /api/v1/users/:id` - Cập nhật user
- `DELETE /api/v1/users/:id` - Xóa user (admin only)

### Products
- `GET /api/v1/products` - Lấy danh sách sản phẩm
- `GET /api/v1/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/v1/products` - Tạo sản phẩm mới (admin only)
- `PUT /api/v1/products/:id` - Cập nhật sản phẩm (admin only)
- `DELETE /api/v1/products/:id` - Xóa sản phẩm (admin only)

## Cấu trúc thư mục

```
user-data-backend-project/
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── User.js
│   └── Product.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── productRoutes.js
├── utils/
│   └── cloudinary.js
├── index.js
├── package.json
└── README.md
```

## Scripts

```bash
# Chạy development mode (với nodemon)
npm run dev

# Chạy production mode
npm start
```

## Authentication

API sử dụng JWT Bearer Token. Sau khi đăng nhập, thêm token vào header:

```
Authorization: Bearer <your-token>
```

## Phân quyền (Roles)

- **user**: Người dùng thông thường
- **admin**: Quản trị viên (full quyền)

## License

ISC