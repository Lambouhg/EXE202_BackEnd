const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'BusCompany', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    departureTime: { type: Date, required: true },
    vehicleType: { type: String, required: true },
    seatNumber: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, default: 'available' },
    createdAt: { type: Date, default: Date.now },
});

// Middleware: Kiểm tra và cập nhật số ghế khi đặt vé
ticketSchema.pre('save', async function (next) {
    const route = await mongoose.model('Route').findById(this.route);
    if (!route) {
        return next(new Error("Route không tồn tại"));
    }

    if (route.availableSeats <= 0) {
        return next(new Error("Không còn ghế trống!"));
    }

    // Kiểm tra xem ghế đã có ai đặt chưa
    const existingTicket = await mongoose.model('Ticket').findOne({
        route: this.route,
        departureTime: this.departureTime,
        seatNumber: this.seatNumber
    });

    if (existingTicket) {
        return next(new Error(`Ghế ${this.seatNumber} đã được đặt. Vui lòng chọn ghế khác.`));
    }

    // Giảm số ghế còn lại
    route.availableSeats -= 1;
    await route.save();

    next();
});

// Middleware: Hoàn lại số ghế khi xóa vé
ticketSchema.pre('remove', async function (next) {
    const route = await mongoose.model('Route').findById(this.route);
    if (route) {
        route.availableSeats += 1;
        await route.save();
    }
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
