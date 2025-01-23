const express = require('express');
const router = express.Router();
const ticketRequestController = require('../controllers/ticketRequestController');


// --- Routes dành cho Admin ---
// Route tạo yêu cầu đổi vé
router.post('/', ticketRequestController.createRequest);
// Lấy danh sách tất cả yêu cầu đổi vé
router.get('/admin/requests', ticketRequestController.getAllRequests); 
// Cập nhật trạng thái yêu cầu
router.patch('/admin/request/:requestId', ticketRequestController.updateRequestStatus); 
// Xóa yêu cầu đổi vé
router.delete('/admin/request/:requestId', ticketRequestController.deleteRequest); 
// Route phản hồi yêu cầu đổi vé
router.patch('/:id/respond', ticketRequestController.respondToTicketRequest);

// Xem danh sách yêu cầu đổi vé của User
router.get('/user/:userId/requests', ticketRequestController.getUserRequests); 
// Xem chi tiết 1 yêu cầu đổi vé
router.get('/user/request/:requestId', ticketRequestController.getRequestDetails); 
// Xóa yêu cầu đổi vé
router.delete('/user/request/:requestId/:userId', ticketRequestController.deleteUserRequest); 

module.exports = router;
