const BusCompany = require('../models/BusCompany');
const Route = require('../models/Route');

// Tạo nhà xe
exports.createBusCompany = async (req, res) => {
  try {
    const { name, contact, address } = req.body;

    const newBusCompany = new BusCompany({
      name,
      contact,
      address,
      createdAt: new Date(),
    });

    await newBusCompany.save();
    return res.status(201).json({ message: 'Thêm nhà xe thành công!', newBusCompany });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thêm tuyến đường
exports.createRoute = async (req, res) => {
  try {
    // Nhận thông tin từ body
    const { startPoint, endPoint, price, seats, companyId, duration, distance, departureTimes } = req.body;

    // Kiểm tra xem companyId có được truyền vào không
    if (!companyId) {
      return res.status(400).json({ message: 'Cần phải cung cấp companyId!' });
    }

    // Kiểm tra công ty có tồn tại không
    const company = await BusCompany.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Công ty không tồn tại!' });
    }

    // Kiểm tra xem departureTimes có được truyền vào hay không
    if (!departureTimes || departureTimes.length === 0) {
      return res.status(400).json({ message: 'Cần phải cung cấp thời gian khởi hành!' });
    }

    // Tạo tuyến đường mới
    const newRoute = new Route({
      startPoint,
      endPoint,
      price,
      availableSeats: seats,
      company: companyId, // Liên kết với công ty
      duration,
      distance,
      departureTimes,  // Thêm mảng thời gian khởi hành
    });

    // Lưu tuyến đường mới vào DB
    await newRoute.save();

    // Cập nhật danh sách tuyến đường của công ty
    company.routes.push(newRoute._id);
    await company.save(); // Lưu lại sau khi cập nhật mối quan hệ

    return res.status(201).json({ message: 'Thêm tuyến thành công!', newRoute });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};