const express = require('express');
const router = express.Router();
const busCompanyController = require('../controllers/busCompanyController');


// Tạo nhà xe (Cần quyền admin)
router.post('/bus-companies',busCompanyController.createBusCompany);

// Thêm tuyến đường (Cần quyền admin)
router.post('/routes', busCompanyController.createRoute);

module.exports = router;
