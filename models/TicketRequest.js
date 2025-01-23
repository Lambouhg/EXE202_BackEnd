const mongoose = require('mongoose');

const ticketRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người yêu cầu
  requestedTicket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true }, // Vé cần thay đổi
  offeredTicket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }, // Vé được đề nghị đổi (nếu có)
  message: { type: String }, // Lời nhắn từ người dùng
  newDepartureTime: { type: Date }, // Ngày khởi hành mới (nếu có)
  requestDate: { type: Date, default: Date.now }, // Ngày yêu cầu
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  }, // Trạng thái yêu cầu
  responseBy: { type: mongoose.Schema.Types.ObjectId, ref: 'BusCompany' }, // Công ty xử lý yêu cầu
  responseDate: { type: Date }, // Ngày phản hồi
  createdAt: { type: Date, default: Date.now }, // Ngày tạo
});

module.exports = mongoose.model('TicketRequest', ticketRequestSchema);
