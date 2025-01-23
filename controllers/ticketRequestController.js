const TicketRequest = require('../models/TicketRequest');
const Ticket = require('../models/Ticket');


//Hàm dành cho Admin 
// Tạo yêu cầu đổi vé
exports.createRequest = async (req, res) => {
    try {
      const { requesterId, requestedTicketId, newDepartureTime, message } = req.body;
  
      // Kiểm tra vé yêu cầu có tồn tại
      const requestedTicket = await Ticket.findById(requestedTicketId).populate('company');
      if (!requestedTicket) {
        return res.status(404).json({ error: 'Requested ticket not found' });
      }
  
      // Kiểm tra người dùng có quyền tạo yêu cầu này
      if (requestedTicket.owner.toString() !== requesterId) {
        return res.status(403).json({ error: 'You can only request changes for your own tickets' });
      }
  
      // Kiểm tra tính hợp lệ của newDepartureTime
      if (!newDepartureTime || isNaN(Date.parse(newDepartureTime))) {
        return res.status(400).json({ error: 'Invalid or missing newDepartureTime' });
      }
  
      const departureTime = new Date(newDepartureTime);
      if (departureTime <= new Date()) {
        return res.status(400).json({ error: 'newDepartureTime must be a future date' });
      }
  
      // Tạo yêu cầu dời ngày khởi hành
      const ticketRequest = new TicketRequest({
        requester: requesterId,
        requestedTicket: requestedTicketId,
        newDepartureTime: departureTime, // Lưu ngày khởi hành mới
        message,
      });
  
      await ticketRequest.save();
  
      res.status(201).json({
        message: 'Ticket change request created successfully',
        ticketRequest,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  

// Phản hồi yêu cầu đổi vé của nhà xe
exports.respondToTicketRequest = async (req, res) => {
  const { id } = req.params; // ID của TicketRequest
  const { companyId, status } = req.body; // ID công ty và trạng thái phản hồi

  try {
    // Tìm yêu cầu đổi vé
    const ticketRequest = await TicketRequest.findById(id);
    if (!ticketRequest) {
      return res.status(404).json({ message: 'Ticket request not found' });
    }

    // Kiểm tra công ty có quyền phản hồi yêu cầu
    const ticket = await Ticket.findById(ticketRequest.requestedTicket);
    if (!ticket) {
      return res.status(404).json({ message: 'Requested ticket not found' });
    }

    if (ticket.company.toString() !== companyId) {
      return res.status(403).json({ message: 'You do not have permission to respond to this request' });
    }

    // Kiểm tra trạng thái phản hồi
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected"' });
    }

    // Cập nhật trạng thái của yêu cầu
    ticketRequest.status = status;
    ticketRequest.responseBy = companyId;
    ticketRequest.responseDate = new Date();

    // Nếu yêu cầu được chấp nhận, xử lý ngày khởi hành mới
    if (status === 'approved') {
      const { newDepartureTime } = ticketRequest;

      if (!newDepartureTime) {
        return res.status(400).json({ message: 'New departure time is missing in the user request' });
      }

      // Cập nhật ngày khởi hành mới cho vé
      ticket.departureTime = new Date(newDepartureTime);
      await ticket.save();
    }

    await ticketRequest.save();

    res.status(200).json({
      message: `Ticket request ${status}`,
      ticketRequest,
      updatedTicket: status === 'approved' ? ticket : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await TicketRequest.find()
      .populate('requester', 'name email') // Thông tin người yêu cầu
      .populate('requestedTicket', 'seatNumber departureTime arrivalTime price')
      .populate('offeredTicket', 'seatNumber departureTime arrivalTime price')
      .populate('responseBy', 'name') // Tên công ty phản hồi
      .sort({ createdAt: -1 });

    if (!requests.length) {
      return res.status(404).json({ message: 'No ticket requests found' });
    }

    res.status(200).json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.deleteRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await TicketRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Ticket request not found' });
    }

    await TicketRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: 'Ticket request deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  const { requestId } = req.params;
  const { status, adminId } = req.body;

  try {
    const request = await TicketRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Ticket request not found' });
    }

    // Kiểm tra trạng thái hợp lệ
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected"' });
    }

    // Cập nhật trạng thái
    request.status = status;
    request.responseBy = adminId;
    request.responseDate = new Date();

    if (status === 'approved') {
      const { newDepartureTime } = request;

      if (!newDepartureTime) {
        return res.status(400).json({ message: 'New departure time is missing' });
      }

      // Cập nhật ngày khởi hành cho vé
      const ticket = await Ticket.findById(request.requestedTicket);
      ticket.departureTime = new Date(newDepartureTime);
      await ticket.save();
    }

    await request.save();

    res.status(200).json({
      message: `Ticket request has been ${status}`,
      request,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// user funtion
//Xem danh sách các yêu cầu đổi vé của User
exports.getUserRequests = async (req, res) => {
  const { userId } = req.params;

  try {
    const requests = await TicketRequest.find({ requester: userId })
      .populate('requestedTicket', 'seatNumber departureTime arrivalTime price')
      .populate('offeredTicket', 'seatNumber departureTime arrivalTime price')
      .sort({ createdAt: -1 });

    if (!requests.length) {
      return res.status(404).json({ message: 'No ticket requests found for this user' });
    }

    res.status(200).json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
//Xem chi tiết một yêu cầu đổi vé cụ thể
exports.getRequestDetails = async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await TicketRequest.findById(requestId)
      .populate('requestedTicket', 'seatNumber departureTime arrivalTime price')
      .populate('offeredTicket', 'seatNumber departureTime arrivalTime price')
      .populate('responseBy', 'name'); // Tên công ty phản hồi

    if (!request) {
      return res.status(404).json({ message: 'Ticket request not found' });
    }

    res.status(200).json({ request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Xóa yêu cầu đổi vé của User
exports.deleteUserRequest = async (req, res) => {
  const { requestId, userId } = req.params;

  try {
    const request = await TicketRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Ticket request not found' });
    }

    // Kiểm tra quyền sở hữu
    if (request.requester.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own ticket requests' });
    }

    // Xóa yêu cầu
    await TicketRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: 'Ticket request deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
