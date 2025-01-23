const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/ticketController'); // Import đúng đường dẫn đến controller

// Định nghĩa route đúng
router.get('/tickets', TicketController.getAllTickets);
router.post('/tickets', TicketController.createTicket);
router.get('/tickets/:id', TicketController.getTicketById);
router.put('/tickets/:id', TicketController.updateTicket);
router.delete('/tickets/:id', TicketController.cancelTicket);

module.exports = router;
