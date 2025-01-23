const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const axios = require('axios');

// Bước 1: Khởi tạo thanh toán
exports.initiatePayment = async (req, res) => {
  try {
    const { ticketIds, amount, paymentMethod } = req.body;
    const userId = req.user.id;

    // Tạo bản ghi thanh toán mới
    const newPayment = new Payment({
      userId,
      ticketIds,
      amount,
      status: 'pending',
      paymentMethod,
      createdAt: Date.now(),
    });

    await newPayment.save();
    return res.status(201).json({ message: 'Thanh toán đã được khởi tạo.', paymentId: newPayment._id });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi khởi tạo thanh toán.' });
  }
};

// Bước 2: Gửi yêu cầu thanh toán qua MoMo
exports.momoCheckout = async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.status !== 'pending') {
      return res.status(400).json({ message: 'Thanh toán không hợp lệ hoặc đã được xử lý.' });
    }

    // Giả sử API MoMo tạo URL thanh toán
    const momoResponse = await axios.post('https://api.momo.vn/v2/checkout', {
      amount: payment.amount,
      userId: payment.userId,
      transactionId: payment._id,
    });

    payment.transactionId = momoResponse.data.transactionId;
    await payment.save();

    return res.status(200).json({ paymentUrl: momoResponse.data.paymentUrl });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi kết nối với MoMo.' });
  }
};

// Bước 3: Xác nhận thanh toán thành công qua callback từ MoMo
exports.momoCallback = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    const payment = await Payment.findOne({ transactionId });
    if (!payment || payment.status !== 'pending') {
      return res.status(400).json({ message: 'Thanh toán không hợp lệ hoặc đã được xử lý.' });
    }

    if (status === 'success') {
      payment.status = 'completed';
      payment.completedAt = Date.now();
      await payment.save();

      await Ticket.updateMany(
        { _id: { $in: payment.ticketIds } },
        { status: 'paid' }
      );

      // Gửi thông báo thành công
      await sendNotification(payment.userId, 'Thanh toán thành công! Vé của bạn đã được thanh toán.');
      
      return res.status(200).json({ message: 'Thanh toán thành công!' });
    } else {
      payment.status = 'failed';
      await payment.save();

      await Ticket.updateMany(
        { _id: { $in: payment.ticketIds } },
        { status: 'available' }
      );

      return res.status(400).json({ message: 'Thanh toán thất bại.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xử lý callback thanh toán.' });
  }
};

// Bước 5.1: Hủy thanh toán
exports.cancelPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);
    if (!payment || payment.status !== 'pending') {
      return res.status(400).json({ message: 'Thanh toán không hợp lệ hoặc đã được xử lý.' });
    }

    payment.status = 'cancelled';
    await payment.save();

    await Ticket.updateMany(
      { _id: { $in: payment.ticketIds } },
      { status: 'available' }
    );

    return res.status(200).json({ message: 'Thanh toán đã bị hủy.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi hủy thanh toán.' });
  }
};

// Hàm gửi thông báo
const sendNotification = async (userId, message) => {
  const notification = new Notification({
    userId,
    message,
    createdAt: Date.now(),
  });

  await notification.save();
};
