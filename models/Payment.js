const mongoose = require('mongoose');

// Định nghĩa schema cho Payment
const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Liên kết với model User
      required: true
    },
    ticketIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',  // Liên kết với model Ticket
      required: true
    }],
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['credit_card', 'momo', 'zalopay', 'paypal']  // Các phương thức thanh toán có thể
    },
    transactionId: {
      type: String,
      default: null  // Mã giao dịch từ nhà cung cấp thanh toán
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null  // Thời điểm thanh toán hoàn tất
    }
  },
  { timestamps: true }  // Tự động tạo trường createdAt và updatedAt
);

// Tạo model Payment từ schema
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
