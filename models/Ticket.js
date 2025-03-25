const mongoose = require('mongoose');
const Route = require('../models/Route');

const ticketSchema = new mongoose.Schema({
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'BusCompany', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    departureTime: { type: Date, required: true },
    vehicleType: { type: String, required: true },
    seatNumbers: { type: [String], required: true }, // Thay vì seatNumber, dùng seatNumbers (mảng)
    price: { type: Number, required: true },
    status: { type: String, default: 'available' },
    createdAt: { type: Date, default: Date.now },
});

// Middleware: Kiểm tra và cập nhật số ghế khi đặt vé
ticketSchema.pre("save", async function (next) {
    if (this.isNew) {
        const route = await mongoose.model("Route").findById(this.route);
        if (!route) {
            return next(new Error("Route không tồn tại"));
        }

        if (route.availableSeats < this.seatNumbers.length) {
            return next(new Error("Không đủ ghế trống để đặt!"));
        }

        // Kiểm tra các ghế đã có ai đặt chưa
        const existingTickets = await mongoose.model("Ticket").find({
            route: this.route,
            departureTime: this.departureTime,
            seatNumbers: { $in: this.seatNumbers },
        });

        if (existingTickets.length > 0) {
            return next(new Error(`Một hoặc nhiều ghế đã được đặt. Vui lòng chọn ghế khác.`));
        }

        // Giảm số ghế còn lại
        route.availableSeats -= this.seatNumbers.length;
        await route.save();
    }

    next();
});

// Middleware: Hoàn lại số ghế khi xóa vé
ticketSchema.pre('remove', async function (next) {
    const route = await mongoose.model('Route').findById(this.route);
    if (route) {
        route.availableSeats += this.seatNumbers.length;
        await route.save();
    }
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
