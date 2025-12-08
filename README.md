# User Data Backend Project

Backend Project for user data management using Node.js, Express, and MongoDB.

## Description

This is a RESTful API backend application built with Node.js and Express that provides endpoints for managing users, authentication, products, and orders. The application uses MongoDB Atlas for data persistence and includes JWT-based authentication.

## Features

- User management (CRUD operations)
- Authentication and authorization with JWT
- Product management
- Order management
- MongoDB Atlas integration
- Password hashing with bcrypt

## Prerequisites

- Node.js (v14 or higher recommended)
- MongoDB Atlas account
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/thanhtrancong/user-data-backend-project.git
cd user-data-backend-project
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGO_URI=your_mongodb_atlas_connection_string
PORT=3000
JWT_SECRET=your_jwt_secret_key
```

**Important Security Notes:**
- Generate a strong, random JWT_SECRET (minimum 32 characters recommended)
- Never commit your `.env` file to version control
- For production, use environment-specific connection strings with proper authentication
- Keep your MongoDB credentials secure and rotate them regularly

## Usage

### Development Mode
Start the server with automatic restart on file changes:
```bash
npm run dev
```

### Production Mode
Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000` (or the PORT specified in your .env file).

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create new product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Orders
- Order endpoints are available at `/api/v1/orders`

## Project Structure

```
.
├── db.js                  # Database connection configuration
├── index.js               # Main application entry point
├── middleware/            # Custom middleware
│   └── authMiddleware.js  # JWT authentication middleware
├── models/                # Mongoose models
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   ├── Cart.js
│   ├── Category.js
│   ├── Notification.js
│   ├── Review.js
│   └── Wishlist.js
├── routes/                # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── productRoutes.js
│   └── orderRoutes.js
├── package.json
└── .gitignore
```

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variable management
- **nodemon** - Development auto-restart

## Author

Richard Trần VLSG

## License

ISC
