const Route = require('../models/Route');
const BusCompany = require('../models/BusCompany'); 
// Tạo tuyến đường mới
exports.createRoute = async (req, res) => {
    try {
      const { companyId, startPoint, endPoint, stops, price, distance, duration, seats } = req.body;
  
      // Kiểm tra xem công ty có tồn tại không
      const company = await BusCompany.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Công ty không tồn tại!' });
      }
  
      // Tạo tuyến đường mới
      const newRoute = new Route({
        company: companyId,
        startPoint,
        endPoint,
        stops,
        price,
        distance,
        duration,
        availableSeats: seats,
      });
  
      // Lưu tuyến đường vào cơ sở dữ liệu
      await newRoute.save();
  
      // Cập nhật lại danh sách tuyến đường của công ty
      company.routes.push(newRoute._id);
      await company.save();
  
      return res.status(201).json({ message: 'Thêm tuyến đường thành công!', newRoute });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  };
// Lấy danh sách tuyến đường
exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find().populate('company');
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};