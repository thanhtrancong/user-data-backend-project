/* FILE: MIDDLEWARE/ERRORMIDDLEWARE.JS */
const errorHandler = (err, req, res, next) => {
    // Mặc định lỗi là 500 (Internal Server Error) nếu không xác định được
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode);
    
    res.json({
        success: false,
        message: err.message,
        // Chỉ hiện stack trace (dòng lỗi) khi ở môi trường dev
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;