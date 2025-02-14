const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/adminAuth');

// --- Đăng nhập Admin ---
router.post('/login', adminController.adminLogin);

// --- Quản lý Người Dùng ---
router.get('/users', authenticate, adminController.getUsers);  // GET tất cả người dùng
router.post('/users', authenticate, adminController.createUser);  // POST tạo người dùng mới
router.put('/users/:id', authenticate, adminController.updateUser);  // PUT cập nhật người dùng
router.patch('/users/:id', authenticate, adminController.partialUpdateUser);  // PATCH cập nhật phần thông tin người dùng
router.delete('/users/:id', authenticate, adminController.deleteUser);  // DELETE xóa người dùng

// --- Quản lý Nhà Xe ---
router.get('/bus-companies', authenticate, adminController.getBusCompanies);  // GET tất cả nhà xe
router.post('/bus-companies', authenticate, adminController.createBusCompany);  // POST tạo nhà xe mới
router.put('/bus-companies/:id', authenticate, adminController.updateBusCompany);  // PUT cập nhật nhà xe
router.patch('/bus-companies/:id', authenticate, adminController.partialUpdateBusCompany);  // PATCH cập nhật phần nhà xe
router.delete('/bus-companies/:id', authenticate, adminController.deleteBusCompany);  // DELETE xóa nhà xe

// --- Quản lý Tuyến Đường ---
router.get('/routes', authenticate, adminController.getRoutes);  // GET tất cả tuyến đường
router.post('/routes', authenticate, adminController.createRoute);  // POST tạo tuyến đường mới
router.put('/routes/:id', authenticate, adminController.updateRoute);  // PUT cập nhật tuyến đường
router.patch('/routes/:id', authenticate, adminController.partialUpdateRoute);  // PATCH cập nhật phần tuyến đường
router.delete('/routes/:id', authenticate, adminController.deleteRoute);  // DELETE xóa tuyến đường

// --- Quản lý Vé ---
router.get('/tickets', authenticate, adminController.getTickets);  // GET tất cả vé
router.post('/tickets', authenticate, adminController.createTicket);  // POST tạo vé mới
router.put('/tickets/:id', authenticate, adminController.updateTicket);  // PUT cập nhật vé
router.patch('/tickets/:id', authenticate, adminController.partialUpdateTicket);  // PATCH cập nhật phần vé
router.delete('/tickets/:id', authenticate, adminController.deleteTicket);  // DELETE xóa vé

// --- Quản lý Yêu Cầu Đổi Vé ---
router.get('/ticket-requests', authenticate, adminController.getTicketRequests);  // GET tất cả yêu cầu đổi vé
router.post('/ticket-requests', authenticate, adminController.createTicketRequest);  // POST tạo yêu cầu đổi vé mới
router.put('/ticket-requests/:requestId', authenticate, adminController.updateTicketRequest);  // PUT cập nhật yêu cầu đổi vé
router.patch('/ticket-requests/:requestId', authenticate, adminController.partialUpdateTicketRequest);  // PATCH cập nhật phần yêu cầu đổi vé
router.delete('/ticket-requests/:requestId', authenticate, adminController.deleteTicketRequest);  // DELETE xóa yêu cầu đổi vé

module.exports = router;
