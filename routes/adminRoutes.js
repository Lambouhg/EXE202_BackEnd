const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/adminAuth');

// --- Đăng nhập Admin ---
router.post('/login', adminController.adminLogin);

// --- Quản lý Người Dùng ---
router.get('/users', authenticate, adminController.getUsers);
router.delete('/users/:id', authenticate, adminController.deleteUser);

// --- Quản lý Nhà Xe ---
router.get('/bus-companies', authenticate, adminController.getBusCompanies);
router.post('/bus-companies', authenticate, adminController.createBusCompany);

// --- Quản lý Tuyến Đường ---
router.get('/routes', authenticate, adminController.getRoutes);
router.delete('/routes/:id', authenticate, adminController.deleteRoute);

// --- Quản lý Vé ---
router.get('/tickets', authenticate, adminController.getTickets);

// --- Quản lý Yêu Cầu Đổi Vé ---
router.get('/ticket-requests', authenticate, adminController.getTicketRequests);
router.patch('/ticket-requests/:requestId', authenticate, adminController.updateTicketRequest);
router.delete('/ticket-requests/:requestId', authenticate, adminController.deleteTicketRequest);

module.exports = router;
