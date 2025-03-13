
const BusCompany = require('../models/BusCompany');
const Route = require('../models/Route');
const Ticket = require('../models/Ticket'); // Giả sử có model Ticket

// 1. Hiển thị danh sách tuyến đường của một nhà xe
exports.getRoutesByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Lấy userId từ URL params

    if (!userId) {
      return res.status(400).json({ message: 'Thiếu userId!' });
    }

    // Tìm nhà xe do user sở hữu
    const busCompany = await BusCompany.findOne({ owner: userId });
    if (!busCompany) {
      return res.status(404).json({ message: 'Người dùng không sở hữu nhà xe nào!' });
    }

    // Lấy danh sách tuyến đường của nhà xe
    const routes = await Route.find({ company: busCompany._id });

    return res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


// 2. Xem danh sách vé của một tuyến đường
exports.getTicketsByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;

    // Kiểm tra tuyến đường có tồn tại không
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({ message: 'Tuyến đường không tồn tại!' });
    }

    // Lấy danh sách vé của tuyến đường
    const tickets = await Ticket.find({ route: routeId });

    return res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 3. Chỉnh sửa thông tin tuyến đường
exports.updateRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const updateData = req.body;

    const updatedRoute = await Route.findByIdAndUpdate(routeId, updateData, { new: true });

    if (!updatedRoute) {
      return res.status(404).json({ message: 'Tuyến đường không tồn tại!' });
    }

    return res.status(200).json({ message: 'Cập nhật tuyến đường thành công!', updatedRoute });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 4. Xóa vé của một tuyến đường
exports.deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Kiểm tra vé có tồn tại không
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Vé không tồn tại!' });
    }

    // Xóa vé
    await Ticket.findByIdAndDelete(ticketId);

    return res.status(200).json({ message: 'Xóa vé thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// // 5. Quản lý vé của tuyến đường (Tạo, Cập nhật, Xóa vé)
// exports.manageTickets = async (req, res) => {
//   try {
//     const { routeId } = req.params;
//     const { action, ticketData } = req.body; // action: 'create', 'update', 'delete'

//     // Kiểm tra tuyến đường có tồn tại không
//     const route = await Route.findById(routeId);
//     if (!route) {
//       return res.status(404).json({ message: 'Tuyến đường không tồn tại!' });
//     }

//     let result;
//     if (action === 'create') {
//       // Tạo vé mới
//       const newTicket = new Ticket({ ...ticketData, route: routeId });
//       await newTicket.save();
//       result = newTicket;
//     } else if (action === 'update') {
//       // Cập nhật vé
//       const { ticketId, ...updateData } = ticketData;
//       result = await Ticket.findByIdAndUpdate(ticketId, updateData, { new: true });
//       if (!result) {
//         return res.status(404).json({ message: 'Vé không tồn tại!' });
//       }
//     } else if (action === 'delete') {
//       // Xóa vé
//       const { ticketId } = ticketData;
//       await Ticket.findByIdAndDelete(ticketId);
//       result = { message: 'Xóa vé thành công!' };
//     } else {
//       return res.status(400).json({ message: 'Hành động không hợp lệ!' });
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi server', error: error.message });
//   }
// };