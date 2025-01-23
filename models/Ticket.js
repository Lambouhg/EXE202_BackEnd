const mongoose = require('mongoose');

const BusCompany = require('../models/BusCompany'); 
const ticketSchema = new mongoose.Schema({
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'BusCompany', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    seatNumber: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, default: 'available' },
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Ticket', ticketSchema);
  