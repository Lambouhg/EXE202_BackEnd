const express = require('express');
const router = express.Router();
const exchangeController = require('../controllers/ExchangeRequestController');

router.post('/exchange-requests', exchangeController.createExchangeRequest);
router.get('/exchange-requests', exchangeController.getAllExchangeRequests);
router.post('/exchange-requests/:requestId/responses', exchangeController.respondToExchangeRequest);
router.patch('/exchange-requests/:requestId/responses/:responseId', exchangeController.respondToResponse);

module.exports = router;
