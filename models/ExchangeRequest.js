const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người tạo yêu cầu
  requestedTicket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true }, // Vé của người yêu cầu
  status: { type: String, enum: ['open', 'completed', 'cancelled'], default: 'open' }, // Trạng thái yêu cầu
  responses: [
    {
      responder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người phản hồi
      offeredTicket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true }, // Vé được đề nghị
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }, // Trạng thái phản hồi
      message: { type: String }, // Lời nhắn
    },
  ],
  message: { type: String }, // Lời nhắn của người yêu cầu
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
