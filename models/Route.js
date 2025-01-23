const mongoose = require('mongoose');
const BusCompany = require('../models/BusCompany'); 

const routeSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'BusCompany', required: true },
    startPoint: { type: String, required: true },
    endPoint: { type: String, required: true },
    stops: [String],
    price: { type: Number, required: true },
    distance: { type: Number, required: true },
    duration: { type: String, required: true },
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
    availableSeats: { type: Number, required: true },
    departureTimes: [{ type: Date }], // Thêm mảng thời gian khởi hành
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Route', routeSchema);
