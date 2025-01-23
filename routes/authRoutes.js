const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đăng ký người dùng
router.post('/register', authController.register);

// Đăng nhập người dùng
router.post('/login', authController.login);


module.exports = router;
