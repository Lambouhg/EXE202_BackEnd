const mongoose = require('mongoose');
const Route = require('../models/Route'); 
const User = require('../models/User');
const busCompanySchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Liên kết với User
    contact: {
        phone: { type: String, default: '' }, // Default để tránh undefined
        email: { type: String, default: '' },
    },
    address: { type: String, required: true },
    imageUrl: { type: String },
    routes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    rating: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BusCompany', busCompanySchema);
