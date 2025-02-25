const mongoose = require('mongoose');
const Ticket  = require('../models/Ticket');
const vehicleSeatsMap = {
    Limousine: 9,
    "Ghế ngồi": 45,
    "Giường nằm": 40,
    "Xe phòng VIP": 24,  // Thêm dòng này
};

const routeSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'BusCompany', required: true },
    startPoint: { type: String, required: true },
    endPoint: { type: String, required: true },
    stops: [String],
    price: { type: Number, required: true },
    distance: { type: Number, required: true },
    duration: { type: String, required: true }, // Số phút
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
    availableSeats: { type: Number },
    departureTimes: [{ type: Date }],
    vehicleType: { 
        type: String, 
        required: true, 
        enum: Object.keys(vehicleSeatsMap), // Chỉ nhận giá trị từ danh sách
    },
    image: { type: String }, // Lưu URL ảnh
    createdAt: { type: Date, default: Date.now },
});

// Middleware: Tự động đặt số ghế khi tạo Route
routeSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('vehicleType')) {
        this.availableSeats = vehicleSeatsMap[this.vehicleType];
    }
    next();
});

module.exports = mongoose.model('Route', routeSchema);
