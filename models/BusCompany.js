const mongoose = require('mongoose');
const Route = require('../models/Route'); 
const busCompanySchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: {
        phone: { type: String },
        email: { type: String },
    },
    address: { type: String, required: true },
    imageUrl: { type: String }, // Thêm trường ảnh đại diện
    routes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    rating: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BusCompany', busCompanySchema);
