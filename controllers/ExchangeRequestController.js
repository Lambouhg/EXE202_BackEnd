const ExchangeRequest = require('../models/ExchangeRequest');
const Ticket = require('../models/Ticket');

exports.createExchangeRequest = async (req, res) => {
  try {
    const { requesterId, requestedTicketId, message } = req.body;

    // Kiểm tra vé tồn tại và thuộc về người dùng
    const ticket = await Ticket.findById(requestedTicketId);
    if (!ticket) return res.status(404).json({ error: 'Requested ticket not found' });
    if (ticket.owner.toString() !== requesterId)
      return res.status(403).json({ error: 'You can only request exchanges for your own tickets' });

    // Tạo yêu cầu đổi vé
    const exchangeRequest = new ExchangeRequest({
      requester: requesterId,
      requestedTicket: requestedTicketId,
      message,
    });
    await exchangeRequest.save();

    // Đánh dấu vé đang trong trạng thái "đổi vé"
    ticket.status = 'in_exchange';
    await ticket.save();

    res.status(201).json({ message: 'Exchange request created successfully', exchangeRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllExchangeRequests = async (req, res) => {
    try {
      const exchangeRequests = await ExchangeRequest.find({ status: 'open' })
        .populate('requester', 'name')
        .populate('requestedTicket', 'route departureTime seatNumber');
      res.status(200).json(exchangeRequests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  exports.respondToExchangeRequest = async (req, res) => {
    try {
      const { requestId } = req.params;
      const { responderId, offeredTicketId, message } = req.body;
  
      // Kiểm tra yêu cầu đổi vé
      const exchangeRequest = await ExchangeRequest.findById(requestId);
      if (!exchangeRequest) return res.status(404).json({ error: 'Exchange request not found' });
  
      // Kiểm tra vé đề nghị thuộc về người phản hồi và cùng công ty
      const offeredTicket = await Ticket.findById(offeredTicketId);
      if (!offeredTicket) return res.status(404).json({ error: 'Offered ticket not found' });
      if (offeredTicket.owner.toString() !== responderId)
        return res.status(403).json({ error: 'You can only offer your own tickets' });
      if (offeredTicket.status === 'in_exchange')
        return res.status(400).json({ error: 'Offered ticket is already in another exchange' });
  
      // Thêm phản hồi vào yêu cầu
      exchangeRequest.responses.push({
        responder: responderId,
        offeredTicket: offeredTicketId,
        message,
      });
      await exchangeRequest.save();
  
      // Đánh dấu vé được đề nghị trong trạng thái "đổi vé"
      offeredTicket.status = 'in_exchange';
      await offeredTicket.save();
  
      res.status(200).json({ message: 'Response submitted successfully', exchangeRequest });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.respondToResponse = async (req, res) => {
    try {
      const { requestId, responseId } = req.params;
      const { status } = req.body; // 'accepted' hoặc 'rejected'
  
      // Lấy yêu cầu đổi vé
      const exchangeRequest = await ExchangeRequest.findById(requestId).populate('responses.offeredTicket');
      if (!exchangeRequest) return res.status(404).json({ error: 'Exchange request not found' });
  
      // Tìm phản hồi trong mảng responses
      const response = exchangeRequest.responses.id(responseId);
      if (!response) return res.status(404).json({ error: 'Response not found' });
  
      // Nếu chấp nhận yêu cầu đổi vé
      if (status === 'accepted') {
        const requestedTicket = await Ticket.findById(exchangeRequest.requestedTicket);
        const offeredTicket = await Ticket.findById(response.offeredTicket);
  
        // Hoán đổi quyền sở hữu của 2 vé
        [requestedTicket.owner, offeredTicket.owner] = [offeredTicket.owner, requestedTicket.owner];
        
        // Cập nhật trạng thái vé
        requestedTicket.status = 'exchanged'; // Cập nhật trạng thái vé yêu cầu
        offeredTicket.status = 'exchanged'; // Cập nhật trạng thái vé đề nghị
  
        await requestedTicket.save();
        await offeredTicket.save();
  
        // Cập nhật trạng thái của yêu cầu đổi vé
        exchangeRequest.status = 'completed';
      }
  
      // Cập nhật trạng thái phản hồi (chấp nhận hoặc từ chối)
      response.status = status;
      await exchangeRequest.save();
  
      // Trả về phản hồi và thông tin yêu cầu đổi vé đã được cập nhật
      res.status(200).json({
        message: `Response ${status}`,
        exchangeRequest,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };