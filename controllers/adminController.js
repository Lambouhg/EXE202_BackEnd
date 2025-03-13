const User = require('../models/User');
const BusCompany = require('../models/BusCompany');
const Route = require('../models/Route');
const Ticket = require('../models/Ticket');
const TicketRequest = require('../models/TicketRequest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//const admin = await User.findOne({ email, role: 'admin' });
// --- Đăng nhập Admin ---
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Email login attempt:", email);  // Log email để kiểm tra

        const admin = await User.findOne({ email, role: 'admin' });
        
        if (!admin) {
            console.log("Admin không tồn tại");
            return res.status(404).json({ message: "Admin không tồn tại!" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });

        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: "Đăng nhập thành công!", token });
    } catch (error) {
        console.log("Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};


// --- Quản lý Người Dùng ---
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "Tạo người dùng thành công!", user: newUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.partialUpdateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Người dùng đã được xóa." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Quản lý Nhà Xe ---
exports.getBusCompanies = async (req, res) => {
    try {
        const companies = await BusCompany.find();
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createBusCompany = async (req, res) => {
    try {
        const { userId, name, contact, address, imageUrl } = req.body;

        // Kiểm tra user có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại!' });
        }

        // Kiểm tra user đã có công ty chưa
        if (user.company) {
            return res.status(400).json({ message: 'User này đã sở hữu một nhà xe!' });
        }

        // Tạo nhà xe mới
        const newCompany = new BusCompany({
            name,
            owner: userId,
            contact,
            address,
            imageUrl
        });

        await newCompany.save();

        // Cập nhật companyId cho user
        user.company = newCompany._id;
        await user.save();

        return res.status(201).json({ 
            message: 'Tạo nhà xe thành công!',
            company: newCompany
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau!' });
    }
};

exports.updateBusCompany = async (req, res) => {
    try {
        const updatedCompany = await BusCompany.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedCompany);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.partialUpdateBusCompany = async (req, res) => {
    try {
        const updatedCompany = await BusCompany.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedCompany);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBusCompany = async (req, res) => {
    try {
        await BusCompany.findByIdAndDelete(req.params.id);
        res.json({ message: "Nhà xe đã được xóa." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Quản lý Tuyến Đường ---
exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route.find().populate('company');
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createRoute = async (req, res) => {
    try {
        const newRoute = new Route(req.body);
        await newRoute.save();
        res.status(201).json(newRoute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateRoute = async (req, res) => {
    try {
        const updatedRoute = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRoute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.partialUpdateRoute = async (req, res) => {
    try {
        const updatedRoute = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRoute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteRoute = async (req, res) => {
    try {
        await Route.findByIdAndDelete(req.params.id);
        res.json({ message: "Tuyến đường đã được xóa." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Quản lý Vé ---
exports.getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().populate('route company owner');
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTicket = async (req, res) => {
    try {
        const newTicket = new Ticket(req.body);
        await newTicket.save();
        res.status(201).json(newTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTicket = async (req, res) => {
    try {
        const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.partialUpdateTicket = async (req, res) => {
    try {
        const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        await Ticket.findByIdAndDelete(req.params.id);
        res.json({ message: "Vé đã được xóa." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Quản lý Yêu Cầu Đổi Vé ---
exports.getTicketRequests = async (req, res) => {
    try {
        const requests = await TicketRequest.find().populate('requester requestedTicket offeredTicket responseBy');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTicketRequest = async (req, res) => {
    try {
        const newRequest = new TicketRequest(req.body);
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTicketRequest = async (req, res) => {
    try {
        const updatedRequest = await TicketRequest.findByIdAndUpdate(
            req.params.requestId,
            { status: req.body.status, responseBy: req.user._id, responseDate: new Date() },
            { new: true }
        );
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.partialUpdateTicketRequest = async (req, res) => {
    try {
        const updatedRequest = await TicketRequest.findByIdAndUpdate(
            req.params.requestId,
            req.body,
            { new: true }
        );
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTicketRequest = async (req, res) => {
    try {
        await TicketRequest.findByIdAndDelete(req.params.requestId);
        res.json({ message: "Yêu cầu đổi vé đã được xóa." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Quản lý Yêu Cầu Đổi Vé (Tiếp tục) ---
exports.getTicketRequests = async (req, res) => {
    try {
        const requests = await TicketRequest.find().populate('requester requestedTicket offeredTicket responseBy');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Cập nhật Trạng thái Yêu Cầu Đổi Vé ---
exports.updateTicketRequest = async (req, res) => {
    try {
        const updatedRequest = await TicketRequest.findByIdAndUpdate(
            req.params.requestId,
            { status: req.body.status, responseBy: req.user._id, responseDate: new Date() },
            { new: true }
        );
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Cập nhật Một Phần Yêu Cầu Đổi Vé ---
exports.partialUpdateTicketRequest = async (req, res) => {
    try {
        const updatedRequest = await TicketRequest.findByIdAndUpdate(
            req.params.requestId,
            req.body,
            { new: true }
        );
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Xóa Yêu Cầu Đổi Vé ---
exports.deleteTicketRequest = async (req, res) => {
    try {
        await TicketRequest.findByIdAndDelete(req.params.requestId);
        res.json({ message: "Yêu cầu đổi vé đã được xóa." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
