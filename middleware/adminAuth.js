const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Không tìm thấy token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ message: 'Token không hợp lệ.' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ.' });
    }
};

// Middleware kiểm tra quyền admin
exports.adminAuth = async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Truy cập bị từ chối. Chỉ dành cho Admin.' });
    }
    next();
};
