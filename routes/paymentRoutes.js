const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Bước 1: Khởi tạo thanh toán
router.post('/initiate', paymentController.initiatePayment);

// Bước 2: Xác thực thanh toán qua MoMo
router.post('/momo/checkout', paymentController.momoCheckout);

// Bước 3: Callback từ MoMo (xác nhận thanh toán)
router.post('/momo/callback', paymentController.momoCallback);

// Bước 5.1: Hủy thanh toán
router.put('/:id/cancel', paymentController.cancelPayment);

module.exports = router;
