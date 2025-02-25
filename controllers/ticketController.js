const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Route = require('../models/Route');

// @desc    Get all tickets

// @desc    Get tickets by user ID
exports.getUserTickets = async (req, res) => {
  try {
    const { userId } = req.params;

    // Kiểm tra nếu userId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Lấy tất cả vé của người dùng
    const tickets = await Ticket.find({ owner: userId })
      .populate('route', 'startPoint endPoint vehicleType')
      .populate('company', 'name')
      .populate('owner', 'name email');

    if (!tickets.length) {
      return res.status(404).json({ success: false, message: 'No tickets found for this user' });
    }

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('route', 'startPoint endPoint vehicleType')
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
    console.log("Dữ liệu nhận từ frontend:", req.body);

    const { route, owner, seatNumber, departureTime } = req.body;

    if (!route || !owner || !seatNumber || !departureTime) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu đặt vé" });
    }

    const departureTimeDate = new Date(departureTime);
    if (isNaN(departureTimeDate.getTime())) {
      return res.status(400).json({ success: false, message: "Thời gian khởi hành không hợp lệ" });
    }

    console.log("departureTimeDate:", departureTimeDate);

    const routeExists = await Route.findById(route).populate("company");
    if (!routeExists) {
      return res.status(404).json({ success: false, message: "Route không tồn tại" });
    }

    const isDepartureTimeValid = routeExists.departureTimes.some((time) => {
      return new Date(time).toISOString() === departureTimeDate.toISOString();
    });

    if (!isDepartureTimeValid) {
      return res.status(400).json({ success: false, message: "Thời gian khởi hành không hợp lệ với tuyến xe" });
    }

    if (typeof seatNumber !== 'string' || parseInt(seatNumber) > routeExists.availableSeats || parseInt(seatNumber) <= 0) {
      return res.status(400).json({
        success: false,
        message: `Số ghế không hợp lệ! Ghế trống: ${routeExists.availableSeats}, yêu cầu: ${seatNumber}`,
      });
    }

    const price = routeExists.price;

    const ticket = new Ticket({
      route,
      company: routeExists.company._id,
      owner,
      departureTime: departureTimeDate,
      vehicleType: routeExists.vehicleType,
      seatNumber,
      price,
    });

    await ticket.save();

    // Cập nhật route bằng cách thêm ticket vào mảng tickets
    routeExists.tickets.push(ticket._id);
    routeExists.availableSeats -= 1;
    await routeExists.save();

    res.status(201).json({ success: true, message: "Đặt vé thành công", ticket });
  } catch (error) {
    console.error("Lỗi khi đặt vé:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
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
    const { id } = req.params;

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
      .populate('route', 'startPoint endPoint vehicleType')
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
