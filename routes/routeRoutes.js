const express = require('express');
const router = express.Router();

// Import các controller
const { createRoute, getRoutes, searchRoutes,getBookedSeats } = require('../controllers/routeController');
const { route } = require('./busCompanyRoutes');

// Tạo tuyến đường mới
router.post('/createRoute', createRoute);

// Lấy danh sách các tuyến đường
router.get('/', getRoutes);

 
router.get('/search', searchRoutes);
router.get('/routes/:routeId/booked-seats',getBookedSeats);
module.exports = router;
