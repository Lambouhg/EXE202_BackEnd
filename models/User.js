const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: 'user' },  // user hoặc admin
  isActive: { type: Boolean, default: true },  // Trạng thái tài khoản
  lastLogin: { type: Date },  // Lưu thời gian đăng nhập cuối
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  transactionHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TicketRequest' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
