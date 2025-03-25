const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Route = require('../models/Route');
const BusCompany = require('../models/BusCompany');
const vehicleSeatsMap = {
  Limousine: 9,
  "Ghế ngồi": 45,
  "Giường nằm": 40,
  "Xe phòng VIP": 24,
};

// @desc    Get tickets by user ID

// @desc    Get tickets by user ID
exports.getUserTickets = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Lấy tất cả vé của người dùng và populate đầy đủ thông tin
    const tickets = await Ticket.find({ owner: userId })
      .populate({
        path: 'route',
        select: 'startPoint endPoint vehicleType availableSeats departureTimes price distance duration stops',
      })
      .populate({
        path: 'company',
        select: 'name contact.phone contact.email address imageUrl',
      })
      .populate({
        path: 'owner',
        select: 'name email phone',
      })
      .lean(); // Chuyển đổi sang object thuần JS

    if (!tickets.length) {
      return res.status(404).json({ success: false, message: 'No tickets found for this user' });
    }

    // Format lại dữ liệu để hiển thị đầy đủ
    const formattedTickets = tickets.map(ticket => ({
      ticketId: ticket._id,
      route: {
        startPoint: ticket.route.startPoint,
        endPoint: ticket.route.endPoint,
        vehicleType: ticket.route.vehicleType,
        availableSeats: ticket.route.availableSeats,
        departureTimes: ticket.route.departureTimes,
        price: ticket.route.price,
        distance: ticket.route.distance,
        duration: ticket.route.duration,
        stops: ticket.route.stops,
      },
      company: {
        name: ticket.company.name,
        email: ticket.company?.contact?.email || 'N/A',
        phone: ticket.company?.contact?.phone || 'N/A',
        address: ticket.company.address,
        imageUrl: ticket.company.imageUrl || '',
      },
      owner: {
        name: ticket.owner.name,
        email: ticket.owner.email,
        phone: ticket.owner.phone,
      },
      seatNumbers: ticket.seatNumbers, // Giữ nguyên danh sách ghế thay vì một số duy nhất
      price: ticket.price,
      status: ticket.status,
      createdAt: ticket.createdAt,
    }));

    res.status(200).json({ success: true, data: formattedTickets });
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

    const { route, owner, seatNumbers, departureTime } = req.body;

    if (!route || !owner || !seatNumbers || !departureTime || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu đặt vé hoặc danh sách ghế không hợp lệ" });
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

    const validSeatNumbers = Array.from({ length: vehicleSeatsMap[routeExists.vehicleType] }, (_, i) => (i + 1).toString());
    const invalidSeats = seatNumbers.filter(seat => !validSeatNumbers.includes(seat));

    if (invalidSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Các số ghế không hợp lệ: ${invalidSeats.join(", ")}`,
      });
    }

    if (routeExists.availableSeats < seatNumbers.length) {
      return res.status(400).json({
        success: false,
        message: `Không đủ ghế trống! Ghế trống còn lại: ${routeExists.availableSeats}`,
      });
    }

    // Kiểm tra xem có ghế nào đã bị đặt chưa
    const existingTickets = await Ticket.find({
      route,
      departureTime: departureTimeDate,
      seatNumbers: { $in: seatNumbers },
    });

    if (existingTickets.length > 0) {
      const takenSeats = existingTickets.flatMap(ticket => ticket.seatNumbers);
      return res.status(400).json({
        success: false,
        message: `Một số ghế đã được đặt: ${takenSeats.join(", ")}. Vui lòng chọn ghế khác.`,
      });
    }

    const price = routeExists.price * seatNumbers.length; // Tính tổng giá vé

    const ticket = new Ticket({
      route,
      company: routeExists.company._id,
      owner,
      departureTime: departureTimeDate,
      vehicleType: routeExists.vehicleType,
      seatNumbers,
      price,
    });

    await ticket.save();

    // Cập nhật route bằng cách thêm ticket vào mảng tickets
    routeExists.tickets.push(ticket._id);
    routeExists.availableSeats -= seatNumbers.length;
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
