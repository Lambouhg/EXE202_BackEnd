const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');

// Tạo đánh giá (Cần xác thực người dùng)
router.post('/reviews', authenticate, reviewController.createReview);

module.exports = router;
