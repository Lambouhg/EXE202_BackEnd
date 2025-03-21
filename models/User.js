const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'company'],  
    default: 'user' 
  },  
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BusCompany', 
    default: null  
  }, 
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  transactionHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TicketRequest' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
