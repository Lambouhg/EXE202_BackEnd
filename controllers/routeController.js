const Route = require('../models/Route');
const BusCompany = require('../models/BusCompany');

const vehicleSeatsMap = {
    Limousine: 9,
    "Ghế ngồi": 45,
    "Giường nằm": 40,
};


// 📌 Tạo tuyến đường mới


// 📌 Tạo tuyến đường mới (có thêm ảnh)
exports.createRoute = async (req, res) => {
    try {
        const { companyId, startPoint, endPoint, stops, price, distance, duration, vehicleType, departureTimes, image } = req.body;

        // Kiểm tra thông tin đầu vào
        if (!companyId || !startPoint || !endPoint || !price || !distance || !duration || !vehicleType || !departureTimes || !image) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
        }

        // Kiểm tra xem công ty có tồn tại không
        const company = await BusCompany.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "Công ty không tồn tại!" });
        }

        // Kiểm tra loại xe hợp lệ
        const normalizedVehicleType = Object.keys(vehicleSeatsMap).find(
            key => key.toLowerCase() === vehicleType.toLowerCase()
        );

        // Kiểm tra tính hợp lệ của departureTimes (mảng các thời gian khởi hành)
        const validDepartureTimes = departureTimes.every(time => {
            const date = new Date(time);
            return !isNaN(date.getTime());
        });

        if (!validDepartureTimes) {
            return res.status(400).json({ message: "Có thời gian khởi hành không hợp lệ!" });
        }

        // Kiểm tra URL ảnh hợp lệ
        if (!/^https?:\/\//.test(image)) {
            return res.status(400).json({ message: "URL ảnh không hợp lệ!" });
        }


        // Tạo tuyến đường mới với số ghế và thời gian khởi hành
        const newRoute = new Route({
            company: companyId,
            startPoint,
            endPoint,
            stops: stops || [],
            price,
            distance,
            duration,
            vehicleType,
            departureTimes,
            availableSeats: vehicleSeatsMap[vehicleType],
            image, // Thêm URL ảnh
        });

        // Lưu tuyến đường vào database
        await newRoute.save();

        // Cập nhật danh sách tuyến đường của công ty
        company.routes.push(newRoute._id);
        await company.save();

        return res.status(201).json({ message: "Thêm tuyến đường thành công!", newRoute });
    } catch (error) {
        console.error("Lỗi tạo tuyến:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};


// 📌 Lấy danh sách tuyến đường
exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route.find().populate({
            path: "company",
            select: "name contact address rating",
        }).populate({
            path: "tickets",
            select: "seatNumber"
        });

        return res.status(200).json({ message: "Lấy danh sách tuyến đường thành công!", routes });
    } catch (error) {
        console.error("Lỗi lấy danh sách tuyến:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};


// 📌 Tìm kiếm tuyến đường theo điểm đi, điểm đến, ngày khởi hành
exports.searchRoutes = async (req, res) => {
    try {
        let { departure, destination, departureDate } = req.query;

        if (!departure && !destination) {
            return res.status(400).json({ message: "Vui lòng nhập ít nhất điểm đi hoặc điểm đến!" });
        }

        const query = { $or: [] };

        if (departure && destination) {
            query.$or.push(
                { startPoint: { $regex: new RegExp(departure, "i") }, endPoint: { $regex: new RegExp(destination, "i") } },
                { startPoint: { $regex: new RegExp(destination, "i") }, endPoint: { $regex: new RegExp(departure, "i") } } // Khứ hồi
            );
        } else if (departure) {
            query.$or.push({ startPoint: { $regex: new RegExp(departure, "i") } });
        } else if (destination) {
            query.$or.push({ endPoint: { $regex: new RegExp(destination, "i") } });
        }

        if (departureDate) {
            const date = new Date(departureDate);
            if (!isNaN(date.getTime())) {
                query.departureTimes = { $gte: date };
            }
        }

        const routes = await Route.find(query).populate({
            path: "company",
            select: "name contact address rating"
        });

        if (routes.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy tuyến đường phù hợp!" });
        }

        return res.status(200).json({ message: "Tìm thấy tuyến đường!", routes });
    } catch (error) {
        console.error("Lỗi tìm kiếm tuyến:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};
