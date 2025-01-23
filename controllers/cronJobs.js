const cron = require('node-cron');
const Ticket = require('../models/Ticket');

// Tự động kiểm tra vé hết hạn
cron.schedule('0 0 * * *', async () => {
  const tickets = await Ticket.find({ status: 'booked' });
  const now = new Date();

  tickets.forEach(async (ticket) => {
    if (new Date(ticket.departureTime) < now) {
      ticket.status = 'expired';
      await ticket.save();
    }
  });
});
//v hy
