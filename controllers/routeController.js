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


exports.searchRoutes = async (req, res) => {
  try {
      const { departure, destination, departureDate } = req.query;

      if (!departure || !destination) {
          return res.status(400).json({ message: "Vui lòng nhập điểm đi và điểm đến." });
      }

      // Tìm kiếm các tuyến có điểm đi và điểm đến phù hợp
      const routes = await Route.find({
          startPoint: { $regex: new RegExp(departure, "i") },
          endPoint: { $regex: new RegExp(destination, "i") },
      });

      if (routes.length === 0) {
          return res.status(404).json({ message: "Không tìm thấy tuyến đường phù hợp." });
      }

      res.status(200).json(routes);
  } catch (error) {
      console.error("Lỗi tìm kiếm tuyến:", error);
      res.status(500).json({ message: "Lỗi server." });
  }
};
