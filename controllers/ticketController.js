const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Route = require('../models/Route');

// @desc    Get all tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('route', 'startPoint endPoint')
      .populate('company', 'name')
      .populate('owner', 'name email');
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const { route, company, owner, departureTime, arrivalTime, seatNumber } = req.body;

    // Kiểm tra xem route có tồn tại không
    const routeExists = await Route.findById(route);
    if (!routeExists) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    // Kiểm tra số ghế trống
    if (routeExists.availableSeats <= 0) {
      return res.status(400).json({ success: false, message: 'No available seats left' });
    }

    // Lấy giá vé từ giá của route
    const ticketPrice = routeExists.price;

    // Tạo vé mới
    const newTicket = new Ticket({
      route,
      company,
      owner,
      departureTime,
      arrivalTime,
      seatNumber,
      price: ticketPrice, // Sử dụng giá từ route
    });

    // Lưu vé vào cơ sở dữ liệu
    const savedTicket = await newTicket.save();

    // Giảm số ghế trống
    routeExists.availableSeats -= 1;
    routeExists.tickets.push(savedTicket._id);
    await routeExists.save();

    res.status(201).json({ success: true, data: savedTicket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error creating ticket', error: error.message });
  }
};

// @desc    Update ticket
exports.updateTicket = async (req, res) => {
  try {
    const { seatNumber, route } = req.body;

    // 1. Tìm vé hiện tại
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // 2. Nếu cập nhật ghế, kiểm tra ghế có trùng không
    if (seatNumber && seatNumber !== ticket.seatNumber) {
      const seatTaken = await Ticket.findOne({ route: ticket.route, seatNumber });
      if (seatTaken) {
        return res.status(400).json({ success: false, message: `Seat ${seatNumber} is already booked` });
      }
    }

    // 3. Cập nhật vé
    const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete ticket
exports.cancelTicket = async (req, res) => {
  try {
    const { id } = req.params;  // Đảm bảo sử dụng `id` thay vì `ticketId`

    // Kiểm tra nếu ticketId là hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID' });
    }

    // Tìm vé theo ID
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Tìm route liên quan đến vé
    const route = await Route.findById(ticket.route);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found for this ticket' });
    }

    // Xóa vé khỏi database
    await Ticket.findByIdAndDelete(id);

    // Cập nhật số ghế trống
    route.availableSeats += 1;

    // Xóa vé khỏi danh sách `tickets` của Route
    route.tickets = route.tickets.filter((ticketId) => ticketId.toString() !== id);
    await route.save();

    res.status(200).json({ success: true, message: 'Ticket cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error cancelling ticket', error: error.message });
  }
};
// @desc    Get ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('route', 'startPoint endPoint')
      .populate('company', 'name')
      .populate('owner', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
