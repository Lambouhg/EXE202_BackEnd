const express = require('express');
const router = express.Router();
const busCompanyController = require('../controllers/busCompanyController');

// 1. Lấy danh sách tuyến đường của một nhà xe
router.get('/:companyId', busCompanyController.getRoutesByBusCompany);

// 2. Xem danh sách vé của một tuyến đường
router.get('/route/:routeId', busCompanyController.getTicketsByRoute);

// 3. Chỉnh sửa thông tin tuyến đường (Cần quyền admin)
router.put('/routes/:routeId', busCompanyController.updateRoute);

// 4. Xóa vé của tuyến đường (Cần quyền admin)
router.delete('/tickets/:ticketId', busCompanyController.deleteTicket);

// // 5. Quản lý vé của tuyến đường (Tạo, Cập nhật, Xóa)
// router.post('/routes/:routeId', busCompanyController.manageTickets);

module.exports = router;