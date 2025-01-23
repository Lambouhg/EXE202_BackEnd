const express = require('express');
const router = express.Router();

// Import các controller
const { createRoute, getRoutes } = require('../controllers/routeController');

// Tạo tuyến đường mới
router.post('/createRoute', createRoute);

// Lấy danh sách các tuyến đường
router.get('/', getRoutes);

module.exports = router;
